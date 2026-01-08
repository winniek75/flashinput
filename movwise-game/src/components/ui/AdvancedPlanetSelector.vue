<template>
  <div class="advanced-galaxy-container">
    <!-- 動的背景システム -->
    <div class="dynamic-background">
      <div class="space-grid"></div>
      <div class="nebula-clouds">
        <div v-for="i in 5" :key="i" class="nebula-cloud" :style="getNebulaStyle(i)"></div>
      </div>
      <div class="star-field">
        <div v-for="i in 150" :key="i" class="star" :style="getStarStyle(i)"></div>
      </div>
      <div class="energy-streams">
        <div v-for="i in 8" :key="i" class="energy-stream" :style="getStreamStyle(i)"></div>
      </div>
    </div>
    
    <!-- メインインターフェース -->
    <div class="main-interface">
      <!-- 上部HUDパネル -->
      <div class="hud-panel">
        <div class="panel-left">
          <div class="academy-logo">
            <div class="logo-ring">
              <div class="logo-core">🌟</div>
              <div class="logo-orbit"></div>
            </div>
            <div class="logo-text">
              <h1 class="academy-title">SOUND GALAXY</h1>
              <p class="academy-subtitle">宇宙英語アカデミー</p>
            </div>
          </div>
        </div>
        
        <div class="panel-center">
          <div class="mission-status">
            <div class="status-item">
              <span class="status-icon">🎯</span>
              <div class="status-info">
                <span class="status-value">{{ galaxyProgress }}%</span>
                <span class="status-label">探索進度</span>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">⚡</span>
              <div class="status-info">
                <span class="status-value">{{ totalEnergy.toLocaleString() }}</span>
                <span class="status-label">エネルギー</span>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">🏆</span>
              <div class="status-info">
                <span class="status-value">{{ completedMissions }}</span>
                <span class="status-label">ミッション</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-right">
          <div class="guardian-rank">
            <div class="rank-badge" :class="`rank-${guardianRank.toLowerCase()}`">
              <span class="rank-icon">{{ guardianRank === 'ルーキー' ? '🌱' : guardianRank === 'アドバンス' ? '⭐' : guardianRank === 'エキスパート' ? '💫' : '👑' }}</span>
              <span class="rank-text">{{ guardianRank }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 中央アカデミーコア -->
      <div class="academy-central">
        <div class="core-platform">
          <div class="platform-rings">
            <div v-for="i in 4" :key="i" class="platform-ring" :style="`animation-delay: ${i * 0.5}s`"></div>
          </div>
          <div class="core-structure">
            <div class="core-base">
              <div class="energy-core">
                <div class="core-inner">🌟</div>
                <div class="energy-waves">
                  <div v-for="i in 3" :key="i" class="wave" :style="`animation-delay: ${i * 0.3}s`"></div>
                </div>
              </div>
            </div>
            <div class="core-label">
              <span class="main-label">アカデミー本部</span>
              <span class="sub-label">CENTRAL COMMAND</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 惑星ナビゲーションシステム -->
      <div class="planet-navigation">
        <div
          v-for="(planet, index) in planets"
          :key="planet.id"
          class="planet-system"
          :class="[
            `planet-${planet.id}`,
            `system-position-${index + 1}`,
            {
              'system-locked': !planet.unlocked,
              'system-active': selectedPlanet?.id === planet.id,
              'system-highlighted': hoveredPlanet?.id === planet.id
            }
          ]"
          @click="selectPlanet(planet)"
          @mouseenter="hoveredPlanet = planet"
          @mouseleave="hoveredPlanet = null"
        >
          <!-- 接続エネルギーライン -->
          <div class="connection-line" :class="{ 'line-active': planet.unlocked }">
            <div class="line-flow"></div>
          </div>
          
          <!-- 惑星メインボディ -->
          <div class="planet-body">
            <div class="planet-surface" :style="{ background: planet.gradient }">
              <!-- 惑星アイコン -->
              <div class="planet-icon">{{ planet.emoji }}</div>
              
              <!-- ロックオーバーレイ -->
              <div v-if="!planet.unlocked" class="lock-overlay">
                <div class="lock-container">
                  <span class="lock-icon">🔐</span>
                  <div class="unlock-progress" :style="`width: ${planet.unlockProgress}%`"></div>
                </div>
              </div>
              
              <!-- エネルギーフィールド -->
              <div v-if="planet.unlocked" class="energy-field">
                <div v-for="i in 6" :key="i" class="energy-particle" :style="getParticleStyle(i)"></div>
              </div>
            </div>
            
            <!-- 惑星オーラ -->
            <div class="planet-aura" :style="{ borderColor: planet.color }"></div>
            
            <!-- 進捗ホログラム -->
            <div v-if="planet.unlocked" class="progress-hologram">
              <svg class="progress-ring" viewBox="0 0 80 80">
                <circle
                  class="progress-track"
                  cx="40"
                  cy="40"
                  r="35"
                  stroke-width="6"
                />
                <circle
                  class="progress-bar"
                  cx="40"
                  cy="40"
                  r="35"
                  stroke-width="6"
                  :stroke="planet.color"
                  :stroke-dasharray="`${planet.progress * 2.2} 220`"
                />
              </svg>
              <div class="progress-text">{{ planet.progress }}%</div>
            </div>
            
            <!-- 衛星システム -->
            <div v-if="planet.satellites" class="satellite-system">
              <div
                v-for="i in planet.satellites"
                :key="i"
                class="satellite"
                :style="`animation-delay: ${i * 0.4}s; --orbit-radius: ${20 + i * 8}px`"
              ></div>
            </div>
          </div>
          
          <!-- 惑星情報パネル -->
          <div class="planet-info-panel">
            <div class="info-header">
              <h3 class="planet-name">{{ planet.name }}</h3>
              <div class="planet-type">{{ planet.type }}</div>
            </div>
            
            <div class="info-stats">
              <div class="stat-chip">
                <span class="chip-icon">🎮</span>
                <span class="chip-value">{{ planet.gameCount }}</span>
              </div>
              <div class="stat-chip">
                <span class="chip-icon">⭐</span>
                <span class="chip-value">{{ planet.difficulty }}/5</span>
              </div>
              <div v-if="planet.unlocked" class="stat-chip">
                <span class="chip-icon">🏆</span>
                <span class="chip-value">{{ planet.achievements }}/{{ planet.totalAchievements }}</span>
              </div>
            </div>
            
            <!-- 特別バッジ -->
            <div v-if="planet.isNew" class="special-badge new-badge">
              <span>NEW</span>
            </div>
            <div v-if="planet.isCompleted" class="special-badge completed-badge">
              <span>完了</span>
            </div>
            <div v-if="planet.isRecommended" class="special-badge recommended-badge">
              <span>推奨</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 詳細情報サイドパネル -->
      <transition name="slide-panel">
        <div v-if="selectedPlanet" class="detail-side-panel">
          <div class="panel-header">
            <div class="header-left">
              <div class="planet-avatar">{{ selectedPlanet.emoji }}</div>
              <div class="planet-details">
                <h2 class="detail-title">{{ selectedPlanet.name }}</h2>
                <p class="detail-subtitle">{{ selectedPlanet.type }}</p>
              </div>
            </div>
            <button @click="selectedPlanet = null" class="close-panel">✕</button>
          </div>
          
          <div class="panel-content">
            <div class="description-section">
              <h4 class="section-title">ミッション概要</h4>
              <p class="mission-description">{{ selectedPlanet.description }}</p>
            </div>
            
            <div v-if="selectedPlanet.unlocked" class="stats-section">
              <h4 class="section-title">進捗状況</h4>
              <div class="progress-grid">
                <div class="progress-item">
                  <div class="progress-label">
                    <span class="label-icon">🎯</span>
                    <span>完了率</span>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" :style="`width: ${selectedPlanet.progress}%`"></div>
                    </div>
                    <span class="progress-percentage">{{ selectedPlanet.progress }}%</span>
                  </div>
                </div>
                
                <div class="progress-item">
                  <div class="progress-label">
                    <span class="label-icon">📊</span>
                    <span>マスター済み</span>
                  </div>
                  <div class="mastery-ratio">
                    <span class="ratio-current">{{ selectedPlanet.mastered }}</span>
                    <span class="ratio-separator">/</span>
                    <span class="ratio-total">{{ selectedPlanet.totalItems }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="rewards-section">
              <h4 class="section-title">獲得可能報酬</h4>
              <div class="reward-grid">
                <div v-for="reward in selectedPlanet.rewards" :key="reward.type" class="reward-card">
                  <div class="reward-icon">{{ reward.icon }}</div>
                  <div class="reward-info">
                    <span class="reward-name">{{ reward.name }}</span>
                    <span class="reward-type">{{ reward.type }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="!selectedPlanet.unlocked" class="unlock-section">
              <h4 class="section-title">解放条件</h4>
              <div class="unlock-requirement">
                <span class="requirement-icon">🔓</span>
                <span class="requirement-text">{{ selectedPlanet.unlockRequirement }}</span>
              </div>
              <div class="unlock-progress-bar">
                <div class="unlock-progress-fill" :style="`width: ${selectedPlanet.unlockProgress}%`"></div>
              </div>
            </div>
          </div>
          
          <div class="panel-footer">
            <button
              v-if="selectedPlanet.unlocked"
              @click="enterPlanet(selectedPlanet)"
              class="enter-mission-btn"
            >
              <span class="btn-icon">🚀</span>
              <span class="btn-text">{{ selectedPlanet.isRecommended ? '推奨ミッション開始' : 'ミッション開始' }}</span>
            </button>
            <button
              v-else
              class="locked-btn"
              disabled
            >
              <span class="btn-icon">🔒</span>
              <span class="btn-text">条件未達成</span>
            </button>
          </div>
        </div>
      </transition>
      
      <!-- 下部コントロールバー -->
      <div class="bottom-control-bar">
        <div class="control-group left">
          <button @click="$emit('back')" class="control-btn primary">
            <span class="btn-icon">🏠</span>
            <span class="btn-label">ホーム</span>
          </button>
        </div>
        
        <div class="control-group center">
          <button @click="toggleView" class="control-btn">
            <span class="btn-icon">🗺️</span>
            <span class="btn-label">{{ viewMode === '3d' ? '2D表示' : '3D表示' }}</span>
          </button>
          <button @click="showSettings = !showSettings" class="control-btn">
            <span class="btn-icon">⚙️</span>
            <span class="btn-label">設定</span>
          </button>
        </div>
        
        <div class="control-group right">
          <button @click="toggleMusic" class="control-btn">
            <span class="btn-icon">{{ musicEnabled ? '🎵' : '🔇' }}</span>
            <span class="btn-label">{{ musicEnabled ? 'サウンド' : 'ミュート' }}</span>
          </button>
          <button @click="showHelp = !showHelp" class="control-btn">
            <span class="btn-icon">❓</span>
            <span class="btn-label">ヘルプ</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 設定モーダル -->
    <transition name="modal-fade">
      <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
        <div class="settings-modal" @click.stop>
          <h3 class="modal-title">環境設定</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <span class="setting-label">音響効果</span>
              <div class="setting-toggle" :class="{ active: soundEnabled }" @click="soundEnabled = !soundEnabled">
                <div class="toggle-slider"></div>
              </div>
            </div>
            <div class="setting-item">
              <span class="setting-label">アニメーション</span>
              <div class="setting-toggle" :class="{ active: animationEnabled }" @click="animationEnabled = !animationEnabled">
                <div class="toggle-slider"></div>
              </div>
            </div>
            <div class="setting-item">
              <span class="setting-label">難易度表示</span>
              <div class="setting-toggle" :class="{ active: showDifficulty }" @click="showDifficulty = !showDifficulty">
                <div class="toggle-slider"></div>
              </div>
            </div>
          </div>
          <button @click="showSettings = false" class="modal-close-btn">閉じる</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

export default {
  name: 'AdvancedPlanetSelector',
  emits: ['select-planet', 'enter-planet', 'enter-recommended-mission', 'back'],
  setup(_, { emit }) {
    const gameStore = useGameStore()
    
    const selectedPlanet = ref(null)
    const hoveredPlanet = ref(null)
    const showSettings = ref(false)
    const showHelp = ref(false)
    const viewMode = ref('3d')
    const musicEnabled = ref(true)
    const soundEnabled = ref(true)
    const animationEnabled = ref(true)
    const showDifficulty = ref(true)
    
    // 高度な惑星データ
    const planets = ref([
      {
        id: 'phonics',
        name: 'サウンド・ネビュラ',
        type: 'Core Learning System',
        emoji: '🟡',
        description: '44個の英語音素をマスターし、音韻認識能力を向上させる基盤学習システム。段階的な習得により、正確な発音技術を身につけます。',
        unlocked: true,
        progress: 75,
        difficulty: 2,
        gameCount: 12,
        mastered: 33,
        totalItems: 44,
        achievements: 8,
        totalAchievements: 10,
        satellites: 3,
        isNew: false,
        isCompleted: false,
        isRecommended: true,
        unlockRequirement: '初期解放済み',
        unlockProgress: 100,
        gradient: 'radial-gradient(circle at 30% 30%, #FFD700, #FFA500, #FF6347)',
        color: '#FFD700',
        rewards: [
          { icon: '🧚‍♀️', name: '音素の妖精', type: 'キャラクター' },
          { icon: '🎵', name: 'サウンドクリスタル', type: 'アイテム' },
          { icon: '⭐', name: 'フォニックスマスター', type: '称号' }
        ]
      },
      {
        id: 'grammar',
        name: 'グラマー・ギャラクシー',
        type: 'Structure Analysis Zone',
        emoji: '🔵',
        description: '英語文法の構造を体系的に学習し、言語パターンを理解する高度な分析ゾーン。論理的思考力と言語能力を同時に向上させます。',
        unlocked: true,
        progress: 35,
        difficulty: 3,
        gameCount: 8,
        mastered: 7,
        totalItems: 20,
        achievements: 3,
        totalAchievements: 8,
        satellites: 2,
        isNew: false,
        isCompleted: false,
        isRecommended: false,
        unlockRequirement: 'サウンド・ネビュラ 20%達成',
        unlockProgress: 100,
        gradient: 'radial-gradient(circle at 30% 30%, #4169E1, #1E90FF, #00BFFF)',
        color: '#4169E1',
        rewards: [
          { icon: '🧙‍♂️', name: '文法の魔法使い', type: 'キャラクター' },
          { icon: '📚', name: 'グラマーコード', type: 'スキル' },
          { icon: '🎯', name: 'シンタックスマスター', type: '称号' }
        ]
      },
      {
        id: 'vocabulary',
        name: 'ボキャブラリー・シティ',
        type: 'Lexical Expansion Hub',
        emoji: '🟢',
        description: '実用的な語彙を効率的に習得する都市型学習環境。コンテキストベースの学習により、記憶定着率を最大化します。',
        unlocked: true,
        progress: 45,
        difficulty: 2,
        gameCount: 6,
        mastered: 450,
        totalItems: 1000,
        achievements: 5,
        totalAchievements: 12,
        satellites: 2,
        isNew: false,
        isCompleted: false,
        isRecommended: true,
        unlockRequirement: 'サウンド・ネビュラ 30%達成',
        unlockProgress: 100,
        gradient: 'radial-gradient(circle at 30% 30%, #32CD32, #228B22, #006400)',
        color: '#32CD32',
        rewards: [
          { icon: '🏪', name: 'ワードマーケット', type: 'エリア' },
          { icon: '💰', name: 'ボキャブラリーコイン', type: '通貨' },
          { icon: '🎪', name: '語彙マエストロ', type: '称号' }
        ]
      },
      {
        id: 'pattern',
        name: 'パターン・ラボラトリー',
        type: 'Advanced AI Learning',
        emoji: '🟣',
        description: '言語パターンの高度な解析と予測学習を行う研究施設。機械学習アルゴリズムを活用した効率的な学習体験を提供します。',
        unlocked: false,
        progress: 0,
        difficulty: 4,
        gameCount: 5,
        mastered: 0,
        totalItems: 50,
        achievements: 0,
        totalAchievements: 6,
        satellites: 1,
        isNew: true,
        isCompleted: false,
        isRecommended: false,
        unlockRequirement: 'グラマー・ギャラクシー 50%達成',
        unlockProgress: 70,
        gradient: 'radial-gradient(circle at 30% 30%, #9370DB, #8A2BE2, #6A0DAD)',
        color: '#9370DB',
        rewards: [
          { icon: '🤖', name: 'AIアシスタント', type: 'ツール' },
          { icon: '🔬', name: 'パターン解析器', type: 'アイテム' },
          { icon: '🧠', name: 'パターンマスター', type: '称号' }
        ]
      },
      {
        id: 'practice',
        name: 'プラクティス・ステーション',
        type: 'Real-World Application',
        emoji: '🚀',
        description: '実世界シミュレーションによる実践的な英語応用訓練ステーション。VR技術を活用したイマーシブな学習環境で実用性を重視します。',
        unlocked: false,
        progress: 0,
        difficulty: 5,
        gameCount: 4,
        mastered: 0,
        totalItems: 30,
        achievements: 0,
        totalAchievements: 8,
        satellites: 1,
        isNew: true,
        isCompleted: false,
        isRecommended: false,
        unlockRequirement: '3つのエリアで30%以上達成',
        unlockProgress: 50,
        gradient: 'radial-gradient(circle at 30% 30%, #DC143C, #B22222, #8B0000)',
        color: '#DC143C',
        rewards: [
          { icon: '🎤', name: 'コミュニケーター', type: 'スキル' },
          { icon: '🌍', name: 'グローバルパス', type: 'アクセス権' },
          { icon: '🏆', name: 'マスターガーディアン', type: '最高称号' }
        ]
      }
    ])
    
    // 統計計算
    const galaxyProgress = computed(() => {
      const totalProgress = planets.value.reduce((sum, planet) => sum + planet.progress, 0)
      return Math.round(totalProgress / planets.value.length)
    })
    
    const totalEnergy = computed(() => gameStore.spaceshipStatus.cosmicEnergy || 2850)
    
    const completedMissions = computed(() => {
      return planets.value.filter(p => p.progress === 100).length
    })
    
    const guardianRank = computed(() => {
      const progress = galaxyProgress.value
      if (progress >= 80) return 'マスター'
      if (progress >= 60) return 'エキスパート'
      if (progress >= 40) return 'アドバンス'
      if (progress >= 20) return 'ビギナー'
      return 'ルーキー'
    })
    
    // スタイル生成関数
    const getNebulaStyle = (index) => {
      const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
      const x = (index * 20) % 100
      const y = (index * 30) % 100
      const size = 150 + (index * 50)
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${colors[index % colors.length]}20, transparent)`,
        animationDelay: `${index * 2}s`
      }
    }
    
    const getStarStyle = (index) => {
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: Math.random() * 0.8 + 0.2
      }
    }
    
    const getStreamStyle = (index) => {
      return {
        left: `${(index * 12.5) % 100}%`,
        animationDelay: `${index * 0.5}s`
      }
    }
    
    const getParticleStyle = (index) => {
      const angle = (index * 60) % 360
      return {
        transform: `rotate(${angle}deg) translateX(30px)`,
        animationDelay: `${index * 0.2}s`
      }
    }
    
    // メソッド
    const selectPlanet = (planet) => {
      selectedPlanet.value = selectedPlanet.value?.id === planet.id ? null : planet
      emit('select-planet', planet)
    }
    
    const enterPlanet = (planet) => {
      // 推奨ミッションに直接進む場合の処理
      if (planet.isRecommended && planet.unlocked) {
        emit('enter-recommended-mission', planet)
      } else {
        emit('enter-planet', planet)
      }
    }
    
    const toggleView = () => {
      viewMode.value = viewMode.value === '3d' ? '2d' : '3d'
    }
    
    const toggleMusic = () => {
      musicEnabled.value = !musicEnabled.value
    }
    
    onMounted(() => {
      // 惑星システムの初期化アニメーション（軽量化）
      setTimeout(() => {
        const systems = document.querySelectorAll('.planet-system')
        systems.forEach((system) => {
          system.classList.add('system-initialized')
        })
      }, 100)
    })
    
    return {
      planets,
      selectedPlanet,
      hoveredPlanet,
      showSettings,
      showHelp,
      viewMode,
      musicEnabled,
      soundEnabled,
      animationEnabled,
      showDifficulty,
      galaxyProgress,
      totalEnergy,
      completedMissions,
      guardianRank,
      getNebulaStyle,
      getStarStyle,
      getStreamStyle,
      getParticleStyle,
      selectPlanet,
      enterPlanet,
      toggleView,
      toggleMusic
    }
  }
}
</script>

<style scoped>
.advanced-galaxy-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, 
    #0B1426 0%, 
    #1E2A4A 25%, 
    #2D3561 50%, 
    #3D4575 75%, 
    #4A5568 100%
  );
  overflow: hidden;
  font-family: 'Segoe UI', 'Hiragino Sans', 'Yu Gothic', sans-serif;
}

/* 動的背景システム */
.dynamic-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.space-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.nebula-clouds {
  position: absolute;
  inset: 0;
}

.nebula-cloud {
  position: absolute;
  border-radius: 50%;
  animation: nebula-drift 30s ease-in-out infinite;
  pointer-events: none;
}

@keyframes nebula-drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

.star-field {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: star-twinkle 3s ease-in-out infinite;
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

.energy-streams {
  position: absolute;
  inset: 0;
}

.energy-stream {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, 
    transparent, 
    rgba(0, 255, 255, 0.5), 
    transparent
  );
  animation: stream-flow 8s linear infinite;
}

@keyframes stream-flow {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* メインインターフェース */
.main-interface {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 上部HUDパネル */
.hud-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(90deg, 
    rgba(11, 20, 38, 0.9) 0%,
    rgba(30, 42, 74, 0.8) 50%,
    rgba(11, 20, 38, 0.9) 100%
  );
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  padding: 0 30px;
  z-index: 10;
}

.panel-left,
.panel-center,
.panel-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.panel-center {
  justify-content: center;
}

.panel-right {
  justify-content: flex-end;
}

.academy-logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-ring {
  position: relative;
  width: 50px;
  height: 50px;
}

.logo-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  z-index: 2;
}

.logo-orbit {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(0, 255, 255, 0.6);
  border-radius: 50%;
  animation: logo-spin 4s linear infinite;
}

@keyframes logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.academy-title {
  font-size: 24px;
  font-weight: bold;
  color: #00FFFF;
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.academy-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.mission-status {
  display: flex;
  gap: 30px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 8px 15px;
  backdrop-filter: blur(10px);
}

.status-icon {
  font-size: 20px;
}

.status-info {
  display: flex;
  flex-direction: column;
}

.status-value {
  font-size: 16px;
  font-weight: bold;
  color: #00FFFF;
  line-height: 1;
}

.status-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

.guardian-rank {
  display: flex;
  align-items: center;
}

.rank-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 15px;
  font-weight: bold;
  border: 2px solid;
}

.rank-ルーキー { background: rgba(76, 175, 80, 0.2); border-color: #4CAF50; color: #4CAF50; }
.rank-ビギナー { background: rgba(33, 150, 243, 0.2); border-color: #2196F3; color: #2196F3; }
.rank-アドバンス { background: rgba(156, 39, 176, 0.2); border-color: #9C27B0; color: #9C27B0; }
.rank-エキスパート { background: rgba(255, 152, 0, 0.2); border-color: #FF9800; color: #FF9800; }
.rank-マスター { background: rgba(255, 193, 7, 0.2); border-color: #FFC107; color: #FFC107; }

.rank-icon {
  font-size: 18px;
}

/* 中央アカデミーコア */
.academy-central {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.core-platform {
  position: relative;
  width: 200px;
  height: 200px;
}

.platform-rings {
  position: absolute;
  inset: 0;
}

.platform-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: platform-rotate 15s linear infinite;
}

.platform-ring:nth-child(2) {
  inset: 10px;
  animation-duration: 20s;
  animation-direction: reverse;
}

.platform-ring:nth-child(3) {
  inset: 20px;
  animation-duration: 25s;
}

.platform-ring:nth-child(4) {
  inset: 30px;
  animation-duration: 30s;
  animation-direction: reverse;
}

@keyframes platform-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.core-structure {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.core-base {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
}

.energy-core {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.3), transparent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.core-inner {
  font-size: 48px;
  z-index: 2;
  animation: core-pulse 2s ease-in-out infinite;
}

@keyframes core-pulse {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.3); }
}

.energy-waves {
  position: absolute;
  inset: 0;
}

.wave {
  position: absolute;
  inset: -20px;
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 50%;
  animation: wave-expand 3s ease-out infinite;
}

@keyframes wave-expand {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.core-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 10px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
}

.main-label {
  font-size: 14px;
  font-weight: bold;
  color: #00FFFF;
}

.sub-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
}

/* 惑星ナビゲーションシステム */
.planet-navigation {
  position: absolute;
  inset: 0;
}

.planet-system {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 1;
  transform: scale(1);
}

.planet-system.system-initialized {
  opacity: 1;
  transform: scale(1);
  animation: system-entrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes system-entrance {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(100px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 惑星システム配置 */
.system-position-1 { top: 15%; left: 15%; }
.system-position-2 { top: 15%; right: 15%; }
.system-position-3 { bottom: 20%; left: 15%; }
.system-position-4 { bottom: 20%; right: 15%; }
.system-position-5 { top: 15%; left: 50%; transform: translateX(-50%); }

.connection-line {
  position: absolute;
  width: 3px;
  height: 100px;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, 
    transparent,
    rgba(0, 255, 255, 0.2),
    transparent
  );
  opacity: 0.3;
  transition: all 0.3s ease;
}

.line-active {
  opacity: 1;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.line-flow {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, 
    transparent,
    rgba(0, 255, 255, 0.8),
    transparent
  );
  animation: line-pulse 2s ease-in-out infinite;
  opacity: 0;
}

.line-active .line-flow {
  opacity: 1;
}

@keyframes line-pulse {
  0%, 100% { transform: translateY(-100%); }
  50% { transform: translateY(100%); }
}

.planet-body {
  position: relative;
  width: 120px;
  height: 120px;
}

.planet-surface {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.planet-system:hover .planet-surface {
  transform: scale(1.05);
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.planet-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  border-radius: 50%;
  z-index: 3;
}

.lock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.lock-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
}

.unlock-progress {
  width: 40px;
  height: 4px;
  background: rgba(0, 255, 255, 0.8);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.energy-field {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
}

.energy-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: rgba(0, 255, 255, 0.8);
  border-radius: 50%;
  animation: particle-orbit 3s linear infinite;
}

@keyframes particle-orbit {
  from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
}

.planet-aura {
  position: absolute;
  inset: -5px;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.planet-system:hover .planet-aura {
  border-color: inherit;
  box-shadow: 0 0 20px currentColor;
}

.progress-hologram {
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.progress-ring {
  position: absolute;
  width: 45px;
  height: 45px;
  transform: rotate(-90deg);
}

.progress-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
  filter: drop-shadow(0 0 3px currentColor);
}

.progress-text {
  font-size: 10px;
  font-weight: bold;
  color: #00FFFF;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.satellite-system {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.satellite {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: satellite-orbit 4s linear infinite;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

@keyframes satellite-orbit {
  from {
    transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg);
  }
}

.planet-info-panel {
  position: absolute;
  bottom: -120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 200px;
  text-align: center;
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.info-header {
  margin-bottom: 8px;
}

.planet-name {
  font-size: 16px;
  font-weight: bold;
  color: #00FFFF;
  margin: 0 0 4px 0;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.planet-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
}

.info-stats {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.stat-chip {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.chip-icon {
  font-size: 14px;
}

.chip-value {
  color: #00FFFF;
  font-weight: bold;
}

.special-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.new-badge {
  background: linear-gradient(45deg, #FF6B9D, #FF8E53);
  color: white;
  animation: badge-glow 2s ease-in-out infinite;
}

.completed-badge {
  background: linear-gradient(45deg, #4CAF50, #45A049);
  color: white;
}

.recommended-badge {
  background: linear-gradient(45deg, #2196F3, #0D8BF0);
  color: white;
}

@keyframes badge-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 107, 157, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 107, 157, 0.8); }
}

/* ロック状態 */
.system-locked {
  opacity: 0.6;
  filter: grayscale(60%);
}

.system-locked .connection-line {
  opacity: 0.1;
}

/* アクティブ状態 */
.system-active .planet-surface {
  border-color: #FFD700;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
}

.system-active .planet-aura {
  border-color: #FFD700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
}

/* 詳細サイドパネル */
.detail-side-panel {
  position: absolute;
  right: 0;
  top: 80px;
  bottom: 80px;
  width: 400px;
  background: rgba(11, 20, 38, 0.95);
  border-left: 2px solid rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  overflow-y: auto;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.planet-avatar {
  font-size: 48px;
}

.planet-details {
  display: flex;
  flex-direction: column;
}

.detail-title {
  font-size: 20px;
  font-weight: bold;
  color: #00FFFF;
  margin: 0;
}

.detail-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0 0 0;
  letter-spacing: 1px;
}

.close-panel {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-panel:hover {
  background: rgba(255, 0, 0, 0.3);
  border-color: #FF0000;
}

.panel-content {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  color: #00FFFF;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '▶';
  font-size: 12px;
}

.description-section {
  margin-bottom: 25px;
}

.mission-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.stats-section {
  margin-bottom: 25px;
}

.progress-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar-bg {
  width: 120px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00FFFF, #0080FF);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-percentage {
  font-size: 12px;
  color: #00FFFF;
  font-weight: bold;
}

.mastery-ratio {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.ratio-current {
  color: #00FFFF;
  font-weight: bold;
}

.ratio-separator {
  color: rgba(255, 255, 255, 0.5);
}

.ratio-total {
  color: rgba(255, 255, 255, 0.7);
}

.rewards-section {
  margin-bottom: 25px;
}

.reward-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.reward-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.reward-card:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
}

.reward-icon {
  font-size: 20px;
}

.reward-info {
  display: flex;
  flex-direction: column;
}

.reward-name {
  font-size: 12px;
  color: #00FFFF;
  font-weight: bold;
}

.reward-type {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.unlock-section {
  margin-bottom: 25px;
}

.unlock-requirement {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.requirement-icon {
  font-size: 18px;
}

.requirement-text {
  font-size: 14px;
  color: #FFC107;
}

.unlock-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.unlock-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFC107, #FF9800);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.panel-footer {
  padding: 25px;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  flex-shrink: 0;
}

.enter-mission-btn {
  width: 100%;
  background: linear-gradient(135deg, #00FFFF, #0080FF);
  border: none;
  border-radius: 12px;
  padding: 15px;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.enter-mission-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 255, 255, 0.5);
}

.locked-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  font-weight: bold;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-icon {
  font-size: 20px;
}

/* 下部コントロールバー */
.bottom-control-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(90deg, 
    rgba(11, 20, 38, 0.9) 0%,
    rgba(30, 42, 74, 0.8) 50%,
    rgba(11, 20, 38, 0.9) 100%
  );
  border-top: 2px solid rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  padding: 0 30px;
  z-index: 10;
}

.control-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.control-group.left {
  flex: 1;
}

.control-group.center {
  flex: 2;
  justify-content: center;
}

.control-group.right {
  flex: 1;
  justify-content: flex-end;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 10px 16px;
  color: #00FFFF;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 70px;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.6);
  transform: translateY(-2px);
}

.control-btn.primary {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.6);
}

.btn-icon {
  font-size: 20px;
}

.btn-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

/* 設定モーダル */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal {
  background: rgba(11, 20, 38, 0.95);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 15px;
  padding: 30px;
  min-width: 400px;
  backdrop-filter: blur(20px);
}

.modal-title {
  font-size: 20px;
  color: #00FFFF;
  margin: 0 0 25px 0;
  text-align: center;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.setting-toggle {
  width: 50px;
  height: 26px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-toggle.active {
  background: linear-gradient(135deg, #00FFFF, #0080FF);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.setting-toggle.active .toggle-slider {
  transform: translateX(24px);
}

.modal-close-btn {
  width: 100%;
  background: linear-gradient(135deg, #00FFFF, #0080FF);
  border: none;
  border-radius: 10px;
  padding: 12px;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
}

/* トランジション */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-panel-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .settings-modal,
.modal-fade-leave-to .settings-modal {
  transform: scale(0.8);
}

/* レスポンシブ */
@media (max-width: 1200px) {
  .detail-side-panel {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .hud-panel {
    height: 60px;
    padding: 0 15px;
    flex-direction: column;
    gap: 10px;
  }
  
  .mission-status {
    gap: 15px;
  }
  
  .detail-side-panel {
    left: 0;
    right: 0;
    width: auto;
    top: 60px;
    bottom: 60px;
    display: flex;
    flex-direction: column;
  }
  
  .panel-content {
    padding: 15px;
    flex: 1;
    overflow-y: auto;
  }
  
  .panel-footer {
    padding: 15px;
    flex-shrink: 0;
  }
  
  .bottom-control-bar {
    height: 60px;
    padding: 0 15px;
  }
  
  .control-group {
    gap: 10px;
  }
  
  .planet-system {
    transform: scale(0.8);
  }
  
  .academy-central {
    transform: translate(-50%, -50%) scale(0.8);
  }
}
</style>