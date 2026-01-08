<template>
  <TresGroup 
    :position="planet.position"
    @click="handleClick"
    @pointer-over="handleHover"
    @pointer-out="handleUnhover"
  >
    <!-- Planet Sphere -->
    <TresMesh 
      ref="planetMesh"
      :rotation="[0, rotation, 0]"
    >
      <TresSphereGeometry :args="[planet.size, 32, 32]" />
      <TresMeshStandardMaterial 
        :color="currentColor"
        :metalness="0.3"
        :roughness="0.7"
        :emissive="planet.unlocked ? planet.color : '#000000'"
        :emissive-intensity="emissiveIntensity"
      />
    </TresMesh>
    
    <!-- Planet Atmosphere (if unlocked) -->
    <TresMesh v-if="planet.unlocked">
      <TresSphereGeometry :args="[planet.size * 1.1, 32, 32]" />
      <TresMeshBasicMaterial 
        :color="planet.color"
        :transparent="true"
        :opacity="0.1"
        :side="2"
      />
    </TresMesh>
    
    <!-- Planet Ring (for some planets) -->
    <TresMesh 
      v-if="showRing"
      :rotation="[Math.PI / 2, 0, 0]"
    >
      <TresTorusGeometry :args="[planet.size * 1.5, 0.2, 8, 32]" />
      <TresMeshStandardMaterial 
        :color="planet.color"
        :metalness="0.8"
        :roughness="0.2"
        :opacity="0.7"
        :transparent="true"
      />
    </TresMesh>
    
    <!-- Lock Icon (if locked) -->
    <TresGroup v-if="!planet.unlocked">
      <TresSprite :position="[0, planet.size + 1, 0]">
        <TresSpriteMaterial 
          :color="0xffaa00"
          :size="[1, 1]"
        />
      </TresSprite>
    </TresGroup>
    
    <!-- Completion Checkmark (if completed) -->
    <TresGroup v-if="planet.completed">
      <TresSprite :position="[0, planet.size + 1, 0]">
        <TresSpriteMaterial 
          :color="0x00ff00"
          :size="[1, 1]"
        />
      </TresSprite>
    </TresGroup>
    
    <!-- Planet Label -->
    <TresGroup :position="[0, -planet.size - 1, 0]">
      <TresSprite>
        <TresSpriteMaterial 
          :color="0xffffff"
          :size="[3, 0.5]"
        />
      </TresSprite>
    </TresGroup>
    
    <!-- Orbiting Particles (decorative) -->
    <TresPoints v-if="planet.unlocked && isHovered">
      <TresBufferGeometry :position="orbitParticles" />
      <TresPointsMaterial 
        :size="0.05"
        :color="planet.color"
        :transparent="true"
        :opacity="0.8"
      />
    </TresPoints>
  </TresGroup>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  planet: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'hover', 'unhover'])

// State
const rotation = ref(0)
const isHovered = ref(false)
const emissiveIntensity = ref(0.1)

// Computed
const currentColor = computed(() => {
  if (!props.planet.unlocked) {
    return '#333333'
  }
  if (isHovered.value) {
    return lightenColor(props.planet.color, 20)
  }
  return props.planet.color
})

const showRing = computed(() => {
  // Show rings for specific planets
  return ['time', 'method'].includes(props.planet.id)
})

const orbitParticles = computed(() => {
  const positions = new Float32Array(300)
  const radius = props.planet.size * 1.5
  
  for (let i = 0; i < 100; i++) {
    const angle = (i / 100) * Math.PI * 2
    const i3 = i * 3
    
    positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.5
    positions[i3 + 1] = (Math.random() - 0.5) * 0.5
    positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.5
  }
  
  return positions
})

// Methods
const handleClick = () => {
  if (props.planet.unlocked) {
    emit('click', props.planet)
  }
}

const handleHover = () => {
  isHovered.value = true
  emissiveIntensity.value = 0.3
  emit('hover', props.planet)
}

const handleUnhover = () => {
  isHovered.value = false
  emissiveIntensity.value = 0.1
  emit('unhover', props.planet)
}

const lightenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  
  return '#' + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1)
}

// Animation
let animationId = null
const animate = () => {
  rotation.value += 0.005
  animationId = requestAnimationFrame(animate)
}

// Lifecycle
onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>