<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    <!-- ヘッダー -->
    <header class="relative z-10 p-6">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="galaxy-button galaxy-button-secondary flex items-center space-x-2">
            <ChevronLeftIcon class="h-6 w-6 cosmic-glow" />
            <span>戻る</span>
          </button>
          <h1 class="text-3xl font-bold galaxy-text-primary cosmic-title">🌌 グラマー・ギャラクシー司令部</h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="galaxy-stats-card">
            <StarIcon class="h-5 w-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold">{{ playerData.totalStars }}</span>
          </div>
          <div class="galaxy-stats-card">
            <span class="text-sm">レベル {{ playerData.level }}</span>
          </div>
          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>

    <!-- 宇宙マップ -->
    <main class="galaxy-map" ref="galaxyMap">
      <!-- 背景の星とパーティクル -->
      <div class="stars-background">
        <div 
          v-for="star in backgroundStars" 
          :key="star.id"
          class="background-star"
          :style="{ 
            left: star.x + '%', 
            top: star.y + '%',
            animationDelay: star.delay + 's',
            animationDuration: star.duration + 's'
          }"
        ></div>
      </div>

      <!-- Rush Zone セクション -->
      <div class="relative z-10 max-w-6xl mx-auto mb-16">
        <div class="galaxy-card p-8 mb-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold galaxy-text-primary cosmic-title mb-2">⚡ ラッシュ・ゾーン - 高速文法訓練基地</h2>
            <p class="text-galaxy-moon-silver text-lg">文法エネルギーの集中的な充電・強化・瞬発力向上の特別訓練エリア</p>
          </div>

          <!-- Rush Games Grid -->
          <div class="rush-games-grid">
            <!-- Be Verb Rush -->
            <div 
              class="galaxy-card"
              :class="{ 
                'unlocked': beVerbRushData.unlocked,
                'completed': beVerbRushData.mastery >= 90 
              }"
              @click="startBeVerbRush"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🏃‍♂️</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">Be動詞ラッシュ</h3>
                <div v-if="beVerbRushData.unlocked" class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">{{ beVerbRushData.mastery }}%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">{{ beVerbRushData.todaySessions }}/5</span>
                  </div>
                  <div class="best-score">
                    <span class="score-label">ベスト:</span>
                    <span class="score-value">{{ beVerbRushData.bestScore }}</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startBeVerbRush"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
                <div v-else class="rush-locked">
                  <span>🔒 要解禁</span>
                </div>
              </div>
            </div>

            <!-- Verb Rush -->
            <div 
              class="galaxy-card"
              :class="{ 
                'unlocked': verbRushData.unlocked,
                'completed': verbRushData.mastery >= 90 
              }"
              @click="startVerbRush"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">⚡</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">動詞ラッシュ</h3>
                <div v-if="verbRushData.unlocked" class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">{{ verbRushData.mastery }}%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">{{ verbRushData.todaySessions }}/5</span>
                  </div>
                  <div class="best-score">
                    <span class="score-label">ベスト:</span>
                    <span class="score-value">{{ verbRushData.bestScore }}</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startVerbRush"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
                <div v-else class="rush-locked">
                  <span>🔒 要解禁</span>
                </div>
              </div>
            </div>

            <!-- Comparison Master Game -->
            <div 
              class="galaxy-card unlocked"
              @click="startComparisonMaster"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">📊</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">比較級マスター</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">0%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">0/5</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startComparisonMaster"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
              </div>
            </div>

            <!-- Modal Verb Challenge Game -->
            <div 
              class="galaxy-card unlocked"
              @click="startModalVerbChallenge"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🛡️</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">助動詞チャレンジ</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">0%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">0/5</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startModalVerbChallenge"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
              </div>
            </div>

            <!-- Conjunction Connection Game -->
            <div 
              class="galaxy-card unlocked"
              @click="startConjunctionConnection"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🔗</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">接続詞コネクト</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">0%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">0/5</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startConjunctionConnection"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
              </div>
            </div>

            <!-- Progressive Tense Game -->
            <div 
              class="galaxy-card unlocked"
              @click="startProgressiveTense"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🌊</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">進行形マスター</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">0%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">0/5</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startProgressiveTense"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
              </div>
            </div>

            <!-- Verb Pattern Galaxy Game -->
            <div
              class="galaxy-card unlocked"
              @click="startVerbPatternGalaxy"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🌌</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">動詞パターン銀河</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">0%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">0/5</span>
                  </div>
                  <button
                    class="rush-play-button"
                    @click.stop="startVerbPatternGalaxy"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
              </div>
            </div>

            <!-- Preposition Master: Space Journey -->
            <div 
              class="galaxy-card unlocked preposition-master-card"
              @click="startPrepositionMaster"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🚀</div>
                <div class="lightning-effect"></div>
                <div class="space-particles"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">前置詞マスター：宇宙の旅</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">{{ prepositionMasteryPercentage }}%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">解放惑星:</span>
                    <span class="progress-value">{{ prepositionUnlockedPlanets }}/5</span>
                  </div>
                  <div class="planet-preview">
                    <div class="planet-icons">
                      <span class="planet-icon" :class="{ completed: isPlanetCompleted('place') }">🌍</span>
                      <span class="planet-icon" :class="{ completed: isPlanetCompleted('time') }">🕐</span>
                      <span class="planet-icon" :class="{ completed: isPlanetCompleted('date') }">📅</span>
                      <span class="planet-icon" :class="{ completed: isPlanetCompleted('method') }">🔧</span>
                      <span class="planet-icon" :class="{ completed: isPlanetCompleted('relation') }">🤝</span>
                    </div>
                  </div>
                  <button 
                    class="rush-play-button preposition-play"
                    @click.stop="startPrepositionMaster"
                  >
                    <span class="cosmic-glow">🌌</span> 宇宙へ出発
                  </button>
                </div>
              </div>
            </div>

            <!-- Space Word Order Quest -->
            <div 
              class="galaxy-card unlocked"
              @click="startSpaceWordOrderQuest"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🌌</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">語順クエスト</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">0%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">0/5</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startSpaceWordOrderQuest"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
              </div>
            </div>

            <!-- Holographic Story Deck -->
            <div
              class="galaxy-card unlocked"
              @click="startHolographicStoryDeck"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🎥</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">ホロデッキ代名詞</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">{{ holographicData.accuracy }}%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">進捗:</span>
                    <span class="progress-value">{{ holographicData.completedScenarios }}/{{ holographicData.totalScenarios }}</span>
                  </div>
                  <button
                    class="rush-play-button"
                    @click.stop="startHolographicStoryDeck"
                  >
                    <span class="cosmic-glow">🎬</span> 体験開始
                  </button>
                </div>
              </div>
            </div>


            <!-- Word Rush -->
            <div class="galaxy-card locked">
              <div class="rush-game-surface">
                <div class="rush-game-icon opacity-50">🏃‍♂️</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">単語ラッシュ</h3>
                <div class="rush-locked">
                  <span>🔒 基本Rush完了で解禁</span>
                  <div class="unlock-condition">Be動詞・動詞ラッシュ完了後</div>
                </div>
              </div>
            </div>

            <!-- Grammar Art Gallery -->
            <div
              class="galaxy-card unlocked art-gallery-card"
              @click="startGrammarArtGallery"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🏛️</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">Grammar Art Gallery</h3>
                <div class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">レベル:</span>
                    <span class="mastery-value">Lv.{{ artGalleryData.level }}</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">発見:</span>
                    <span class="progress-value">{{ artGalleryData.artifacts }}/{{ artGalleryData.totalArtifacts }}</span>
                  </div>
                  <div class="best-score">
                    <span class="score-label">レベル:</span>
                    <span class="score-value">{{ artGalleryData.level }}</span>
                  </div>
                  <button
                    class="rush-play-button art-gallery-button"
                    @click.stop="startGrammarArtGallery"
                  >
                    <span class="cosmic-glow">🔍</span> 探索開始
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>

        <!-- Rush Zone 統計 -->
        <div class="rush-zone-stats">
          <h4 class="stats-title">📊 今日のラッシュ活動</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ dailyRushSessions }}</div>
              <div class="stat-label">セッション</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ averageAccuracy }}%</div>
              <div class="stat-label">平均正答率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalRushTime }}分</div>
              <div class="stat-label">練習時間</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🆕 直接ゲーム選択セクション -->
      <div class="direct-games-section">
        <div class="galaxy-card p-8 mb-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold galaxy-text-primary cosmic-title mb-2">🎮 文法ゲーム宇宙ステーション</h2>
            <p class="text-galaxy-moon-silver text-lg">お気に入りのゲームを直接選んで、楽しく英文法をマスターしよう！</p>
          </div>

          <!-- Grammar Galaxy Foundation Games -->
          <div class="featured-games mb-12">
            <h3 class="text-xl font-bold galaxy-text-primary cosmic-title mb-6 text-center">🌌 Grammar Galaxy Foundation - 文法宇宙の基礎</h3>
            <p class="text-center text-gray-300 mb-8">英語文法の基本構造を学ぶ核となるゲーム群</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Galaxy Grammar Station -->
              <div class="game-card featured" @click="startDirectGame('grammarColorCode')">
                <div class="game-icon-large">🛸</div>
                <h4 class="game-title">銀河文法ステーション</h4>
                <p class="game-description">色分けモジュールで宇宙ステーション建設</p>
                <div class="difficulty-badge beginner">基礎 - 文構造</div>
                <button class="play-button-large">
                  <span class="play-icon">▶️</span>
                  ステーション建設開始！
                </button>
              </div>

              <!-- Verb Time Machine -->
              <div class="game-card featured" @click="startDirectGame('verbTimeMachine')">
                <div class="game-icon-large">🕐</div>
                <h4 class="game-title">動詞タイムマシン</h4>
                <p class="game-description">時代を旅して動詞の活用をマスター</p>
                <div class="difficulty-badge intermediate">基礎 - 時制学習</div>
                <button class="play-button-large">
                  <span class="play-icon">▶️</span>
                  時間旅行を開始！
                </button>
              </div>

              <!-- Galactic Question Navigator -->
              <div class="game-card featured" @click="startDirectGame('galacticQuestionNavigator')">
                <div class="game-icon-large">🚀</div>
                <h4 class="game-title">疑問詞ナビゲーター</h4>
                <p class="game-description">宇宙ナビゲーターとして疑問詞の使い分けを学習</p>
                <div class="difficulty-badge intermediate">基礎 - 疑問詞</div>
                <button class="play-button-large">
                  <span class="play-icon">▶️</span>
                  ナビゲーション開始！
                </button>
              </div>

            </div>
          </div>

          <!-- 応用文法ゲーム -->
          <div class="other-games mb-12">
            <h3 class="text-xl font-bold galaxy-text-primary cosmic-title mb-6 text-center">🚀 応用文法ゲーム</h3>
            <p class="text-center text-gray-300 mb-8">基礎を身につけた後の実践的な文法ゲーム</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Space Word Order Quest -->
              <div class="game-card" @click="startDirectGame('spaceWordOrderQuest')">
                <div class="game-icon-large">🌌</div>
                <h4 class="game-title">語順クエスト・アドベンチャー</h4>
                <p class="game-description">宇宙語順並び替えアドベンチャー</p>
                <div class="difficulty-badge intermediate">応用 - 英検4級</div>
                <button class="play-button-large">
                  <span class="play-icon">▶️</span>
                  クエスト開始！
                </button>
              </div>

              <!-- Pattern Hunter -->
              <div class="game-card" @click="startDirectGame('patternHunter')">
                <div class="game-icon-large">🕵️‍♂️</div>
                <h4 class="game-title">文法パターン探偵</h4>
                <p class="game-description">文法パターンを探し出すミステリー</p>
                <div class="difficulty-badge intermediate">応用 - 英検4級</div>
                <button class="play-button-large">
                  <span class="play-icon">▶️</span>
                  捜査開始！
                </button>
              </div>

              <!-- Grammar Puzzle Cascade -->
              <div class="game-card" @click="startDirectGame('grammarPuzzleCascade')">
                <div class="game-icon-large">🧩</div>
                <h4 class="game-title">文法パズル・カスケード</h4>
                <p class="game-description">落ちてくるブロックで文法パターン</p>
                <div class="difficulty-badge advanced">応用 - 英検3級</div>
                <button class="play-button-large">
                  <span class="play-icon">▶️</span>
                  パズル開始！
                </button>
              </div>
            </div>
          </div>

          <!-- 専門文法ゲーム -->
          <div class="all-games">
            <h3 class="text-xl font-bold galaxy-text-primary cosmic-title mb-6 text-center">⚡ 専門文法トレーニング</h3>
            <p class="text-center text-gray-300 mb-8">特定の文法項目を集中的に鍛える専門ゲーム</p>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div class="mini-game-card" @click="startDirectGame('grammarReflexArena')">
                <div class="mini-icon">⚔️</div>
                <div class="mini-title">文法反射アリーナ</div>
              </div>
              
              <div class="mini-game-card" @click="startDirectGame('comparisonMaster')">
                <div class="mini-icon">📊</div>
                <div class="mini-title">比較級マスター</div>
              </div>
              
              <div class="mini-game-card" @click="startDirectGame('modalVerbChallenge')">
                <div class="mini-icon">🛡️</div>
                <div class="mini-title">助動詞チャレンジ</div>
              </div>
              
              <div class="mini-game-card" @click="startDirectGame('conjunctionConnection')">
                <div class="mini-icon">🔗</div>
                <div class="mini-title">接続詞コネクト</div>
              </div>
              
              <div class="mini-game-card" @click="startDirectGame('progressiveTense')">
                <div class="mini-icon">🌊</div>
                <div class="mini-title">進行形マスター</div>
              </div>
              
              <div class="mini-game-card" @click="goToRushZone()">
                <div class="mini-icon">⚡</div>
                <div class="mini-title">ラッシュゾーン</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔽 学習レベル別惑星（オプション表示） -->
      <div class="learning-path-toggle text-center">
        <button @click="showAdvancedPath = !showAdvancedPath" class="galaxy-button galaxy-button-secondary mb-6">
          <span v-if="!showAdvancedPath">🌌 詳細な学習パス表示（上級者向け）</span>
          <span v-else">📱 シンプル表示に戻る</span>
        </button>
        <p v-if="!showAdvancedPath" class="text-galaxy-moon-silver text-sm mb-6">
          ※ 上のゲーム一覧から直接選択することをお勧めします
        </p>
      </div>

      <!-- メイン学習パス（折りたたみ可能） -->
      <div v-show="showAdvancedPath" class="learning-path">
        <!-- Level 1: Grammar Foundation Solar System -->
        <div class="solar-system level-1" :class="{ 'unlocked': isLevelUnlocked(1) }">
          <h2 class="system-title">🌌 Level 1: ファウンデーション・ソーラーシステム</h2>
          <p class="system-subtitle">🪐 基礎文法惑星群 - 英検5級レベルの宇宙探索</p>
          
          <div class="planets-container">
            <!-- Be動詞惑星 -->
            <div 
              class="planet be-verb-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('beVerb'),
                'completed': isPlanetCompleted('beVerb'),
                'current': currentPlanet === 'beVerb'
              }"
              @click="enterPlanet('beVerb')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🪐</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">Be動詞惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 3" 
                      :key="i"
                      :class="getStarClass('beVerb', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('beVerb') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 一般動詞惑星 -->
            <div 
              class="planet general-verb-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('generalVerb'),
                'completed': isPlanetCompleted('generalVerb'),
                'current': currentPlanet === 'generalVerb'
              }"
              @click="enterPlanet('generalVerb')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌍</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">一般動詞惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 3" 
                      :key="i"
                      :class="getStarClass('generalVerb', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('generalVerb') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 基本語順惑星 -->
            <div 
              class="planet word-order-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('wordOrder'),
                'completed': isPlanetCompleted('wordOrder'),
                'current': currentPlanet === 'wordOrder'
              }"
              @click="enterPlanet('wordOrder')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌕</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">語順惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 3" 
                      :key="i"
                      :class="getStarClass('wordOrder', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('wordOrder') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Level 2: Grammar Application Moon -->
        <div class="solar-system level-2" :class="{ 'unlocked': isLevelUnlocked(2) }">
          <h2 class="system-title">Level 2: Application Moon</h2>
          <p class="system-subtitle">英検4級レベル - 応用文法の習得</p>
          
          <div class="planets-container">
            <!-- 時制惑星 -->
            <div 
              class="planet tense-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('tense'),
                'completed': isPlanetCompleted('tense'),
                'current': currentPlanet === 'tense'
              }"
              @click="enterPlanet('tense')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌙</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">時制惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 5" 
                      :key="i"
                      :class="getStarClass('tense', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('tense') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 比較・助動詞惑星 -->
            <div 
              class="planet comparison-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('comparison'),
                'completed': isPlanetCompleted('comparison'),
                'current': currentPlanet === 'comparison'
              }"
              @click="enterPlanet('comparison')"
            >
              <div class="planet-surface">
                <div class="planet-icon">⭐</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">比較・助動詞惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 5" 
                      :key="i"
                      :class="getStarClass('comparison', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('comparison') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Level 3: Grammar Mastery Galaxy -->
        <div class="solar-system level-3" :class="{ 'unlocked': isLevelUnlocked(3) }">
          <h2 class="system-title">Level 3: Mastery Galaxy</h2>
          <p class="system-subtitle">英検3級レベル - 高度文法の習得</p>
          
          <div class="planets-container">
            <!-- 複合文法惑星 -->
            <div 
              class="planet complex-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('complex'),
                'completed': isPlanetCompleted('complex'),
                'current': currentPlanet === 'complex'
              }"
              @click="enterPlanet('complex')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌌</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">複合文法銀河</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 7" 
                      :key="i"
                      :class="getStarClass('complex', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('complex') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 現在の学習状況パネル -->
      <div class="current-status-panel">
        <div class="panel-header">
          <h3>今日の学習</h3>
          <div class="daily-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: dailyProgressPercent + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ dailyProgressPercent }}%</span>
          </div>
        </div>
        
        <div class="recommended-next">
          <h4>推奨次ステップ</h4>
          <div class="next-activity" @click="goToRecommendedActivity">
            <div class="activity-icon">🎯</div>
            <div class="activity-info">
              <div class="activity-name">{{ recommendedActivity.name }}</div>
              <div class="activity-description">{{ recommendedActivity.description }}</div>
            </div>
            <ChevronRightIcon class="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div class="recent-achievements" v-if="recentAchievements.length > 0">
          <h4>最近の達成</h4>
          <div class="achievements-list">
            <div 
              v-for="achievement in recentAchievements" 
              :key="achievement.id"
              class="achievement-item"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-text">{{ achievement.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 統一フッターナビゲーション -->
    <CommonFooter 
      :active="'grammar'"
      @navigate="handleFooterNavigation"
    />

    <!-- プラネット選択モーダル -->
    <Transition name="modal">
      <div v-if="showPlanetModal" class="modal-overlay" @click="closePlanetModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedPlanetInfo.name }}</h3>
            <button @click="closePlanetModal" class="close-button">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <div class="modal-body">
            <div class="planet-detail">
              <div class="planet-icon-large">{{ selectedPlanetInfo.icon }}</div>
              <p class="planet-description">{{ selectedPlanetInfo.description }}</p>
              
              <div class="available-games">
                <h4>利用可能なゲーム</h4>
                <div class="games-grid">
                  <div 
                    v-for="game in selectedPlanetInfo.games" 
                    :key="game.id"
                    class="game-card"
                    :class="{ 'locked': !game.unlocked }"
                    @click="startGame(game)"
                  >
                    <div class="game-icon">{{ game.icon }}</div>
                    <div class="game-name">{{ game.name }}</div>
                    <div class="game-stars">
                      <StarIcon 
                        v-for="i in 3" 
                        :key="i"
                        :class="getGameStarClass(game.id, i)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="startPlanetLearning" class="start-button">
              学習開始
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import { usePrepositionGameStore } from '@/stores/grammarGalaxy/prepositionGameStore'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'grammar-galaxy-foundation',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    StarIcon,
    XMarkIcon,
    CommonFooter
  },
  setup() {
    const router = useRouter()
    let grammarStore
    let prepositionStore
    try {
      grammarStore = useGrammarGalaxyStore()
      prepositionStore = usePrepositionGameStore()
      // 初期化が成功したかチェック
      if (!grammarStore.planetsData) {
        logger.warn('Grammar store not fully initialized, using fallback')
        grammarStore.loadProgress()
      }
      // 前置詞ゲームデータを読み込み
      prepositionStore.loadProgress()
    } catch (error) {
      logger.error('Failed to initialize stores:', error)
      // フォールバック処理
      router.push('/')
      return
    }

    // リアクティブなデータ
    const galaxyMap = ref(null)
    const showPlanetModal = ref(false)
    const selectedPlanet = ref(null)
    const currentPlanet = ref('beVerb')
    const backgroundStars = ref([])
    
    // 🆕 UI制御
    const showSimpleMode = ref(true) // デフォルトはシンプルモード
    const showAdvancedPath = ref(false) // 詳細パスは初期状態で非表示

    // 計算されたプロパティ（安全性チェック付き）
    const playerData = computed(() => {
      return {
        level: grammarStore.playerData?.value?.level || 1,
        totalStars: grammarStore.playerData?.value?.totalStars || 0,
        totalGamesCompleted: grammarStore.playerData?.value?.totalGamesCompleted || 0,
        currentStreak: grammarStore.playerData?.value?.currentStreak || 0,
        lastPlayDate: grammarStore.playerData?.value?.lastPlayDate || null,
        preferences: grammarStore.playerData?.value?.preferences || {
          difficulty: 'normal',
          soundEnabled: true,
          animationsEnabled: true
        }
      }
    })

    const maxStars = computed(() => {
      return grammarStore.maxStars?.value || 0
    })

    const dailyProgressPercent = computed(() => {
      return grammarStore.dailyProgressPercent?.value || 0
    })

    const recommendedActivity = computed(() => {
      return grammarStore.recommendedActivity?.value || {
        id: 'beVerb',
        name: 'Be動詞惑星',
        description: '英語学習の第一歩を踏み出しましょう',
        type: 'planet'
      }
    })

    const recentAchievements = computed(() => {
      return grammarStore.recentAchievements?.value || []
    })

    const selectedPlanetInfo = computed(() => {
      if (typeof grammarStore.getPlanetInfo === 'function') {
        return grammarStore.getPlanetInfo(selectedPlanet.value)
      }
      return null
    })

    // 背景の星を生成
    const generateBackgroundStars = () => {
      const stars = []
      for (let i = 0; i < 100; i++) {
        stars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 2 + Math.random() * 3
        })
      }
      backgroundStars.value = stars
    }

    // 🆕 Rush Zone データ
    const beVerbRushData = computed(() => {
      try {
        return grammarStore.rushZoneData?.beVerbRush || {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      } catch (error) {
        return {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      }
    })

    const verbRushData = computed(() => {
      try {
        return grammarStore.rushZoneData?.verbRush || {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      } catch (error) {
        return {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      }
    })

    const dailyRushSessions = computed(() => {
      try {
        return grammarStore.getDailyRushSessions?.() || 0
      } catch (error) {
        return 0
      }
    })

    const averageAccuracy = computed(() => {
      try {
        return grammarStore.getAverageRushAccuracy?.() || 0
      } catch (error) {
        return 0
      }
    })

    const totalRushTime = computed(() => {
      try {
        return grammarStore.getTotalRushTime?.() || 0
      } catch (error) {
        return 0
      }
    })

    // Grammar Art Gallery 用の計算プロパティ
    const artGalleryData = computed(() => {
      return {
        explored: Math.round(progressStore.sections.grammarGalaxy.progress), // 文法ギャラクシーの進捗を使用
        artifacts: Math.floor(progressStore.sections.grammarGalaxy.level / 2), // レベルに基づく
        totalArtifacts: 12, // 総アーティファクト数
        level: progressStore.sections.grammarGalaxy.level, // 実際のレベル
        unlocked: true // 常に解禁済み
      }
    })

    // 前置詞ゲーム用の計算プロパティ
    const prepositionMasteryPercentage = computed(() => {
      try {
        return prepositionStore.overallProgress || 0
      } catch (error) {
        return 0
      }
    })

    const prepositionUnlockedPlanets = computed(() => {
      try {
        return prepositionStore.unlockedPlanetsCount || 1
      } catch (error) {
        return 1
      }
    })

    const isPlanetCompleted = (planetId) => {
      try {
        const planet = prepositionStore.planets.find(p => p.id === planetId)
        return planet?.completed || false
      } catch (error) {
        return false
      }
    }

    // 新規代名詞ゲーム用データ
    const holographicData = computed(() => {
      try {
        return gameStore.gameProgress?.holographicStoryDeck || {
          completedScenarios: 0,
          totalScenarios: 10,
          accuracy: 0,
          bestScore: 0
        }
      } catch (error) {
        return {
          completedScenarios: 0,
          totalScenarios: 10,
          accuracy: 0,
          bestScore: 0
        }
      }
    })


    // 新規ゲーム開始関数
    const startHolographicStoryDeck = () => {
      logger.log('Starting Holographic Story Deck')
      router.push('/grammar-galaxy/holographic-story-deck')
    }


    // 🆕 Be Verb Rush 開始関数
    const startBeVerbRush = () => {
      logger.log('startBeVerbRush called')
      
      try {
        if (!grammarStore) {
          logger.error('Grammar store not available')
          alert('エラー: データの読み込みに失敗しました')
          return
        }

        // Be Verb Rush のアンロック状態チェック
        if (!beVerbRushData.value.unlocked) {
          alert('🔒 Be Verb Rush はまだアンロックされていません')
          return
        }

        // Be Verb Rush ページに遷移
        router.push({
          name: 'be-verb-rush'
        }).catch(err => {
          logger.error('Navigation error:', err)
          alert('Be Verb Rush の開始に失敗しました')
        })
      } catch (error) {
        logger.error('Error in startBeVerbRush:', error)
        alert('エラーが発生しました。ページを再読み込みしてください。')
      }
    }

    // 🆕 Verb Rush 開始関数
    const startVerbRush = () => {
      logger.log('startVerbRush called')
      
      try {
        if (!grammarStore) {
          logger.error('Grammar store not available')
          alert('エラー: データの読み込みに失敗しました')
          return
        }

        // Verb Rush のアンロック状態チェック
        if (!verbRushData.value.unlocked) {
          alert('🔒 Verb Rush はまだアンロックされていません')
          return
        }

        // Verb Rush ページに遷移
        router.push({
          name: 'verb-rush'
        }).catch(err => {
          logger.error('Navigation error:', err)
          alert('Verb Rush の開始に失敗しました')
        })
      } catch (error) {
        logger.error('Error in startVerbRush:', error)
        alert('エラーが発生しました。ページを再読み込みしてください。')
      }
    }

    // 🆕 新しいゲーム開始関数群
    const startComparisonMaster = () => {
      logger.log('startComparisonMaster called')
      router.push({ name: 'comparison-master' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('Comparison Master の開始に失敗しました')
      })
    }

    const startModalVerbChallenge = () => {
      logger.log('startModalVerbChallenge called')
      router.push({ name: 'modal-verb-challenge' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('Modal Verb Challenge の開始に失敗しました')
      })
    }

    const startConjunctionConnection = () => {
      logger.log('startConjunctionConnection called')
      router.push({ name: 'conjunction-connection' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('Conjunction Connection の開始に失敗しました')
      })
    }

    const startProgressiveTense = () => {
      logger.log('startProgressiveTense called')
      router.push({ name: 'progressive-tense' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('Progressive Tense の開始に失敗しました')
      })
    }

    const startVerbPatternGalaxy = () => {
      logger.log('startVerbPatternGalaxy called')
      router.push({ name: 'verb-pattern-galaxy-hub' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('Verb Pattern Galaxy の開始に失敗しました')
      })
    }

    // 前置詞マスターゲーム開始
    const startPrepositionMaster = () => {
      logger.log('startPrepositionMaster called')
      router.push({ name: 'PrepositionSpaceStation' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('前置詞マスター：宇宙の旅の開始に失敗しました')
      })
    }

    const startSpaceWordOrderQuest = () => {
      logger.log('startSpaceWordOrderQuest called')
      router.push({ name: 'space-word-order-quest' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('Space Word Order Quest の開始に失敗しました')
      })
    }

    // Grammar Art Gallery 開始関数
    const startGrammarArtGallery = () => {
      logger.log('startGrammarArtGallery called')
      router.push({ name: 'grammar-art-gallery' }).catch(err => {
        logger.error('Navigation error:', err)
        alert('Grammar Art Gallery の開始に失敗しました')
      })
    }

    // 🆕 直接ゲーム開始機能
    const startDirectGame = (gameId) => {
      logger.log('startDirectGame called:', gameId)
      
      try {
        // ゲームIDに基づいてルート設定
        let routeConfig = null
        
        switch (gameId) {
          // Grammar Galaxy Foundation Games
          case 'verbTimeMachine':
            routeConfig = { name: 'verb-time-machine' }
            break
          case 'galacticQuestionNavigator':
            routeConfig = { name: 'galactic-question-navigator' }
            break
          // Other Grammar Games
          case 'grammarColorCode':
            // Grammar Color Code はplanetIdパラメータが必要
            routeConfig = { 
              name: 'grammar-color-code', 
              params: { planetId: 'beVerb' } 
            }
            break
          case 'patternHunter':
            routeConfig = { name: 'pattern-hunter' }
            break
          case 'grammarPuzzleCascade':
            routeConfig = { name: 'grammar-puzzle-cascade' }
            break
          case 'grammarReflexArena':
            routeConfig = { name: 'grammar-reflex-arena' }
            break
          case 'comparisonMaster':
            routeConfig = { name: 'comparison-master' }
            break
          case 'modalVerbChallenge':
            routeConfig = { name: 'modal-verb-challenge' }
            break
          case 'conjunctionConnection':
            routeConfig = { name: 'conjunction-connection' }
            break
          case 'progressiveTense':
            routeConfig = { name: 'progressive-tense' }
            break
          case 'spaceWordOrderQuest':
            routeConfig = { name: 'space-word-order-quest' }
            break
          default:
            logger.warn('Unknown game ID:', gameId)
            alert('ゲームが見つかりません')
            return
        }
        
        if (routeConfig) {
          logger.log('Navigating with config:', routeConfig)
          router.push(routeConfig).catch(err => {
            logger.error('Navigation error:', err)
            alert(`${gameId} の開始に失敗しました`)
          })
        }
      } catch (error) {
        logger.error('Error in startDirectGame:', error)
        alert('ゲームの開始に失敗しました')
      }
    }

    // 🆕 惑星IDを指定してゲーム開始
    const startDirectGameWithPlanet = (gameId, planetId) => {
      logger.log('startDirectGameWithPlanet called:', { gameId, planetId })
      
      try {
        let routeConfig = null
        
        switch (gameId) {
          case 'grammarColorCode':
            routeConfig = { 
              name: 'grammar-color-code', 
              params: { planetId: planetId || 'beVerb' } 
            }
            break
          default:
            // その他のゲームは通常の開始方法
            return startDirectGame(gameId)
        }
        
        if (routeConfig) {
          logger.log('Navigating with planet config:', routeConfig)
          router.push(routeConfig).catch(err => {
            logger.error('Navigation error:', err)
            alert(`${gameId} の開始に失敗しました`)
          })
        }
      } catch (error) {
        logger.error('Error in startDirectGameWithPlanet:', error)
        alert('ゲームの開始に失敗しました')
      }
    }

    // 🆕 Rush Zone へのナビゲーション
    const goToRushZone = () => {
      logger.log('goToRushZone called')
      // Rush Zone は同じページの上部にあるのでスクロール
      const rushSection = document.querySelector('.rush-zone-section')
      if (rushSection) {
        rushSection.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // レベル・プラネットのアンロック状態チェック（安全性チェック付き）
    const isLevelUnlocked = (level) => {
      if (typeof grammarStore.isLevelUnlocked === 'function') {
        return grammarStore.isLevelUnlocked(level)
      }
      return level === 1 // フォールバック: レベル1のみアンロック
    }

    const isPlanetUnlocked = (planetId) => {
      if (typeof grammarStore.isPlanetUnlocked === 'function') {
        return grammarStore.isPlanetUnlocked(planetId)
      }
      return ['beVerb', 'generalVerb', 'wordOrder'].includes(planetId) // フォールバック
    }

    const isGrammarPlanetCompleted = (planetId) => {
      if (typeof grammarStore.isPlanetCompleted === 'function') {
        return grammarStore.isPlanetCompleted(planetId)
      }
      return false // フォールバック
    }

    // 星の表示クラス取得（安全性チェック付き）
    const getStarClass = (planetId, starIndex) => {
      let progress = 0
      if (typeof grammarStore.getPlanetStars === 'function') {
        progress = grammarStore.getPlanetStars(planetId)
      }
      return [
        'h-4 w-4',
        starIndex <= progress ? 'text-yellow-400 fill-current' : 'text-gray-300'
      ]
    }

    const getGameStarClass = (gameId, starIndex) => {
      let progress = 0
      if (typeof grammarStore.getGameStars === 'function') {
        progress = grammarStore.getGameStars(gameId)
      }
      return [
        'h-3 w-3',
        starIndex <= progress ? 'text-yellow-400 fill-current' : 'text-gray-300'
      ]
    }

    // プラネット進捗テキスト取得（安全性チェック付き）
    const getPlanetProgress = (planetId) => {
      if (typeof grammarStore.getPlanetProgress === 'function') {
        const progress = grammarStore.getPlanetProgress(planetId)
        return `${progress.current}/${progress.total} ゲーム完了`
      }
      return '0/0 ゲーム完了' // フォールバック
    }

    // プラネット入場
    const enterPlanet = (planetId) => {
      logger.log('enterPlanet called:', planetId)
      try {
        // 惑星に複数のゲームがある場合は選択モーダルを表示
        selectedPlanet.value = planetId
        showPlanetModal.value = true
      } catch (error) {
        logger.error('Error in enterPlanet:', error)
        alert('エラーが発生しました。ページを再読み込みしてください。')
      }
    }

    const closePlanetModal = () => {
      showPlanetModal.value = false
      selectedPlanet.value = null
    }

    const startPlanetLearning = () => {
      if (selectedPlanet.value) {
        alert(`🚀 ${selectedPlanet.value}惑星の学習を開始します！\n\n（実装予定）`)
        closePlanetModal()
      }
    }

    const startGame = (game) => {
      if (!game.unlocked) {
        alert('🔒 このゲームはまだアンロックされていません')
        return
      }
      
      logger.log('startGame called:', game.id)
      
      // 選択された惑星のIDを使ってゲームを開始
      const planetId = selectedPlanet.value
      closePlanetModal() // モーダルを閉じる
      
      // ゲームIDに基づいて適切なルーティング
      try {
        if (game.id === 'grammarColorCode' && planetId) {
          // Grammar Color Code は planetId が必要
          router.push({ 
            name: 'grammar-color-code', 
            params: { planetId: planetId } 
          })
        } else {
          // その他のゲームは直接開始
          startDirectGame(game.id)
        }
      } catch (error) {
        logger.error('Navigation error:', error)
        alert(`ゲームの開始に失敗しました: ${game.name}`)
      }
    }

    // 推奨アクティビティに移動
    const goToRecommendedActivity = () => {
      const activity = recommendedActivity.value
      logger.log('goToRecommendedActivity called:', activity)
      
      if (activity.type === 'game') {
        // ゲームタイプの場合は直接ゲーム開始
        startDirectGame(activity.id)
      } else if (activity.type === 'planet') {
        // 惑星タイプの場合は、ゲーム選択モーダルを表示
        logger.log(`Planet ${activity.id} -> Opening game selection modal`)
        enterPlanet(activity.id)
      } else {
        // フォールバック：Grammar Color Code を開始
        logger.log('Fallback: Starting Grammar Color Code')
        startDirectGame('grammarColorCode')
      }
    }

    // ナビゲーション
    const goBack = () => {
      router.push('/')
    }

    // 統一フッターナビゲーションメソッド
    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure-hub')
          break
        case 'grammar':
          // 現在のページなので何もしない
          break
        case 'multi-layer':
          router.push('/multi-layer')
          break
        case 'co-pilot':
          router.push('/co-pilot-dock')
          break
        case 'vr-academy':
          router.push('/vr-academy')
          break
        default:
          logger.warn('Unknown navigation section:', section)
      }
    }

    // ライフサイクル
    onMounted(() => {
      generateBackgroundStars()
      
      // ストアの初期化チェック（安全に実行）
      try {
        if (typeof grammarStore.loadProgress === 'function') {
          grammarStore.loadProgress()
          logger.log('✅ Grammar store progress loaded')
        }
      } catch (error) {
        logger.warn('⚠️ Could not load grammar store progress:', error)
      }
    })

    return {
      // Refs
      galaxyMap,
      showPlanetModal,
      selectedPlanet,
      currentPlanet,
      backgroundStars,
      
      // Computed
      playerData,
      maxStars,
      dailyProgressPercent,
      recommendedActivity,
      recentAchievements,
      selectedPlanetInfo,

      // 🆕 Rush Zone 関連
      beVerbRushData,
      verbRushData,
      dailyRushSessions,
      averageAccuracy,
      totalRushTime,
      startBeVerbRush,
      startVerbRush,

      // 前置詞ゲーム関連
      prepositionMasteryPercentage,
      prepositionUnlockedPlanets,
      isPlanetCompleted,
      startPrepositionMaster,
      
      // 新規代名詞ゲーム関連
      holographicData,
      startHolographicStoryDeck,

      // 🆕 新しいゲーム関連
      startComparisonMaster,
      startModalVerbChallenge,
      startConjunctionConnection,
      startProgressiveTense,
      startVerbPatternGalaxy,
      startSpaceWordOrderQuest,

      // Grammar Art Gallery 関連
      artGalleryData,
      startGrammarArtGallery,

      // 🆕 直接ナビゲーション機能
      startDirectGame,
      startDirectGameWithPlanet,
      goToRushZone,
      showSimpleMode,
      showAdvancedPath,
      
      // Methods
      isLevelUnlocked,
      isPlanetUnlocked,
      isPlanetCompleted,
      getStarClass,
      getGameStarClass,
      getPlanetProgress,
      enterPlanet,
      closePlanetModal,
      startPlanetLearning,
      startGame,
      goToRecommendedActivity,
      goBack,
      handleFooterNavigation
    }
  }
}
</script>
<style scoped>
/* Galaxy background - unified with other components */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

/* Galaxy-themed components - unified */
.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.8) 50%, 
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.galaxy-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan-line 2s linear infinite;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 🆕 直接ゲーム選択セクションのスタイル */
.direct-games-section {
  @apply relative z-10 max-w-7xl mx-auto mb-8;
}

.featured-games {
  @apply mb-12;
}

.game-card.featured {
  @apply relative p-8 rounded-3xl cursor-pointer transition-all duration-300 transform hover:scale-105;
  background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(168,85,247,0.1) 100%);
  border: 2px solid rgba(59,130,246,0.4);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(59,130,246,0.2);
  text-align: center;
}

.game-card.featured:hover {
  border-color: rgba(59,130,246,0.7);
  box-shadow: 0 12px 40px rgba(59,130,246,0.3);
}

.game-icon-large {
  @apply text-6xl mb-4 block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.game-title {
  @apply text-xl font-bold galaxy-text-primary mb-3;
}

.game-description {
  @apply text-galaxy-moon-silver text-sm mb-4;
}

.difficulty-badge {
  @apply inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4;
}

.difficulty-badge.beginner {
  @apply bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30;
}

.difficulty-badge.intermediate {
  @apply bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30;
}

.difficulty-badge.advanced {
  @apply bg-red-500 bg-opacity-20 text-red-300 border border-red-500 border-opacity-30;
}

.play-button-large {
  @apply w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl text-white font-bold transition-all duration-200 transform hover:scale-105;
  box-shadow: 0 4px 15px rgba(59,130,246,0.4);
}

.play-icon {
  @apply mr-2 text-lg;
}

/* ミニゲームカード */
.all-games {
  @apply text-center;
}

.mini-game-card {
  @apply p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.mini-game-card:hover {
  border-color: rgba(59,130,246,0.5);
  box-shadow: 0 4px 15px rgba(59,130,246,0.2);
}

.mini-icon {
  @apply text-3xl mb-2;
}

.mini-title {
  @apply text-xs font-semibold text-galaxy-moon-silver;
}

/* Rush Zone専用スタイル */
.rush-zone-section {
  @apply relative z-10 max-w-6xl mx-auto mb-16 p-8 rounded-3xl border;
  background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%);
  border: 2px solid rgba(99,102,241,0.4);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(99,102,241,0.2);
}

.rush-zone-header {
  @apply text-center mb-8;
}

.zone-title {
  @apply text-3xl font-bold mb-2;
  background: linear-gradient(45deg, #FBBF24, #F59E0B, #EF4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(251,191,36,0.3));
}

.zone-subtitle {
  @apply text-blue-200 text-lg;
}

/* Rush Games Grid */
.rush-games-grid {
  @apply grid gap-6 mb-8;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.galaxy-card {
  @apply relative p-6 rounded-xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid transparent;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.galaxy-card.unlocked {
  border: 2px solid rgba(251,191,36,0.5);
  background: linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(239,68,68,0.1) 100%);
}

.galaxy-card.unlocked:hover {
  @apply scale-105;
  box-shadow: 0 8px 25px rgba(251,191,36,0.3);
  border-color: rgba(251,191,36,0.7);
}

.galaxy-card.completed {
  background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(251,191,36,0.15) 100%);
  border: 2px solid rgba(34,197,94,0.6);
}

.galaxy-card.locked {
  @apply opacity-50 cursor-not-allowed;
  filter: grayscale(0.7);
}

/* Rush Game Surface */
.rush-game-surface {
  @apply relative text-center mb-4;
}

.rush-game-icon {
  @apply text-5xl mb-2 inline-block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.lightning-effect {
  @apply absolute inset-0 rounded-full opacity-60;
  background: radial-gradient(circle at center, rgba(251,191,36,0.3) 0%, transparent 70%);
  animation: lightning-pulse 2s ease-in-out infinite alternate;
}

@keyframes lightning-pulse {
  0% { 
    transform: scale(0.95); 
    opacity: 0.3; 
    background: radial-gradient(circle at center, rgba(251,191,36,0.3) 0%, transparent 70%);
  }
  100% { 
    transform: scale(1.05); 
    opacity: 0.7;
    background: radial-gradient(circle at center, rgba(239,68,68,0.4) 0%, transparent 70%);
  }
}

/* Rush Game Info */
.rush-game-info {
  @apply text-center;
}

.rush-game-name {
  @apply text-xl font-bold mb-3 text-yellow-300;
}

.rush-game-stats {
  @apply space-y-2 mb-4;
}

.mastery-display,
.today-progress,
.best-score {
  @apply flex justify-between items-center text-sm;
}

.mastery-label,
.progress-label,
.score-label {
  @apply text-gray-300;
}

.mastery-value,
.progress-value,
.score-value {
  @apply text-yellow-300 font-semibold;
}

.rush-play-button {
  @apply w-full py-3 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-400 hover:to-red-400 rounded-lg text-white font-bold transition-all duration-200 transform hover:scale-105;
  box-shadow: 0 4px 15px rgba(251,191,36,0.4);
}

.rush-locked {
  @apply text-gray-400 text-sm;
}

.unlock-condition {
  @apply text-gray-400 text-sm mt-2;
}

/* Rush Zone Stats */
.rush-zone-stats {
  @apply bg-black bg-opacity-20 rounded-xl p-6;
}

.stats-title {
  @apply text-lg font-semibold mb-4 text-blue-200;
}

.stats-grid {
  @apply grid grid-cols-3 gap-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply text-2xl font-bold text-yellow-300;
}

.stat-label {
  @apply text-sm text-gray-300 mt-1;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .direct-games-section {
    @apply mx-4;
  }
  
  .featured-games .grid {
    @apply grid-cols-1;
  }
  
  .game-card.featured {
    @apply p-6;
  }
  
  .game-icon-large {
    @apply text-5xl;
  }
  
  .game-title {
    @apply text-lg;
  }
  
  .all-games .grid {
    @apply grid-cols-2;
  }
  
  .mini-game-card {
    @apply p-3;
  }
  
  .mini-icon {
    @apply text-2xl;
  }
  
  .rush-zone-section {
    @apply mx-4 p-4;
  }
  
  .zone-title {
    @apply text-2xl;
  }
  
  .rush-games-grid {
    @apply grid-cols-1;
  }
  
  .stats-grid {
    @apply grid-cols-1 gap-2;
  }
  
  .rush-game-icon {
    @apply text-4xl;
  }
}

@media (max-width: 480px) {
  .zone-title {
    @apply text-xl;
  }
  
  .rush-game-card {
    @apply p-4;
  }
}

/* アニメーション削減設定 */
@media (prefers-reduced-motion: reduce) {
  .lightning-effect {
    animation: none;
  }
  
  .rush-game-card:hover {
    transform: none;
  }
  
  .rush-play-button:hover {
    transform: none;
  }
}

/* ヘッダー */
.galaxy-header {
  @apply relative z-10 bg-black bg-opacity-30 backdrop-blur-md;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  @apply max-w-7xl mx-auto px-4 py-4 flex items-center justify-between;
}

.back-button {
  @apply flex items-center gap-2 px-3 py-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200;
}

.header-title {
  @apply text-center;
}

.galaxy-title {
  @apply text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent;
}

.galaxy-subtitle {
  @apply text-blue-200 text-sm mt-1;
}

.header-stats {
  @apply flex items-center gap-4;
}

.player-level {
  @apply flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-sm font-semibold text-black;
}

.total-stars {
  @apply text-right;
}

.stars-count {
  @apply text-2xl font-bold text-yellow-400;
}

.stars-max {
  @apply text-gray-400;
}

/* 宇宙マップ */
.galaxy-map {
  @apply relative flex-1 overflow-y-auto;
  padding: 2rem;
  min-height: calc(100vh - 140px);
}

/* 背景の星 */
.stars-background {
  @apply absolute inset-0 pointer-events-none;
}

.background-star {
  @apply absolute w-1 h-1 bg-white rounded-full;
  animation: twinkle 3s infinite ease-in-out;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 学習パス */
.learning-path {
  @apply relative z-10 max-w-6xl mx-auto space-y-16;
}

.solar-system {
  @apply relative p-8 rounded-3xl border transition-all duration-500;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.solar-system.unlocked {
  @apply shadow-2xl;
  background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.05) 100%);
  border: 1px solid rgba(99,102,241,0.3);
}

.solar-system:not(.unlocked) {
  @apply opacity-50 pointer-events-none;
  filter: grayscale(0.7);
}

.system-title {
  @apply text-3xl font-bold text-center mb-2;
  background: linear-gradient(45deg, #60A5FA, #C084FC);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.system-subtitle {
  @apply text-blue-200 text-center mb-8;
}

/* プラネットコンテナ */
.planets-container {
  @apply grid gap-8;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* プラネット */
.planet {
  @apply relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid transparent;
}

.planet:not(.unlocked) {
  @apply opacity-40 cursor-not-allowed;
  filter: grayscale(0.8);
}

.planet.unlocked:hover {
  @apply scale-105;
  box-shadow: 0 20px 40px rgba(99,102,241,0.3);
}

.planet.current {
  border: 2px solid #60A5FA;
  box-shadow: 0 0 30px rgba(96,165,250,0.5);
}

.planet.completed {
  background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%);
  border: 2px solid rgba(34,197,94,0.5);
}

/* Be動詞惑星 */
.be-verb-planet.unlocked {
  background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.1) 100%);
}

/* 一般動詞惑星 */
.general-verb-planet.unlocked {
  background: linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(59,130,246,0.1) 100%);
}

/* 語順惑星 */
.word-order-planet.unlocked {
  background: linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,101,101,0.1) 100%);
}

/* 時制惑星 */
.tense-planet.unlocked {
  background: linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.1) 100%);
}

/* 比較・助動詞惑星 */
.comparison-planet.unlocked {
  background: linear-gradient(135deg, rgba(245,101,101,0.15) 0%, rgba(251,191,36,0.1) 100%);
}

/* 複合文法惑星 */
.complex-planet.unlocked {
  background: linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.15) 100%);
}

/* プラネット表面 */
.planet-surface {
  @apply relative text-center mb-4;
}

.planet-icon {
  @apply text-6xl mb-2 inline-block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.planet-glow {
  @apply absolute inset-0 rounded-full opacity-60;
  background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
  animation: planet-glow 3s ease-in-out infinite alternate;
}

@keyframes planet-glow {
  0% { transform: scale(0.95); opacity: 0.4; }
  100% { transform: scale(1.05); opacity: 0.8; }
}

/* プラネット情報 */
.planet-info {
  @apply text-center;
}

.planet-name {
  @apply text-xl font-bold mb-3;
}

.planet-progress {
  @apply space-y-2;
}

.progress-stars {
  @apply flex justify-center gap-1;
}

.progress-text {
  @apply text-sm text-gray-300;
}

/* 現在の学習状況パネル */
.current-status-panel {
  @apply fixed top-1/2 right-4 transform -translate-y-1/2 w-80 bg-black bg-opacity-40 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 z-20;
}

.panel-header {
  @apply mb-6;
}

.panel-header h3 {
  @apply text-lg font-semibold mb-3;
}

.daily-progress {
  @apply flex items-center gap-3;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500;
}

.progress-text {
  @apply text-sm font-medium;
}

/* 推奨次ステップ */
.recommended-next {
  @apply mb-6;
}

.recommended-next h4 {
  @apply text-base font-semibold mb-3 text-blue-200;
}

.next-activity {
  @apply flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg cursor-pointer hover:from-blue-500 hover:to-purple-500 transition-all duration-200;
}

.activity-icon {
  @apply text-2xl;
}

.activity-info {
  @apply flex-1;
}

.activity-name {
  @apply font-semibold;
}

.activity-description {
  @apply text-sm text-blue-100;
}

/* 最近の達成 */
.recent-achievements h4 {
  @apply text-base font-semibold mb-3 text-yellow-200;
}

.achievements-list {
  @apply space-y-2;
}

.achievement-item {
  @apply flex items-center gap-3 p-2 bg-yellow-500 bg-opacity-20 rounded-lg;
}

.achievement-icon {
  @apply text-lg;
}

.achievement-text {
  @apply text-sm font-medium;
}

/* フッターナビゲーション */
.galaxy-footer {
  @apply fixed bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-md border-t border-white border-opacity-20 px-4 py-3 z-20;
}

.galaxy-footer {
  @apply flex justify-around;
}

.footer-nav-item {
  @apply flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-white;
}

.footer-nav-item.active {
  @apply text-blue-400 bg-blue-500 bg-opacity-20;
}

.footer-nav-item span {
  @apply text-xs font-medium;
}

/* モーダル */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto;
  border: 1px solid rgba(255,255,255,0.2);
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-700;
}

.modal-header h3 {
  @apply text-2xl font-bold;
}

.close-button {
  @apply p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200;
}

.modal-body {
  @apply p-6;
}

.planet-detail {
  @apply text-center;
}

.planet-icon-large {
  @apply text-8xl mb-4;
}

.planet-description {
  @apply text-gray-300 mb-6 leading-relaxed;
}

.available-games h4 {
  @apply text-lg font-semibold mb-4 text-left;
}

.games-grid {
  @apply grid grid-cols-2 gap-4;
}

.game-card {
  @apply p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-all duration-200 text-center;
  border: 2px solid transparent;
}

.game-card:hover {
  border: 2px solid rgba(99,102,241,0.5);
}

.game-card.locked {
  @apply opacity-50 cursor-not-allowed;
  filter: grayscale(0.8);
}

.game-icon {
  @apply text-3xl mb-2;
}

.game-name {
  @apply font-semibold mb-2;
}

.game-stars {
  @apply flex justify-center gap-1;
}

.modal-footer {
  @apply p-6 border-t border-gray-700;
}

.start-button {
  @apply w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105;
}

/* モーダルトランジション */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-content {
  transform: translateY(-50px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: translateY(50px);
  opacity: 0;
}

/* レスポンシブデザイン */
@media (max-width: 1280px) {
  .current-status-panel {
    @apply relative right-auto top-auto transform-none w-full mt-8;
  }
}

@media (max-width: 768px) {
  .galaxy-map {
    @apply px-4;
  }
  
  .planets-container {
    @apply grid-cols-1;
  }
  
  .header-content {
    @apply px-2;
  }
  
  .galaxy-title {
    @apply text-2xl;
  }
  
  .solar-system {
    @apply p-4;
  }
  
  .planet {
    @apply p-4;
  }
  
  .planet-icon {
    @apply text-4xl;
  }
  
  .modal-content {
    @apply mx-2;
  }
  
  .games-grid {
    @apply grid-cols-1;
  }
}

@media (max-width: 480px) {
  .header-stats {
    @apply gap-2;
  }
  
  .player-level {
    @apply px-2 text-xs;
  }
  
  .stars-count {
    @apply text-lg;
  }
  
  .footer-nav-item {
    @apply px-2;
  }
  
  .footer-nav-item span {
    @apply hidden;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .grammar-galaxy-foundation {
    /* デフォルトでダークテーマなので変更なし */
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .background-star,
  .planet-glow,
  .progress-fill {
    animation: none;
  }
  
  .planet:hover {
    transform: none;
  }
  
  .start-button:hover {
    transform: none;
  }
}

/* 高コントラスト対応 */
@media (prefers-contrast: high) {
  .solar-system {
    border: 2px solid #ffffff;
    background: rgba(0,0,0,0.8);
  }
  
  .planet {
    border: 2px solid #ffffff;
    background: rgba(0,0,0,0.9);
  }
  
  .modal-content {
    border: 2px solid #ffffff;
    background: #000000;
  }
}

/* 印刷対応 */
@media print {
  .galaxy-footer,
  .current-status-panel,
  .modal-overlay {
    @apply hidden;
  }
  
  .grammar-galaxy-foundation {
    @apply bg-white text-black;
  }
  
  .background-star {
    @apply hidden;
  }
}

/* 前置詞マスター専用スタイル */
.preposition-master-card {
  position: relative;
  overflow: hidden;
}

.preposition-master-card .space-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px, 30px 30px, 70px 70px;
  animation: float-particles 20s linear infinite;
}

@keyframes float-particles {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100px);
  }
}

/* Grammar Art Gallery 専用スタイル */
.art-gallery-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg,
    rgba(168, 85, 247, 0.15) 0%,
    rgba(139, 92, 246, 0.1) 50%,
    rgba(124, 58, 237, 0.15) 100%);
  border: 2px solid rgba(168, 85, 247, 0.5);
}

.art-gallery-card:hover {
  border-color: rgba(168, 85, 247, 0.8);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.art-gallery-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 60px 60px, 40px 40px, 80px 80px;
  animation: gallery-shimmer 15s linear infinite;
  pointer-events: none;
}

.art-gallery-button {
  background: linear-gradient(45deg,
    rgba(168, 85, 247, 0.8),
    rgba(139, 92, 246, 0.9));
  border: 1px solid rgba(168, 85, 247, 0.6);
}

.art-gallery-button:hover {
  background: linear-gradient(45deg,
    rgba(168, 85, 247, 1),
    rgba(139, 92, 246, 1));
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
}

@keyframes gallery-shimmer {
  0% {
    transform: translateX(-100%);
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(100%);
    opacity: 0.3;
  }
}

.planet-preview {
  margin: 8px 0;
}

.planet-icons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.planet-icon {
  font-size: 16px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.planet-icon.completed {
  opacity: 1;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.7));
  animation: planet-pulse 2s ease-in-out infinite;
}

@keyframes planet-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.preposition-play {
  background: linear-gradient(45deg, #ff6b35, #f7931e) !important;
  box-shadow: 0 4px 15px rgba(247, 147, 30, 0.3);
}

.preposition-play:hover {
  background: linear-gradient(45deg, #ff5722, #ff9800) !important;
  box-shadow: 0 6px 20px rgba(247, 147, 30, 0.5);
  transform: translateY(-2px);
}
</style>
