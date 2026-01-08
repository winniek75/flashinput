<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
    <!-- 宇宙背景エフェクト -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="star in backgroundStars"
        :key="star.id"
        class="absolute bg-white rounded-full opacity-80"
        :style="{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          animation: `twinkle ${star.duration}s ease-in-out infinite`,
          animationDelay: `${star.delay}s`
        }"
      />
    </div>

    <!-- ヘッダー -->
    <header class="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/20">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button 
              @click="goHome"
              class="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
            >
              <Home class="w-5 h-5" />
              ホーム
            </button>
            
            <div class="text-center">
              <h1 class="text-3xl font-bold text-white flex items-center gap-3">
                🌌 Galaxy Trading Empire
              </h1>
              <p class="text-white/80 text-sm">惑星企業投資ゲーム × 英語学習</p>
            </div>
          </div>

          <!-- プレイヤーステータス -->
          <div class="hidden md:flex items-center gap-4">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
              <div class="flex items-center gap-3">
                <div class="text-center">
                  <div class="text-lg font-bold text-yellow-300">{{ availableEnergy.toLocaleString() }}</div>
                  <div class="text-xs text-white/80">エネルギーポイント</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-blue-300">{{ portfolioStats.totalPlanets }}</div>
                  <div class="text-xs text-white/80">投資済み惑星</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-green-300">{{ portfolioStats.dailyIncome }}</div>
                  <div class="text-xs text-white/80">日次収益</div>
                </div>
              </div>
            </div>
          </div>

          <!-- モバイルメニューボタン -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-200"
          >
            <Menu class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <!-- モバイルメニュー -->
    <div v-if="showMobileMenu" class="md:hidden fixed inset-0 bg-black/80 z-50">
      <div class="bg-gradient-to-b from-purple-900 to-indigo-900 h-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-white">メニュー</h2>
          <button @click="toggleMobileMenu" class="text-white text-2xl">×</button>
        </div>
        
        <!-- モバイルステータス -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-xl font-bold text-yellow-300">{{ availableEnergy.toLocaleString() }}</div>
              <div class="text-xs text-white/80">エネルギー</div>
            </div>
            <div>
              <div class="text-xl font-bold text-blue-300">{{ portfolioStats.totalPlanets }}</div>
              <div class="text-xs text-white/80">惑星</div>
            </div>
            <div>
              <div class="text-xl font-bold text-green-300">{{ portfolioStats.dailyIncome }}</div>
              <div class="text-xs text-white/80">収益</div>
            </div>
          </div>
        </div>

        <!-- モバイルナビゲーション -->
        <div class="space-y-4">
          <button @click="goToLearning()" class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold">
            📖 学習を続ける
          </button>
          <button @click="startBoardGame" class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold">
            🗺️ 従来のボードゲーム
          </button>
          <button @click="startMomotetsuGame" class="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold">
            🚂 Galaxy桃鉄ゲーム
          </button>
          <button @click="toggleMobileMenu" class="w-full bg-white/10 text-white py-3 rounded-xl font-bold">
            🏠 ダッシュボード
          </button>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <main class="relative z-10 container mx-auto px-4 py-8">
      <!-- 初回説明モーダル -->
      <div v-if="showWelcomeModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div class="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
          <div class="text-center">
            <div class="text-6xl mb-4">🚀</div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Galaxy Trading Empire へようこそ！</h2>
            <div class="text-left space-y-3 mb-6 text-gray-600">
              <p>🎓 <strong>学習と投資の新しい体験</strong></p>
              <p>• 英語学習の成果で惑星企業への投資が解禁されます</p>
              <p>• 投資は「お気に入りのお店を応援する」感覚です</p>
              <p>• 毎日のリターンで更なる学習が可能になります</p>
              <p>• 分散投資とリスク管理を楽しく学べます</p>
            </div>
            <button
              @click="closeWelcomeModal"
              class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              🌟 冒険を始める
            </button>
          </div>
        </div>
      </div>

      <!-- 今日の目標 -->
      <div class="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          🎯 今日の目標
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="bg-white/10 rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">📚</div>
            <div class="text-white font-bold text-lg">{{ dailyGoals.learning }}%</div>
            <div class="text-white/80 text-sm">学習進捗</div>
            <div class="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" :style="{ width: dailyGoals.learning + '%' }"></div>
            </div>
          </div>
          
          <div class="bg-white/10 rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">💼</div>
            <div class="text-white font-bold text-lg">{{ dailyGoals.investment }}</div>
            <div class="text-white/80 text-sm">投資目標 (EP)</div>
            <div class="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
              <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" :style="{ width: Math.min(100, (portfolioStats.totalInvestment / dailyGoals.investment) * 100) + '%' }"></div>
            </div>
          </div>
          
          <div class="bg-white/10 rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">🌍</div>
            <div class="text-white font-bold text-lg">{{ dailyGoals.planets }}</div>
            <div class="text-white/80 text-sm">新惑星解禁</div>
            <div class="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
              <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" :style="{ width: Math.min(100, (Object.keys(planetUnlockStatus).filter(key => planetUnlockStatus[key].unlocked).length / dailyGoals.planets) * 100) + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <button @click="showLearningGoals" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105">
            🎯 詳細確認
          </button>
        </div>
      </div>

      <!-- ボードゲーム情報 -->
      <div class="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          🗺️ ボードゲーム情報
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="bg-white/10 rounded-xl p-4">
            <h4 class="text-white font-bold mb-2">🎮 ゲームの目的</h4>
            <div class="text-white/80 text-sm space-y-1">
              <div>• 惑星を探検して投資チャンスを発見</div>
              <div>• 英語学習でスキルを向上</div>
              <div>• 投資ポートフォリオを構築</div>
              <div>• 新惑星を解禁して宇宙を拡張</div>
            </div>
          </div>
          
          <div class="bg-white/10 rounded-xl p-4">
            <h4 class="text-white font-bold mb-2">📋 ゲームルール</h4>
            <div class="text-white/80 text-sm space-y-1">
              <div>• サイコロを振って移動</div>
              <div>• 惑星タイルで投資チャンス</div>
              <div>• イベントタイルでボーナス獲得</div>
              <div>• 学習進捗で新惑星解禁</div>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <button @click="startBoardGame" class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105">
            🚀 ボードゲーム開始
          </button>
        </div>
      </div>

      <!-- メインダッシュボード -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側: 惑星企業一覧 -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              🏢 惑星企業一覧
              <span class="text-sm font-normal text-white/60">(学習進捗で解禁)</span>
            </h2>
            <button 
              @click="refreshPlanets"
              class="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <RefreshCw class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-4">
            <PlanetCorporationCard
              v-for="planet in Object.values(planetCorporations)"
              :key="planet.id"
              :planet="planet"
              :unlock-status="planetUnlockStatus[planet.id]"
              :investment-status="getInvestmentStatus(planet.id)"
              @invest="openInvestmentModal"
              @learn="goToLearning"
              @view-vr="prepareVRExperience"
            />
          </div>
        </div>

        <!-- 右側: サイドパネル -->
        <div class="space-y-6">
          <!-- 投資ポートフォリオ -->
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              💼 投資ポートフォリオ
            </h3>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all duration-200">
                  <div class="text-2xl font-bold text-green-300">{{ portfolioStats.totalValue.toLocaleString() }}</div>
                  <div class="text-xs text-white/80">総資産価値</div>
                </div>
                <div class="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all duration-200">
                  <div class="text-2xl font-bold text-blue-300">{{ portfolioStats.diversificationScore }}%</div>
                  <div class="text-xs text-white/80">分散度</div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-white/80">総投資額:</span>
                  <span class="text-white font-bold">{{ playerInvestments.totalInvested.toLocaleString() }} EP</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-white/80">総リターン:</span>
                  <span class="text-green-300 font-bold">+{{ playerInvestments.totalReturns.toLocaleString() }} EP</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-white/80">リスクレベル:</span>
                  <span class="font-bold" :class="getRiskColor(portfolioStats.riskLevel)">
                    {{ getRiskLabel(portfolioStats.riskLevel) }}
                  </span>
                </div>
              </div>

              <!-- 投資履歴リスト -->
              <div v-if="playerInvestments.ownedPlanets.length > 0" class="mt-4">
                <div class="text-sm font-bold text-white/90 mb-2">保有投資:</div>
                <div class="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  <div 
                    v-for="investment in playerInvestments.ownedPlanets"
                    :key="investment.id"
                    class="flex justify-between text-xs bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-all duration-200"
                  >
                    <span class="text-white/80">{{ getPlanetName(investment.planetId) }}</span>
                    <span class="text-green-300 font-bold">+{{ getDailyReturn(investment) }} EP/日</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- サイコロセクション -->
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🎲 学習サイコロ
            </h3>
            
            <!-- サイコロ表示 -->
            <div class="text-center mb-6">
              <div class="relative inline-block">
                <button
                  @click="rollDice"
                  :disabled="isRolling"
                  class="dice-button bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-4xl font-bold w-20 h-20 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-xl"
                >
                  <span v-if="isRolling">🔄</span>
                  <span v-else-if="currentDiceResult">{{ currentDiceResult }}</span>
                  <span v-else>🎲</span>
                </button>
                
                <!-- サイコロの状態表示 -->
                <div v-if="isRolling" class="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  🔄
                </div>
                
                <div v-if="currentDiceResult && !isRolling" class="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {{ currentDiceResult }}
                </div>
              </div>
              
              <div class="mt-3">
                <span v-if="isRolling" class="text-white/80 text-sm">サイコロを振っています...</span>
                <span v-else-if="currentDiceResult" class="text-white/80 text-sm">結果: {{ currentDiceResult }}</span>
                <span v-else class="text-white/80 text-sm">サイコロをクリックして振ってください</span>
              </div>
            </div>

            <!-- おすすめアクション -->
            <div v-if="diceRecommendation" class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 mb-4 border border-purple-500/30">
              <div class="flex items-start gap-3">
                <div class="text-2xl">{{ diceRecommendation.icon }}</div>
                <div class="flex-1">
                  <div class="text-white font-bold mb-1">{{ diceRecommendation.title }}</div>
                  <div class="text-white/80 text-sm leading-relaxed">{{ diceRecommendation.description }}</div>
                  <button
                    @click="diceRecommendation.action"
                    class="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    アクション実行
                  </button>
                </div>
              </div>
            </div>

            <!-- 今日の進捗サマリー -->
            <div class="bg-white/5 rounded-xl p-4 mb-4">
              <h4 class="text-white font-bold mb-3 text-center">📊 今日の進捗サマリー</h4>
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm text-white/80 mb-1">
                    <span>📚 学習進捗</span>
                    <span>{{ dailyGoals.learning }}%</span>
                  </div>
                  <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" :style="{ width: dailyGoals.learning + '%' }">
                      <div class="animate-pulse bg-white/30 h-full w-full"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between text-sm text-white/80 mb-1">
                    <span>💼 投資目標</span>
                    <span>{{ dailyGoals.investment }} EP</span>
                  </div>
                  <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" :style="{ width: Math.min(100, (portfolioStats.totalInvestment / dailyGoals.investment) * 100) + '%' }">
                      <div class="animate-pulse bg-white/30 h-full w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- サイコロ履歴 -->
            <div class="bg-white/5 rounded-xl p-4">
              <h4 class="text-white font-bold mb-3 text-center">📜 サイコロ履歴</h4>
              <div class="grid grid-cols-5 gap-2">
                <div 
                  v-for="(result, index) in diceHistory.slice(-10)" 
                  :key="index"
                  class="bg-white/10 rounded-lg p-2 text-center text-sm"
                  :class="{ 'bg-yellow-500/30 border border-yellow-500/50': index === diceHistory.length - 1 }"
                >
                  <div class="text-lg">{{ result }}</div>
                  <div class="text-xs text-white/60">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学習進捗 -->
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📚 学習進捗
            </h3>
            
            <div class="space-y-3">
              <div v-for="(progress, gameType) in learningProgress" :key="gameType" class="space-y-1">
                <div class="flex justify-between text-sm">
                  <span class="text-white/80">{{ getGameLabel(gameType) }}:</span>
                  <span class="text-white font-bold">{{ progress.progress || 0 }}%</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full h-2 transition-all duration-500 relative"
                    :style="{ width: `${progress.progress || 0}%` }"
                  >
                    <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 text-center">
              <button
                @click="goToLearning()"
                class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                📖 学習を続ける
              </button>
            </div>
          </div>

          <!-- クイックアクション -->
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              ⚡ クイックアクション
            </h3>
            
            <div class="space-y-3">
              <button
                @click="startBoardGame"
                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                🗺️ 従来のボードゲーム
              </button>
              
              <button
                @click="startMomotetsuGame"
                class="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                🚂 Galaxy桃鉄ゲーム
              </button>
              
              <button
                @click="checkDailyReturns"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                💰 日次リターン確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ボードゲームモーダル -->
      <div v-if="showBoardGameModal" class="fixed inset-0 bg-black/90 z-50">
        <GalaxyBoardMap 
          @back="closeBoardGame"
          @tile-reached="handleTileReached"
          @event-triggered="handleBoardEvent"
        />
      </div>
      
      <!-- 桃鉄ゲームモーダル -->
      <div v-if="showMomotetsuGameModal" class="fixed inset-0 bg-black/90 z-50">
        <MomotetsuGameBoard 
          @back="closeMomotetsuGame"
        />
      </div>

      <!-- 投資モーダル -->
      <div v-if="showInvestmentModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div class="text-center">
            <div class="text-4xl mb-4">{{ selectedPlanet?.emoji }}</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedPlanet?.name }}</h3>
            <p class="text-gray-600 mb-4">{{ selectedPlanet?.theme }}</p>
            
            <!-- CEO紹介 -->
            <div class="bg-blue-50 rounded-2xl p-4 mb-6">
              <div class="text-sm text-blue-800">
                <div class="font-bold mb-1">👨‍💼 CEO: {{ selectedPlanet?.ceo }}</div>
                <div>事業: {{ selectedPlanet?.businessType }}</div>
              </div>
            </div>

            <!-- 投資オプション -->
            <div class="space-y-3 mb-6">
              <div 
                v-for="(tier, index) in selectedPlanet?.investmentTiers || []" 
                :key="index"
                @click="selectInvestmentTier(index)"
                class="investment-tier-option p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                :class="{
                  'border-blue-500 bg-blue-50': selectedTierIndex === index,
                  'border-gray-200 hover:border-gray-300': selectedTierIndex !== index,
                  'opacity-50 cursor-not-allowed': availableEnergy < tier.cost
                }"
              >
                <div class="flex justify-between items-center">
                  <div class="text-left">
                    <div class="font-bold text-sm">{{ tier.label }}</div>
                    <div class="text-xs text-gray-600">日次: +{{ tier.dailyReturn }} EP</div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-lg">{{ tier.cost }}</div>
                    <div class="text-xs text-gray-600">EP</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 投資教育メッセージ -->
            <div class="bg-yellow-50 rounded-2xl p-4 mb-6">
              <div class="text-sm text-yellow-800">
                <div class="font-bold mb-1">💡 投資の学習</div>
                <div>{{ getInvestmentEducationMessage() }}</div>
              </div>
            </div>

            <!-- アクションボタン -->
            <div class="flex gap-3">
              <button
                @click="closeInvestmentModal"
                class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                キャンセル
              </button>
              <button
                @click="executeInvestment"
                :disabled="selectedTierIndex === null || !canAffordInvestment"
                class="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                投資実行
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Menu, RefreshCw } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import PlanetCorporationCard from './PlanetCorporationCard.vue'
import GalaxyBoardMap from '../board/GalaxyBoardMap.vue'
import MomotetsuGameBoard from '@/games/momotetsu/components/GameBoard.vue'

export default {
  name: 'GalaxyTradingDashboard',
  components: {
    Home,
    Menu,
    RefreshCw,
    PlanetCorporationCard,
    GalaxyBoardMap,
    MomotetsuGameBoard
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const showWelcomeModal = ref(!galaxyStore.isEnabled)
    const showInvestmentModal = ref(false)
    const showBoardGameModal = ref(false)
    const showMomotetsuGameModal = ref(false)
    const showMobileMenu = ref(false)
    const selectedPlanet = ref(null)
    const selectedTierIndex = ref(null)
    const isRolling = ref(false)
    const currentDiceResult = ref(null)
    const diceRecommendation = ref(null) // オブジェクト形式に変更
    const diceHistory = ref([])
    
    // 背景星エフェクト
    const backgroundStars = ref([])
    
    // 日次目標
    const dailyGoals = ref({
      learning: 75,
      investment: 500,
      planets: 1
    })
    
    // === 計算プロパティ ===
    const planetCorporations = computed(() => galaxyStore.planetCorporations)
    const planetUnlockStatus = computed(() => galaxyStore.planetUnlockStatus)
    const availableEnergy = computed(() => galaxyStore.availableEnergy)
    const portfolioStats = computed(() => galaxyStore.portfolioStats)
    const playerInvestments = computed(() => galaxyStore.playerInvestments)
    const learningProgress = computed(() => galaxyStore.learningProgress)
    
    const canAffordInvestment = computed(() => {
      if (selectedTierIndex.value === null || !selectedPlanet.value) return false
      const tier = selectedPlanet.value.investmentTiers[selectedTierIndex.value]
      return availableEnergy.value >= tier.cost
    })
    
    // === メソッド ===
    
    /**
     * 背景星の生成
     */
    const generateBackgroundStars = () => {
      backgroundStars.value = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5
      }))
    }
    
    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
    }
    
    const closeWelcomeModal = () => {
      showWelcomeModal.value = false
      galaxyStore.enableGalaxyTrading()
    }
    
    const goHome = () => {
      router.push('/')
    }
    
    const goToLearning = (gameType = null) => {
      if (gameType) {
        // 特定のゲームに直接移動
        const gameRoutes = {
          cvcWord: '/apple-planet',
          blendingBuilder: '/robot-planet',
          grammar: '/grammar-moon'
        }
        router.push(gameRoutes[gameType] || '/')
      } else {
        // 学習ハブに移動
        router.push('/platforms/phonics-adventure')
      }
    }
    
    const getInvestmentStatus = (planetId) => {
      const investments = playerInvestments.value.ownedPlanets.filter(
        inv => inv.planetId === planetId
      )
      return {
        hasInvestment: investments.length > 0,
        investmentCount: investments.length,
        totalValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0)
      }
    }
    
    const openInvestmentModal = (planet) => {
      selectedPlanet.value = planet
      selectedTierIndex.value = null
      showInvestmentModal.value = true
    }
    
    const closeInvestmentModal = () => {
      showInvestmentModal.value = false
      selectedPlanet.value = null
      selectedTierIndex.value = null
    }
    
    const selectInvestmentTier = (tierIndex) => {
      const tier = selectedPlanet.value.investmentTiers[tierIndex]
      if (availableEnergy.value >= tier.cost) {
        selectedTierIndex.value = tierIndex
      }
    }
    
    const executeInvestment = async () => {
      if (selectedTierIndex.value === null || !canAffordInvestment.value) return
      
      try {
        const investment = galaxyStore.investInPlanet(
          selectedPlanet.value.id,
          selectedTierIndex.value
        )
        
        // 成功通知
        const tier = selectedPlanet.value.investmentTiers[selectedTierIndex.value]
        alert(`🎉 投資成功！\n${selectedPlanet.value.name}の「${tier.label}」に投資しました。\n日次リターン: ${tier.dailyReturn} EP`)
        
        closeInvestmentModal()
        
      } catch (error) {
        alert(`❌ 投資実行エラー: ${error.message}`)
        logger.error('投資実行エラー:', error)
      }
    }
    
    // === サイコロ関連メソッド ===
    const rollDice = async () => {
      if (isRolling.value) return
      
      try {
        isRolling.value = true
        diceRecommendation.value = null
        
        // サイコロアニメーション
        for (let i = 0; i < 5; i++) {
          currentDiceResult.value = Math.floor(Math.random() * 6) + 1
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        // 最終結果
        const finalResult = Math.floor(Math.random() * 6) + 1
        currentDiceResult.value = finalResult
        
        // 履歴に追加
        diceHistory.value.push(finalResult)
        if (diceHistory.value.length > 10) {
          diceHistory.value = diceHistory.value.slice(-10)
        }
        
        // 結果に基づくアクション提案
        setTimeout(() => {
          showActionSuggestion(finalResult)
        }, 500)
        
      } catch (error) {
        logger.error('サイコロロールエラー:', error)
        currentDiceResult.value = 1
      } finally {
        isRolling.value = false
      }
    }

    const showActionSuggestion = (diceResult) => {
      const suggestions = [
        {
          title: '🌍 惑星探検',
          action: () => startBoardGame(),
          description: '新しい惑星を発見して投資チャンスを探しましょう！',
          icon: '🗺️',
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: '📚 英語学習',
          action: () => goToLearning(),
          description: '英語スキルを向上させて投資判断力を高めましょう！',
          icon: '🎓',
          color: 'from-green-500 to-emerald-500'
        },
        {
          title: '💼 投資管理',
          action: () => scrollToPortfolio(),
          description: '現在の投資ポートフォリオを確認・調整しましょう！',
          icon: '📊',
          color: 'from-purple-500 to-pink-500'
        },
        {
          title: '🎯 目標確認',
          action: () => showLearningGoals(),
          description: '今日の学習・投資目標を確認しましょう！',
          icon: '��',
          color: 'from-yellow-500 to-orange-500'
        },
        {
          title: '🚀 新惑星解禁',
          action: () => unlockNewPlanet(),
          description: '新しい惑星を解禁して投資の幅を広げましょう！',
          icon: '🔓',
          color: 'from-red-500 to-pink-500'
        },
        {
          title: '💰 収益確認',
          action: () => checkDailyReturns(),
          description: '今日の投資収益を確認しましょう！',
          icon: '💎',
          color: 'from-indigo-500 to-purple-500'
        }
      ]
      
      const suggestion = suggestions[diceResult - 1]
      diceRecommendation.value = {
        title: suggestion.title,
        description: suggestion.description,
        icon: suggestion.icon,
        color: suggestion.color,
        action: suggestion.action
      }
      
      // 自動的にアクションを実行するか確認
      if (confirm(`${suggestion.title}\n\n${suggestion.description}\n\nこのアクションを実行しますか？`)) {
        suggestion.action()
      }
    }

    // === 新機能: 惑星解禁システム ===
    const unlockNewPlanet = () => {
      const lockedPlanets = Object.entries(planetUnlockStatus.value)
        .filter(([_, status]) => !status.unlocked)
        .map(([planetId, status]) => ({ planetId, ...status }))
      
      if (lockedPlanets.length === 0) {
        alert('🎉 すべての惑星が解禁されています！')
        return
      }
      
      // ランダムに惑星を選択
      const randomPlanet = lockedPlanets[Math.floor(Math.random() * lockedPlanets.length)]
      const planet = planetCorporations.value[randomPlanet.planetId]
      
      if (planet) {
        // 解禁条件をチェック
        if (canUnlockPlanet(randomPlanet.planetId)) {
          planetUnlockStatus.value[randomPlanet.planetId].unlocked = true
          planetUnlockStatus.value[randomPlanet.planetId].unlockedAt = new Date().toISOString()
          
          alert(`🔓 新惑星解禁！\n\n${planet.name}\n${planet.theme}\n\nこの惑星への投資が可能になりました！`)
          
          // 投資モーダルを表示
          selectedPlanet.value = planet
          showInvestmentModal.value = true
        } else {
          alert(`🔒 ${planet.name}の解禁には以下の条件が必要です：\n\n${getUnlockRequirements(randomPlanet.planetId)}`)
        }
      }
    }

    const canUnlockPlanet = (planetId) => {
      const requirements = planetUnlockStatus.value[planetId]?.requirements || {}
      
      // 学習進捗チェック
      if (requirements.learningProgress && dailyGoals.value.learning < requirements.learningProgress) {
        return false
      }
      
      // 投資額チェック
      if (requirements.totalInvestment && portfolioStats.value.totalInvestment < requirements.totalInvestment) {
        return false
      }
      
      // 惑星数チェック
      if (requirements.visitedPlanets && portfolioStats.value.totalPlanets < requirements.visitedPlanets) {
        return false
      }
      
      return true
    }

    const getUnlockRequirements = (planetId) => {
      const requirements = planetUnlockStatus.value[planetId]?.requirements || {}
      const reqs = []
      
      if (requirements.learningProgress) {
        reqs.push(`📚 学習進捗: ${requirements.learningProgress}%以上`)
      }
      if (requirements.totalInvestment) {
        reqs.push(`💼 総投資額: ${requirements.totalInvestment} EP以上`)
      }
      if (requirements.visitedPlanets) {
        reqs.push(`🌍 訪問惑星数: ${requirements.visitedPlanets}個以上`)
      }
      
      return reqs.join('\n')
    }

    // === ボードゲーム連携強化 ===
    const handleTileReached = (tile) => {
      logger.log(`📍 ボードゲーム: ${tile.name}に到達`)
      
      // ボードゲームからダッシュボードへの連携
      if (tile.type === 'planet' && tile.property) {
        const planet = planetCorporations.value[tile.property]
        if (planet) {
          // 惑星が解禁されているかチェック
          if (planetUnlockStatus.value[tile.property]?.unlocked) {
            // 惑星への投資チャンスを提供
            setTimeout(() => {
              selectedPlanet.value = planet
              showInvestmentModal.value = true
              showBoardGameModal.value = false
              
              // 投資教育メッセージを表示
              alert(`🌍 ${planet.name}に到着！\n\n${planet.theme}\n\nこの惑星への投資を検討してみましょう！`)
            }, 1000)
          } else {
            // 惑星解禁の条件を表示
            const requirements = getUnlockRequirements(tile.property)
            alert(`🔒 ${planet.name}はまだ解禁されていません\n\n解禁条件：\n${requirements}`)
          }
        }
      } else if (tile.type === 'event') {
        // イベントタイルの効果
        const eventRewards = {
          energy: Math.floor(Math.random() * 50) + 25,
          learning: Math.floor(Math.random() * 10) + 5
        }
        
        availableEnergy.value += eventRewards.energy
        dailyGoals.value.learning = Math.min(100, dailyGoals.value.learning + eventRewards.learning)
        
        alert(`⭐ 特別イベント！\n\n+${eventRewards.energy} EP\n+${eventRewards.learning}% 学習進捗\n\n素晴らしい発見でした！`)
      } else if (tile.type === 'bonus') {
        // ボーナスタイルの効果
        const bonusAmount = Math.floor(Math.random() * 100) + 50
        availableEnergy.value += bonusAmount
        
        alert(`💰 ボーナス獲得！\n\n+${bonusAmount} EP\n\nラッキー！`)
      }
    }

    const handleBoardEvent = (eventData) => {
      logger.log('🎲 ボードゲームイベント:', eventData)
      // 必要に応じてダッシュボードのデータを更新
    }

    // === ボードゲーム関連メソッド ===
    const startBoardGame = () => {
      showBoardGameModal.value = true
      showMobileMenu.value = false
      logger.log('🎮 ボードゲームモード開始')
    }

    const closeBoardGame = () => {
      showBoardGameModal.value = false
      logger.log('🎮 ボードゲームモード終了')
    }
    
    // === 桃鉄ゲーム関連メソッド ===
    const startMomotetsuGame = () => {
      try {
        logger.log('🚂 Galaxy桃鉄ゲーム開始前チェック')
        showMomotetsuGameModal.value = true
        showMobileMenu.value = false
        logger.log('🚂 Galaxy桃鉄ゲームモード開始')
      } catch (error) {
        logger.error('🚂 Galaxy桃鉄ゲーム開始エラー:', error)
        alert('ゲームの開始に失敗しました。ページをリロードしてお試しください。')
      }
    }

    const closeMomotetsuGame = () => {
      showMomotetsuGameModal.value = false
      logger.log('🚂 Galaxy桃鉄ゲームモード終了')
    }

    // === 不足している関数を追加 ===
    const scrollToPortfolio = () => {
      const portfolioElement = document.querySelector('.bg-white\\/10.backdrop-blur-sm.rounded-2xl')
      if (portfolioElement) {
        portfolioElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    const showLearningGoals = () => {
      const goals = [
        `📚 今日の学習目標: ${dailyGoals.value.learning}%の進捗`,
        `💼 投資目標: ${dailyGoals.value.investment} EP`,
        `🌍 新惑星解禁目標: ${dailyGoals.value.planets}個`
      ]
      
      alert(`🎯 今日の目標\n\n${goals.join('\n')}\n\n頑張りましょう！`)
    }

    const prepareVRExperience = (planetId) => {
      router.push({
        path: '/vr-academy',
        query: { planet: planetId }
      })
    }

    const getPlanetName = (planetId) => {
      return planetCorporations.value[planetId]?.name || planetId
    }

    const getDailyReturn = (investment) => {
      const planet = planetCorporations.value[investment.planetId]
      const tier = planet?.investmentTiers[investment.tier]
      return tier?.dailyReturn || 0
    }

    const getRiskColor = (riskLevel) => {
      const colors = {
        low: 'text-green-300',
        medium: 'text-yellow-300',
        high: 'text-red-300',
        none: 'text-gray-300'
      }
      return colors[riskLevel] || colors.none
    }

    const getRiskLabel = (riskLevel) => {
      const labels = {
        low: '低リスク',
        medium: '中リスク',
        high: '高リスク',
        none: 'リスクなし'
      }
      return labels[riskLevel] || labels.none
    }

    const getGameLabel = (gameType) => {
      const labels = {
        cvcWord: 'CVC Word',
        blendingBuilder: 'Blending',
        grammar: 'Grammar'
      }
      return labels[gameType] || gameType
    }

    const getInvestmentEducationMessage = () => {
      if (selectedTierIndex.value === null) {
        return '投資は応援の気持ちです。リスクとリターンを理解して選択しましょう。'
      }
      
      const tier = selectedPlanet.value.investmentTiers[selectedTierIndex.value]
      const dailyReturn = tier.dailyReturn
      const cost = tier.cost
      const roi = ((dailyReturn * 30) / cost * 100).toFixed(1)
      
      return `この投資の月次リターン率は約${roi}%です。長期的な視点で考えてみましょう。`
    }

    // === 新機能: 惑星データ更新 ===
    const refreshPlanets = () => {
      logger.log('🔄 惑星データを更新中...')
      // 実際の実装ではAPIコールなどを行う
      alert('🔄 惑星データを更新しました！')
    }

    const checkDailyReturns = () => {
      // 日次リターンの確認
      const totalReturn = portfolioStats.value.dailyIncome
      if (totalReturn > 0) {
        alert(`🎊 日次リターン: +${totalReturn} EP\n\n投資が実を結んでいます！`)
      } else {
        alert('📅 まだ日次リターンの時間ではありません\n\n投資を継続しましょう！')
      }
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🌌 Galaxy Trading Dashboard 初期化')
      generateBackgroundStars()
      
      // Galaxy Trading システムが無効な場合は有効化
      if (!galaxyStore.isEnabled) {
        logger.log('⚡ Galaxy Trading システムを有効化中...')
      }
      
      // アプリ起動時のデイリーリターンチェック
      const returnsResult = galaxyStore.checkDailyReturnsOnStartup()
      if (returnsResult?.calculated && returnsResult.totalReturn > 0) {
        logger.log(`🎊 ダッシュボード起動時にデイリーリターンを受け取りました: ${returnsResult.totalReturn} EP`)
      }
    })
    
    return {
      // State
      showWelcomeModal,
      showInvestmentModal,
      showBoardGameModal,
      showMomotetsuGameModal,
      showMobileMenu,
      selectedPlanet,
      selectedTierIndex,
      isRolling,
      currentDiceResult,
      diceRecommendation,
      diceHistory,
      backgroundStars,
      dailyGoals,
      
      // Computed
      planetCorporations,
      planetUnlockStatus,
      availableEnergy,
      portfolioStats,
      playerInvestments,
      learningProgress,
      canAffordInvestment,
      
      // Methods
      toggleMobileMenu,
      closeWelcomeModal,
      goHome,
      goToLearning,
      getInvestmentStatus,
      openInvestmentModal,
      closeInvestmentModal,
      selectInvestmentTier,
      executeInvestment,
      rollDice,
      prepareVRExperience,
      getPlanetName,
      getDailyReturn,
      getRiskColor,
      getRiskLabel,
      getGameLabel,
      getInvestmentEducationMessage,
      
      // Board Game Methods
      startBoardGame,
      closeBoardGame,
      startMomotetsuGame,
      closeMomotetsuGame,
      handleTileReached,
      handleBoardEvent,

      // New Methods
      refreshPlanets,
      checkDailyReturns,
      showActionSuggestion,
      scrollToPortfolio,
      showLearningGoals,
      unlockNewPlanet,
      canUnlockPlanet,
      getUnlockRequirements
    }
  }
}
</script>

<style scoped>
/* 星の瞬きアニメーション */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* サイコロアニメーション */
.animate-bounce {
  animation: bounce 0.5s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 投資ティアオプション */
.investment-tier-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* カスタムスクロールバー */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* フェードイン効果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container > * {
  animation: fadeIn 0.6s ease-out;
}

/* ホバーエフェクト */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .grid-cols-1.lg\\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .lg\\:col-span-2 {
    grid-column: span 1;
  }
  
  .text-3xl {
    font-size: 1.5rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .text-3xl {
    font-size: 1.25rem;
  }
  
  .text-2xl {
    font-size: 1.125rem;
  }
}

/* アニメーション */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>