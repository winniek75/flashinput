<template>
  <div class="recommendation-display">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>推奨ミッションを分析中...</p>
    </div>
    
    <div v-else class="recommendation-content">
      <div class="recommendation-header">
        <span class="header-icon">🎯</span>
        <h3>{{ playerName }}さんへの推奨ミッション</h3>
      </div>
      
      <div class="progress-overview">
        <div class="progress-bar">
          <div class="progress-fill" :style="`width: ${currentProgress}%`"></div>
        </div>
        <p class="progress-text">{{ worldName }}の進捗: {{ currentProgress }}%</p>
      </div>
      
      <div class="recommendation-card" v-if="recommendedGame">
        <div class="card-header">
          <span class="difficulty-badge" :class="`difficulty-${difficulty}`">
            {{ difficultyText }}
          </span>
          <span class="recommendation-badge">おすすめ</span>
        </div>
        
        <div class="card-content">
          <h4 class="game-name">{{ gameDisplayName }}</h4>
          <p class="game-description">{{ gameDescription }}</p>
          
          <div class="learning-points">
            <h5>学習ポイント:</h5>
            <ul>
              <li v-for="point in learningPoints" :key="point">{{ point }}</li>
            </ul>
          </div>
        </div>
        
        <button @click="startRecommendedGame" class="start-button">
          <span class="button-icon">🚀</span>
          <span>このミッションを開始</span>
        </button>
      </div>
      
      <div class="alternative-recommendations" v-if="alternativeGames.length > 0">
        <h4>その他の推奨ミッション:</h4>
        <div class="alternative-list">
          <div 
            v-for="game in alternativeGames" 
            :key="game.name"
            class="alternative-item"
            @click="selectAlternative(game)"
          >
            <span class="game-icon">🎮</span>
            <span class="game-name">{{ getGameDisplayName(game.name) }}</span>
            <span class="difficulty-indicator" :class="`level-${game.difficulty}`">
              {{ '★'.repeat(game.difficulty) }}
            </span>
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
import { getRecommendedGame, getNextRecommendedGames } from '@/utils/recommendationEngine'

export default {
  name: 'ProgressBasedRecommendation',
  props: {
    worldId: {
      type: String,
      required: true
    },
    worldName: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const router = useRouter()
    const gameStore = useGameStore()
    
    const loading = ref(true)
    const recommendedGame = ref(null)
    const alternativeGames = ref([])
    const currentProgress = ref(0)
    
    // ゲーム名のマッピング
    const gameDisplayNames = {
      PureSoundLab: 'フォニーム・セイバー',
      'pure-sound-lab': 'フォニーム・セイバー',
      SinglePhonemeGame: '単一音素ゲーム',
      SoundHunterGame: 'サウンドハンター',
      PhonicsTrainingHub: 'フォニックス訓練場',
      SequentialBlendingGame: '連続ブレンディング',
      CvcWordGame: 'CVC単語工場',
      MagicCastleJumpGame: 'マジックキャッスルジャンプ',
      SilentLetterDetectiveGame: 'サイレントレター探偵',
      ComplexPhonemePatternsGame: '複雑音素パターン',
      SentenceBuilderMaster: '英作文マスター',
      BeVerbRush: 'Be動詞ラッシュ',
      PatternHunterGame: 'パターンハンター',
      ModalVerbChallengeGame: '助動詞チャレンジ',
      TimeZoneNavigatorGame: 'タイムゾーンナビゲーター',
      WordRushGame: 'ワードラッシュ'
    }
    
    const gameDescriptions = {
      PureSoundLab: 'ビートセイバー風のリズムゲームで音素を楽しく学習します',
      'pure-sound-lab': 'ビートセイバー風のリズムゲームで音素を楽しく学習します',
      SinglePhonemeGame: '単一音素のパターンを視覚的に理解します',
      SoundHunterGame: '音とシンボルを正確にマッチングする力を養います',
      PhonicsTrainingHub: '子音と母音の組み合わせを練習します',
      SequentialBlendingGame: '音素を滑らかにつなげる技術を習得します',
      CvcWordGame: '子音-母音-子音の基本単語パターンを学習します',
      MagicCastleJumpGame: 'マジックEルールを楽しく学びます',
      SilentLetterDetectiveGame: '発音しない文字を見つける探偵になります',
      ComplexPhonemePatternsGame: '高度な音素パターンに挑戦します',
      SentenceBuilderMaster: '段階的に英文構造を学び、英作文能力を向上させます',
      BeVerbRush: 'am/is/areを瞬時に選択する反射神経を鍛えます',
      PatternHunterGame: '文法パターンを素早く見つける力を養います',
      ModalVerbChallengeGame: 'can, may, must, shouldの使い分けをマスターします',
      TimeZoneNavigatorGame: '時制を自在に操る力を身につけます',
      WordRushGame: '語彙を効率的に学習し、瞬時に認識する力を養います'
    }
    
    const learningPointsMap = {
      PureSoundLab: ['リズム感による音素学習', 'タイミング重視の反応力', '楽しい没入型体験'],
      'pure-sound-lab': ['リズム感による音素学習', 'タイミング重視の反応力', '楽しい没入型体験'],
      SinglePhonemeGame: ['音素パターンの理解', '視覚と聴覚の統合', '音素の分類'],
      SoundHunterGame: ['音とシンボルの関連付け', '聴覚記憶の強化', '音素認識の自動化'],
      PhonicsTrainingHub: ['CV組み合わせ', '音の連結', '発音の流暢性'],
      SequentialBlendingGame: ['音素の連続', 'スムーズな発音', '音の流れの理解'],
      CvcWordGame: ['基本単語構造', '音素の組み合わせ', '単語認識力'],
      MagicCastleJumpGame: ['マジックEルール', '長母音の理解', '音の変化パターン'],
      SilentLetterDetectiveGame: ['サイレントレターの識別', 'スペリングルール', '例外パターンの理解'],
      ComplexPhonemePatternsGame: ['高度な音素組み合わせ', '例外的な発音', '応用力'],
      SentenceBuilderMaster: ['英文構造理解', 'ドラッグ&ドロップ操作', '段階的学習'],
      BeVerbRush: ['主語とbe動詞の一致', '瞬間的判断力', '基本文法の定着'],
      PatternHunterGame: ['文法パターン認識', '規則性の発見', '分析力'],
      ModalVerbChallengeGame: ['助動詞の意味', '文脈での使い分け', '実践的応用'],
      TimeZoneNavigatorGame: ['時制の理解', '時間表現', '文法の統合'],
      WordRushGame: ['語彙の拡張', '瞬間認識力', '文脈理解']
    }
    
    const playerName = computed(() => gameStore.playerData.name || 'ガーディアン')
    
    const gameDisplayName = computed(() => {
      if (!recommendedGame.value) return ''
      return gameDisplayNames[recommendedGame.value.name] || recommendedGame.value.name
    })
    
    const gameDescription = computed(() => {
      if (!recommendedGame.value) return ''
      return gameDescriptions[recommendedGame.value.name] || ''
    })
    
    const learningPoints = computed(() => {
      if (!recommendedGame.value) return []
      return learningPointsMap[recommendedGame.value.name] || []
    })
    
    const difficulty = computed(() => {
      if (!currentProgress.value) return 'beginner'
      if (currentProgress.value < 30) return 'beginner'
      if (currentProgress.value < 70) return 'intermediate'
      return 'advanced'
    })
    
    const difficultyText = computed(() => {
      const texts = {
        beginner: '初級',
        intermediate: '中級',
        advanced: '上級'
      }
      return texts[difficulty.value]
    })
    
    const getGameDisplayName = (gameName) => {
      return gameDisplayNames[gameName] || gameName
    }
    
    const loadRecommendations = () => {
      loading.value = true
      
      // 現在の進捗を計算
      currentProgress.value = calculateWorldProgress()
      
      // 推奨ゲームを取得
      recommendedGame.value = getRecommendedGame(props.worldId)
      
      // 代替ゲームを取得
      alternativeGames.value = getNextRecommendedGames(props.worldId, 3)
        .filter(game => game.name !== recommendedGame.value?.name)
      
      loading.value = false
    }
    
    const calculateWorldProgress = () => {
      // recommendationEngine.jsの計算ロジックを再利用
      const gameStore = useGameStore()
      
      switch(props.worldId) {
        case 'phonics':
          return calculatePhonicsProgress(gameStore)
        case 'grammar':
          return calculateGrammarProgress(gameStore)
        case 'vocabulary':
          return calculateVocabularyProgress(gameStore)
        default:
          return 0
      }
    }
    
    // 進捗計算関数（recommendationEngine.jsから複製）
    const calculatePhonicsProgress = (gameStore) => {
      const phonicsGames = [
        'pureSoundLab', 'singlePhoneme', 'soundHunter', 'phonicsTrainingHub',
        'sequentialBlending', 'blendingBuilder', 'cvcWord', 'rhyming',
        'magicCastleJump', 'magicCardBattle', 'spellRacing', 'magicCooking',
        'voicePuzzle', 'silentLetterDetective', 'complexPhonemePatterns'
      ]
      
      let totalProgress = 0
      let gameCount = 0
      
      phonicsGames.forEach(gameId => {
        if (gameStore.gameProgress[gameId]) {
          totalProgress += gameStore.gameProgress[gameId].progress || 0
          gameCount++
        }
      })
      
      return gameCount > 0 ? Math.round(totalProgress / gameCount) : 0
    }
    
    const calculateGrammarProgress = (gameStore) => {
      const grammarGames = [
        'grammarColorCode', 'beVerbRush', 'patternHunter', 
        'modalVerbChallenge', 'timeZoneNavigator'
      ]
      
      let totalProgress = 0
      let gameCount = 0
      
      grammarGames.forEach(gameId => {
        if (gameStore.gameProgress[gameId]) {
          totalProgress += gameStore.gameProgress[gameId].progress || 0
          gameCount++
        }
      })
      
      return gameCount > 0 ? Math.round(totalProgress / gameCount) : 0
    }
    
    const calculateVocabularyProgress = (gameStore) => {
      const vocabGames = ['wordRush']
      
      let totalProgress = 0
      let gameCount = 0
      
      vocabGames.forEach(gameId => {
        if (gameStore.gameProgress[gameId]) {
          totalProgress += gameStore.gameProgress[gameId].progress || 0
          gameCount++
        }
      })
      
      return gameCount > 0 ? Math.round(totalProgress / gameCount) : 0
    }
    
    const startRecommendedGame = () => {
      if (recommendedGame.value) {
        router.push(recommendedGame.value)
      }
    }
    
    const selectAlternative = (game) => {
      router.push({ name: game.name })
    }
    
    onMounted(() => {
      loadRecommendations()
    })
    
    return {
      loading,
      recommendedGame,
      alternativeGames,
      currentProgress,
      playerName,
      gameDisplayName,
      gameDescription,
      learningPoints,
      difficulty,
      difficultyText,
      getGameDisplayName,
      startRecommendedGame,
      selectAlternative
    }
  }
}
</script>

<style scoped>
.recommendation-display {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-top: 3px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.header-icon {
  font-size: 24px;
}

.recommendation-header h3 {
  margin: 0;
  color: #00ffff;
  font-size: 20px;
}

.progress-overview {
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #00ff7f);
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.recommendation-card {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.difficulty-beginner {
  background: rgba(0, 255, 127, 0.2);
  color: #00ff7f;
  border: 1px solid #00ff7f;
}

.difficulty-intermediate {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid #ffd700;
}

.difficulty-advanced {
  background: rgba(255, 69, 0, 0.2);
  color: #ff4500;
  border: 1px solid #ff4500;
}

.recommendation-badge {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid #00ffff;
}

.game-name {
  font-size: 22px;
  color: #ffffff;
  margin: 0 0 10px 0;
}

.game-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.5;
}

.learning-points {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.learning-points h5 {
  margin: 0 0 10px 0;
  color: #00ffff;
  font-size: 14px;
}

.learning-points ul {
  margin: 0;
  padding-left: 20px;
}

.learning-points li {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
  font-size: 14px;
}

.start-button {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #00ffff, #00ff7f);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.4);
}

.button-icon {
  font-size: 20px;
}

.alternative-recommendations {
  margin-top: 30px;
}

.alternative-recommendations h4 {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  font-size: 16px;
}

.alternative-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alternative-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alternative-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
  transform: translateX(5px);
}

.game-icon {
  font-size: 18px;
}

.alternative-item .game-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.difficulty-indicator {
  color: #ffd700;
  font-size: 12px;
}

.level-1 { color: #00ff7f; }
.level-2 { color: #7fff00; }
.level-3 { color: #ffd700; }
.level-4 { color: #ff8c00; }
.level-5 { color: #ff4500; }
</style>