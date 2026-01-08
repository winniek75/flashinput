<template>
  <div class="event-banner-container">
    <Transition 
      name="banner-slide" 
      appear
    >
      <div 
        v-if="currentEvent"
        class="event-banner"
        :class="[
          `banner-${currentEvent.type}`,
          `animation-${currentEvent.bannerConfig.animationType}`,
          `layout-${currentEvent.bannerConfig.layout}`,
          { 'ending-soon': isEndingSoon }
        ]"
        :style="bannerStyles"
        @click="handleBannerClick"
      >
        <!-- Background Image -->
        <div 
          class="banner-background"
          :style="{ backgroundImage: `url(${currentEvent.bannerConfig.bannerImage})` }"
        />
        
        <!-- Animated Overlay Effects -->
        <div class="animation-overlay">
          <div v-if="currentEvent.bannerConfig.animationType === 'sparkle'" class="sparkles">
            <div 
              v-for="i in 20" 
              :key="`sparkle-${i}`"
              class="sparkle"
              :style="getSparkleStyle(i)"
            />
          </div>
          
          <div v-if="currentEvent.bannerConfig.animationType === 'seasonal'" class="seasonal-effects">
            <div v-if="currentEvent.seasonalPeriod === 'spring'" class="cherry-petals">
              <div 
                v-for="i in 15" 
                :key="`petal-${i}`"
                class="petal"
                :style="getPetalStyle(i)"
              />
            </div>
            <div v-if="currentEvent.seasonalPeriod === 'summer'" class="sun-rays">
              <div class="ray" v-for="i in 8" :key="`ray-${i}`" :style="getRayStyle(i)" />
            </div>
            <div v-if="currentEvent.seasonalPeriod === 'halloween'" class="floating-spirits">
              <div v-for="i in 6" :key="`spirit-${i}`" class="spirit" :style="getSpiritStyle(i)" />
            </div>
            <div v-if="currentEvent.seasonalPeriod === 'christmas'" class="snowflakes">
              <div v-for="i in 10" :key="`snow-${i}`" class="snowflake" :style="getSnowStyle(i)" />
            </div>
          </div>
          
          <div v-if="currentEvent.bannerConfig.animationType === 'festive'" class="festive-effects">
            <div class="fireworks">
              <div v-for="i in 5" :key="`firework-${i}`" class="firework" :style="getFireworkStyle(i)" />
            </div>
          </div>
        </div>

        <!-- Content Container -->
        <div class="banner-content">
          <!-- Event Icon/Badge -->
          <div class="event-badge">
            <div class="badge-icon">
              <Icon 
                :name="getEventIcon(currentEvent.type)" 
                class="icon"
              />
            </div>
            <div class="badge-text">{{ getEventTypeLabel(currentEvent.type) }}</div>
          </div>

          <!-- Main Content -->
          <div class="main-content">
            <h2 class="event-title" :style="titleStyles">
              {{ currentEvent.title }}
            </h2>
            <p class="event-subtitle">
              {{ currentEvent.subtitle }}
            </p>
            <p class="event-description">
              {{ currentEvent.description }}
            </p>
          </div>

          <!-- Event Status & Actions -->
          <div class="event-actions">
            <!-- Countdown Timer -->
            <div 
              class="countdown-section"
              :class="`countdown-${currentEvent.bannerConfig.countdownStyle}`"
            >
              <div class="countdown-label">
                {{ getCountdownLabel() }}
              </div>
              <div class="countdown-timer">
                <div class="time-unit" v-if="timeRemaining.days > 0">
                  <span class="time-value">{{ timeRemaining.days }}</span>
                  <span class="time-label">日</span>
                </div>
                <div class="time-unit" v-if="timeRemaining.hours > 0 || timeRemaining.days > 0">
                  <span class="time-value">{{ timeRemaining.hours }}</span>
                  <span class="time-label">時</span>
                </div>
                <div class="time-unit">
                  <span class="time-value">{{ timeRemaining.minutes }}</span>
                  <span class="time-label">分</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button 
                v-if="!isEventStarted"
                class="btn btn-preview"
                @click.stop="previewEvent"
              >
                <Icon name="eye" />
                プレビュー
              </button>

              <button 
                v-if="isEventActive && !isPlayerParticipating"
                class="btn btn-join"
                @click.stop="joinEvent"
                :disabled="!canJoinEvent"
              >
                <Icon name="play" />
                参加する
              </button>

              <button 
                v-if="isPlayerParticipating"
                class="btn btn-continue"
                @click.stop="continueEvent"
              >
                <Icon name="arrow-right" />
                続ける
              </button>

              <button 
                class="btn btn-details"
                @click.stop="showEventDetails"
              >
                <Icon name="info" />
                詳細
              </button>
            </div>
          </div>
        </div>

        <!-- Priority Indicator -->
        <div 
          v-if="currentEvent.priority >= 90"
          class="priority-indicator"
          :class="`priority-${getPriorityLevel()}`"
        >
          <Icon name="star" />
          <span>{{ getPriorityLabel() }}</span>
        </div>

        <!-- Status Badge -->
        <div 
          class="status-badge"
          :class="`status-${currentEvent.status}`"
        >
          {{ getStatusLabel(currentEvent.status) }}
        </div>

        <!-- Participation Progress (if participating) -->
        <div 
          v-if="isPlayerParticipating && eventProgress"
          class="progress-indicator"
        >
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${eventProgress.participationRate * 100}%` }"
            />
          </div>
          <span class="progress-text">
            {{ Math.round(eventProgress.participationRate * 100) }}% 完了
          </span>
        </div>

        <!-- Close Button -->
        <button 
          class="close-btn"
          @click.stop="closeBanner"
          :title="'バナーを閉じる'"
        >
          <Icon name="x" />
        </button>
      </div>
    </Transition>

    <!-- Banner Navigation (if multiple events) -->
    <div v-if="availableEvents.length > 1" class="banner-navigation">
      <button 
        v-for="(event, index) in availableEvents"
        :key="event.id"
        class="nav-dot"
        :class="{ active: currentEventIndex === index }"
        @click="switchToEvent(index)"
        :title="event.title"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { eventStorySystem } from '@/story/events/EventStorySystem'
import type { EventStory, EventProgress } from '@/story/events/EventStorySystem'
import Icon from '@/components/ui/Icon.vue'

// Props
interface Props {
  autoRotate?: boolean
  rotationInterval?: number
  showCloseButton?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoRotate: true,
  rotationInterval: 10000,
  showCloseButton: true,
  compact: false
})

// Emits
const emit = defineEmits<{
  eventJoined: [eventId: string]
  eventContinued: [eventId: string]
  eventPreviewed: [eventId: string]
  eventDetailsRequested: [eventId: string]
  bannerClosed: []
}>()

// Reactive State
const availableEvents = ref<EventStory[]>([])
const currentEventIndex = ref(0)
const timeRemaining = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const isVisible = ref(true)
const rotationTimer = ref<NodeJS.Timeout | null>(null)
const countdownTimer = ref<NodeJS.Timeout | null>(null)

// Computed Properties
const currentEvent = computed(() => {
  return availableEvents.value[currentEventIndex.value] || null
})

const isEventStarted = computed(() => {
  if (!currentEvent.value) return false
  return new Date() >= currentEvent.value.startDate
})

const isEventActive = computed(() => {
  if (!currentEvent.value) return false
  const now = new Date()
  return now >= currentEvent.value.startDate && now <= currentEvent.value.endDate
})

const isEndingSoon = computed(() => {
  return currentEvent.value?.status === 'ending_soon'
})

const isPlayerParticipating = computed(() => {
  if (!currentEvent.value) return false
  return eventStorySystem.getEventProgress(currentEvent.value.id) !== undefined
})

const eventProgress = computed(() => {
  if (!currentEvent.value) return null
  return eventStorySystem.getEventProgress(currentEvent.value.id)
})

const canJoinEvent = computed(() => {
  if (!currentEvent.value || !isEventActive.value) return false
  // Check requirements here if needed
  return true
})

const bannerStyles = computed(() => {
  if (!currentEvent.value) return {}
  
  return {
    '--accent-color': currentEvent.value.bannerConfig.accentColor,
    '--font-family': getFontFamily(currentEvent.value.bannerConfig.fontStyle)
  }
})

const titleStyles = computed(() => {
  if (!currentEvent.value) return {}
  
  return {
    fontFamily: getFontFamily(currentEvent.value.bannerConfig.fontStyle),
    color: currentEvent.value.bannerConfig.accentColor
  }
})

// Methods
const loadEvents = async () => {
  availableEvents.value = eventStorySystem.getBannerEvents()
}

const updateCountdown = () => {
  if (!currentEvent.value) return
  
  const now = new Date()
  const targetTime = isEventStarted.value ? currentEvent.value.endDate : currentEvent.value.startDate
  const diff = targetTime.getTime() - now.getTime()
  
  if (diff <= 0) {
    timeRemaining.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  timeRemaining.value = { days, hours, minutes, seconds }
}

const getCountdownLabel = () => {
  if (!isEventStarted.value) return '開始まで'
  if (isEndingSoon.value) return '終了まで'
  return '残り時間'
}

const getEventIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'seasonal': 'calendar',
    'character_birthday': 'gift',
    'collaboration': 'users',
    'special_story': 'book',
    'community': 'heart',
    'milestone': 'trophy',
    'limited_time': 'clock',
    'recurring': 'refresh'
  }
  return iconMap[type] || 'star'
}

const getEventTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    'seasonal': '季節イベント',
    'character_birthday': '誕生日',
    'collaboration': 'コラボ',
    'special_story': '特別ストーリー',
    'community': 'コミュニティ',
    'milestone': 'マイルストーン',
    'limited_time': '期間限定',
    'recurring': '定期イベント'
  }
  return labelMap[type] || 'イベント'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'announced': '予告',
    'active': '開催中',
    'ending_soon': 'まもなく終了',
    'completed': '終了',
    'archived': 'アーカイブ'
  }
  return statusMap[status] || status
}

const getPriorityLevel = () => {
  if (!currentEvent.value) return 'normal'
  if (currentEvent.value.priority >= 95) return 'urgent'
  if (currentEvent.value.priority >= 90) return 'high'
  return 'normal'
}

const getPriorityLabel = () => {
  const level = getPriorityLevel()
  const labelMap: Record<string, string> = {
    'urgent': '緊急',
    'high': '重要',
    'normal': '通常'
  }
  return labelMap[level]
}

const getFontFamily = (style: string) => {
  const fontMap: Record<string, string> = {
    'elegant': '"Noto Serif JP", serif',
    'festive': '"M PLUS Rounded 1c", sans-serif',
    'gothic': '"Noto Sans JP", sans-serif',
    'adventurous': '"Kosugi Maru", sans-serif',
    'inspirational': '"Sawarabi Gothic", sans-serif'
  }
  return fontMap[style] || '"Noto Sans JP", sans-serif'
}

// Animation Style Generators
const getSparkleStyle = (index: number) => {
  const delay = Math.random() * 2
  const duration = 1 + Math.random() * 2
  const x = Math.random() * 100
  const y = Math.random() * 100
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getPetalStyle = (index: number) => {
  const delay = Math.random() * 3
  const duration = 3 + Math.random() * 2
  const x = Math.random() * 100
  
  return {
    left: `${x}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getRayStyle = (index: number) => {
  const angle = (index * 45) + Math.random() * 10
  return {
    transform: `rotate(${angle}deg)`,
    animationDelay: `${index * 0.2}s`
  }
}

const getSpiritStyle = (index: number) => {
  const delay = Math.random() * 4
  const x = Math.random() * 100
  const y = 20 + Math.random() * 60
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`
  }
}

const getSnowStyle = (index: number) => {
  const delay = Math.random() * 2
  const duration = 2 + Math.random() * 3
  const x = Math.random() * 100
  const size = 4 + Math.random() * 8
  
  return {
    left: `${x}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getFireworkStyle = (index: number) => {
  const delay = index * 0.5
  const x = 20 + Math.random() * 60
  const y = 20 + Math.random() * 40
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`
  }
}

// Event Handlers
const handleBannerClick = () => {
  if (isPlayerParticipating.value) {
    continueEvent()
  } else if (isEventActive.value) {
    joinEvent()
  }
}

const joinEvent = () => {
  if (!currentEvent.value || !canJoinEvent.value) return
  emit('eventJoined', currentEvent.value.id)
}

const continueEvent = () => {
  if (!currentEvent.value) return
  emit('eventContinued', currentEvent.value.id)
}

const previewEvent = () => {
  if (!currentEvent.value) return
  emit('eventPreviewed', currentEvent.value.id)
}

const showEventDetails = () => {
  if (!currentEvent.value) return
  emit('eventDetailsRequested', currentEvent.value.id)
}

const closeBanner = () => {
  isVisible.value = false
  emit('bannerClosed')
}

const switchToEvent = (index: number) => {
  currentEventIndex.value = index
  updateCountdown()
}

const startRotation = () => {
  if (!props.autoRotate || availableEvents.value.length <= 1) return
  
  rotationTimer.value = setInterval(() => {
    currentEventIndex.value = (currentEventIndex.value + 1) % availableEvents.value.length
  }, props.rotationInterval)
}

const stopRotation = () => {
  if (rotationTimer.value) {
    clearInterval(rotationTimer.value)
    rotationTimer.value = null
  }
}

const startCountdown = () => {
  updateCountdown()
  countdownTimer.value = setInterval(updateCountdown, 60000) // Update every minute
}

const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await loadEvents()
  if (availableEvents.value.length > 0) {
    startCountdown()
    startRotation()
  }
})

onUnmounted(() => {
  stopRotation()
  stopCountdown()
})

// Watchers
watch(() => availableEvents.value.length, (newLength) => {
  if (newLength > 0) {
    startCountdown()
    if (props.autoRotate && newLength > 1) {
      startRotation()
    }
  } else {
    stopCountdown()
    stopRotation()
  }
})

watch(currentEventIndex, () => {
  updateCountdown()
})

// Expose methods for parent components
defineExpose({
  loadEvents,
  switchToEvent,
  closeBanner
})
</script>

<style scoped>
.event-banner-container {
  position: relative;
  margin-bottom: 20px;
}

.event-banner {
  position: relative;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.95) 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
}

.event-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.event-banner.ending-soon {
  border-color: #ff6b6b;
  box-shadow: 0 8px 32px rgba(255,107,107,0.2);
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 1;
}

.animation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}

/* Animation Effects */
.sparkles .sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #ffd700, #ffed4e);
  border-radius: 50%;
  animation: sparkle 2s infinite ease-in-out;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.cherry-petals .petal {
  position: absolute;
  width: 8px;
  height: 12px;
  background: linear-gradient(45deg, #ffb3d9, #ffc0cb);
  border-radius: 50% 10px 50% 10px;
  animation: fall 5s infinite linear;
}

@keyframes fall {
  0% { 
    transform: translateY(-20px) rotateZ(0deg);
    opacity: 1;
  }
  100% { 
    transform: translateY(calc(100vh + 20px)) rotateZ(360deg);
    opacity: 0;
  }
}

.sun-rays .ray {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #ffd700, transparent);
  transform-origin: 50% 0%;
  animation: rotate 8s infinite linear;
}

@keyframes rotate {
  0% { transform: translateX(-50%) rotateZ(0deg); }
  100% { transform: translateX(-50%) rotateZ(360deg); }
}

.floating-spirits .spirit {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.8), transparent);
  border-radius: 50%;
  animation: float 4s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
}

.snowflakes .snowflake {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: snow 5s infinite linear;
}

@keyframes snow {
  0% { 
    transform: translateY(-20px) rotateZ(0deg);
    opacity: 1;
  }
  100% { 
    transform: translateY(calc(100vh + 20px)) rotateZ(180deg);
    opacity: 0;
  }
}

.fireworks .firework {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  border-radius: 50%;
  animation: explode 2s infinite ease-out;
}

@keyframes explode {
  0% { 
    transform: scale(0);
    opacity: 1;
  }
  70% { 
    transform: scale(4);
    opacity: 0.8;
  }
  100% { 
    transform: scale(8);
    opacity: 0;
  }
}

.banner-content {
  position: relative;
  z-index: 3;
  padding: 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
}

.event-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 80px;
}

.badge-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-color, #4a90e2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.badge-icon .icon {
  width: 24px;
  height: 24px;
  color: white;
}

.badge-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-color, #4a90e2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--accent-color, #2c3e50);
  line-height: 1.2;
}

.event-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.event-description {
  font-size: 14px;
  color: #888;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  min-width: 200px;
}

.countdown-section {
  text-align: center;
}

.countdown-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.countdown-timer {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.9);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 40px;
}

.time-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-color, #2c3e50);
  line-height: 1;
}

.time-label {
  font-size: 10px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-preview {
  background: rgba(108, 117, 125, 0.9);
  color: white;
}

.btn-preview:hover {
  background: rgba(108, 117, 125, 1);
  transform: translateY(-1px);
}

.btn-join {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.btn-join:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(78, 205, 196, 0.4);
}

.btn-join:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-continue {
  background: linear-gradient(135deg, #45b7d1, #96ceb4);
  color: white;
  box-shadow: 0 4px 12px rgba(69, 183, 209, 0.3);
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(69, 183, 209, 0.4);
}

.btn-details {
  background: rgba(255, 255, 255, 0.9);
  color: var(--accent-color, #2c3e50);
  border: 1px solid rgba(0,0,0,0.1);
}

.btn-details:hover {
  background: white;
  transform: translateY(-1px);
}

.priority-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  z-index: 4;
}

.priority-indicator.priority-urgent {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  animation: pulse 2s infinite ease-in-out;
}

.priority-indicator.priority-high {
  background: linear-gradient(135deg, #ffa726, #ff9800);
  color: white;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  z-index: 4;
}

.status-badge.status-announced {
  background: rgba(108, 117, 125, 0.9);
  color: white;
}

.status-badge.status-active {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.status-badge.status-ending_soon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  animation: blink 1s infinite ease-in-out;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.05);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 4;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color, #4a90e2), rgba(var(--accent-color, 74, 144, 226), 0.7));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-color, #2c3e50);
  white-space: nowrap;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  background: rgba(0,0,0,0.2);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
}

.close-btn:hover {
  background: rgba(0,0,0,0.4);
  transform: scale(1.1);
}

.close-btn .icon {
  width: 14px;
  height: 14px;
  color: white;
}

.banner-navigation {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-dot.active {
  background: var(--accent-color, #4a90e2);
  transform: scale(1.2);
}

.nav-dot:hover {
  background: var(--accent-color, #4a90e2);
  transform: scale(1.1);
}

/* Transitions */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.5s ease;
}

.banner-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.banner-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Responsive Design */
@media (max-width: 768px) {
  .banner-content {
    grid-template-columns: 1fr;
    gap: 16px;
    text-align: center;
  }
  
  .event-actions {
    align-items: center;
    min-width: auto;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .event-title {
    font-size: 20px;
  }
  
  .countdown-timer {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .banner-content {
    padding: 16px;
  }
  
  .event-title {
    font-size: 18px;
  }
  
  .event-subtitle {
    font-size: 14px;
  }
  
  .event-description {
    font-size: 13px;
  }
  
  .btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* Compact Mode */
.event-banner.layout-compact {
  min-height: 120px;
}

.event-banner.layout-compact .banner-content {
  padding: 16px;
}

.event-banner.layout-compact .event-title {
  font-size: 18px;
}

.event-banner.layout-compact .event-subtitle {
  font-size: 14px;
}

.event-banner.layout-compact .event-description {
  display: none;
}

.event-banner.layout-compact .badge-icon {
  width: 36px;
  height: 36px;
}

.event-banner.layout-compact .badge-icon .icon {
  width: 18px;
  height: 18px;
}

/* Sidebar Layout */
.event-banner.layout-sidebar {
  min-height: 160px;
}

.event-banner.layout-sidebar .banner-content {
  grid-template-columns: 1fr;
  text-align: center;
  gap: 12px;
}

.event-banner.layout-sidebar .event-badge {
  flex-direction: row;
  justify-content: center;
  gap: 12px;
  min-width: auto;
}

.event-banner.layout-sidebar .badge-icon {
  margin-bottom: 0;
}
</style>