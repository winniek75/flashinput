<template>
  <div class="min-h-screen dashboard-background relative overflow-hidden">
    <!-- Command Center Background Effects -->
    <div class="command-center-grid"></div>
    <div class="scanning-lines"></div>
    <div class="orbital-rings"></div>
    
    <!-- Navigation Header -->
    <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-cyan-500/30">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <button
            @click="handleBack"
            class="command-button command-button-secondary flex items-center gap-3 px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
          >
            <span class="text-lg">←</span>
            <span>アカデミーに戻る</span>
          </button>
          
          <div class="flex items-center gap-4">
            <div class="mission-status px-4 py-2 rounded-xl">
              <span class="text-cyan-400 font-bold">🎯 ミッション司令室</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Command Center -->
    <div class="pt-24 pb-8 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Command Center Title -->
        <div class="text-center mb-16">
          <div class="command-center-title mb-6">
            <div class="title-hologram">
              <h1 class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
                ディクテーション＆スペリング
              </h1>
              <div class="text-4xl font-bold text-cyan-300 tracking-wider">
                🎯 MISSION CONTROL CENTER
              </div>
            </div>
          </div>
          <div class="command-subtitle">
            <p class="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              🚀 聞く力と書く力の総合訓練施設へようこそ！<br>
              <span class="text-cyan-400 font-semibold">音声認識システム</span>と<span class="text-purple-400 font-semibold">文字入力システム</span>を統合した最新トレーニングプログラムです。
            </p>
          </div>
        </div>

        <!-- Mission Status Dashboard -->
        <div class="mission-dashboard mb-12">
          <div class="dashboard-container p-8 rounded-3xl">
            <div class="flex items-center justify-center mb-6">
              <div class="status-indicator animate-pulse">
                <span class="text-2xl">🛡️</span>
              </div>
              <h2 class="text-3xl font-bold text-cyan-300 ml-4 tracking-wide">MISSION STATUS DASHBOARD</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="status-module">
                <div class="module-header">
                  <span class="text-2xl mb-2 block">🎧</span>
                  <div class="text-lg font-bold text-cyan-400">聴覚システム</div>
                </div>
                <div class="module-data">
                  <div class="text-4xl font-black text-blue-400 mb-1">{{ overallProgress.dictationAccuracy }}%</div>
                  <div class="text-slate-400 text-sm">DICTATION ACCURACY</div>
                </div>
                <div class="module-status success"></div>
              </div>
              
              <div class="status-module">
                <div class="module-header">
                  <span class="text-2xl mb-2 block">⌨️</span>
                  <div class="text-lg font-bold text-purple-400">入力システム</div>
                </div>
                <div class="module-data">
                  <div class="text-4xl font-black text-green-400 mb-1">{{ overallProgress.spellingAccuracy }}%</div>
                  <div class="text-slate-400 text-sm">SPELLING ACCURACY</div>
                </div>
                <div class="module-status success"></div>
              </div>
              
              <div class="status-module">
                <div class="module-header">
                  <span class="text-2xl mb-2 block">📚</span>
                  <div class="text-lg font-bold text-orange-400">データベース</div>
                </div>
                <div class="module-data">
                  <div class="text-4xl font-black text-purple-400 mb-1">{{ overallProgress.wordsLearned }}</div>
                  <div class="text-slate-400 text-sm">WORDS ACQUIRED</div>
                </div>
                <div class="module-status success"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mission Categories -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <!-- Audio Mission Section -->
          <div class="mission-category-container">
            <div class="mission-category-card p-8 rounded-3xl">
              <div class="category-header mb-8">
                <div class="category-icon-container">
                  <div class="category-icon">🎧</div>
                  <div class="icon-pulse"></div>
                </div>
                <h2 class="text-3xl font-bold text-cyan-300 mb-2 tracking-wide">AUDIO MISSION</h2>
                <p class="text-slate-400 text-lg">
                  🔊 音声認識・解析トレーニングプログラム
                </p>
              </div>

              <div class="space-y-4">
                <!-- Word Audio Mission -->
                <div 
                  @click="startWordDictation"
                  class="mission-task active cursor-pointer"
                >
                  <div class="task-indicator">
                    <div class="task-status online"></div>
                  </div>
                  <div class="task-content">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="task-icon">🎧</div>
                        <div class="task-info">
                          <div class="task-name">WORD AUDIO DICTATION</div>
                          <div class="task-description">音声信号を文字データに変換するトレーニング</div>
                        </div>
                      </div>
                      <div class="task-stats">
                        <div class="stat-value text-green-400">{{ progress.wordDictation.accuracy }}%</div>
                        <div class="stat-label">SUCCESS RATE</div>
                        <div class="stat-secondary">{{ progress.wordDictation.completed }} MISSIONS</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sentence Audio Mission -->
                <div 
                  @click="startSentenceDictation"
                  class="mission-task cursor-pointer"
                  :class="!isUnlocked.sentenceDictation ? 'locked' : 'active'"
                >
                  <div class="task-indicator">
                    <div class="task-status" :class="!isUnlocked.sentenceDictation ? 'locked' : 'standby'"></div>
                  </div>
                  <div class="task-content">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="task-icon">📄</div>
                        <div class="task-info">
                          <div class="task-name">
                            SENTENCE AUDIO MISSION
                            <span v-if="!isUnlocked.sentenceDictation" class="lock-indicator">🔒</span>
                          </div>
                          <div class="task-description">複合音声データの解析・変換トレーニング</div>
                        </div>
                      </div>
                      <div class="task-stats">
                        <div class="stat-value text-blue-400">{{ progress.sentenceDictation.accuracy }}%</div>
                        <div class="stat-label">SUCCESS RATE</div>
                        <div class="stat-secondary">{{ progress.sentenceDictation.completed }} MISSIONS</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Speed Mission -->
                <div 
                  @click="startSpeedDictation"
                  class="mission-task cursor-pointer"
                  :class="!isUnlocked.speedDictation ? 'locked' : 'active'"
                >
                  <div class="task-indicator">
                    <div class="task-status" :class="!isUnlocked.speedDictation ? 'locked' : 'standby'"></div>
                  </div>
                  <div class="task-content">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="task-icon">⚡</div>
                        <div class="task-info">
                          <div class="task-name">
                            SPEED AUDIO MISSION
                            <span v-if="!isUnlocked.speedDictation" class="lock-indicator">🔒</span>
                          </div>
                          <div class="task-description">高速音声データ処理トレーニング</div>
                        </div>
                      </div>
                      <div class="task-stats">
                        <div class="stat-value text-red-400">{{ progress.speedDictation.wpm }}</div>
                        <div class="stat-label">WPM RECORD</div>
                        <div class="stat-secondary">SPEED MISSIONS</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Combat Mission Section -->
          <div class="mission-category-container">
            <div class="mission-category-card p-8 rounded-3xl">
              <div class="category-header mb-8">
                <div class="category-icon-container">
                  <div class="category-icon">⌨️</div>
                  <div class="icon-pulse"></div>
                </div>
                <h2 class="text-3xl font-bold text-purple-300 mb-2 tracking-wide">COMBAT MISSION</h2>
                <p class="text-slate-400 text-lg">
                  ⚔️ 総合戦闘スキル・タクティカルトレーニング
                </p>
              </div>

              <div class="space-y-4">
                <!-- Vocabulary Combat Mission -->
                <div 
                  @click="startVocabularyBuilder"
                  class="mission-task standby cursor-pointer"
                >
                  <div class="task-indicator">
                    <div class="task-status development"></div>
                  </div>
                  <div class="task-content">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="task-icon">📖</div>
                        <div class="task-info">
                          <div class="task-name">VOCABULARY COMBAT</div>
                          <div class="task-description">語彙データベース構築・戦術学習</div>
                        </div>
                      </div>
                      <div class="task-stats">
                        <div class="stat-value text-blue-400">{{ progress.vocabularyBuilder.wordsLearned || 0 }}</div>
                        <div class="stat-label">WORDS ACQUIRED</div>
                        <div class="stat-secondary">VOCAB MISSIONS</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Typing Arena Combat Mission -->
                <div 
                  @click="startSpellingBee"
                  class="mission-task active cursor-pointer"
                >
                  <div class="task-indicator">
                    <div class="task-status online"></div>
                  </div>
                  <div class="task-content">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="task-icon">⌨️</div>
                        <div class="task-info">
                          <div class="task-name">EIKEN TYPING ARENA</div>
                          <div class="task-description">3D戦術入力システム・英検レベル対応</div>
                        </div>
                      </div>
                      <div class="task-stats">
                        <div class="stat-value text-purple-400">{{ progress.spellingBee.highScore || 0 }}</div>
                        <div class="stat-label">MAX WPM</div>
                        <div class="stat-secondary">ARENA RECORD</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pattern Detective Mission -->
                <div 
                  @click="startPatternDetective"
                  class="mission-task cursor-pointer"
                  :class="!isUnlocked.patternDetective ? 'locked' : 'standby'"
                >
                  <div class="task-indicator">
                    <div class="task-status" :class="!isUnlocked.patternDetective ? 'locked' : 'development'"></div>
                  </div>
                  <div class="task-content">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="task-icon">🕵️</div>
                        <div class="task-info">
                          <div class="task-name">
                            PATTERN DETECTIVE
                            <span v-if="!isUnlocked.patternDetective" class="lock-indicator">🔒</span>
                          </div>
                          <div class="task-description">パターン解析・情報収集ミッション</div>
                        </div>
                      </div>
                      <div class="task-stats">
                        <div class="stat-value text-purple-400">{{ progress.patternDetective.patternsLearned }}</div>
                        <div class="stat-label">PATTERNS</div>
                        <div class="stat-secondary">DISCOVERED</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Word Scramble Mission -->
                <div 
                  @click="startWordScramble"
                  class="mission-task cursor-pointer"
                  :class="!isUnlocked.wordScramble ? 'locked' : 'standby'"
                >
                  <div class="task-indicator">
                    <div class="task-status" :class="!isUnlocked.wordScramble ? 'locked' : 'development'"></div>
                  </div>
                  <div class="task-content">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="task-icon">🔤</div>
                        <div class="task-info">
                          <div class="task-name">
                            WORD SCRAMBLE MISSION
                            <span v-if="!isUnlocked.wordScramble" class="lock-indicator">🔒</span>
                          </div>
                          <div class="task-description">データ再組立・復号ミッション</div>
                        </div>
                      </div>
                      <div class="task-stats">
                        <div class="stat-value text-green-400">{{ progress.wordScramble.streak }}</div>
                        <div class="stat-label">STREAK</div>
                        <div class="stat-secondary">MAX COMBO</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Command Systems -->
        <div class="advanced-systems mb-12">
          <div class="systems-container p-8 rounded-3xl">
            <div class="flex items-center justify-center mb-8">
              <div class="system-indicator animate-pulse">
                <span class="text-2xl">🚀</span>
              </div>
              <h2 class="text-3xl font-bold text-orange-300 ml-4 tracking-wide">ADVANCED COMMAND SYSTEMS</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Custom Database System -->
              <div 
                @click="openCustomWordLists"
                class="system-module cursor-pointer"
              >
                <div class="system-header">
                  <div class="system-icon">📚</div>
                  <div class="system-title">
                    <h3 class="text-xl font-bold text-orange-400 mb-2">CUSTOM DATABASE</h3>
                    <p class="text-slate-400 text-sm">
                      📊 カスタムデータセット構築システム
                    </p>
                  </div>
                </div>
                <div class="system-status development"></div>
              </div>

              <!-- Analytics System -->
              <div 
                @click="openAnalytics"
                class="system-module cursor-pointer"
              >
                <div class="system-header">
                  <div class="system-icon">📊</div>
                  <div class="system-title">
                    <h3 class="text-xl font-bold text-cyan-400 mb-2">ANALYTICS ENGINE</h3>
                    <p class="text-slate-400 text-sm">
                      🔍 パフォーマンス解析システム
                    </p>
                  </div>
                </div>
                <div class="system-status development"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Daily Mission Briefing -->
        <div class="daily-mission mb-8">
          <div class="mission-briefing-container p-8 rounded-3xl">
            <div class="flex items-center justify-between mb-6">
              <div class="briefing-info">
                <div class="flex items-center mb-4">
                  <div class="mission-priority animate-pulse">
                    <span class="text-2xl">🎯</span>
                  </div>
                  <h2 class="text-3xl font-bold text-yellow-300 ml-4 tracking-wide">DAILY MISSION BRIEFING</h2>
                </div>
                <p class="text-slate-300 text-lg">{{ dailyChallenge.description }}</p>
              </div>
              <div class="mission-counter">
                <div class="counter-label text-slate-400 mb-1">PROGRESS</div>
                <div class="counter-value text-3xl font-black text-yellow-400">
                  {{ dailyChallenge.progress }}/{{ dailyChallenge.target }}
                </div>
              </div>
            </div>
            
            <!-- Mission Progress Bar -->
            <div class="mission-progress-container">
              <div class="progress-track">
                <div 
                  class="progress-fill"
                  :style="{ width: `${(dailyChallenge.progress / dailyChallenge.target) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

export default {
  name: 'DictationSpellingHub',
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()

    // Progress data
    const progress = ref({
      wordDictation: {
        accuracy: 78,
        completed: 45,
        unlocked: true
      },
      sentenceDictation: {
        accuracy: 65,
        completed: 12,
        unlocked: false
      },
      speedDictation: {
        wpm: 25,
        completed: 8,
        unlocked: false
      },
      spellingBee: {
        highScore: 1250,
        gamesPlayed: 18,
        unlocked: true
      },
      patternDetective: {
        patternsLearned: 8,
        accuracy: 72,
        unlocked: false
      },
      wordScramble: {
        streak: 12,
        completed: 34,
        unlocked: false
      },
      vocabularyBuilder: {
        wordsLearned: 125,
        accuracy: 82,
        unlocked: true
      }
    })

    // Daily challenge
    const dailyChallenge = ref({
      description: '今日は20個の単語のディクテーションにチャレンジしよう！',
      progress: 8,
      target: 20,
      type: 'dictation'
    })

    // Computed properties
    const overallProgress = computed(() => {
      return {
        dictationAccuracy: Math.round((
          progress.value.wordDictation.accuracy + 
          progress.value.sentenceDictation.accuracy + 
          progress.value.speedDictation.wpm
        ) / 3),
        spellingAccuracy: Math.round((
          progress.value.spellingBee.highScore / 20 + 
          progress.value.patternDetective.accuracy + 
          progress.value.wordScramble.streak * 5
        ) / 3),
        wordsLearned: progress.value.wordDictation.completed + 
                     progress.value.sentenceDictation.completed * 5 + 
                     progress.value.wordScramble.completed
      }
    })

    const isUnlocked = computed(() => {
      return {
        sentenceDictation: progress.value.wordDictation.completed >= 20,
        speedDictation: progress.value.sentenceDictation.completed >= 5,
        patternDetective: progress.value.spellingBee.gamesPlayed >= 10,
        wordScramble: progress.value.spellingBee.highScore >= 500
      }
    })

    // Navigation methods
    const startWordDictation = () => {
      router.push('/games/word-dictation-challenge')
    }

    const startSentenceDictation = () => {
      if (isUnlocked.value.sentenceDictation) {
        alert('🚧 文章ディクテーションは開発中です！\n\n近日公開予定ですので、もう少しお待ちください。')
        // router.push('/games/sentence-dictation')
      } else {
        alert('🔒 単語ディクテーションを20問完了すると解放されます！')
      }
    }

    const startSpeedDictation = () => {
      if (isUnlocked.value.speedDictation) {
        alert('🚧 スピードディクテーションは開発中です！\n\n近日公開予定ですので、もう少しお待ちください。')
        // router.push('/games/speed-dictation')
      } else {
        alert('🔒 文章ディクテーションを5問完了すると解放されます！')
      }
    }

    const startSpellingBee = () => {
      router.push('/games/typing-arena')
    }

    const startVocabularyBuilder = () => {
      alert('🚧 語彙力ビルダーは開発中です！\n\n画像・定義・例文を使った包括的な語彙学習システムを開発中です。')
    }

    const startPatternDetective = () => {
      if (isUnlocked.value.patternDetective) {
        alert('🚧 スペリング・パターン探偵は開発中です！\n\n近日公開予定ですので、もう少しお待ちください。')
        // router.push('/games/spelling-pattern-detective')
      } else {
        alert('🔒 スペリング・ビーを10回プレイすると解放されます！')
      }
    }

    const startWordScramble = () => {
      if (isUnlocked.value.wordScramble) {
        alert('🚧 ワード・スクランブル・スペラーは開発中です！\n\n近日公開予定ですので、もう少しお待ちください。')
        // router.push('/games/word-scramble-speller')
      } else {
        alert('🔒 スペリング・ビーで500点以上獲得すると解放されます！')
      }
    }

    const openCustomWordLists = () => {
      alert('🚧 カスタム単語リストは開発中です！\n\n近日公開予定ですので、もう少しお待ちください。')
      // router.push('/dictation-spelling/custom-word-lists')
    }

    const openAnalytics = () => {
      alert('🚧 学習分析ダッシュボードは開発中です！\n\n近日公開予定ですので、もう少しお待ちください。')
      // router.push('/dictation-spelling/analytics')
    }

    const handleBack = () => {
      router.back()
    }

    // Initialize data
    onMounted(() => {
      // Load user progress from store
      // This would typically fetch from a backend service
      console.log('Loading dictation & spelling progress...')
    })

    return {
      // Data
      progress,
      dailyChallenge,
      overallProgress,
      isUnlocked,

      // Methods
      startWordDictation,
      startSentenceDictation,
      startSpeedDictation,
      startSpellingBee,
      startVocabularyBuilder,
      startPatternDetective,
      startWordScramble,
      openCustomWordLists,
      openAnalytics,
      handleBack
    }
  }
}
</script>

<style scoped>
/* Mission Control Dashboard Styles */
.dashboard-background {
  background: 
    radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f172a 100%);
  min-height: 100vh;
}

/* Command Center Grid Pattern */
.command-center-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.3;
}

/* Scanning Lines Effect */
.scanning-lines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(6, 182, 212, 0.1) 50%,
    transparent 100%
  );
  background-size: 200px 100%;
  animation: scan 8s linear infinite;
  pointer-events: none;
  z-index: 2;
}

/* Orbital Rings */
.orbital-rings {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 800px;
  height: 800px;
  margin: -400px 0 0 -400px;
  border: 1px solid rgba(6, 182, 212, 0.1);
  border-radius: 50%;
  animation: rotate 60s linear infinite;
  pointer-events: none;
  z-index: 1;
}

.orbital-rings::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  margin: -300px 0 0 -300px;
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: 50%;
  animation: rotate 40s linear infinite reverse;
}

@keyframes scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100vw); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Command Center Interface Elements */
.command-center-title {
  position: relative;
  z-index: 10;
}

.title-hologram {
  position: relative;
  text-align: center;
}

.title-hologram::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.1), transparent);
  border-radius: 20px;
  animation: hologram 3s ease-in-out infinite;
}

.command-subtitle {
  position: relative;
  z-index: 10;
}

@keyframes hologram {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

/* Mission Dashboard */
.mission-dashboard {
  position: relative;
  z-index: 10;
}

.dashboard-container {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%, 
    rgba(30, 41, 59, 0.9) 50%, 
    rgba(15, 23, 42, 0.9) 100%
  );
  backdrop-filter: blur(20px);
  border: 2px solid rgba(6, 182, 212, 0.3);
  box-shadow: 
    0 0 50px rgba(6, 182, 212, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.status-module {
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.8) 0%, 
    rgba(51, 65, 85, 0.8) 100%
  );
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  transition: all 0.3s ease;
}

.status-module:hover {
  border-color: rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(6, 182, 212, 0.1);
}

.module-header {
  text-align: center;
  margin-bottom: 16px;
}

.module-data {
  text-align: center;
  margin-bottom: 16px;
}

.module-status {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  animation: pulse 2s infinite;
}

.module-status.success {
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Command Buttons */
.command-button {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.command-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.command-button:hover::before {
  left: 100%;
}

.command-button-secondary {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #e2e8f0;
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
}

.command-button-secondary:hover {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

/* Mission Status Indicators */
.mission-status {
  background: linear-gradient(135deg, 
    rgba(6, 182, 212, 0.2) 0%, 
    rgba(168, 85, 247, 0.2) 100%
  );
  border: 1px solid rgba(6, 182, 212, 0.3);
  backdrop-filter: blur(10px);
}

.status-indicator {
  display: inline-block;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* Mission Categories */
.mission-category-container {
  position: relative;
  z-index: 10;
}

.mission-category-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%, 
    rgba(30, 41, 59, 0.9) 50%, 
    rgba(15, 23, 42, 0.9) 100%
  );
  backdrop-filter: blur(20px);
  border: 2px solid rgba(6, 182, 212, 0.3);
  box-shadow: 
    0 0 50px rgba(6, 182, 212, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.category-header {
  text-align: center;
  position: relative;
}

.category-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.category-icon {
  font-size: 3rem;
  display: block;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  border: 2px solid rgba(6, 182, 212, 0.3);
  border-radius: 50%;
  animation: iconPulse 3s infinite;
}

@keyframes iconPulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* Mission Tasks */
.mission-task {
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.6) 0%, 
    rgba(51, 65, 85, 0.6) 100%
  );
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.mission-task::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.1), transparent);
  transition: left 0.5s;
}

.mission-task:hover::before {
  left: 100%;
}

.mission-task:hover {
  border-color: rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.1);
}

.mission-task.locked {
  opacity: 0.5;
  border-color: rgba(100, 116, 139, 0.3);
}

.mission-task.locked:hover {
  transform: none;
  box-shadow: none;
}

.task-indicator {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 8px;
  height: 8px;
}

.task-status {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.task-status.online {
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

.task-status.standby {
  background: #f59e0b;
  box-shadow: 0 0 10px #f59e0b;
}

.task-status.development {
  background: #3b82f6;
  box-shadow: 0 0 10px #3b82f6;
}

.task-status.locked {
  background: #64748b;
  box-shadow: 0 0 10px #64748b;
  animation: none;
}

.task-content {
  margin-left: 24px;
}

.task-icon {
  font-size: 2rem;
  margin-right: 16px;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.task-description {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.4;
}

.task-stats {
  text-align: right;
  min-width: 120px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.stat-secondary {
  font-size: 0.6rem;
  color: #64748b;
  margin-top: 2px;
}

.lock-indicator {
  color: #f59e0b;
  margin-left: 8px;
  font-size: 0.8rem;
}

/* Advanced Systems */
.advanced-systems,
.daily-mission {
  position: relative;
  z-index: 10;
}

.systems-container,
.mission-briefing-container {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%, 
    rgba(30, 41, 59, 0.9) 50%, 
    rgba(15, 23, 42, 0.9) 100%
  );
  backdrop-filter: blur(20px);
  border: 2px solid rgba(245, 158, 11, 0.3);
  box-shadow: 
    0 0 50px rgba(245, 158, 11, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.system-indicator,
.mission-priority {
  display: inline-block;
  animation: statusPulse 2s infinite;
}

.system-module {
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.6) 0%, 
    rgba(51, 65, 85, 0.6) 100%
  );
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.system-module:hover {
  border-color: rgba(245, 158, 11, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.1);
}

.system-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.system-icon {
  font-size: 2rem;
  margin-right: 16px;
}

.system-title h3 {
  margin: 0;
}

.system-status {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.system-status.development {
  background: #3b82f6;
  box-shadow: 0 0 10px #3b82f6;
}

/* Daily Mission */
.briefing-info {
  flex: 1;
}

.mission-counter {
  text-align: right;
  min-width: 120px;
}

.counter-label {
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.counter-value {
  line-height: 1;
}

.mission-progress-container {
  position: relative;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
  animation: progressPulse 2s infinite;
}

@keyframes progressPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
  50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .text-6xl {
    font-size: 3rem;
  }
  
  .text-4xl {
    font-size: 2rem;
  }
  
  .mission-category-card,
  .dashboard-container,
  .systems-container,
  .mission-briefing-container {
    padding: 1rem;
  }
  
  .task-content {
    margin-left: 16px;
  }
  
  .task-icon {
    font-size: 1.5rem;
    margin-right: 12px;
  }
  
  .task-stats {
    min-width: 80px;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
}
</style>