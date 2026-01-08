// 推奨ミッションエンジン - 生徒の進捗に基づいて最適なゲームを推奨
import { useGameStore } from '@/stores/gameStore'

// フォニックスゲームの学習順序と前提条件
const phonicsGameSequence = [
  {
    name: 'pure-sound-lab',
    minProgress: 0,
    maxProgress: 20,
    description: '42音素の基礎認識',
    prerequisites: []
  },
  {
    name: 'phoneme-pattern-lab',
    minProgress: 15,
    maxProgress: 35,
    description: '単一音素パターン学習',
    prerequisites: ['pure-sound-lab']
  },
  {
    name: 'sound-to-symbol',
    minProgress: 25,
    maxProgress: 45,
    description: '音とシンボルのマッチング',
    prerequisites: ['phoneme-pattern-lab']
  },
  {
    name: 'phonics-training-hub',
    minProgress: 35,
    maxProgress: 55,
    description: 'CV発音練習',
    prerequisites: ['sound-to-symbol']
  },
  {
    name: 'SequentialBlendingGame',
    minProgress: 45,
    maxProgress: 65,
    description: '音素ブレンディング',
    prerequisites: ['PhonicsTrainingHub']
  },
  {
    name: 'CvcWordGame',
    minProgress: 55,
    maxProgress: 75,
    description: 'CVC単語工場',
    prerequisites: ['SequentialBlendingGame']
  },
  {
    name: 'MagicCastleJumpGame',
    minProgress: 65,
    maxProgress: 85,
    description: 'マジックEルール',
    prerequisites: ['CvcWordGame']
  },
  {
    name: 'SilentLetterDetectiveGame',
    minProgress: 75,
    maxProgress: 90,
    description: 'サイレントレター探偵',
    prerequisites: ['MagicCastleJumpGame']
  },
  {
    name: 'ComplexPhonemePatternsGame',
    minProgress: 85,
    maxProgress: 100,
    description: '高度な音素パターン',
    prerequisites: ['SilentLetterDetectiveGame']
  }
]

// 文法ゲームの学習順序
const grammarGameSequence = [
  {
    name: 'SentenceBuilderMaster',
    minProgress: 0,
    maxProgress: 25,
    description: '英作文練習マスター',
    prerequisites: []
  },
  {
    name: 'BeVerbRush',
    minProgress: 20,
    maxProgress: 45,
    description: 'be動詞高速練習',
    prerequisites: ['SentenceBuilderMaster']
  },
  {
    name: 'PatternHunterGame',
    minProgress: 40,
    maxProgress: 65,
    description: 'パターン認識',
    prerequisites: ['BeVerbRush']
  },
  {
    name: 'ModalVerbChallengeGame',
    minProgress: 60,
    maxProgress: 85,
    description: '助動詞チャレンジ',
    prerequisites: ['PatternHunterGame']
  },
  {
    name: 'TimeZoneNavigatorGame',
    minProgress: 80,
    maxProgress: 100,
    description: '時制ナビゲーション',
    prerequisites: ['ModalVerbChallengeGame']
  }
]

// 語彙ゲームの学習順序
const vocabularyGameSequence = [
  {
    name: 'WordRushGame',
    minProgress: 0,
    maxProgress: 100,
    description: '高速語彙認識',
    prerequisites: [],
    difficultyLevels: ['beginner', 'intermediate', 'advanced']
  }
]

// 生徒の進捗データを取得
function getStudentProgress(worldId) {
  const gameStore = useGameStore()
  
  // 各ワールドの総合進捗を計算
  switch(worldId) {
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

// フォニックスの進捗計算
function calculatePhonicsProgress(gameStore) {
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

// 文法の進捗計算
function calculateGrammarProgress(gameStore) {
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

// 語彙の進捗計算
function calculateVocabularyProgress(gameStore) {
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

// 推奨ゲームを取得
export function getRecommendedGame(worldId) {
  const progress = getStudentProgress(worldId)
  let gameSequence = []
  
  // ワールドに応じたゲームシーケンスを選択
  switch(worldId) {
    case 'phonics':
      gameSequence = phonicsGameSequence
      break
    case 'grammar':
      gameSequence = grammarGameSequence
      break
    case 'vocabulary':
      gameSequence = vocabularyGameSequence
      break
    default:
      return null
  }
  
  // 現在の進捗に最適なゲームを見つける
  const recommendedGames = gameSequence.filter(game => {
    return progress >= game.minProgress && progress <= game.maxProgress
  })
  
  // 最も適切なゲームを選択（前提条件を満たしているもの）
  for (const game of recommendedGames) {
    if (checkPrerequisites(game.prerequisites)) {
      // 語彙ゲームの場合は難易度レベルも含める
      if (worldId === 'vocabulary' && game.difficultyLevels) {
        const level = getRecommendedDifficulty(progress)
        return {
          name: game.name,
          query: { level }
        }
      }
      return { name: game.name }
    }
  }
  
  // 適切なゲームが見つからない場合は最初のゲームを推奨
  return { name: gameSequence[0].name }
}

// 前提条件をチェック
function checkPrerequisites(prerequisites) {
  if (!prerequisites || prerequisites.length === 0) return true
  
  const gameStore = useGameStore()
  
  // すべての前提条件ゲームがある程度進んでいるかチェック
  return prerequisites.every(gameId => {
    const gameKey = gameId.charAt(0).toLowerCase() + gameId.slice(1)
    const progress = gameStore.gameProgress[gameKey]
    return progress && progress.progress >= 50 // 50%以上で前提条件クリア
  })
}

// 推奨難易度を取得
function getRecommendedDifficulty(progress) {
  if (progress < 30) return 'beginner'
  if (progress < 70) return 'intermediate'
  return 'advanced'
}

// 次の推奨ゲームリストを取得（複数の選択肢を提供）
export function getNextRecommendedGames(worldId, count = 3) {
  const progress = getStudentProgress(worldId)
  let gameSequence = []
  
  switch(worldId) {
    case 'phonics':
      gameSequence = phonicsGameSequence
      break
    case 'grammar':
      gameSequence = grammarGameSequence
      break
    case 'vocabulary':
      gameSequence = vocabularyGameSequence
      break
    default:
      return []
  }
  
  // 現在の進捗に適したゲームをフィルタリング
  const eligibleGames = gameSequence.filter(game => {
    return progress >= game.minProgress - 10 && progress <= game.maxProgress + 10
  })
  
  // 前提条件を満たすゲームのみを返す
  return eligibleGames
    .filter(game => checkPrerequisites(game.prerequisites))
    .slice(0, count)
    .map(game => ({
      name: game.name,
      description: game.description,
      difficulty: Math.round((game.minProgress + game.maxProgress) / 40) // 1-5の難易度
    }))
}