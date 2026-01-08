<template>
  <div class="construction-vr-container" ref="vrContainer">
    <!-- VR Canvas -->
    <canvas ref="vrCanvas" class="vr-canvas"></canvas>

    <!-- UI Overlay for non-VR fallback -->
    <div v-if="!isVRActive" class="ui-overlay">
      <div class="construction-status-bar">
        <div class="status-item">
          <span class="status-label">状態:</span>
          <span class="status-value">{{ vrStatus }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">建設進度:</span>
          <span class="status-value">{{ Math.round(buildingProgress) }}%</span>
        </div>
        <button
          v-if="vrSupported && !isVRActive"
          @click="enterVR"
          class="vr-enter-button"
        >
          🏗️ VR建築モードで開始
        </button>
      </div>
    </div>

    <!-- Building HUD -->
    <div class="building-hud" ref="hudElement">
      <div class="hud-building-info">
        <div class="building-label">建設プロジェクト</div>
        <div class="building-name">{{ currentProject.name }}</div>
        <div class="building-type">{{ currentProject.type }}</div>
      </div>

      <div class="hud-floor-info">
        <div class="floor-label">現在のフロア</div>
        <div class="floor-number">{{ currentFloor + 1 }}/{{ totalFloors }}</div>
        <div class="floor-topic">{{ buildingFloors[currentFloor]?.topic || '準備中' }}</div>
      </div>

      <div class="hud-blocks">
        <div class="blocks-label">利用可能ブロック</div>
        <div class="blocks-count">{{ availableBlocks.length }}個</div>
      </div>

      <div class="hud-score">
        <div class="score-label">建設スコア</div>
        <div class="score-value">{{ totalScore }}</div>
      </div>
    </div>

    <!-- Grammar Block Inventory -->
    <div v-if="!isVRActive" class="block-inventory">
      <h3>Grammar Blocks</h3>
      <div class="inventory-grid">
        <div
          v-for="block in availableBlocks"
          :key="block.id"
          class="inventory-block"
          :class="[`block-${block.type}`, { selected: selectedBlockId === block.id }]"
          @click="selectBlock(block)"
        >
          <div class="block-symbol">{{ block.symbol }}</div>
          <div class="block-label">{{ block.label }}</div>
          <div class="block-category">{{ block.category }}</div>
        </div>
      </div>
    </div>

    <!-- Audio Elements -->
    <audio ref="blockPlacedSound" preload="auto">
      <source src="/audio/block-placed.mp3" type="audio/mpeg">
    </audio>
    <audio ref="constructionSuccess" preload="auto">
      <source src="/audio/construction-success.mp3" type="audio/mpeg">
    </audio>
    <audio ref="floorCompleted" preload="auto">
      <source src="/audio/floor-completed.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue'
import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js'
import * as CANNON from 'cannon-es'
import { useGameStore } from '@/stores/gameStore'
import { useTicketStore } from '@/stores/ticketStore'
import logger from '@/utils/logger'

export default {
  name: 'ConstructionVR',
  setup() {
    // Stores
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
    let world = null // Cannon.js physics world
    let controllers = []
    let controllerGrips = []
    let hands = []
    let raycaster = null
    let selectedObject = null
    let buildingGrid = null
    let buildingStructure = []

    // Audio
    const blockPlacedSound = ref(null)
    const constructionSuccess = ref(null)
    const floorCompleted = ref(null)
    let audioListener = null

    // Game State
    const gameState = reactive({
      currentProject: {
        name: 'Grammar Galaxy Tower',
        type: 'Educational Skyscraper',
        description: '文法要素を組み合わせて学習タワーを建設'
      },
      currentFloor: 0,
      totalFloors: 5,
      buildingProgress: 0,
      totalScore: 0,
      selectedBlockId: null,
      isBuilding: false,
      constructionPhase: 'explanation', // explanation, construction, review
      buildingFloors: [
        {
          id: 1,
          topic: '名詞の基礎',
          blocks: ['noun', 'article', 'adjective'],
          target: 'Building the foundation with nouns',
          completed: false,
          progress: 0
        },
        {
          id: 2,
          topic: '動詞の活用',
          blocks: ['verb', 'auxiliary', 'adverb'],
          target: 'Constructing action frameworks',
          completed: false,
          progress: 0
        },
        {
          id: 3,
          topic: '前置詞の関係',
          blocks: ['preposition', 'object', 'location'],
          target: 'Building spatial relationships',
          completed: false,
          progress: 0
        },
        {
          id: 4,
          topic: '接続詞の構造',
          blocks: ['conjunction', 'clause', 'sentence'],
          target: 'Connecting structural elements',
          completed: false,
          progress: 0
        },
        {
          id: 5,
          topic: '複合文の完成',
          blocks: ['complex', 'compound', 'complete'],
          target: 'Finalizing the grammar tower',
          completed: false,
          progress: 0
        }
      ],
      availableBlocks: [
        // Nouns
        { id: 1, type: 'noun', symbol: 'N', label: 'cat', category: 'Noun', color: 0xff6b6b, physics: null },
        { id: 2, type: 'noun', symbol: 'N', label: 'dog', category: 'Noun', color: 0xff6b6b, physics: null },
        { id: 3, type: 'noun', symbol: 'N', label: 'house', category: 'Noun', color: 0xff6b6b, physics: null },

        // Verbs
        { id: 4, type: 'verb', symbol: 'V', label: 'run', category: 'Verb', color: 0x4ecdc4, physics: null },
        { id: 5, type: 'verb', symbol: 'V', label: 'jump', category: 'Verb', color: 0x4ecdc4, physics: null },
        { id: 6, type: 'verb', symbol: 'V', label: 'eat', category: 'Verb', color: 0x4ecdc4, physics: null },

        // Articles
        { id: 7, type: 'article', symbol: 'Art', label: 'the', category: 'Article', color: 0xffd93d, physics: null },
        { id: 8, type: 'article', symbol: 'Art', label: 'a', category: 'Article', color: 0xffd93d, physics: null },
        { id: 9, type: 'article', symbol: 'Art', label: 'an', category: 'Article', color: 0xffd93d, physics: null },

        // Adjectives
        { id: 10, type: 'adjective', symbol: 'Adj', label: 'big', category: 'Adjective', color: 0x6c5ce7, physics: null },
        { id: 11, type: 'adjective', symbol: 'Adj', label: 'small', category: 'Adjective', color: 0x6c5ce7, physics: null },
        { id: 12, type: 'adjective', symbol: 'Adj', label: 'red', category: 'Adjective', color: 0x6c5ce7, physics: null },

        // Prepositions
        { id: 13, type: 'preposition', symbol: 'Prep', label: 'in', category: 'Preposition', color: 0xa29bfe, physics: null },
        { id: 14, type: 'preposition', symbol: 'Prep', label: 'on', category: 'Preposition', color: 0xa29bfe, physics: null },
        { id: 15, type: 'preposition', symbol: 'Prep', label: 'under', category: 'Preposition', color: 0xa29bfe, physics: null }
      ],
      placedBlocks: [],
      currentTask: null,
      snapZones: []
    })

    // Computed
    const currentFloor = computed(() => gameState.currentFloor)
    const totalFloors = computed(() => gameState.totalFloors)
    const buildingProgress = computed(() => {
      const completedFloors = gameState.buildingFloors.filter(f => f.completed).length
      return (completedFloors / gameState.totalFloors) * 100
    })
    const totalScore = computed(() => gameState.totalScore)
    const availableBlocks = computed(() => {
      const currentFloorData = gameState.buildingFloors[gameState.currentFloor]
      return gameState.availableBlocks.filter(block =>
        currentFloorData?.blocks.includes(block.type)
      )
    })
    const selectedBlockId = computed(() => gameState.selectedBlockId)

    // VR Initialization
    const initVR = async () => {
      try {
        // Check VR Support
        if ('xr' in navigator) {
          vrSupported.value = await navigator.xr.isSessionSupported('immersive-vr')

          if (vrSupported.value) {
            vrStatus.value = 'VR建築準備完了'
            logger.log('🏗️ VR construction support detected')
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
        setupPhysics()

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
      scene.background = new THREE.Color(0x87ceeb) // Sky blue for construction site
      scene.fog = new THREE.Fog(0x87ceeb, 10, 100)

      // Camera
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.set(0, 1.6, 5)

      // Lighting
      setupLighting()

      // Construction Site
      createConstructionSite()

      // Building Grid
      createBuildingGrid()

      // Grammar Blocks
      createGrammarBlocks()

      // VR Controllers and Hands
      if (vrSupported.value) {
        setupVRInteraction()
      }

      // Audio
      setupAudio()

      // Environment
      createEnvironment()
    }

    // Setup Physics (Cannon.js)
    const setupPhysics = () => {
      world = new CANNON.World()
      world.gravity.set(0, -9.82, 0)
      world.broadphase = new CANNON.NaiveBroadphase()
      world.solver.iterations = 10

      // Ground physics body
      const groundShape = new CANNON.Plane()
      const groundBody = new CANNON.Body({ mass: 0 })
      groundBody.addShape(groundShape)
      groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
      world.add(groundBody)
    }

    // Setup Lighting
    const setupLighting = () => {
      // Ambient Light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      scene.add(ambientLight)

      // Directional Light (Sun)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
      directionalLight.position.set(10, 20, 10)
      directionalLight.castShadow = true
      directionalLight.shadow.camera.near = 1
      directionalLight.shadow.camera.far = 50
      directionalLight.shadow.camera.left = -20
      directionalLight.shadow.camera.right = 20
      directionalLight.shadow.camera.top = 20
      directionalLight.shadow.camera.bottom = -20
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      scene.add(directionalLight)

      // Point lights for work area
      const workLight1 = new THREE.PointLight(0xffffff, 0.8, 10)
      workLight1.position.set(-3, 3, 3)
      scene.add(workLight1)

      const workLight2 = new THREE.PointLight(0xffffff, 0.8, 10)
      workLight2.position.set(3, 3, 3)
      scene.add(workLight2)
    }

    // Create Construction Site
    const createConstructionSite = () => {
      // Ground
      const groundGeometry = new THREE.PlaneGeometry(20, 20)
      const groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x8b7355,
        transparent: true,
        opacity: 0.9
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      scene.add(ground)

      // Foundation Platform
      const foundationGeometry = new THREE.BoxGeometry(6, 0.2, 6)
      const foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 })
      const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial)
      foundation.position.set(0, 0.1, 0)
      foundation.receiveShadow = true
      foundation.castShadow = true
      scene.add(foundation)

      // Construction Crane (decoration)
      const craneGroup = new THREE.Group()

      // Crane tower
      const towerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8)
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 })
      const tower = new THREE.Mesh(towerGeometry, towerMaterial)
      tower.position.set(8, 4, 8)
      tower.castShadow = true
      craneGroup.add(tower)

      // Crane arm
      const armGeometry = new THREE.BoxGeometry(8, 0.3, 0.3)
      const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 })
      const arm = new THREE.Mesh(armGeometry, armMaterial)
      arm.position.set(4, 8, 8)
      arm.castShadow = true
      craneGroup.add(arm)

      scene.add(craneGroup)

      // Safety barriers
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 12
        const z = Math.sin(angle) * 12

        const barrierGeometry = new THREE.BoxGeometry(2, 1, 0.1)
        const barrierMaterial = new THREE.MeshLambertMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.8
        })
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial)
        barrier.position.set(x, 0.5, z)
        barrier.lookAt(0, 0.5, 0)
        scene.add(barrier)
      }
    }

    // Create Building Grid
    const createBuildingGrid = () => {
      const gridSize = 3
      const cellSize = 1
      buildingGrid = new THREE.Group()

      // Grid lines
      const gridHelper = new THREE.GridHelper(gridSize * cellSize, gridSize, 0x0000ff, 0x808080)
      gridHelper.position.y = 0.21
      buildingGrid.add(gridHelper)

      // Snap zones for blocks
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const snapZone = createSnapZone(
            (x - gridSize/2 + 0.5) * cellSize,
            0.5,
            (z - gridSize/2 + 0.5) * cellSize
          )
          buildingGrid.add(snapZone)
          gameState.snapZones.push({
            position: snapZone.position.clone(),
            occupied: false,
            block: null,
            mesh: snapZone
          })
        }
      }

      scene.add(buildingGrid)
    }

    // Create Snap Zone
    const createSnapZone = (x, y, z) => {
      const geometry = new THREE.BoxGeometry(0.9, 0.1, 0.9)
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3
      })
      const snapZone = new THREE.Mesh(geometry, material)
      snapZone.position.set(x, y, z)
      snapZone.userData.isSnapZone = true
      return snapZone
    }

    // Create Grammar Blocks in 3D
    const createGrammarBlocks = () => {
      availableBlocks.value.forEach((blockData, index) => {
        const block = createGrammarBlock(blockData)

        // Position blocks in a semicircle around the player
        const angle = (index / availableBlocks.value.length) * Math.PI
        const radius = 3
        block.position.set(
          Math.cos(angle) * radius,
          0.7,
          Math.sin(angle) * radius + 2
        )

        scene.add(block)
        blockData.mesh = block
      })
    }

    // Create Individual Grammar Block
    const createGrammarBlock = (blockData) => {
      const group = new THREE.Group()

      // Block geometry
      const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6)
      const material = new THREE.MeshPhongMaterial({
        color: blockData.color,
        transparent: true,
        opacity: 0.9
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)

      // Text label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 256

      // Symbol
      context.fillStyle = '#ffffff'
      context.font = 'bold 48px Arial'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(blockData.symbol, 128, 96)

      // Label
      context.font = 'bold 24px Arial'
      context.fillText(blockData.label, 128, 160)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(1, 1, 1)
      sprite.position.y = 0.8
      group.add(sprite)

      // Physics body
      const shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.3, 0.3))
      const body = new CANNON.Body({ mass: 1 })
      body.addShape(shape)
      body.material = new CANNON.Material({ friction: 0.4, restitution: 0.3 })
      world.add(body)

      // Link physics and visual
      blockData.physics = body
      group.userData = {
        blockData: blockData,
        physicsBody: body,
        isGrammarBlock: true
      }

      return group
    }

    // Setup VR Interaction (Controllers and Hand Tracking)
    const setupVRInteraction = () => {
      const controllerModelFactory = new XRControllerModelFactory()
      const handModelFactory = new XRHandModelFactory()

      // Setup Controllers (0 = right, 1 = left)
      for (let i = 0; i < 2; i++) {
        // Controller
        const controller = renderer.xr.getController(i)
        controller.addEventListener('selectstart', onSelectStart)
        controller.addEventListener('selectend', onSelectEnd)
        controller.addEventListener('squeezestart', onSqueezeStart)
        controller.addEventListener('squeezeend', onSqueezeEnd)
        scene.add(controller)
        controllers[i] = controller

        // Controller Grip
        const controllerGrip = renderer.xr.getControllerGrip(i)
        controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip))
        scene.add(controllerGrip)
        controllerGrips[i] = controllerGrip

        // Hand Tracking
        const hand = renderer.xr.getHand(i)
        hand.add(handModelFactory.createHandModel(hand, 'mesh'))
        hand.addEventListener('pinchstart', onPinchStart)
        hand.addEventListener('pinchend', onPinchEnd)
        scene.add(hand)
        hands[i] = hand

        // Add laser pointer
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -5)
        ])
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
        const line = new THREE.Line(geometry, material)
        controller.add(line)
      }

      raycaster = new THREE.Raycaster()
    }

    // Controller/Hand Interaction Events
    const onSelectStart = (event) => {
      const controller = event.target
      const intersections = getIntersections(controller)

      if (intersections.length > 0) {
        const intersected = intersections[0].object

        if (intersected.parent.userData.isGrammarBlock) {
          selectAndGrabBlock(controller, intersected.parent)
        } else if (intersected.userData.isSnapZone) {
          if (selectedObject && selectedObject.userData.isGrammarBlock) {
            placeBlockInSnapZone(selectedObject, intersected)
          }
        }
      }
    }

    const onSelectEnd = (event) => {
      const controller = event.target
      if (selectedObject) {
        releaseBlock(controller)
      }
    }

    const onSqueezeStart = (event) => {
      // Alternative grabbing method
      onSelectStart(event)
    }

    const onSqueezeEnd = (event) => {
      onSelectEnd(event)
    }

    const onPinchStart = (event) => {
      // Hand tracking pinch - same as controller select
      onSelectStart(event)
    }

    const onPinchEnd = (event) => {
      onSelectEnd(event)
    }

    // Get Intersections with Controller Ray
    const getIntersections = (controller) => {
      const tempMatrix = new THREE.Matrix4()
      tempMatrix.identity().extractRotation(controller.matrixWorld)

      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)

      const intersectableObjects = []

      // Add grammar blocks
      availableBlocks.value.forEach(block => {
        if (block.mesh) {
          intersectableObjects.push(...block.mesh.children)
        }
      })

      // Add snap zones
      gameState.snapZones.forEach(zone => {
        intersectableObjects.push(zone.mesh)
      })

      return raycaster.intersectObjects(intersectableObjects, true)
    }

    // Select and Grab Block
    const selectAndGrabBlock = (controller, blockGroup) => {
      if (selectedObject) {
        releaseBlock(controller)
      }

      selectedObject = blockGroup
      gameState.selectedBlockId = blockGroup.userData.blockData.id

      // Attach to controller
      controller.attach(blockGroup)

      // Disable physics while grabbed
      if (blockGroup.userData.physicsBody) {
        blockGroup.userData.physicsBody.type = CANNON.Body.KINEMATIC
      }

      // Visual feedback
      blockGroup.children[0].material.emissive.setHex(0x444444)

      // Haptic feedback
      if (controller.gamepad && controller.gamepad.hapticActuators && controller.gamepad.hapticActuators[0]) {
        controller.gamepad.hapticActuators[0].pulse(0.5, 100)
      }

      logger.log(`🤏 Grabbed block: ${blockGroup.userData.blockData.label}`)
    }

    // Release Block
    const releaseBlock = (controller) => {
      if (!selectedObject) return

      // Re-enable physics
      if (selectedObject.userData.physicsBody) {
        selectedObject.userData.physicsBody.type = CANNON.Body.DYNAMIC

        // Sync position with physics
        selectedObject.userData.physicsBody.position.copy(selectedObject.position)
        selectedObject.userData.physicsBody.quaternion.copy(selectedObject.quaternion)
      }

      // Remove visual feedback
      selectedObject.children[0].material.emissive.setHex(0x000000)

      // Detach from controller
      scene.attach(selectedObject)

      selectedObject = null
      gameState.selectedBlockId = null

      logger.log('🤚 Released block')
    }

    // Place Block in Snap Zone
    const placeBlockInSnapZone = (blockGroup, snapZoneObj) => {
      const snapZone = gameState.snapZones.find(zone => zone.mesh === snapZoneObj)

      if (!snapZone || snapZone.occupied) {
        logger.log('❌ Snap zone occupied or invalid')
        return
      }

      // Position block in snap zone
      blockGroup.position.copy(snapZone.position)
      blockGroup.position.y = snapZone.position.y + 0.3

      // Mark snap zone as occupied
      snapZone.occupied = true
      snapZone.block = blockGroup.userData.blockData

      // Update visual feedback
      snapZone.mesh.material.color.setHex(0x00ff00)
      snapZone.mesh.material.opacity = 0.8

      // Add to placed blocks
      gameState.placedBlocks.push({
        block: blockGroup.userData.blockData,
        position: snapZone.position.clone(),
        snapZone: snapZone
      })

      // Play sound effect
      if (blockPlacedSound.value) {
        blockPlacedSound.value.play()
      }

      // Check construction progress
      checkConstructionProgress()

      // Score points
      gameState.totalScore += 50

      logger.log(`🔧 Placed block ${blockGroup.userData.blockData.label} in construction zone`)
    }

    // Check Construction Progress
    const checkConstructionProgress = () => {
      const currentFloorData = gameState.buildingFloors[gameState.currentFloor]
      const requiredBlocks = currentFloorData.blocks
      const placedBlockTypes = gameState.placedBlocks.map(pb => pb.block.type)

      // Check if all required block types are placed
      const hasAllRequiredBlocks = requiredBlocks.every(reqType =>
        placedBlockTypes.includes(reqType)
      )

      if (hasAllRequiredBlocks) {
        completeFloor()
      } else {
        // Update progress
        const completedBlockTypes = requiredBlocks.filter(reqType =>
          placedBlockTypes.includes(reqType)
        )
        currentFloorData.progress = (completedBlockTypes.length / requiredBlocks.length) * 100
      }
    }

    // Complete Current Floor
    const completeFloor = () => {
      const currentFloorData = gameState.buildingFloors[gameState.currentFloor]
      currentFloorData.completed = true
      currentFloorData.progress = 100

      // Visual effects
      createCompletionEffect()

      // Play sound
      if (floorCompleted.value) {
        floorCompleted.value.play()
      }

      // Award points
      gameState.totalScore += 200

      // Move to next floor
      if (gameState.currentFloor < gameState.totalFloors - 1) {
        setTimeout(() => {
          gameState.currentFloor++
          resetForNextFloor()
        }, 2000)
      } else {
        completeProject()
      }

      logger.log(`🎉 Floor ${gameState.currentFloor + 1} completed!`)
    }

    // Reset for Next Floor
    const resetForNextFloor = () => {
      // Clear placed blocks
      gameState.placedBlocks.forEach(pb => {
        pb.snapZone.occupied = false
        pb.snapZone.block = null
        pb.snapZone.mesh.material.color.setHex(0x00ff00)
        pb.snapZone.mesh.material.opacity = 0.3
      })

      gameState.placedBlocks = []

      // Reset block positions
      availableBlocks.value.forEach((blockData, index) => {
        if (blockData.mesh) {
          const angle = (index / availableBlocks.value.length) * Math.PI
          const radius = 3
          blockData.mesh.position.set(
            Math.cos(angle) * radius,
            0.7,
            Math.sin(angle) * radius + 2
          )
        }
      })

      vrStatus.value = `フロア ${gameState.currentFloor + 1} 建設中`
    }

    // Complete Entire Project
    const completeProject = () => {
      logger.log('🏆 Construction project completed!')

      // Award VR ticket
      ticketStore.earnTicket('game_clear', {
        game: 'ConstructionVR',
        score: gameState.totalScore
      })

      // Update game progress
      gameStore.updateGameProgress('constructionVR', {
        completed: true,
        bestScore: Math.max(gameStore.getGameProgress('constructionVR').bestScore || 0, gameState.totalScore),
        buildingProgress: 100
      })

      // Success effects
      if (constructionSuccess.value) {
        constructionSuccess.value.play()
      }

      vrStatus.value = 'プロジェクト完成！'
    }

    // Create Completion Effect
    const createCompletionEffect = () => {
      // Fireworks effect
      const particleCount = 100
      const particles = []

      for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8)
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
          transparent: true,
          opacity: 1
        })

        const particle = new THREE.Mesh(particleGeometry, particleMaterial)
        particle.position.set(
          (Math.random() - 0.5) * 6,
          3 + Math.random() * 2,
          (Math.random() - 0.5) * 6
        )

        particle.userData.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          Math.random() * 0.3 + 0.2,
          (Math.random() - 0.5) * 0.3
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
          particle.userData.velocity.y -= 0.02 // Gravity
          particle.material.opacity = Math.max(0, 1 - frame * 0.01)

          if (particle.material.opacity <= 0) {
            scene.remove(particle)
          }
        })

        if (frame < 100) {
          requestAnimationFrame(animateParticles)
        }
      }

      animateParticles()
    }

    // Setup Audio
    const setupAudio = () => {
      audioListener = new THREE.AudioListener()
      camera.add(audioListener)
    }

    // Create Environment
    const createEnvironment = () => {
      // Sky gradient
      const skyGeometry = new THREE.SphereGeometry(50, 32, 32)
      const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: new THREE.Color(0x87ceeb) },
          bottomColor: { value: new THREE.Color(0xffffff) },
          offset: { value: 15 },
          exponent: { value: 0.6 }
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
          }
        `,
        side: THREE.BackSide
      })

      const sky = new THREE.Mesh(skyGeometry, skyMaterial)
      scene.add(sky)

      // Construction site props
      createSiteProps()
    }

    // Create Construction Site Props
    const createSiteProps = () => {
      // Tool shed
      const shedGeometry = new THREE.BoxGeometry(2, 2, 1.5)
      const shedMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      const shed = new THREE.Mesh(shedGeometry, shedMaterial)
      shed.position.set(-8, 1, -5)
      shed.castShadow = true
      scene.add(shed)

      // Material piles
      for (let i = 0; i < 5; i++) {
        const pileGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.8, 6)
        const pileMaterial = new THREE.MeshLambertMaterial({
          color: new THREE.Color().setHSL(0.1, 0.8, 0.5 + Math.random() * 0.3)
        })
        const pile = new THREE.Mesh(pileGeometry, pileMaterial)
        pile.position.set(
          6 + Math.random() * 2,
          0.4,
          -6 + Math.random() * 2
        )
        pile.castShadow = true
        scene.add(pile)
      }
    }

    // Enter VR Mode
    const enterVR = async () => {
      try {
        // Check VR ticket availability
        if (!ticketStore.canUseTicket) {
          alert('VRチケットが不足しています')
          return
        }

        // Request VR session
        vrSession = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
        })

        // Set session to renderer
        await renderer.xr.setSession(vrSession)

        // Use VR ticket
        ticketStore.useTicket('vr_session', {
          game: 'ConstructionVR'
        })

        isVRActive.value = true
        vrStatus.value = 'VR建築モード'

        // Handle session end
        vrSession.addEventListener('end', () => {
          isVRActive.value = false
          vrStatus.value = 'VR終了'
          vrSession = null
        })

        logger.log('🏗️ Entered VR construction mode')

      } catch (error) {
        logger.error('Failed to enter VR:', error)
        alert('VRモードの開始に失敗しました: ' + error.message)
      }
    }

    // Block Selection (for non-VR mode)
    const selectBlock = (block) => {
      gameState.selectedBlockId = block.id
      logger.log(`Selected block: ${block.label}`)
    }

    // Animation Loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        // Update physics
        world.step(1/60)

        // Sync physics bodies with visual objects
        gameState.availableBlocks.forEach(blockData => {
          if (blockData.mesh && blockData.physics && blockData.physics.type === CANNON.Body.DYNAMIC) {
            blockData.mesh.position.copy(blockData.physics.position)
            blockData.mesh.quaternion.copy(blockData.physics.quaternion)
          }
        })

        // Update time-based animations
        const time = Date.now() * 0.001

        // Animate snap zones
        gameState.snapZones.forEach((zone, index) => {
          if (!zone.occupied) {
            zone.mesh.material.opacity = 0.3 + Math.sin(time * 2 + index) * 0.1
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

      if (world) {
        world.bodies.forEach(body => world.remove(body))
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
      blockPlacedSound,
      constructionSuccess,
      floorCompleted,

      // State
      isVRActive,
      vrSupported,
      vrStatus,

      // Game state
      currentFloor,
      totalFloors,
      buildingProgress,
      totalScore,
      availableBlocks,
      selectedBlockId,

      // Game objects for computed access
      currentProject: computed(() => gameState.currentProject),
      buildingFloors: computed(() => gameState.buildingFloors),

      // Methods
      enterVR,
      selectBlock
    }
  }
}
</script>

<style scoped>
.construction-vr-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #87ceeb 0%, #98fb98 100%);
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

.construction-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(to bottom, rgba(139, 115, 85, 0.9), transparent);
  pointer-events: auto;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.status-label {
  opacity: 0.8;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-value {
  font-weight: bold;
  font-size: 1rem;
}

.vr-enter-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border: 2px solid rgba(255, 107, 53, 0.5);
  border-radius: 2rem;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.vr-enter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
}

.building-hud {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 10;
}

.hud-building-info,
.hud-floor-info,
.hud-blocks,
.hud-score {
  background: rgba(139, 115, 85, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: white;
  text-align: center;
  min-width: 160px;
  backdrop-filter: blur(10px);
}

.building-label,
.floor-label,
.blocks-label,
.score-label {
  font-size: 0.75rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
}

.building-name {
  font-size: 1rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 0.25rem;
}

.building-type {
  font-size: 0.8rem;
  opacity: 0.9;
}

.floor-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ff00;
  margin-bottom: 0.25rem;
}

.floor-topic {
  font-size: 0.875rem;
  color: #87ceeb;
}

.blocks-count {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ff6b35;
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

.block-inventory {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 1rem;
  padding: 1rem;
  z-index: 10;
  max-width: 400px;
}

.block-inventory h3 {
  color: white;
  margin-bottom: 1rem;
  text-align: center;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
}

.inventory-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.inventory-block:hover {
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.inventory-block.selected {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
}

.block-noun { border-left: 4px solid #ff6b6b; }
.block-verb { border-left: 4px solid #4ecdc4; }
.block-article { border-left: 4px solid #ffd93d; }
.block-adjective { border-left: 4px solid #6c5ce7; }
.block-preposition { border-left: 4px solid #a29bfe; }

.block-symbol {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.25rem;
}

.block-label {
  font-size: 0.75rem;
  color: #ccc;
  margin-bottom: 0.25rem;
}

.block-category {
  font-size: 0.625rem;
  color: #999;
  text-transform: uppercase;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .building-hud {
    top: 1rem;
    right: 1rem;
    gap: 0.5rem;
  }

  .hud-building-info,
  .hud-floor-info,
  .hud-blocks,
  .hud-score {
    padding: 0.5rem;
    min-width: 120px;
  }

  .block-inventory {
    bottom: 1rem;
    left: 1rem;
    max-width: 300px;
  }

  .inventory-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }
}
</style>