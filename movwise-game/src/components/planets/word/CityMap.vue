<template>
  <div class="city-map-container">
    <div class="city-grid" :style="{ transform: `scale(${zoomLevel})` }">
      <!-- City Background Grid -->
      <div class="city-background">
        <div 
          v-for="row in gridHeight" 
          :key="`row-${row}`" 
          class="grid-row"
        >
          <div 
            v-for="col in gridWidth" 
            :key="`cell-${row}-${col}`" 
            :class="[
              'grid-cell',
              getCellType(row, col)
            ]"
          />
        </div>
      </div>

      <!-- District Buildings -->
      <div class="buildings-layer">
        <div
          v-for="district in cityDistricts"
          :key="district.id"
          :class="[
            'district-area',
            `district-${district.id}`
          ]"
          :style="getDistrictStyle(district)"
          @click="$emit('district-selected', district)"
        >
          <!-- District Label -->
          <div class="district-label">
            <div class="district-icon">{{ district.icon }}</div>
            <div class="district-name">{{ district.name }}</div>
          </div>

          <!-- Facilities within District -->
          <div class="facilities-container">
            <div
              v-for="facility in district.facilities"
              :key="facility.id"
              :class="[
                'facility-building',
                `facility-${facility.id}`,
                facility.unlocked ? 'facility-active' : 'facility-inactive'
              ]"
              :style="getFacilityStyle(facility)"
              @click.stop="handleFacilityClick(facility)"
            >
              <!-- Building Structure -->
              <div class="building-base">
                <div class="building-main" :class="getBuildingClass(facility)">
                  <div class="building-face building-front">
                    <div class="facility-icon">{{ facility.icon }}</div>
                    <div class="facility-windows">
                      <div 
                        v-for="window in getBuildingWindows(facility)" 
                        :key="window"
                        :class="[
                          'window',
                          facility.unlocked ? 'window-lit' : 'window-dark'
                        ]"
                      />
                    </div>
                  </div>
                  <div class="building-face building-side">
                    <div class="side-details"></div>
                  </div>
                </div>
                
                <!-- Building Shadow -->
                <div class="building-shadow"></div>
                
                <!-- Progress Indicator -->
                <div v-if="facility.progress && facility.unlocked" class="progress-indicator">
                  <div 
                    class="progress-fill"
                    :style="{ width: `${facility.progress}%` }"
                  ></div>
                </div>
              </div>

              <!-- Facility Info Panel -->
              <div class="facility-info" v-if="selectedFacility === facility.id">
                <div class="info-panel">
                  <h4 class="facility-title">{{ facility.name }}</h4>
                  <p class="facility-description">{{ facility.description }}</p>
                  <div v-if="facility.progress" class="progress-stats">
                    <span>進捗: {{ facility.progress }}%</span>
                  </div>
                  <div v-if="!facility.unlocked" class="unlock-requirement">
                    🔒 {{ facility.unlockRequirement }}
                  </div>
                </div>
              </div>

              <!-- Interactive Elements -->
              <div v-if="facility.unlocked" class="facility-particles">
                <div 
                  v-for="particle in 6" 
                  :key="particle"
                  class="particle"
                  :style="{ animationDelay: `${particle * 0.2}s` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- City Infrastructure -->
      <div class="infrastructure-layer">
        <!-- Roads -->
        <div class="road horizontal-road road-1"></div>
        <div class="road vertical-road road-2"></div>
        <div class="road horizontal-road road-3"></div>
        
        <!-- City Park -->
        <div class="city-park">
          <div class="park-trees">
            <div v-for="tree in 8" :key="tree" class="tree">🌳</div>
          </div>
          <div class="park-fountain">⛲</div>
        </div>

        <!-- Transportation -->
        <div class="transport-line">
          <div class="transport-vehicle" :style="{ left: `${vehiclePosition}%` }">
            🚌
          </div>
        </div>
      </div>

      <!-- Weather Effects -->
      <div v-if="weatherEffect" class="weather-layer">
        <div 
          v-for="drop in weatherParticles" 
          :key="drop.id"
          :class="`weather-${weatherEffect}`"
          :style="{
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`
          }"
        >
          {{ getWeatherSymbol() }}
        </div>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="map-controls">
      <button 
        @click="zoomIn" 
        class="control-button zoom-in"
        :disabled="zoomLevel >= maxZoom"
      >
        🔍+
      </button>
      <button 
        @click="zoomOut" 
        class="control-button zoom-out"
        :disabled="zoomLevel <= minZoom"
      >
        🔍-
      </button>
      <button 
        @click="toggleWeather" 
        class="control-button weather-toggle"
      >
        {{ weatherEffect ? '☀️' : '🌧️' }}
      </button>
      <button 
        @click="centerMap" 
        class="control-button center-map"
      >
        🎯
      </button>
    </div>

    <!-- Mini Map -->
    <div class="mini-map">
      <div class="mini-grid">
        <div 
          v-for="district in cityDistricts" 
          :key="`mini-${district.id}`"
          class="mini-district"
          :class="{ 'mini-active': selectedDistrict === district.id }"
          @click="focusDistrict(district)"
        >
          {{ district.icon }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  cityDistricts: {
    type: Array,
    required: true
  },
  playerProgress: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['district-selected', 'facility-clicked'])

// Map State
const zoomLevel = ref(1.0)
const maxZoom = 1.5
const minZoom = 0.7
const selectedFacility = ref(null)
const selectedDistrict = ref(null)
const vehiclePosition = ref(0)
const weatherEffect = ref(null)
const weatherParticles = ref([])

// Grid Configuration
const gridWidth = 20
const gridHeight = 15

// District Positions (grid coordinates)
const districtPositions = {
  recognition_quarter: { x: 2, y: 2, width: 6, height: 5 },
  speed_district: { x: 10, y: 2, width: 6, height: 5 },
  construction_zone: { x: 2, y: 8, width: 6, height: 5 },
  racing_circuit: { x: 10, y: 8, width: 6, height: 5 }
}

// Facility Positions within Districts
const facilityPositions = {
  sight_word_library: { x: 1, y: 1 },
  word_memory_palace: { x: 4, y: 1 },
  speed_track: { x: 1, y: 1 },
  reflex_center: { x: 4, y: 1 },
  word_factory: { x: 1, y: 1 },
  syllable_workshop: { x: 4, y: 1 },
  spell_circuit: { x: 1, y: 1 },
  dictation_dome: { x: 4, y: 1 }
}

// Computed Properties
const islandLayout = computed(() => {
  return props.cityDistricts.map(district => ({
    ...district,
    position: districtPositions[district.id] || { x: 0, y: 0, width: 4, height: 4 }
  }))
})

// Methods
const getCellType = (row, col) => {
  // Determine cell type based on position
  if ((row + col) % 4 === 0) return 'cell-road'
  if ((row + col) % 6 === 0) return 'cell-park'
  return 'cell-ground'
}

const getDistrictStyle = (district) => {
  const position = districtPositions[district.id]
  if (!position) return {}
  
  return {
    left: `${(position.x / gridWidth) * 100}%`,
    top: `${(position.y / gridHeight) * 100}%`,
    width: `${(position.width / gridWidth) * 100}%`,
    height: `${(position.height / gridHeight) * 100}%`
  }
}

const getFacilityStyle = (facility) => {
  const position = facilityPositions[facility.id]
  if (!position) return {}
  
  return {
    left: `${position.x * 25}%`,
    top: `${position.y * 25}%`
  }
}

const getBuildingClass = (facility) => {
  const classes = ['building-standard']
  
  // Add facility-specific building styles
  if (facility.id.includes('library')) classes.push('building-tall')
  if (facility.id.includes('factory')) classes.push('building-industrial')
  if (facility.id.includes('track') || facility.id.includes('circuit')) classes.push('building-wide')
  if (facility.unlocked) classes.push('building-active')
  
  return classes
}

const getBuildingWindows = (facility) => {
  // Different buildings have different window counts
  if (facility.id.includes('library')) return 12
  if (facility.id.includes('factory')) return 8
  if (facility.id.includes('track')) return 6
  return 9
}

const getWeatherSymbol = () => {
  return weatherEffect.value === 'rain' ? '💧' : '❄️'
}

// Event Handlers
const handleFacilityClick = (facility) => {
  selectedFacility.value = selectedFacility.value === facility.id ? null : facility.id
  emit('facility-clicked', facility)
}

const zoomIn = () => {
  if (zoomLevel.value < maxZoom) {
    zoomLevel.value = Math.min(maxZoom, zoomLevel.value + 0.1)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > minZoom) {
    zoomLevel.value = Math.max(minZoom, zoomLevel.value - 0.1)
  }
}

const toggleWeather = () => {
  weatherEffect.value = weatherEffect.value ? null : 'rain'
  if (weatherEffect.value) {
    generateWeatherParticles()
  }
}

const centerMap = () => {
  zoomLevel.value = 1.0
  selectedFacility.value = null
  selectedDistrict.value = null
}

const focusDistrict = (district) => {
  selectedDistrict.value = district.id
  emit('district-selected', district)
}

const generateWeatherParticles = () => {
  weatherParticles.value = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3
  }))
}

// Animation Functions
const animateVehicle = () => {
  vehiclePosition.value = (vehiclePosition.value + 0.5) % 100
}

// Lifecycle
onMounted(() => {
  // Start vehicle animation
  const vehicleInterval = setInterval(animateVehicle, 100)
  
  onUnmounted(() => {
    clearInterval(vehicleInterval)
  })
})
</script>

<style scoped>
.city-map-container {
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.city-grid {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  transform-origin: center;
}

/* Grid Background */
.city-background {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
  flex: 1;
}

.grid-cell {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.cell-ground {
  background: rgba(144, 238, 144, 0.3);
}

.cell-road {
  background: rgba(128, 128, 128, 0.4);
}

.cell-park {
  background: rgba(34, 139, 34, 0.3);
}

/* Buildings Layer */
.buildings-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.district-area {
  position: absolute;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.district-area:hover {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

.district-label {
  position: absolute;
  top: -15px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.district-icon {
  font-size: 1rem;
}

.facilities-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Facility Buildings */
.facility-building {
  position: absolute;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.facility-building:hover {
  transform: scale(1.1);
}

.building-base {
  position: relative;
  width: 100%;
  height: 100%;
}

.building-main {
  position: relative;
  width: 50px;
  height: 50px;
  margin: 0 auto;
  transform-style: preserve-3d;
}

.building-standard {
  height: 50px;
}

.building-tall {
  height: 65px;
}

.building-wide {
  width: 65px;
}

.building-industrial {
  border-radius: 2px;
}

.building-face {
  position: absolute;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.building-front {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.building-side {
  width: 15px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  right: -15px;
  top: 0;
  transform: rotateY(90deg) translateZ(25px);
}

.building-active .building-face {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  animation: building-pulse 2s ease-in-out infinite;
}

.facility-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
}

.facility-windows {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  width: 70%;
}

.window {
  width: 4px;
  height: 4px;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.window-lit {
  background: #FFF59D;
  box-shadow: 0 0 3px #FFF59D;
}

.window-dark {
  background: rgba(0, 0, 0, 0.3);
}

.building-shadow {
  position: absolute;
  bottom: -5px;
  left: 5px;
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  transform: scaleX(1.2);
  z-index: -1;
}

.progress-indicator {
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Facility Info Panel */
.facility-info {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.info-panel {
  background: rgba(255, 255, 255, 0.95);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  min-width: 120px;
  font-size: 0.75rem;
  color: #333;
  text-align: center;
}

.facility-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #4f46e5;
}

.facility-description {
  margin-bottom: 6px;
  color: #666;
}

.progress-stats {
  color: #059669;
  font-weight: bold;
}

.unlock-requirement {
  color: #dc2626;
  font-size: 0.7rem;
}

/* Particles */
.facility-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #fbbf24;
  border-radius: 50%;
  animation: particle-float 3s ease-in-out infinite;
}

.particle:nth-child(1) { top: 10%; left: 20%; }
.particle:nth-child(2) { top: 20%; right: 20%; }
.particle:nth-child(3) { bottom: 30%; left: 30%; }
.particle:nth-child(4) { bottom: 20%; right: 30%; }
.particle:nth-child(5) { top: 50%; left: 10%; }
.particle:nth-child(6) { top: 40%; right: 10%; }

/* Infrastructure Layer */
.infrastructure-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 5;
}

.road {
  position: absolute;
  background: rgba(128, 128, 128, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.horizontal-road {
  height: 8px;
  width: 100%;
}

.vertical-road {
  width: 8px;
  height: 100%;
}

.road-1 { top: 30%; }
.road-2 { left: 50%; }
.road-3 { top: 70%; }

.city-park {
  position: absolute;
  top: 45%;
  left: 45%;
  width: 10%;
  height: 10%;
  background: rgba(34, 139, 34, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.park-trees {
  position: absolute;
  width: 100%;
  height: 100%;
}

.tree {
  position: absolute;
  font-size: 0.8rem;
  animation: tree-sway 4s ease-in-out infinite;
}

.tree:nth-child(1) { top: 10%; left: 20%; }
.tree:nth-child(2) { top: 20%; right: 20%; }
.tree:nth-child(3) { bottom: 20%; left: 30%; }
.tree:nth-child(4) { bottom: 30%; right: 15%; }

.park-fountain {
  font-size: 1.2rem;
  z-index: 2;
}

.transport-line {
  position: absolute;
  top: 30%;
  width: 100%;
  height: 8px;
}

.transport-vehicle {
  position: absolute;
  top: -10px;
  font-size: 1.2rem;
  animation: vehicle-bounce 0.5s ease-in-out infinite;
}

/* Weather Layer */
.weather-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 50;
  pointer-events: none;
}

.weather-rain {
  position: absolute;
  font-size: 0.8rem;
  animation: rain-fall linear infinite;
}

/* Map Controls */
.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 100;
}

.control-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(102, 126, 234, 0.5);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.1);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mini Map */
.mini-map {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 100px;
  height: 75px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 5px;
  z-index: 100;
}

.mini-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  height: 100%;
}

.mini-district {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mini-district:hover,
.mini-active {
  background: rgba(102, 126, 234, 0.6);
  transform: scale(1.1);
}

/* Keyframe Animations */
@keyframes building-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8), 0 0 40px rgba(102, 126, 234, 0.3); }
}

@keyframes particle-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
  50% { transform: translateY(-15px) rotate(180deg); opacity: 0.7; }
}

@keyframes tree-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

@keyframes vehicle-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

@keyframes rain-fall {
  0% { transform: translateY(-10px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(110vh); opacity: 0; }
}
</style>