<template>
  <div class="min-h-screen galaxy-background p-6 relative overflow-hidden">
    <!-- Animated star layers -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>
    
    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Header with back button -->
      <button
        @click="handleBack"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
      >
        ← 戻る
      </button>

      <!-- Mode Selection Screen -->
      <div v-if="gameMode === 'selection'" class="mode-selection-container">
        <h1 class="text-5xl font-bold galaxy-text-primary mb-12 text-center cosmic-glow">
          ⌨️ 英検タイピング・アリーナ
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Story Mode Card -->
          <div 
            @click="selectMode('story')"
            class="mode-card story-mode-card p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <div class="mode-icon text-6xl mb-4">🌌</div>
            <h3 class="text-3xl font-bold text-white mb-2">ストーリーモード</h3>
            <p class="text-lg text-slate-200 mb-4">銀河英語救出作戦</p>
            <div class="progress-indicator">
              <div class="progress-bar-bg">
                <div class="progress-bar" :style="{width: storyProgress + '%'}"></div>
              </div>
              <span class="text-sm mt-2">Chapter {{ currentChapter }}/5</span>
            </div>
            <div class="mt-4 text-sm text-slate-300">
              <div>🏆 {{ characterTitle }}</div>
              <div>⭐ Lv.{{ characterLevel }}</div>
            </div>
          </div>
          
          <!-- Practice Mode Card -->
          <div 
            @click="selectMode('practice')"
            class="mode-card practice-mode-card p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <div class="mode-icon text-6xl mb-4">⚡</div>
            <h3 class="text-3xl font-bold text-white mb-2">練習モード</h3>
            <p class="text-lg text-slate-200 mb-4">自由にスキルアップ</p>
            <div class="quick-stats space-y-2">
              <div class="stat-item">
                <span class="stat-label">最高WPM:</span>
                <span class="stat-value">{{ bestWPM }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均正確率:</span>
                <span class="stat-value">{{ Math.round(averageAccuracy) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">総セッション数:</span>
                <span class="stat-value">{{ totalSessions }}</span>
              </div>
            </div>
            <div v-if="analysisRecommendations.length > 0" class="mt-3 pt-3 border-t border-white/20">
              <div class="text-xs text-yellow-300 font-semibold">🎯 AIおすすめ練習</div>
            </div>
          </div>
        </div>

        <!-- Overall Progress -->
        <div class="mt-12 text-center">
          <div class="galaxy-card rounded-2xl p-6 max-w-2xl mx-auto">
            <h4 class="text-xl font-bold text-white mb-4">総合進捗</h4>
            <div class="overall-progress-bar">
              <div class="progress-fill" :style="{width: overallProgress + '%'}"></div>
            </div>
            <p class="mt-2 text-slate-300">{{ overallProgress }}% 完了</p>
          </div>
        </div>
      </div>

      <!-- Story Mode Hub -->
      <div v-else-if="gameMode === 'story' && !inGame" class="story-mode-hub">
        <h1 class="text-4xl font-bold galaxy-text-primary mb-8 text-center cosmic-glow">
          🌌 銀河英語救出作戦
        </h1>

        <!-- Chapter Selection -->
        <div class="chapters-container mb-8">
          <div class="chapter-map">
            <div 
              v-for="(chapter, index) in storyChapters" 
              :key="chapter.id"
              class="chapter-node"
              :class="{
                'unlocked': chapter.unlocked,
                'completed': chapter.completed,
                'current': currentChapter === index + 1
              }"
              @click="selectChapter(index + 1)"
            >
              <div class="chapter-icon">{{ getChapterIcon(index + 1) }}</div>
              <div class="chapter-info">
                <h3 class="text-lg font-bold">Chapter {{ index + 1 }}</h3>
                <p class="text-sm">{{ chapter.name }}</p>
              </div>
              <div v-if="!chapter.unlocked" class="lock-overlay">
                <span class="text-2xl">🔒</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons mt-8 flex gap-4 justify-center">
          <button
            @click="startStoryMode"
            class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all duration-200"
          >
            ストーリー開始！
          </button>
          <button
            @click="gameMode = 'selection'"
            class="galaxy-button galaxy-button-secondary px-6 py-4 rounded-2xl font-bold text-xl"
          >
            モード選択に戻る
          </button>
        </div>
      </div>

      <!-- Practice Mode Level Selection (Original) -->
      <div v-else-if="gameMode === 'practice' && gameState === 'levelSelect'" 
           class="galaxy-card rounded-3xl p-8 shadow-2xl mb-6">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-4 text-shadow-lg">📚 英検レベルを選択</h2>
          <p class="text-slate-200 text-lg font-medium bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            あなたの英語レベルに合わせたタイピング練習を始めましょう
          </p>
        </div>
        
        <!-- Practice Mode Options -->
        <div class="practice-options mb-6">
          <div class="flex gap-4 justify-center flex-wrap">
            <button
              @click="practiceType = 'standard'"
              class="practice-option-btn px-6 py-3 rounded-xl font-bold transition-all duration-200"
              :class="practiceType === 'standard' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'"
            >
              🎯 標準練習
            </button>
            <button
              @click="practiceType = 'weakness'"
              class="practice-option-btn px-6 py-3 rounded-xl font-bold transition-all duration-200 relative"
              :class="practiceType === 'weakness' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'"
            >
              🤖 AI弱点強化
              <span v-if="analysisRecommendations.length > 0" 
                    class="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full text-xs text-gray-800 flex items-center justify-center font-bold">
                {{ analysisRecommendations.length }}
              </span>
            </button>
            <button
              @click="practiceType = 'timeAttack'"
              class="practice-option-btn px-6 py-3 rounded-xl font-bold transition-all duration-200"
              :class="practiceType === 'timeAttack' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'"
            >
              ⏱️ タイムアタック
            </button>
          </div>
        </div>
        
        <!-- AI Weakness Analysis -->
        <div v-if="practiceType === 'weakness' && typingAnalytics.weakPoints" 
             class="ai-analysis-panel mb-6 p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400/40">
          <h3 class="text-xl font-bold text-white mb-4">🤖 AI分析レポート</h3>
          
          <div class="analysis-sections space-y-4">
            <div v-if="typingAnalytics.weakPoints.slowLetters.length > 0">
              <h4 class="text-sm font-bold text-purple-300 mb-2">🐢 タイピングが遅い文字</h4>
              <div class="flex gap-2 flex-wrap">
                <span v-for="letter in typingAnalytics.weakPoints.slowLetters.slice(0, 10)" 
                      :key="letter.char"
                      class="px-3 py-1 bg-purple-700/50 rounded-lg text-white font-mono">
                  {{ letter.char }} <span class="text-xs text-purple-300">({{ letter.avgTime }}ms)</span>
                </span>
              </div>
            </div>
            
            <div v-if="typingAnalytics.weakPoints.errorPronePatterns.length > 0">
              <h4 class="text-sm font-bold text-red-300 mb-2">❌ エラーが多いパターン</h4>
              <div class="flex gap-2 flex-wrap">
                <span v-for="pattern in typingAnalytics.weakPoints.errorPronePatterns.slice(0, 8)" 
                      :key="pattern.pattern"
                      class="px-3 py-1 bg-red-700/50 rounded-lg text-white font-mono">
                  {{ pattern.pattern }} <span class="text-xs text-red-300">({{ pattern.errorRate }}%)</span>
                </span>
              </div>
            </div>
            
            <div v-if="typingAnalytics.weakPoints.difficultWords.length > 0">
              <h4 class="text-sm font-bold text-orange-300 mb-2">📖 苦手な単語</h4>
              <div class="space-y-1">
                <div v-for="word in typingAnalytics.weakPoints.difficultWords.slice(0, 5)" 
                     :key="word.word"
                     class="text-sm text-orange-200">
                  {{ word.word }} <span class="text-xs text-orange-400">(ミス{{ word.errors }}回)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="recommendations mt-4 pt-4 border-t border-purple-400/40">
            <h4 class="text-sm font-bold text-yellow-300 mb-2">💡 おすすめ練習</h4>
            <ul class="space-y-1 text-sm text-yellow-200">
              <li v-for="(rec, index) in analysisRecommendations.slice(0, 3)" :key="index">
                • {{ rec }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Time Attack Settings -->
        <div v-if="practiceType === 'timeAttack'" 
             class="time-attack-settings mb-6 p-6 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/40">
          <h3 class="text-xl font-bold text-white mb-4">⏱️ タイムアタック設定</h3>
          
          <div class="settings-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-bold text-orange-300 mb-2 block">制限時間</label>
              <select v-model="timeAttackDuration" 
                      class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-orange-400/50">
                <option :value="30">30秒</option>
                <option :value="60">1分</option>
                <option :value="120">2分</option>
                <option :value="180">3分</option>
              </select>
            </div>
            
            <div>
              <label class="text-sm font-bold text-orange-300 mb-2 block">チャレンジ目標</label>
              <select v-model="timeAttackGoal" 
                      class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-orange-400/50">
                <option value="words">単語数</option>
                <option value="accuracy">正確率重視</option>
                <option value="speed">スピード重視</option>
              </select>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-orange-900/30 rounded-lg">
            <p class="text-sm text-orange-200">
              <strong>ルール:</strong> {{ timeAttackDuration }}秒間でできるだけ多くの単語を正確にタイプしてください。
              {{ timeAttackGoal === 'accuracy' ? '正確率が重要です！' : timeAttackGoal === 'speed' ? 'スピードを重視！' : '単語数を稼いで！' }}
            </p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(level, key) in levels" 
            :key="key"
            @click="selectLevel(key)"
            class="level-card p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 relative overflow-hidden"
            :class="{
              'level-selected border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-xl transform scale-105': selectedLevel === key,
              'level-unselected border-gray-600 bg-gray-800/30 hover:border-purple-400 hover:bg-purple-500/10 hover:scale-105': selectedLevel !== key
            }"
          >
            <!-- Selection indicator -->
            <div v-if="selectedLevel === key" class="selection-indicator absolute top-2 right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span class="text-gray-900 font-bold text-lg">✓</span>
            </div>
            
            <!-- Glow effect for selected item -->
            <div v-if="selectedLevel === key" class="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-xl pointer-events-none animate-pulse"></div>
            
            <div class="text-center relative z-10">
              <div class="text-4xl mb-3 transition-transform duration-300" :class="{ 'scale-110': selectedLevel === key }">{{ level.icon }}</div>
              <div class="text-xl font-bold mb-2 transition-colors duration-300" 
                   :class="selectedLevel === key ? 'text-yellow-300 text-shadow-glow' : 'text-white text-shadow-md'">
                {{ level.name }}
              </div>
              <div class="text-sm font-medium mb-3 px-3 py-1 rounded-lg transition-colors duration-300" 
                   :class="selectedLevel === key ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30' : 'bg-black/20 text-slate-200'">
                {{ level.description }}
              </div>
              <div class="text-xs font-semibold px-3 py-1 rounded-lg transition-colors duration-300" 
                   :class="selectedLevel === key ? 'bg-orange-500/20 text-orange-100 border border-orange-400/30' : 'bg-slate-800/40 text-slate-300'">
                語彙数: {{ level.wordCount }}語 | 文章: {{ level.sentenceCount }}文
              </div>
            </div>
            
            <!-- Selected overlay -->
            <div v-if="selectedLevel === key" class="absolute inset-0 border-2 border-yellow-400 rounded-xl pointer-events-none shadow-glow"></div>
          </div>
        </div>
        
        <!-- Selection status indicator -->
        <div class="selection-status mt-6 text-center">
          <div v-if="selectedLevel" class="selected-info p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border-2 border-green-400/40">
            <div class="flex items-center justify-center gap-3 mb-2">
              <span class="text-2xl">{{ levels[selectedLevel].icon }}</span>
              <span class="text-xl font-bold text-green-300">{{ levels[selectedLevel].name }} を選択中</span>
              <span class="text-green-400 text-2xl animate-bounce">✓</span>
            </div>
            <p class="text-sm text-green-200">{{ levels[selectedLevel].description }} の練習を開始できます</p>
          </div>
          <div v-else class="unselected-info p-4 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-2xl border-2 border-gray-400/40">
            <div class="flex items-center justify-center gap-3 mb-2">
              <span class="text-2xl">📚</span>
              <span class="text-xl font-bold text-gray-300">英検レベルを選択してください</span>
            </div>
            <p class="text-sm text-gray-400">上記のカードをクリックして練習レベルを選択してください</p>
          </div>
        </div>
        
        <div class="text-center mt-8 space-x-4">
          <button
            @click="startTyping"
            :disabled="!selectedLevel"
            class="galaxy-button px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300"
            :class="{
              'galaxy-button-primary hover:shadow-lg hover:scale-105 animate-pulse': selectedLevel,
              'opacity-40 cursor-not-allowed bg-gray-700 text-gray-400': !selectedLevel
            }"
          >
            <span v-if="selectedLevel" class="flex items-center gap-2">
              <span>🚀</span>
              <span>{{ levels[selectedLevel].name }} でタイピング開始！</span>
            </span>
            <span v-else>レベルを選択してください</span>
          </button>
          <button
            @click="gameMode = 'selection'"
            class="galaxy-button galaxy-button-secondary px-6 py-4 rounded-2xl font-bold text-xl"
          >
            モード選択に戻る
          </button>
        </div>
      </div>

      <!-- Character Status Panel (Story Mode) -->
      <div v-if="gameMode === 'story' && inGame" class="character-panel mb-6">
        <div class="galaxy-card rounded-3xl p-6 shadow-2xl">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Character Avatar & Basic Info -->
            <div class="character-section">
              <div class="character-avatar-container text-center">
                <div class="character-avatar relative inline-block">
                  <div class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl">
                    🌟
                  </div>
                  <div class="level-badge absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-white">
                    <span class="text-xs font-bold text-white">{{ characterLevel }}</span>
                  </div>
                </div>
                <div class="character-info mt-4">
                  <h3 class="text-xl font-bold text-white">{{ characterName }}</h3>
                  <p class="text-sm text-yellow-400 font-semibold">{{ characterTitle }}</p>
                  
                  <!-- Experience Bar -->
                  <div class="exp-container mt-3">
                    <div class="exp-bar relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div class="exp-fill h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" 
                           :style="{width: expPercentage + '%'}"></div>
                      <div class="exp-text absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {{ characterExp }}/{{ nextLevelExp }}
                      </div>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">次のレベルまで</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pet Status -->
            <div class="pet-section">
              <h4 class="text-lg font-bold text-white mb-4">🐦 ペット状態</h4>
              <div class="pet-display">
                <div class="pet-avatar mb-4">
                  <div class="pet-container relative">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto relative"
                         :class="getPetBackgroundClass()">
                      {{ getCurrentPetIcon() }}
                      <div v-if="petEvolutionStage > 0" class="evolution-sparkle absolute inset-0 rounded-full pointer-events-none"></div>
                    </div>
                    <div v-if="canEvolve()" class="evolution-indicator absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse">
                      <span class="text-xs font-bold text-gray-800">⬆</span>
                    </div>
                  </div>
                  <p class="text-center text-white font-bold mt-2">{{ petName }}</p>
                  <p class="text-center text-sm text-green-400">Lv.{{ petLevel }}</p>
                  <div class="pet-exp-bar mt-2">
                    <div class="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300"
                           :style="{width: petExpPercentage + '%'}"></div>
                    </div>
                  </div>
                </div>
                <div class="affection-display">
                  <div class="affection-hearts flex justify-center gap-1 mb-2">
                    <span v-for="i in 5" :key="i" 
                          class="heart text-sm transition-opacity duration-200"
                          :class="{'opacity-100': i <= petAffectionLevel, 'opacity-30': i > petAffectionLevel}">❤️</span>
                  </div>
                  <div class="affection-bar w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div class="affection-fill h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300" 
                         :style="{width: petAffectionPercentage + '%'}"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="stats-section">
              <h4 class="text-lg font-bold text-white mb-4">⚡ クイック統計</h4>
              <div class="stats-grid space-y-3">
                <div class="stat-item flex justify-between items-center p-2 rounded bg-black/20">
                  <span class="stat-label text-sm text-slate-400">スピード:</span>
                  <span class="stat-value font-bold text-white">{{ characterStats.speed }}/100</span>
                </div>
                <div class="stat-item flex justify-between items-center p-2 rounded bg-black/20">
                  <span class="stat-label text-sm text-slate-400">精度:</span>
                  <span class="stat-value font-bold text-white">{{ characterStats.accuracy }}/100</span>
                </div>
                <div class="stat-item flex justify-between items-center p-2 rounded bg-black/20">
                  <span class="stat-label text-sm text-slate-400">語彙力:</span>
                  <span class="stat-value font-bold text-white">{{ characterStats.vocabulary }}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boss Battle UI -->
      <div v-if="isBossBattle && inGame" class="boss-battle-ui mb-6">
        <div class="galaxy-card rounded-3xl p-6 shadow-2xl">
          <div class="boss-health-container flex items-center gap-4">
            <div class="boss-info flex items-center gap-3">
              <div class="boss-avatar w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500"
                   :class="{ 'animate-pulse': specialAttackActive }">
                <span class="text-2xl">{{ currentBoss.icon }}</span>
              </div>
              <div class="boss-details">
                <h3 class="text-lg font-bold text-white">{{ currentBoss.name }}</h3>
                <div class="boss-phase text-sm text-red-400 font-semibold">{{ getCurrentPhase() }}</div>
                <div v-if="specialAttackActive" class="special-attack-indicator text-sm text-yellow-400 font-bold animate-pulse">
                  ⚡ 特殊攻撃中!
                </div>
              </div>
            </div>
            
            <div class="health-bar-container flex-1 ml-4">
              <div class="health-bar relative w-full h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600">
                <div class="health-fill h-full transition-all duration-500" 
                     :style="{
                       width: healthPercentage + '%',
                       backgroundColor: getHealthColor()
                     }"></div>
              </div>
              <div class="health-text text-center text-sm font-bold text-white mt-1">
                {{ bossHP }} / {{ maxBossHP }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Game Area (Shared) -->
      <div v-else-if="gameState === 'typing' && inGame" class="galaxy-card rounded-3xl p-8 shadow-2xl mb-6">
        <!-- Timer and Progress -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-2xl font-bold galaxy-text-primary">
            ⏱️ {{ Math.floor(elapsedTime / 60) }}:{{ String(elapsedTime % 60).padStart(2, '0') }}
          </div>
          <div class="text-lg text-galaxy-moon-silver">
            {{ currentTextIndex + 1 }} / {{ currentTexts.length }}
          </div>
        </div>

        <!-- Current Text Display (3D Style) -->
        <div class="typing-display mb-8">
          <div class="text-display-3d p-6 rounded-2xl mb-4">
            <div class="text-2xl font-mono leading-relaxed tracking-wide">
              <span 
                v-for="(char, index) in currentText" 
                :key="index"
                class="char-display transition-all duration-150"
                :class="{
                  'text-green-400 bg-green-500/20': index < userInput.length && userInput[index] === char,
                  'text-red-400 bg-red-500/20 animate-pulse': index < userInput.length && userInput[index] !== char,
                  'text-gray-300': index >= userInput.length && index !== userInput.length,
                  'text-white bg-blue-500/30 animate-pulse': index === userInput.length,
                  'shadow-lg': index === userInput.length
                }"
              >{{ char }}</span>
            </div>
          </div>
          
          <!-- Japanese Translation (shown after completion) -->
          <div v-if="showTranslation" class="translation-display p-4 bg-blue-500/20 rounded-xl border-2 border-blue-400">
            <div class="text-lg font-bold text-blue-300 mb-2">🇯🇵 日本語訳</div>
            <div class="text-xl text-blue-100">{{ currentTranslation }}</div>
          </div>

          <!-- Pet Helper (Story Mode) -->
          <div v-if="gameMode === 'story'" class="pet-helper mt-4 p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/40">
            <div class="flex items-center gap-4">
              <div class="pet-avatar w-16 h-16 cursor-pointer transition-transform duration-200 hover:scale-110" @click="interactWithPet">
                <div class="w-full h-full rounded-full flex items-center justify-center text-2xl relative"
                     :class="getPetBackgroundClass()">
                  {{ getCurrentPetIcon() }}
                  <div v-if="petEvolutionStage > 0" class="evolution-sparkle absolute inset-0 rounded-full pointer-events-none"></div>
                  <div class="pet-level-badge absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-white">
                    <span class="text-xs font-bold text-white">{{ petLevel }}</span>
                  </div>
                </div>
              </div>
              
              <div class="pet-info flex-1">
                <h4 class="pet-name text-lg font-bold text-green-400">{{ petName }}</h4>
                <div class="pet-status text-sm text-white">{{ getPetStatus() }}</div>
              </div>

              <div class="pet-abilities flex gap-2">
                <button 
                  @click="usePetHint" 
                  :disabled="petHintCooldown > 0"
                  class="ability-button px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="ability-icon mr-1">💡</span>
                  <span v-if="petHintCooldown > 0">{{ petHintCooldown }}s</span>
                  <span v-else>ヒント</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Special Skills Bar (Story Mode) -->
          <div v-if="gameMode === 'story'" class="special-skills-bar mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/40">
            <h4 class="text-sm font-bold text-purple-400 mb-2">🌠 特殊スキル</h4>
            <div class="skills-container flex gap-2 flex-wrap">
              <button
                v-for="skill in specialSkills"
                :key="skill.id"
                @click="useSpecialSkill(skill)"
                :disabled="!canUseSkill(skill)"
                class="skill-button p-2 rounded-lg text-sm font-semibold transition-all duration-200 relative"
                :class="{
                  'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105': canUseSkill(skill),
                  'bg-gray-700 text-gray-400 cursor-not-allowed': !canUseSkill(skill)
                }"
                :title="getSkillTooltip(skill)"
              >
                <span class="skill-icon">{{ skill.icon }}</span>
                <span class="skill-name ml-1">{{ skill.name }}</span>
                <div v-if="skill.cooldown > 0" class="cooldown-overlay absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                  <span class="text-xs font-bold text-white">{{ skill.cooldown }}s</span>
                </div>
              </button>
            </div>
            <div class="focus-bar mt-2">
              <div class="text-xs text-purple-300 mb-1">集中力: {{ focusPoints }}/{{ maxFocusPoints }}</div>
              <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                     :style="{width: (focusPoints / maxFocusPoints * 100) + '%'}"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Virtual Keyboard (3D Style) -->
        <div class="virtual-keyboard mb-6">
          <div class="keyboard-3d p-6 rounded-2xl">
            <div class="text-center mb-4">
              <div class="text-lg font-bold galaxy-text-primary">バーチャルキーボード</div>
            </div>
            
            <!-- Keyboard rows -->
            <div class="space-y-2">
              <div v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex" class="flex justify-center gap-1">
                <button
                  v-for="key in row"
                  :key="key"
                  class="keyboard-key"
                  :class="{
                    'key-active': activeKeys.includes(key.toLowerCase()),
                    'key-correct': lastTypedChar === key.toLowerCase() && isLastCharCorrect,
                    'key-incorrect': lastTypedChar === key.toLowerCase() && !isLastCharCorrect,
                    'key-hint': petHintChar === key.toLowerCase()
                  }"
                  @click="virtualKeyPress(key)"
                >
                  {{ key }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Hidden input for actual typing -->
        <input
          ref="typingInput"
          v-model="userInput"
          @input="handleTyping"
          @keydown="handleKeydown"
          class="opacity-0 absolute -z-10"
          type="text"
          autocomplete="off"
          spellcheck="false"
        />

        <!-- Stats Display -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-yellow-400">{{ wpm }}</div>
            <div class="text-sm text-galaxy-moon-silver">Words/Min</div>
          </div>
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-green-400">{{ accuracy }}%</div>
            <div class="text-sm text-galaxy-moon-silver">正確率</div>
          </div>
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-red-400">{{ errors }}</div>
            <div class="text-sm text-galaxy-moon-silver">エラー数</div>
          </div>
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-blue-400">{{ streak }}</div>
            <div class="text-sm text-galaxy-moon-silver">連続正解</div>
          </div>
        </div>
      </div>

      <!-- Results Screen -->
      <div v-else-if="gameState === 'results'" class="galaxy-card rounded-3xl p-8 shadow-2xl mb-6">
        <div class="text-center">
          <div class="result-icon text-8xl mb-4">{{ getResultIcon() }}</div>
          <h2 class="text-4xl font-bold text-white mb-6 text-shadow-lg">🏆 タイピング結果</h2>
          
          <!-- Final Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-400/30">
              <div class="text-3xl font-bold text-yellow-400 text-shadow-md">{{ finalWpm }}</div>
              <div class="text-lg text-white font-semibold">平均WPM</div>
            </div>
            <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-green-400/30">
              <div class="text-3xl font-bold text-green-400 text-shadow-md">{{ finalAccuracy }}%</div>
              <div class="text-lg text-white font-semibold">総合正確率</div>
            </div>
            <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-blue-400/30">
              <div class="text-3xl font-bold text-blue-400 text-shadow-md">{{ totalTime }}</div>
              <div class="text-lg text-white font-semibold">総時間</div>
            </div>
            <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-400/30">
              <div class="text-3xl font-bold text-purple-400 text-shadow-md">{{ calculateScore() }}</div>
              <div class="text-lg text-white font-semibold">総合スコア</div>
            </div>
          </div>

          <!-- Story Mode Rewards -->
          <div v-if="gameMode === 'story' && storyRewards" class="rewards-section mb-8">
            <h3 class="text-2xl font-bold text-white mb-6">🎁 獲得報酬</h3>
            
            <div class="rewards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-if="storyRewards.experience" class="reward-item flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/40">
                <div class="reward-icon text-3xl">⭐</div>
                <div class="reward-content">
                  <div class="reward-name text-sm font-semibold text-green-400">経験値</div>
                  <div class="reward-value text-lg font-bold text-white">+{{ storyRewards.experience }} EXP</div>
                </div>
              </div>

              <div v-if="storyRewards.petExperience" class="reward-item flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/40">
                <div class="reward-icon text-3xl">🐦</div>
                <div class="reward-content">
                  <div class="reward-name text-sm font-semibold text-blue-400">ペット経験値</div>
                  <div class="reward-value text-lg font-bold text-white">+{{ storyRewards.petExperience }} EXP</div>
                </div>
              </div>

              <div v-if="storyRewards.title" class="reward-item flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/40">
                <div class="reward-icon text-3xl">👑</div>
                <div class="reward-content">
                  <div class="reward-name text-sm font-semibold text-yellow-400">新称号獲得</div>
                  <div class="reward-value text-lg font-bold text-white">{{ storyRewards.title }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ranking -->
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-white mb-4 text-shadow-md">🥇 ランキング</h3>
            <div class="ranking-display p-6 bg-black/50 backdrop-blur-md rounded-xl border border-white/20">
              <div class="text-xl text-white font-bold text-shadow-sm">
                {{ getRankingMessage() }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 justify-center flex-wrap">
            <template v-if="gameMode === 'story'">
              <button
                @click="continueStory"
                class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all duration-200"
              >
                🌟 続きを進める
              </button>
              <button
                @click="restartGame"
                class="galaxy-button galaxy-button-accent px-6 py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all duration-200"
              >
                🔄 再挑戦
              </button>
            </template>
            <template v-else>
              <button
                @click="restartGame"
                class="galaxy-button galaxy-button-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                🔄 もう一度
              </button>
              <button
                @click="changeLevelAndRestart"
                class="galaxy-button galaxy-button-accent px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📊 レベル変更
              </button>
            </template>
            <button
              @click="gameMode = 'selection'"
              class="galaxy-button galaxy-button-secondary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              🏠 ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TypingArena',
  setup() {
    const router = useRouter()

    // Game mode and state
    const gameMode = ref('selection') // 'selection', 'story', 'practice'
    const gameState = ref('levelSelect') // 'levelSelect', 'typing', 'results'
    const inGame = ref(false)
    const selectedLevel = ref('')
    const currentLevel = ref('')
    
    // Story mode state
    const currentChapter = ref(1)
    const isBossBattle = ref(false)
    const currentBoss = ref(null)
    const bossHP = ref(0)
    const maxBossHP = ref(0)
    const storyRewards = ref(null)
    
    // Boss special attack state
    const specialAttackActive = ref(false)
    const specialAttackType = ref('')
    const specialAttackTimer = ref(null)
    
    // Character system
    const characterName = ref('ギャラクシー・タイパー')
    const characterLevel = ref(1)
    const characterExp = ref(0)
    const nextLevelExp = ref(100)
    const characterTitle = ref('タイピング・ルーキー')
    const characterStats = ref({
      speed: 10,
      accuracy: 10,
      stamina: 10,
      vocabulary: 10,
      focus: 10,
      leadership: 0
    })
    
    // Pet system
    const petType = ref('alphabetBird') // Current pet type
    const petName = ref('アルファベット・バード')
    const petLevel = ref(1)
    const petExp = ref(0)
    const petNextLevelExp = ref(50)
    const petAffectionLevel = ref(2)
    const petAffectionPercentage = ref(40)
    const petHintCooldown = ref(0)
    const petHintChar = ref('')
    const petEvolutionStage = ref(0) // 0: Basic, 1: Evolution, 2: Rare
    
    // Typing game state
    const currentTextIndex = ref(0)
    const userInput = ref('')
    const typingInput = ref(null)
    
    // Timing
    const startTime = ref(0)
    const elapsedTime = ref(0)
    const timer = ref(null)
    
    // Stats
    const wpm = ref(0)
    const accuracy = ref(100)
    const errors = ref(0)
    const completedWords = ref(0)
    const streak = ref(0)
    const maxStreak = ref(0)
    const totalCharacters = ref(0)
    const correctCharacters = ref(0)
    
    // Display
    const showTranslation = ref(false)
    const activeKeys = ref([])
    const lastTypedChar = ref('')
    const isLastCharCorrect = ref(true)
    
    // Progress tracking
    const bestWPM = ref(45)
    const averageAccuracy = ref(87)
    const totalSessions = ref(12)
    const storyProgress = ref(25)
    const overallProgress = ref(35)
    
    // Practice modes
    const practiceType = ref('standard') // 'standard', 'weakness', 'timeAttack'
    const timeAttackDuration = ref(60) // seconds
    const timeAttackGoal = ref('words') // 'words', 'accuracy', 'speed'
    const timeAttackWordsCompleted = ref(0)
    const timeAttackStartTime = ref(0)
    
    // AI Analysis System
    const typingAnalytics = ref({
      letterErrors: {}, // Track errors by letter
      wordErrors: {}, // Track errors by word
      patternErrors: {}, // Track errors by pattern (e.g., 'th', 'ing')
      speedByLevel: {}, // Track WPM by difficulty level
      accuracyByLevel: {}, // Track accuracy by level
      commonMistakes: [], // Top 10 common mistakes
      weakPoints: {
        slowLetters: [], // Letters typed slowly
        errorPronePatterns: [], // Patterns with high error rate
        difficultWords: [] // Words frequently mistyped
      }
    })
    
    const analysisRecommendations = ref([])
    const showWeaknessAnalysis = ref(false)
    
    // Special skills system
    const focusPoints = ref(100)
    const maxFocusPoints = ref(100)
    const activeSkillEffects = ref([])
    
    const specialSkills = ref([
      {
        id: 'focusMode',
        name: '集中モード',
        icon: '🎯',
        description: '制限時間を1.5倍延長',
        cooldown: 0,
        maxCooldown: 120, // seconds
        cost: 20, // focus points
        unlocked: true
      },
      {
        id: 'perfectHint',
        name: '完璧ヒント',
        icon: '💡',
        description: '1回だけ正解表示',
        cooldown: 0,
        maxCooldown: 90,
        cost: 15,
        unlocked: false,
        unlockLevel: 10
      },
      {
        id: 'reviveChance',
        name: '復活チャンス',
        icon: '💖',
        description: 'ボス戦で1回復活',
        cooldown: 0,
        maxCooldown: 300,
        cost: 50,
        unlocked: false,
        unlockLevel: 20
      },
      {
        id: 'expBoost',
        name: '経験値ブースト',
        icon: '⭐',
        description: '獲得経験値2倍',
        cooldown: 0,
        maxCooldown: 180,
        cost: 30,
        duration: 60, // seconds
        unlocked: false,
        unlockLevel: 15
      }
    ])
    
    // Pet definitions
    const petDatabase = {
      // Basic pets
      alphabetBird: {
        id: 'alphabetBird',
        name: 'アルファベット・バード',
        icon: '🐦',
        stage: 0,
        abilities: ['hint', 'affection'],
        hintPower: 1,
        expBonus: 1.0,
        evolution: 'phoenixWriter',
        evolutionRequirement: { level: 10, affection: 80 }
      },
      grammarCat: {
        id: 'grammarCat',
        name: 'グラマー・キャット',
        icon: '🐱',
        stage: 0,
        abilities: ['grammarCheck', 'accuracy'],
        accuracyBonus: 1.1,
        expBonus: 1.0,
        evolution: 'lionMaster',
        evolutionRequirement: { level: 12, accuracy: 90 }
      },
      speedDog: {
        id: 'speedDog',
        name: 'スピード・ドッグ',
        icon: '🐕',
        stage: 0,
        abilities: ['speedBoost', 'streak'],
        speedBonus: 1.15,
        expBonus: 1.0,
        evolution: 'wisdomWolf',
        evolutionRequirement: { level: 15, wpm: 60 }
      },
      // Evolution pets
      phoenixWriter: {
        id: 'phoenixWriter',
        name: 'フェニックス・ライター',
        icon: '🦅',
        stage: 1,
        abilities: ['superHint', 'revive', 'fireTyping'],
        hintPower: 2,
        expBonus: 1.5,
        evolution: 'unicornGenius',
        evolutionRequirement: { level: 30, totalScore: 10000 }
      },
      lionMaster: {
        id: 'lionMaster',
        name: 'ライオン・マスター',
        icon: '🦁',
        stage: 1,
        abilities: ['bossSlayer', 'courage', 'roar'],
        damageBonus: 1.3,
        expBonus: 1.4,
        evolution: 'dragonEmperor',
        evolutionRequirement: { level: 35, bossesDefeated: 3 }
      },
      wisdomWolf: {
        id: 'wisdomWolf',
        name: 'ウィズダム・ウルフ',
        icon: '🐺',
        stage: 1,
        abilities: ['learningBoost', 'pack', 'hunt'],
        learningBonus: 2.0,
        expBonus: 1.6,
        evolution: 'cosmicGuardian',
        evolutionRequirement: { level: 40, chaptersCompleted: 4 }
      },
      // Rare pets
      unicornGenius: {
        id: 'unicornGenius',
        name: 'ユニコーン・ジーニアス',
        icon: '🦄',
        stage: 2,
        abilities: ['allBoost', 'magicShield', 'rainbowPower'],
        allStatsBonus: 1.5,
        expBonus: 2.0
      },
      dragonEmperor: {
        id: 'dragonEmperor',
        name: 'ドラゴン・エンペラー',
        icon: '🐉',
        stage: 2,
        abilities: ['invincible', 'dragonBreath', 'treasure'],
        invincibilityDuration: 30,
        expBonus: 2.2
      },
      cosmicGuardian: {
        id: 'cosmicGuardian',
        name: 'コスミック・ガーディアン',
        icon: '👑',
        stage: 2,
        abilities: ['ultimateTyping', 'cosmicPower', 'eternity'],
        ultimateBonus: 3.0,
        expBonus: 2.5
      }
    }
    
    // Level definitions
    const levels = {
      eiken5: {
        name: '英検5級',
        description: '中学初級レベル',
        icon: '🌱',
        wordCount: 600,
        sentenceCount: 50
      },
      eiken4: {
        name: '英検4級', 
        description: '中学中級レベル',
        icon: '🌿',
        wordCount: 1300,
        sentenceCount: 80
      },
      eiken3: {
        name: '英検3級',
        description: '中学卒業レベル',
        icon: '🌳',
        wordCount: 2100,
        sentenceCount: 120
      },
      eikenPre2: {
        name: '英検準2級',
        description: '高校中級レベル',
        icon: '🎋',
        wordCount: 3600,
        sentenceCount: 150
      },
      eiken2: {
        name: '英検2級',
        description: '高校卒業レベル',
        icon: '🌲',
        wordCount: 5100,
        sentenceCount: 200
      }
    }

    const levelDescriptions = computed(() => {
      const descriptions = {}
      Object.keys(levels).forEach(key => {
        descriptions[key] = levels[key].description
      })
      return descriptions
    })
    
    // Story chapters
    const storyChapters = ref([
      {
        id: 'earthCrisis',
        name: '地球の危機',
        unlocked: true,
        completed: false
      },
      {
        id: 'moonMystery',
        name: '月面基地の謎',
        unlocked: false,
        completed: false
      },
      {
        id: 'marsColony',
        name: '火星植民地計画',
        unlocked: false,
        completed: false
      },
      {
        id: 'timeDistortion',
        name: '時空の歪み修復',
        unlocked: false,
        completed: false
      },
      {
        id: 'galaxyPeace',
        name: '英語銀河の平和',
        unlocked: false,
        completed: false
      }
    ])

    // Boss definitions
    const bosses = {
      wordEater: {
        id: 'wordEater',
        name: 'ワードイーター',
        icon: '👾',
        chapter: 1,
        hp: 1000,
        phases: [
          { threshold: 70, name: 'Phase 1', speedMultiplier: 1.0, accuracy: 85 },
          { threshold: 30, name: 'Phase 2 - 加速', speedMultiplier: 1.3, accuracy: 90 },
          { threshold: 0, name: 'Phase 3 - 怒り', speedMultiplier: 1.5, accuracy: 95 }
        ],
        specialAttacks: [
          { name: '文字化け攻撃', type: 'scramble', chance: 0.2 },
          { name: '制限時間短縮', type: 'timeLimit', chance: 0.15 },
          { name: '暗闇', type: 'darkness', chance: 0.1 }
        ]
      },
      grammarDragon: {
        id: 'grammarDragon',
        name: 'グラマー・ドラゴン',
        icon: '🐉',
        chapter: 2,
        hp: 1500,
        phases: [
          { threshold: 70, name: 'Phase 1', speedMultiplier: 1.0, accuracy: 87 },
          { threshold: 40, name: 'Phase 2 - 文法強化', speedMultiplier: 1.2, accuracy: 92 },
          { threshold: 0, name: 'Phase 3 - 究極文法', speedMultiplier: 1.4, accuracy: 97 }
        ],
        specialAttacks: [
          { name: '文法混乱', type: 'grammarConfusion', chance: 0.25 },
          { name: '時制変換', type: 'tenseChange', chance: 0.2 },
          { name: '難易度上昇', type: 'difficultyUp', chance: 0.15 }
        ]
      },
      sentenceKing: {
        id: 'sentenceKing',
        name: 'センテンス・キング',
        icon: '👑',
        chapter: 3,
        hp: 2000,
        phases: [
          { threshold: 80, name: 'Phase 1', speedMultiplier: 1.0, accuracy: 90 },
          { threshold: 50, name: 'Phase 2 - 長文攻撃', speedMultiplier: 1.1, accuracy: 93 },
          { threshold: 20, name: 'Phase 3 - 極限長文', speedMultiplier: 1.3, accuracy: 96 }
        ],
        specialAttacks: [
          { name: '長文爆撃', type: 'longSentence', chance: 0.3 },
          { name: '単語順序入れ替え', type: 'wordShuffle', chance: 0.2 },
          { name: '同音異義語攻撃', type: 'homophone', chance: 0.15 }
        ]
      },
      tenseMaster: {
        id: 'tenseMaster',
        name: 'テンス・マスター',
        icon: '⏰',
        chapter: 4,
        hp: 2500,
        phases: [
          { threshold: 75, name: 'Phase 1 - 現在時制', speedMultiplier: 1.0, accuracy: 92 },
          { threshold: 45, name: 'Phase 2 - 過去未来混合', speedMultiplier: 1.2, accuracy: 94 },
          { threshold: 15, name: 'Phase 3 - 時制の渦', speedMultiplier: 1.4, accuracy: 98 }
        ],
        specialAttacks: [
          { name: '時制ワープ', type: 'tenseWarp', chance: 0.35 },
          { name: '完了形の嵐', type: 'perfectStorm', chance: 0.25 },
          { name: '時間逆流', type: 'timeReverse', chance: 0.2 }
        ]
      },
      languageEmperor: {
        id: 'languageEmperor',
        name: 'ランゲージ・エンペラー',
        icon: '🌟',
        chapter: 5,
        hp: 3000,
        phases: [
          { threshold: 80, name: 'Phase 1 - 統合試験', speedMultiplier: 1.0, accuracy: 95 },
          { threshold: 60, name: 'Phase 2 - 極限挑戦', speedMultiplier: 1.2, accuracy: 97 },
          { threshold: 30, name: 'Phase 3 - 最終形態', speedMultiplier: 1.5, accuracy: 99 },
          { threshold: 10, name: 'Phase 4 - 覚醒', speedMultiplier: 2.0, accuracy: 99 }
        ],
        specialAttacks: [
          { name: '全文法総攻撃', type: 'allGrammar', chance: 0.4 },
          { name: '極限スピード要求', type: 'extremeSpeed', chance: 0.3 },
          { name: '言語崩壊', type: 'languageBreak', chance: 0.25 },
          { name: '究極の試練', type: 'ultimateTest', chance: 0.2 }
        ]
      }
    }

    // Content database
    const contentDatabase = {
      eiken5: {
        words: [
          { text: 'apple', translation: 'りんご' },
          { text: 'book', translation: '本' },
          { text: 'cat', translation: '猫' },
          { text: 'dog', translation: '犬' },
          { text: 'egg', translation: '卵' },
          { text: 'fish', translation: '魚' },
          { text: 'game', translation: 'ゲーム' },
          { text: 'house', translation: '家' },
          { text: 'ice', translation: '氷' },
          { text: 'juice', translation: 'ジュース' }
        ],
        sentences: [
          { text: 'I like apples.', translation: '私はりんごが好きです。' },
          { text: 'This is a pen.', translation: 'これはペンです。' },
          { text: 'How are you?', translation: '元気ですか？' },
          { text: 'Nice to meet you.', translation: 'はじめまして。' },
          { text: 'What time is it?', translation: '今何時ですか？' },
          { text: 'I have a dog.', translation: '私は犬を飼っています。' },
          { text: 'She is my friend.', translation: '彼女は私の友達です。' },
          { text: 'Let us play games.', translation: 'ゲームをしましょう。' }
        ]
      },
      eiken4: {
        words: [
          { text: 'beautiful', translation: '美しい' },
          { text: 'important', translation: '重要な' },
          { text: 'difficult', translation: '難しい' },
          { text: 'interesting', translation: '面白い' },
          { text: 'comfortable', translation: '快適な' },
          { text: 'dangerous', translation: '危険な' },
          { text: 'expensive', translation: '高価な' },
          { text: 'necessary', translation: '必要な' }
        ],
        sentences: [
          { text: 'I went to the library yesterday.', translation: '昨日図書館に行きました。' },
          { text: 'She is studying English very hard.', translation: '彼女は英語をとても一生懸命勉強しています。' },
          { text: 'We will have a test next week.', translation: '来週テストがあります。' },
          { text: 'Could you help me with this problem?', translation: 'この問題を手伝ってもらえますか？' },
          { text: 'The weather was very nice today.', translation: '今日はとても良い天気でした。' }
        ]
      },
      eiken3: {
        words: [
          { text: 'environment', translation: '環境' },
          { text: 'technology', translation: '技術' },
          { text: 'communication', translation: 'コミュニケーション' },
          { text: 'experience', translation: '経験' },
          { text: 'opportunity', translation: '機会' },
          { text: 'responsibility', translation: '責任' },
          { text: 'achievement', translation: '達成' }
        ],
        sentences: [
          { text: 'Environmental protection is very important for our future.', translation: '環境保護は私たちの将来にとってとても重要です。' },
          { text: 'Technology has changed our daily lives significantly.', translation: '技術は私たちの日常生活を大きく変えました。' },
          { text: 'Good communication skills are essential in business.', translation: '良いコミュニケーションスキルはビジネスに不可欠です。' }
        ]
      },
      eikenPre2: {
        words: [
          { text: 'independence', translation: '独立' },
          { text: 'development', translation: '発展' },
          { text: 'consideration', translation: '考慮' },
          { text: 'sustainability', translation: '持続可能性' },
          { text: 'collaboration', translation: '協力' }
        ],
        sentences: [
          { text: 'Taking responsibility for your actions is a sign of maturity.', translation: '自分の行動に責任を持つことは成熟の印です。' },
          { text: 'Independence is something that everyone should strive for.', translation: '独立は誰もが目指すべきものです。' }
        ]
      },
      eiken2: {
        words: [
          { text: 'globalization', translation: 'グローバル化' },
          { text: 'interconnectedness', translation: '相互関連性' },
          { text: 'anthropological', translation: '人類学的な' },
          { text: 'transcendental', translation: '超越的な' }
        ],
        sentences: [
          { text: 'The sustainability of our planet depends on collective global action.', translation: '地球の持続可能性は集団的な世界的行動にかかっています。' },
          { text: 'Globalization has created unprecedented interconnectedness among nations.', translation: 'グローバル化は国家間に前例のない相互関連性を生み出しました。' }
        ]
      }
    }

    // Keyboard layout
    const keyboardLayout = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ]

    // Current content
    const currentTexts = ref([])
    const currentText = computed(() => {
      return currentTexts.value[currentTextIndex.value]?.text || ''
    })
    const currentTranslation = computed(() => {
      return currentTexts.value[currentTextIndex.value]?.translation || ''
    })
    
    // Computed properties
    const expPercentage = computed(() => {
      return Math.round((characterExp.value / nextLevelExp.value) * 100)
    })
    
    const healthPercentage = computed(() => {
      if (!currentBoss.value) return 100
      return Math.max(0, (bossHP.value / maxBossHP.value) * 100)
    })

    // Game methods
    const selectMode = (mode) => {
      gameMode.value = mode
      if (mode === 'practice') {
        gameState.value = 'levelSelect'
      }
    }
    
    const selectChapter = (chapter) => {
      if (storyChapters.value[chapter - 1]?.unlocked) {
        currentChapter.value = chapter
      }
    }
    
    const getChapterIcon = (chapter) => {
      const icons = ['🌍', '🌙', '🪐', '🌌', '👑']
      return icons[chapter - 1] || '🌟'
    }

    const selectLevel = (level) => {
      selectedLevel.value = level
      currentLevel.value = level
    }
    
    const startStoryMode = () => {
      gameState.value = 'typing'
      inGame.value = true
      
      // Initialize story content based on current chapter
      const difficulty = ['eiken5', 'eiken4', 'eiken3', 'eikenPre2', 'eiken2'][currentChapter.value - 1]
      const levelContent = contentDatabase[difficulty]
      currentTexts.value = [...levelContent.words.slice(0, 8), ...levelContent.sentences.slice(0, 4)]
        .sort(() => Math.random() - 0.5)
      
      // Boss battle appears at the end of each chapter
      const isChapterEnd = Math.random() < 0.5 // 50% chance for now, will be based on actual progress
      if (isChapterEnd) {
        initializeBossBattle()
      }
      
      initializeTypingGame()
    }

    const startTyping = () => {
      if (!selectedLevel.value) return
      
      gameState.value = 'typing'
      inGame.value = true
      
      // Mix words and sentences
      const levelContent = contentDatabase[selectedLevel.value]
      currentTexts.value = [...levelContent.words, ...levelContent.sentences]
        .sort(() => Math.random() - 0.5)
        .slice(0, 20)
      
      initializeTypingGame()
    }
    
    const initializeBossBattle = () => {
      isBossBattle.value = true
      
      // Select boss based on current chapter
      const bossKeys = ['wordEater', 'grammarDragon', 'sentenceKing', 'tenseMaster', 'languageEmperor']
      const bossKey = bossKeys[currentChapter.value - 1] || 'wordEater'
      const bossData = bosses[bossKey]
      
      currentBoss.value = {
        ...bossData,
        currentPhase: 0,
        isSpecialAttackActive: false,
        specialAttackType: null
      }
      
      maxBossHP.value = bossData.hp
      bossHP.value = maxBossHP.value
    }
    
    const getCurrentPhase = () => {
      if (!currentBoss.value || !currentBoss.value.phases) return ''
      const percentage = healthPercentage.value
      
      for (let i = 0; i < currentBoss.value.phases.length; i++) {
        const phase = currentBoss.value.phases[i]
        if (percentage > phase.threshold) {
          currentBoss.value.currentPhase = i
          return phase.name
        }
      }
      
      currentBoss.value.currentPhase = currentBoss.value.phases.length - 1
      return currentBoss.value.phases[currentBoss.value.phases.length - 1].name
    }
    
    const getHealthColor = () => {
      const percentage = healthPercentage.value
      if (percentage > 70) return '#10b981' // green
      if (percentage > 50) return '#84cc16' // lime
      if (percentage > 30) return '#f59e0b' // yellow
      if (percentage > 15) return '#f97316' // orange
      return '#ef4444' // red
    }

    const initializeTypingGame = () => {
      currentTextIndex.value = 0
      userInput.value = ''
      startTime.value = Date.now()
      elapsedTime.value = 0
      
      // Reset stats
      wpm.value = 0
      accuracy.value = 100
      errors.value = 0
      completedWords.value = 0
      streak.value = 0
      maxStreak.value = 0
      totalCharacters.value = 0
      correctCharacters.value = 0
      showTranslation.value = false
      
      // Start timer
      timer.value = setInterval(() => {
        elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
        updateWPM()
      }, 1000)
      
      // Focus input
      nextTick(() => {
        if (typingInput.value) {
          typingInput.value.focus()
        }
      })
    }

    const handleTyping = () => {
      const input = userInput.value
      const target = currentText.value
      
      if (input.length > target.length) {
        userInput.value = input.slice(0, target.length)
        return
      }
      
      // Check current character
      const currentIndex = input.length - 1
      if (currentIndex >= 0) {
        const currentChar = input[currentIndex]
        const targetChar = target[currentIndex]
        
        lastTypedChar.value = currentChar.toLowerCase()
        isLastCharCorrect.value = currentChar === targetChar
        
        if (currentChar === targetChar) {
          correctCharacters.value++
          streak.value++
          maxStreak.value = Math.max(maxStreak.value, streak.value)
        } else {
          errors.value++
          streak.value = 0
        }
        
        totalCharacters.value++
        updateAccuracy()
      }
      
      // Check completion
      if (input === target) {
        completeCurrentText()
      }
    }

    const completeCurrentText = () => {
      completedWords.value++
      showTranslation.value = true
      
      // Deal damage to boss if in boss battle
      if (isBossBattle.value && currentBoss.value) {
        const damage = calculateDamage()
        bossHP.value = Math.max(0, bossHP.value - damage)
        
        if (bossHP.value <= 0) {
          defeatBoss()
          return
        }
      }
      
      // Show translation for 2 seconds
      setTimeout(() => {
        showTranslation.value = false
        currentTextIndex.value++
        
        if (currentTextIndex.value >= currentTexts.value.length) {
          finishGame()
        } else {
          userInput.value = ''
          petHintChar.value = ''
          
          // Focus input for next text
          nextTick(() => {
            if (typingInput.value) {
              typingInput.value.focus()
            }
          })
        }
      }, 2000)
    }
    
    const calculateDamage = () => {
      let damage = 50 // Base damage
      damage += characterStats.value.speed * 2
      damage += characterStats.value.vocabulary * 1.5
      
      if (accuracy.value >= 95) damage *= 1.5
      else if (accuracy.value >= 90) damage *= 1.2
      
      damage += streak.value * 5
      
      return Math.round(damage)
    }
    
    const defeatBoss = () => {
      clearInterval(timer.value)
      
      // Award rewards
      const exp = calculateExperience()
      characterExp.value += exp
      
      // Check for level up
      while (characterExp.value >= nextLevelExp.value) {
        levelUp()
      }
      
      storyRewards.value = {
        experience: exp,
        petExperience: Math.floor(exp * 0.5),
        title: 'ボスハンター'
      }
      
      gameState.value = 'results'
    }
    
    const levelUp = () => {
      characterLevel.value++
      characterExp.value -= nextLevelExp.value
      nextLevelExp.value = Math.floor(nextLevelExp.value * 1.2)
      
      // Increase stats
      characterStats.value.speed += 2
      characterStats.value.accuracy += 1.5
      characterStats.value.vocabulary += 2
      
      // Update title
      if (characterLevel.value >= 20) characterTitle.value = 'タイピング・エキスパート'
      else if (characterLevel.value >= 10) characterTitle.value = 'タイピング・アドバンス'
      else if (characterLevel.value >= 5) characterTitle.value = 'タイピング・アマチュア'
    }
    
    const calculateExperience = () => {
      let exp = 50
      exp += Math.floor(wpm.value * 0.5)
      
      if (accuracy.value >= 95) exp += 50
      else if (accuracy.value >= 90) exp += 30
      else if (accuracy.value >= 85) exp += 20
      
      exp += Math.floor(maxStreak.value * 0.2)
      
      return Math.floor(exp)
    }

    const handleKeydown = (event) => {
      const key = event.key.toLowerCase()
      if (!activeKeys.value.includes(key)) {
        activeKeys.value.push(key)
      }
      
      setTimeout(() => {
        const index = activeKeys.value.indexOf(key)
        if (index > -1) {
          activeKeys.value.splice(index, 1)
        }
      }, 150)
    }

    const virtualKeyPress = (key) => {
      userInput.value += key.toLowerCase()
      handleTyping()
    }

    const updateWPM = () => {
      const minutes = elapsedTime.value / 60
      if (minutes > 0) {
        const wordsTyped = correctCharacters.value / 5
        wpm.value = Math.round(wordsTyped / minutes)
      }
    }

    const updateAccuracy = () => {
      if (totalCharacters.value > 0) {
        accuracy.value = Math.round((correctCharacters.value / totalCharacters.value) * 100)
      }
    }

    const finishGame = () => {
      clearInterval(timer.value)
      
      if (gameMode.value === 'story') {
        const exp = calculateExperience()
        characterExp.value += exp
        
        while (characterExp.value >= nextLevelExp.value) {
          levelUp()
        }
        
        storyRewards.value = {
          experience: exp,
          petExperience: Math.floor(exp * 0.5)
        }
      }
      
      gameState.value = 'results'
    }
    
    // Pet functions
    const interactWithPet = () => {
      petAffectionLevel.value = Math.min(5, petAffectionLevel.value + 0.1)
      petAffectionPercentage.value = Math.min(100, petAffectionPercentage.value + 2)
    }
    
    const usePetHint = () => {
      if (petHintCooldown.value > 0) return
      
      const nextChar = currentText.value[userInput.value.length]
      if (nextChar) {
        petHintChar.value = nextChar.toLowerCase()
        petHintCooldown.value = 30
        
        const cooldownTimer = setInterval(() => {
          petHintCooldown.value--
          if (petHintCooldown.value <= 0) {
            clearInterval(cooldownTimer)
            petHintChar.value = ''
          }
        }, 1000)
      }
    }
    
    const getPetStatus = () => {
      if (accuracy.value > 95) return '大興奮！'
      if (accuracy.value > 85) return '機嫌よし'
      if (accuracy.value > 70) return '普通'
      return '心配中...'
    }
    
    // Pet functions
    const getCurrentPetData = () => {
      return petDatabase[petType.value] || petDatabase.alphabetBird
    }
    
    const getCurrentPetIcon = () => {
      return getCurrentPetData().icon
    }
    
    const getPetBackgroundClass = () => {
      const stage = petEvolutionStage.value
      if (stage === 2) return 'bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400'
      if (stage === 1) return 'bg-gradient-to-br from-blue-500 to-purple-500'
      return 'bg-gradient-to-br from-green-500 to-blue-500'
    }
    
    const petExpPercentage = computed(() => {
      return Math.round((petExp.value / petNextLevelExp.value) * 100)
    })
    
    const canEvolve = () => {
      const currentPet = getCurrentPetData()
      if (!currentPet.evolution) return false
      
      const req = currentPet.evolutionRequirement
      if (!req) return false
      
      // Check level requirement
      if (req.level && petLevel.value < req.level) return false
      
      // Check affection requirement
      if (req.affection && petAffectionPercentage.value < req.affection) return false
      
      // Check other requirements
      if (req.accuracy && accuracy.value < req.accuracy) return false
      if (req.wpm && wpm.value < req.wpm) return false
      
      return true
    }
    
    // Special skills functions
    const canUseSkill = (skill) => {
      if (!skill.unlocked) return false
      if (skill.cooldown > 0) return false
      if (focusPoints.value < skill.cost) return false
      return true
    }
    
    const getSkillTooltip = (skill) => {
      if (!skill.unlocked) {
        return `Lv.${skill.unlockLevel}でアンロック`
      }
      if (skill.cooldown > 0) {
        return `クールダウン中: ${skill.cooldown}秒`
      }
      if (focusPoints.value < skill.cost) {
        return `集中力不足 (必要: ${skill.cost})`
      }
      return skill.description
    }
    
    const useSpecialSkill = (skill) => {
      if (!canUseSkill(skill)) return
      
      // Consume focus points
      focusPoints.value -= skill.cost
      
      // Apply skill effect
      switch (skill.id) {
        case 'focusMode':
          // Extend time limit
          if (timer.value) {
            elapsedTime.value = Math.max(0, elapsedTime.value - 30) // Remove 30 seconds
          }
          break
          
        case 'perfectHint':
          // Show the entire correct answer
          userInput.value = currentText.value
          handleTyping()
          break
          
        case 'reviveChance':
          // Store revive state
          activeSkillEffects.value.push({
            type: 'revive',
            remaining: 1
          })
          break
          
        case 'expBoost':
          // Activate exp boost
          activeSkillEffects.value.push({
            type: 'expBoost',
            multiplier: 2,
            duration: skill.duration,
            endTime: Date.now() + skill.duration * 1000
          })
          break
      }
      
      // Start cooldown
      skill.cooldown = skill.maxCooldown
      const cooldownInterval = setInterval(() => {
        skill.cooldown--
        if (skill.cooldown <= 0) {
          clearInterval(cooldownInterval)
        }
      }, 1000)
    }
    
    const getTimeAttackRank = () => {
      const wordsPerMinute = timeAttackWordsCompleted.value / (timeAttackDuration.value / 60)
      if (wordsPerMinute >= 40 && accuracy.value >= 95) return '🏆 タイピングマスター!'
      if (wordsPerMinute >= 30 && accuracy.value >= 90) return '🥇 エキスパート!'
      if (wordsPerMinute >= 20 && accuracy.value >= 85) return '🥈 上級者!'
      if (wordsPerMinute >= 15) return '🎯 中級者'
      return '🌱 初級者'
    }

    // Results calculations
    const finalWpm = computed(() => wpm.value)
    const finalAccuracy = computed(() => accuracy.value)
    const totalTime = computed(() => {
      const minutes = Math.floor(elapsedTime.value / 60)
      const seconds = elapsedTime.value % 60
      return `${minutes}:${String(seconds).padStart(2, '0')}`
    })

    const calculateScore = () => {
      return Math.round(wpm.value * (accuracy.value / 100) * 10)
    }
    
    const getResultIcon = () => {
      const score = calculateScore()
      if (score >= 800) return '🏆'
      if (score >= 600) return '🥈'
      if (score >= 400) return '🥉'
      if (score >= 200) return '🎯'
      return '📝'
    }

    const getRankingMessage = () => {
      const score = calculateScore()
      if (score >= 800) return 'タイピングマスター！'
      if (score >= 600) return '上級者レベル！'
      if (score >= 400) return '中級者レベル！'
      if (score >= 200) return '初級者レベル'
      return '練習を続けましょう！'
    }

    const restartGame = () => {
      gameState.value = 'levelSelect'
      selectedLevel.value = ''
      inGame.value = false
      isBossBattle.value = false
      currentBoss.value = null
      storyRewards.value = null
    }

    const changeLevelAndRestart = () => {
      gameMode.value = 'practice'
      restartGame()
    }
    
    const continueStory = () => {
      // Progress to next chapter if possible
      if (currentChapter.value < 5) {
        storyChapters.value[currentChapter.value].unlocked = true
        currentChapter.value++
      }
      
      gameState.value = 'levelSelect'
      inGame.value = false
      isBossBattle.value = false
      currentBoss.value = null
      storyRewards.value = null
    }

    const handleBack = () => {
      if (timer.value) {
        clearInterval(timer.value)
      }
      router.back()
    }

    // Lifecycle
    onUnmounted(() => {
      if (timer.value) {
        clearInterval(timer.value)
      }
    })

    return {
      // State
      gameMode,
      gameState,
      inGame,
      selectedLevel,
      currentLevel,
      currentChapter,
      isBossBattle,
      currentBoss,
      bossHP,
      maxBossHP,
      storyRewards,
      currentTextIndex,
      userInput,
      typingInput,
      elapsedTime,
      wpm,
      accuracy,
      errors,
      completedWords,
      streak,
      showTranslation,
      activeKeys,
      lastTypedChar,
      isLastCharCorrect,
      petHintChar,
      specialAttackActive,
      specialAttackType,
      
      // Character & Pet
      characterName,
      characterLevel,
      characterExp,
      nextLevelExp,
      characterTitle,
      characterStats,
      petType,
      petName,
      petLevel,
      petExp,
      petAffectionLevel,
      petAffectionPercentage,
      petHintCooldown,
      petExpPercentage,
      petEvolutionStage,
      
      // Progress
      bestWPM,
      averageAccuracy,
      totalSessions,
      storyProgress,
      overallProgress,
      
      // Practice mode
      practiceType,
      timeAttackDuration,
      timeAttackGoal,
      timeAttackWordsCompleted,
      typingAnalytics,
      analysisRecommendations,
      showWeaknessAnalysis,
      
      // Special skills
      specialSkills,
      focusPoints,
      maxFocusPoints,
      activeSkillEffects,
      
      // Data
      levels,
      levelDescriptions,
      storyChapters,
      keyboardLayout,
      currentTexts,
      currentText,
      currentTranslation,
      petDatabase,
      
      // Computed
      expPercentage,
      healthPercentage,
      finalWpm,
      finalAccuracy,
      totalTime,
      
      // Methods
      selectMode,
      selectChapter,
      getChapterIcon,
      selectLevel,
      startStoryMode,
      startTyping,
      getCurrentPhase,
      getHealthColor,
      handleTyping,
      handleKeydown,
      virtualKeyPress,
      calculateScore,
      getRankingMessage,
      getResultIcon,
      restartGame,
      changeLevelAndRestart,
      continueStory,
      handleBack,
      interactWithPet,
      usePetHint,
      getPetStatus,
      getCurrentPetIcon,
      getPetBackgroundClass,
      canEvolve,
      canUseSkill,
      getSkillTooltip,
      useSpecialSkill,
      getTimeAttackRank
    }
  }
}
</script>

<style scoped>
/* Galaxy theme styles */
.galaxy-background {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.stars-layer-1 {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 8s linear infinite;
}

.stars-layer-2 {
  background-image: radial-gradient(1px 1px at 30px 20px, rgba(255,255,255,0.4), transparent);
  background-repeat: repeat;
  background-size: 300px 150px;
  animation: sparkle 12s linear infinite reverse;
}

.stars-layer-3 {
  background-image: radial-gradient(1px 1px at 10px 60px, rgba(255,255,255,0.2), transparent);
  background-repeat: repeat;
  background-size: 400px 200px;
  animation: sparkle 16s linear infinite;
}

@keyframes sparkle {
  from { transform: translateX(0); }
  to { transform: translateX(-200px); }
}

/* Mode selection cards */
.mode-card {
  background: linear-gradient(135deg, 
    rgba(60, 60, 100, 0.3) 0%, 
    rgba(70, 70, 120, 0.3) 100%
  );
  backdrop-filter: blur(10px);
  border: 2px solid rgba(147, 51, 234, 0.3);
  transition: all 0.3s ease;
}

.story-mode-card:hover {
  background: linear-gradient(135deg, 
    rgba(80, 60, 140, 0.4) 0%, 
    rgba(100, 70, 160, 0.4) 100%
  );
  border-color: rgba(147, 51, 234, 0.6);
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.3);
}

.practice-mode-card:hover {
  background: linear-gradient(135deg, 
    rgba(60, 80, 140, 0.4) 0%, 
    rgba(70, 100, 160, 0.4) 100%
  );
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.mode-icon {
  text-align: center;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
}

/* Progress indicators */
.progress-bar-bg {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500;
}

.overall-progress-bar {
  @apply w-full h-4 bg-gray-800 rounded-full overflow-hidden relative;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

/* Stats display */
.stat-item {
  @apply flex justify-between items-center p-2 rounded bg-black/20;
}

.stat-label {
  @apply text-sm text-slate-400;
}

.stat-value {
  @apply text-lg font-bold text-white;
}

/* Chapter map */
.chapters-container {
  @apply max-w-4xl mx-auto;
}

.chapter-map {
  @apply flex flex-wrap justify-center gap-4;
}

.chapter-node {
  @apply relative w-40 h-40 rounded-full cursor-pointer transition-all duration-300;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.9), rgba(30, 30, 60, 0.9));
  border: 3px solid rgba(147, 51, 234, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.chapter-node.unlocked {
  @apply hover:scale-110;
  border-color: rgba(147, 51, 234, 0.8);
}

.chapter-node.completed {
  background: linear-gradient(135deg, rgba(16, 80, 40, 0.9), rgba(24, 100, 60, 0.9));
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 
    0 4px 15px rgba(34, 197, 94, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.chapter-node.current {
  @apply animate-pulse;
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.6);
}

.chapter-icon {
  @apply text-4xl mb-2;
}

.chapter-info {
  @apply text-center;
}

.chapter-info h3 {
  @apply text-white font-bold;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    1px 1px 2px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(0, 0, 0, 0.5);
}

.chapter-info p {
  @apply text-slate-200 font-semibold;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.9),
    1px 1px 2px rgba(0, 0, 0, 0.7),
    0 0 6px rgba(0, 0, 0, 0.6);
}

.lock-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black/50 rounded-full;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(30, 30, 60, 0.95) 0%, 
    rgba(40, 40, 80, 0.95) 50%, 
    rgba(20, 20, 50, 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(147, 51, 234, 0.3);
}

/* Updated level-card styles moved to above section */

/* 3D Typing Display */
.text-display-3d {
  background: linear-gradient(145deg, #1a1a2e, #0f0f23);
  border: 2px solid rgba(147, 51, 234, 0.5);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: perspective(1000px) rotateX(5deg);
}

.char-display {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 3D Virtual Keyboard */
.keyboard-3d {
  background: linear-gradient(145deg, #2a2a4e, #1a1a3e);
  border: 2px solid rgba(147, 51, 234, 0.3);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: perspective(1000px) rotateX(10deg);
}

.keyboard-key {
  min-width: 40px;
  height: 40px;
  background: linear-gradient(145deg, #4a4a6e, #3a3a5e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.keyboard-key:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.keyboard-key.key-active {
  transform: translateY(1px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, #5a5a7e, #4a4a6e);
}

.keyboard-key.key-correct {
  background: linear-gradient(145deg, #10b981, #059669);
  border-color: rgba(16, 185, 129, 0.5);
}

.keyboard-key.key-incorrect {
  background: linear-gradient(145deg, #ef4444, #dc2626);
  border-color: rgba(239, 68, 68, 0.5);
}

.keyboard-key.key-hint {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  border-color: rgba(59, 130, 246, 0.8);
  animation: pulse-hint 1s ease-in-out infinite;
}

@keyframes pulse-hint {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Stats Cards */
.stat-card {
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.6), rgba(30, 30, 60, 0.6));
  border: 1px solid rgba(147, 51, 234, 0.3);
  backdrop-filter: blur(10px);
}

/* Translation Display */
.translation-display {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Level selection enhancements */
.level-selected {
  box-shadow: 
    0 0 30px rgba(251, 191, 36, 0.5),
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.level-unselected:hover {
  box-shadow: 
    0 4px 20px rgba(147, 51, 234, 0.3),
    0 4px 15px rgba(0, 0, 0, 0.2);
}

.selection-indicator {
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
}

.text-shadow-glow {
  text-shadow: 
    0 0 10px rgba(251, 191, 36, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.9);
}

.shadow-glow {
  box-shadow: 
    0 0 25px rgba(251, 191, 36, 0.6),
    inset 0 0 25px rgba(251, 191, 36, 0.1);
}

/* Improved level card styling */
.level-card {
  backdrop-filter: blur(10px);
  position: relative;
  transform-origin: center;
}

.level-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.level-selected::before {
  opacity: 1;
  background: linear-gradient(45deg, rgba(251, 191, 36, 0.5), rgba(249, 115, 22, 0.5), rgba(251, 191, 36, 0.5));
}

/* Galaxy themed buttons */
.galaxy-button {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
}

.galaxy-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.6);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(55, 65, 81, 0.4);
}

.galaxy-button-accent {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.galaxy-text-primary {
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.5);
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.cosmic-glow {
  text-shadow: 0 0 20px rgba(147, 51, 234, 0.8);
}

.galaxy-nova-orange {
  color: #f59e0b;
}

.galaxy-cosmic-purple {
  color: #7c3aed;
}

/* Text shadows for readability */
.text-shadow-lg {
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.9),
    1px 1px 2px rgba(0, 0, 0, 0.8),
    0 0 8px rgba(0, 0, 0, 0.6);
}

.text-shadow-md {
  text-shadow: 
    1px 1px 3px rgba(0, 0, 0, 0.8),
    0 0 6px rgba(0, 0, 0, 0.5);
}

/* Pet evolution effects */
.evolution-sparkle {
  background: radial-gradient(circle at 30% 30%, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(255, 255, 255, 0) 70%);
  animation: sparkle-rotate 3s linear infinite;
}

@keyframes sparkle-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pet-container {
  display: inline-block;
}

.evolution-indicator {
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
}

/* Responsive design */
@media (max-width: 768px) {
  .text-display-3d {
    transform: perspective(800px) rotateX(3deg);
  }
  
  .keyboard-3d {
    transform: perspective(800px) rotateX(5deg);
  }
  
  .keyboard-key {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .chapter-map {
    @apply grid grid-cols-2 gap-3;
  }
  
  .chapter-node {
    @apply w-32 h-32;
  }
}
</style>