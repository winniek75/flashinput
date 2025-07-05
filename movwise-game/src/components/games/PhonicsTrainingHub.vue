<template>
  <div class="min-h-screen phonics-hub-bg">
    <!-- Animated background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="floating-sounds">
        <div v-for="n in 15" :key="n" class="floating-sound" :style="getFloatingStyle(n)">
          {{ getRandomSound() }}
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="relative z-10 p-4">
      <div class="flex justify-between items-center">
        <button @click="goBack" class="galaxy-button galaxy-button-secondary">
          <Icon name="arrow-left" class="w-4 h-4 mr-2" />
          戻る
        </button>
        <h1 class="text-3xl font-bold cosmic-text">🎵 フォニックス練習センター</h1>
        <div class="flex items-center gap-2">
          <button @click="showSettings = !showSettings" class="galaxy-button galaxy-button-secondary">
            <Icon name="settings" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Training Games Selection -->
    <div v-if="!selectedGame" class="relative z-10 p-4">
      <div class="max-w-6xl mx-auto">
        <!-- Introduction -->
        <div class="text-center mb-8">
          <div class="galaxy-card max-w-2xl mx-auto">
            <div class="text-6xl mb-4">🗣️</div>
            <h2 class="text-2xl font-bold cosmic-text mb-4">英語発音マスター</h2>
            <p class="text-gray-300 leading-relaxed">
              子音と母音の組み合わせから始まり、音素の識別まで、
              段階的に英語の発音を身につけましょう。
              音声認識技術を使った正確な発音チェックで、
              ネイティブレベルの発音を目指します。
            </p>
          </div>
        </div>

        <!-- Game Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- CV Pronunciation Trainer -->
          <div class="game-card" @click="selectGame('cv-trainer')">
            <div class="game-card-header">
              <div class="game-icon">🗣️</div>
              <div class="game-title">CV発音トレーナー</div>
              <div class="game-badge new">NEW</div>
            </div>
            
            <div class="game-description">
              <p class="mb-4">
                子音＋母音の組み合わせ発音を集中練習。
                リアルタイム音声認識で正確な発音をチェックします。
              </p>
              
              <div class="game-features">
                <div class="feature-item">
                  <Icon name="mic" class="feature-icon" />
                  <span>音声認識判定</span>
                </div>
                <div class="feature-item">
                  <Icon name="user" class="feature-icon" />
                  <span>講師モード対応</span>
                </div>
                <div class="feature-item">
                  <Icon name="target" class="feature-icon" />
                  <span>3段階の難易度</span>
                </div>
                <div class="feature-item">
                  <Icon name="chart" class="feature-icon" />
                  <span>発音スコア分析</span>
                </div>
              </div>
            </div>

            <div class="game-footer">
              <div class="difficulty-levels">
                <span class="difficulty-badge beginner">初級</span>
                <span class="difficulty-badge intermediate">中級</span>
                <span class="difficulty-badge advanced">上級</span>
              </div>
              <div class="play-button">
                <Icon name="play" class="w-5 h-5" />
                練習開始
              </div>
            </div>
          </div>

          <!-- True Sound Impact -->
          <div class="game-card" @click="selectGame('letter-hunt')">
            <div class="game-card-header">
              <div class="game-icon">🔊</div>
              <div class="game-title">サウンド・インパクト</div>
              <div class="game-badge new">科学的</div>
            </div>
            
            <div class="game-description">
              <p class="mb-4">
                純粋な音韻認識から始める科学的学習法。
                IPA音韻記号と文字の正確な対応関係を段階的に習得します。
              </p>
              
              <div class="game-features">
                <div class="feature-item">
                  <Icon name="brain" class="feature-icon" />
                  <span>段階的音韻習得</span>
                </div>
                <div class="feature-item">
                  <Icon name="target" class="feature-icon" />
                  <span>85%習熟度判定</span>
                </div>
                <div class="feature-item">
                  <Icon name="book" class="feature-icon" />
                  <span>IPA音韻記号対応</span>
                </div>
                <div class="feature-item">
                  <Icon name="chart" class="feature-icon" />
                  <span>個別進捗管理</span>
                </div>
              </div>
            </div>

            <div class="game-footer">
              <div class="difficulty-levels">
                <span class="difficulty-badge beginner">基本母音</span>
                <span class="difficulty-badge intermediate">基本子音</span>
                <span class="difficulty-badge advanced">複合音素</span>
              </div>
              <div class="play-button">
                <Icon name="play" class="w-5 h-5" />
                学習開始
              </div>
            </div>
          </div>
        </div>

        <!-- Progress & Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Overall Progress -->
          <div class="stat-card">
            <div class="stat-header">
              <Icon name="chart" class="stat-icon" />
              <span class="stat-title">総合進捗</span>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overallProgress }}%</div>
              <div class="stat-description">発音マスター度</div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Practice Time -->
          <div class="stat-card">
            <div class="stat-header">
              <Icon name="clock" class="stat-icon" />
              <span class="stat-title">練習時間</span>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalPracticeTime }}分</div>
              <div class="stat-description">累計練習時間</div>
              <div class="stat-detail">今週: {{ weeklyPracticeTime }}分</div>
            </div>
          </div>

          <!-- Achievement -->
          <div class="stat-card">
            <div class="stat-header">
              <Icon name="star" class="stat-icon" />
              <span class="stat-title">音韻習得</span>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ masteredPhonemes }}</div>
              <div class="stat-description">習得済み音素</div>
              <div class="stat-detail">正解率: {{ phonemeAccuracy }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Components -->
    <CvPronunciationTrainer 
      v-if="selectedGame === 'cv-trainer'" 
      @back="selectedGame = null" 
    />
    
    <TrueSoundImpact 
      v-if="selectedGame === 'letter-hunt'" 
      @back="selectedGame = null" 
    />

    <!-- Settings Modal -->
    <div v-if="showSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="galaxy-card max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold cosmic-text">設定</h3>
          <button @click="showSettings = false" class="text-gray-400 hover:text-white">
            <Icon name="x" class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Audio Settings -->
          <div class="setting-group">
            <label class="setting-label">音声音量</label>
            <input 
              type="range" 
              v-model="audioVolume" 
              min="0" 
              max="100" 
              class="setting-slider"
            />
            <span class="setting-value">{{ audioVolume }}%</span>
          </div>

          <!-- Language Settings -->
          <div class="setting-group">
            <label class="setting-label">音声言語</label>
            <select v-model="audioLanguage" class="setting-select">
              <option value="en-US">英語 (アメリカ)</option>
              <option value="en-GB">英語 (イギリス)</option>
              <option value="en-AU">英語 (オーストラリア)</option>
            </select>
          </div>

          <!-- Speech Rate -->
          <div class="setting-group">
            <label class="setting-label">音声速度</label>
            <input 
              type="range" 
              v-model="speechRate" 
              min="50" 
              max="150" 
              class="setting-slider"
            />
            <span class="setting-value">{{ speechRate }}%</span>
          </div>

          <!-- Microphone Sensitivity -->
          <div class="setting-group">
            <label class="setting-label">マイク感度</label>
            <input 
              type="range" 
              v-model="micSensitivity" 
              min="50" 
              max="150" 
              class="setting-slider"
            />
            <span class="setting-value">{{ micSensitivity }}%</span>
          </div>
        </div>

        <div class="flex gap-2 mt-6">
          <button @click="testAudio" class="galaxy-button galaxy-button-secondary flex-1">
            音声テスト
          </button>
          <button @click="saveSettings" class="galaxy-button galaxy-button-primary flex-1">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameAudio } from '@/composables/useGameAudio'
import { PHONEME_LEARNING_SYSTEM, progressionManager } from '@/data/phonemeLearningSystem'
import Icon from '@/components/shared/Icon.vue'
import CvPronunciationTrainer from './CvPronunciationTrainer.vue'
import TrueSoundImpact from './TrueSoundImpact.vue'

// Router
const router = useRouter()

// Emits
const emit = defineEmits(['back'])

// Audio system
const { speak } = useGameAudio()

// State
const selectedGame = ref(null)
const showSettings = ref(false)

// Settings
const audioVolume = ref(80)
const audioLanguage = ref('en-US')
const speechRate = ref(100)
const micSensitivity = ref(100)

// Mock data for stats (実際の実装では localStorage やサーバーから取得)
const overallProgress = ref(67)
const totalPracticeTime = ref(1240)
const weeklyPracticeTime = ref(180)

// Phoneme learning stats from the learning system
const masteredPhonemes = computed(() => {
  const phonemeMastery = PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery
  return Object.values(phonemeMastery).filter(mastery => mastery.masteryAchieved).length
})

const phonemeAccuracy = computed(() => {
  const phonemeMastery = PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery
  const accuracies = Object.values(phonemeMastery)
    .filter(mastery => mastery.attempts > 0)
    .map(mastery => mastery.accuracy)
  
  if (accuracies.length === 0) return 0
  const totalAccuracy = accuracies.reduce((sum, accuracy) => sum + accuracy, 0)
  return Math.round((totalAccuracy / accuracies.length) * 100)
})

// Methods
const goBack = () => {
  console.log('🔙 GoBack called')
  
  // 直接ルーターを使って戻る
  try {
    router.push('/sound-adventure')
    console.log('✅ Navigated to Sound Adventure Hub')
  } catch (error) {
    console.error('❌ Navigation failed:', error)
    // フォールバックとしてブラウザの戻るボタン
    window.history.back()
  }
}

const selectGame = (gameType) => {
  selectedGame.value = gameType
}

const testAudio = async () => {
  await speak('Hello, this is a test of the audio system.', {
    lang: audioLanguage.value,
    rate: speechRate.value / 100,
    volume: audioVolume.value / 100
  })
}

const saveSettings = () => {
  // 設定を保存 (localStorage など)
  localStorage.setItem('phonics-settings', JSON.stringify({
    audioVolume: audioVolume.value,
    audioLanguage: audioLanguage.value,
    speechRate: speechRate.value,
    micSensitivity: micSensitivity.value
  }))
  
  showSettings.value = false
}

const loadSettings = () => {
  const saved = localStorage.getItem('phonics-settings')
  if (saved) {
    const settings = JSON.parse(saved)
    audioVolume.value = settings.audioVolume || 80
    audioLanguage.value = settings.audioLanguage || 'en-US'
    speechRate.value = settings.speechRate || 100
    micSensitivity.value = settings.micSensitivity || 100
  }
}

const getFloatingStyle = (n) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${15 + Math.random() * 10}s`
  }
}

const getRandomSound = () => {
  const sounds = ['🎵', '🎶', '🔊', '🎤', '🗣️', '👂', '💭', '✨']
  return sounds[Math.floor(Math.random() * sounds.length)]
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.phonics-hub-bg {
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%);
  color: white;
}

.stars-layer-1,
.stars-layer-2 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 2s;
  opacity: 0.2;
}

.floating-sounds {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.floating-sound {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.2;
  animation: float-around 20s infinite linear;
  pointer-events: none;
}

@keyframes float-around {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.galaxy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(79, 172, 254, 0.6);
}

.cosmic-text {
  background: linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6, #FBBF24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-flow 4s ease-in-out infinite;
}

@keyframes cosmic-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.game-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%, 
    rgba(30, 41, 59, 0.85) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 1.5rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
  animation: scan-line 3s linear infinite;
}

@keyframes scan-line {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.game-card:hover {
  border-color: rgba(79, 172, 254, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(79, 172, 254, 0.3);
}

.game-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.game-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px currentColor);
}

.game-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #60A5FA;
  flex: 1;
}

.game-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.game-badge.new {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.game-badge.popular {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
}

.game-description {
  margin-bottom: 2rem;
  color: #94A3B8;
}

.game-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #CBD5E1;
}

.feature-icon {
  width: 1rem;
  height: 1rem;
  color: #60A5FA;
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-levels {
  display: flex;
  gap: 0.5rem;
}

.difficulty-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.difficulty-badge.beginner {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.difficulty-badge.intermediate {
  background: rgba(251, 191, 36, 0.2);
  color: #FBBF24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.difficulty-badge.advanced {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.play-button {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.stat-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #60A5FA;
}

.stat-title {
  font-weight: bold;
  color: #E2E8F0;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #60A5FA;
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: 0.875rem;
  color: #94A3B8;
  margin-bottom: 0.5rem;
}

.stat-detail {
  font-size: 0.75rem;
  color: #64748B;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6);
  transition: width 0.5s ease;
  border-radius: 3px;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-label {
  flex: 1;
  font-weight: bold;
  color: #E2E8F0;
}

.setting-slider {
  flex: 2;
  appearance: none;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
}

.setting-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #60A5FA, #3B82F6);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.setting-select {
  flex: 2;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
}

.setting-value {
  min-width: 3rem;
  text-align: right;
  color: #60A5FA;
  font-weight: bold;
}

@media (max-width: 768px) {
  .game-features {
    grid-template-columns: 1fr;
  }
  
  .game-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .setting-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .setting-label {
    text-align: center;
  }
}
</style>