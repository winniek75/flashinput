<template>
  <div class="star-background">
    <!-- Multiple Layers for Parallax Effect -->
    <div class="stars-layer layer-1">
      <div v-for="n in 50" :key="`s1-${n}`" class="star star-small" :style="getStarStyle(n, 1)"></div>
    </div>
    
    <div class="stars-layer layer-2">
      <div v-for="n in 30" :key="`s2-${n}`" class="star star-medium" :style="getStarStyle(n, 2)"></div>
    </div>
    
    <div class="stars-layer layer-3">
      <div v-for="n in 20" :key="`s3-${n}`" class="star star-large" :style="getStarStyle(n, 3)"></div>
    </div>
    
    <!-- Nebula Effects -->
    <div class="nebula nebula-1"></div>
    <div class="nebula nebula-2"></div>
    
    <!-- Shooting Stars -->
    <div class="shooting-stars">
      <div v-for="n in 5" :key="`ss-${n}`" class="shooting-star" :style="getShootingStarStyle(n)"></div>
    </div>
    
    <!-- Galaxy -->
    <div class="galaxy"></div>
    
    <!-- Cosmic Dust -->
    <div class="cosmic-dust">
      <div v-for="n in 100" :key="`d-${n}`" class="dust-particle" :style="getDustStyle(n)"></div>
    </div>
    
    <!-- Planets in Background -->
    <div class="distant-planets">
      <div class="planet planet-1"></div>
      <div class="planet planet-2"></div>
      <div class="planet planet-3"></div>
    </div>
    
    <!-- Constellation Lines -->
    <svg class="constellation" viewBox="0 0 100 100" preserveAspectRatio="none">
      <g class="constellation-group">
        <circle cx="20" cy="30" r="0.5" fill="white" opacity="0.6"/>
        <circle cx="35" cy="25" r="0.5" fill="white" opacity="0.6"/>
        <circle cx="50" cy="35" r="0.5" fill="white" opacity="0.6"/>
        <circle cx="65" cy="30" r="0.5" fill="white" opacity="0.6"/>
        <circle cx="80" cy="40" r="0.5" fill="white" opacity="0.6"/>
        
        <line x1="20" y1="30" x2="35" y2="25" stroke="white" stroke-width="0.1" opacity="0.3"/>
        <line x1="35" y1="25" x2="50" y2="35" stroke="white" stroke-width="0.1" opacity="0.3"/>
        <line x1="50" y1="35" x2="65" y2="30" stroke="white" stroke-width="0.1" opacity="0.3"/>
        <line x1="65" y1="30" x2="80" y2="40" stroke="white" stroke-width="0.1" opacity="0.3"/>
      </g>
    </svg>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'

export default {
  name: 'StarBackground',
  setup() {
    let animationFrame = null
    
    // Generate random star positions
    const getStarStyle = (index, layer) => {
      const x = Math.random() * 100
      const y = Math.random() * 100
      const delay = Math.random() * 5
      const duration = 3 + Math.random() * 4
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }
    }
    
    // Generate shooting star styles
    const getShootingStarStyle = (index) => {
      const startX = Math.random() * 100
      const startY = Math.random() * 50
      const delay = index * 8 + Math.random() * 5
      
      return {
        left: `${startX}%`,
        top: `${startY}%`,
        animationDelay: `${delay}s`
      }
    }
    
    // Generate cosmic dust styles
    const getDustStyle = (index) => {
      const x = Math.random() * 100
      const y = Math.random() * 100
      const size = 0.5 + Math.random() * 1.5
      const opacity = 0.1 + Math.random() * 0.3
      const delay = Math.random() * 10
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity,
        animationDelay: `${delay}s`
      }
    }
    
    // Parallax effect on mouse move
    const handleMouseMove = (event) => {
      const layers = document.querySelectorAll('.stars-layer')
      const x = event.clientX / window.innerWidth
      const y = event.clientY / window.innerHeight
      
      layers.forEach((layer, index) => {
        const speed = (index + 1) * 2
        const xOffset = (x - 0.5) * speed
        const yOffset = (y - 0.5) * speed
        layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`
      })
    }
    
    onMounted(() => {
      window.addEventListener('mousemove', handleMouseMove)
    })
    
    onUnmounted(() => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    })
    
    return {
      getStarStyle,
      getShootingStarStyle,
      getDustStyle
    }
  }
}
</script>

<style scoped>
.star-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

/* Star Layers */
.stars-layer {
  position: absolute;
  top: -5%;
  left: -5%;
  width: 110%;
  height: 110%;
  transition: transform 0.1s ease-out;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle linear infinite;
}

.star-small {
  width: 1px;
  height: 1px;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.star-medium {
  width: 2px;
  height: 2px;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.9);
}

.star-large {
  width: 3px;
  height: 3px;
  box-shadow: 0 0 6px rgba(255, 255, 255, 1);
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

/* Nebula Effects */
.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
}

.nebula-1 {
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse at center, #667eea 0%, transparent 70%);
  top: 10%;
  right: -200px;
  animation: nebulaDrift 60s ease-in-out infinite;
}

.nebula-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle at center, #764ba2 0%, transparent 70%);
  bottom: 10%;
  left: -150px;
  animation: nebulaDrift 80s ease-in-out infinite reverse;
}

@keyframes nebulaDrift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -20px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 30px) scale(0.9);
  }
}

/* Shooting Stars */
.shooting-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.shooting-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: shootingStar 3s ease-in-out infinite;
  animation-fill-mode: both;
}

.shooting-star::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, white, transparent);
  transform: translateX(-100px);
  opacity: 0.6;
}

@keyframes shootingStar {
  0% {
    transform: translate(0, 0) rotate(-45deg);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  100% {
    transform: translate(300px, 300px) rotate(-45deg);
    opacity: 0;
  }
}

/* Galaxy */
.galaxy {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="galaxy"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="50%" stop-color="%23667eea" stop-opacity="0.05"/><stop offset="100%" stop-color="%23764ba2" stop-opacity="0"/></radialGradient></defs><circle cx="500" cy="500" r="400" fill="url(%23galaxy)"/></svg>') no-repeat center;
  background-size: 150% 150%;
  opacity: 0.3;
  animation: galaxyRotate 200s linear infinite;
}

@keyframes galaxyRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Cosmic Dust */
.cosmic-dust {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.dust-particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: floatDust 20s ease-in-out infinite;
}

@keyframes floatDust {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(10px) translateX(-10px);
  }
  75% {
    transform: translateY(-10px) translateX(-20px);
  }
}

/* Distant Planets */
.distant-planets {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.planet {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
}

.planet-1 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle at 30% 30%, #ffd700, #ff8c00);
  top: 20%;
  right: 15%;
  animation: planetOrbit 120s linear infinite;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.planet-2 {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at 30% 30%, #4fc3f7, #2196f3);
  bottom: 30%;
  left: 10%;
  animation: planetOrbit 90s linear infinite reverse;
  box-shadow: 0 0 25px rgba(33, 150, 243, 0.3);
}

.planet-3 {
  width: 40px;
  height: 40px;
  background: radial-gradient(circle at 30% 30%, #81c784, #4caf50);
  top: 60%;
  left: 70%;
  animation: planetFloat 30s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

@keyframes planetOrbit {
  from {
    transform: rotate(0deg) translateX(50px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(50px) rotate(-360deg);
  }
}

@keyframes planetFloat {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-30px) translateX(20px);
  }
}

/* Constellation */
.constellation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.constellation-group {
  animation: constellationGlow 10s ease-in-out infinite;
}

@keyframes constellationGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nebula-1, .nebula-2 {
    filter: blur(40px);
  }
  
  .planet-1 {
    width: 60px;
    height: 60px;
  }
  
  .planet-2 {
    width: 40px;
    height: 40px;
  }
  
  .planet-3 {
    width: 30px;
    height: 30px;
  }
}

/* Performance optimization for low-end devices */
@media (prefers-reduced-motion: reduce) {
  .star,
  .shooting-star,
  .dust-particle,
  .planet,
  .nebula,
  .galaxy {
    animation: none !important;
  }
  
  .stars-layer {
    transition: none !important;
  }
}
</style>