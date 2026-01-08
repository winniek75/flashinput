// 統合プログレッションシステム - ゲーム統合ユーティリティ
import { useProgressStore } from '@/stores/progress'
import logger from '@/utils/logger'

/**
 * 全ゲーム共通の結果記録関数
 * @param {Object} gameData - ゲーム結果データ
 * @param {string} gameData.gameType - ゲームタイプ
 * @param {number} gameData.score - スコア
 * @param {number} gameData.accuracy - 正解率 (0-100)
 * @param {number} gameData.timeSpent - プレイ時間（秒）
 * @param {number} gameData.correctAnswers - 正解数
 * @param {number} gameData.totalQuestions - 総問題数
 * @param {number} gameData.correctStreak - 最大連続正解数
 * @param {string} gameData.difficulty - 難易度
 * @param {boolean} gameData.levelCompleted - レベル完了フラグ
 */
export function recordUnifiedGameResult(gameData) {
  const progressStore = useProgressStore()

  // データ検証
  const validatedData = {
    gameType: gameData.gameType || 'unknown',
    score: gameData.score || 0,
    accuracy: gameData.accuracy || 0,
    timeSpent: gameData.timeSpent || 0,
    correctAnswers: gameData.correctAnswers || 0,
    totalQuestions: gameData.totalQuestions || 1,
    correctStreak: gameData.correctStreak || 0,
    difficulty: gameData.difficulty || 'normal',
    levelCompleted: gameData.accuracy >= 80
  }

  // 統合プログレッションシステムに記録
  progressStore.recordGameScore(validatedData)

  logger.log(`✅ ${gameData.gameType} 結果記録完了:`, {
    score: validatedData.score,
    accuracy: validatedData.accuracy,
    skillExp: progressStore.calculateExpFromScore(validatedData),
    nextRecommendation: progressStore.getRecommendedPath?.priority || 'balanced'
  })

  return validatedData
}

/**
 * ゲーム開始時の共通処理
 * @param {string} gameType - ゲームタイプ
 */
export function initializeUnifiedGame(gameType) {
  const progressStore = useProgressStore()

  // セッション開始
  if (progressStore.microAchievements.sessionStreak === 0) {
    progressStore.setDailyGoals()
  }

  logger.log(`🚀 ${gameType} 開始 - 統合プログレッション準備完了`)
}

/**
 * ゲーム終了時の共通処理とマイクロ達成チェック
 * @param {Object} gameData - ゲーム結果データ
 * @param {Object} options - オプション設定
 */
export function completeUnifiedGame(gameData, options = {}) {
  const progressStore = useProgressStore()

  // マイクロ達成をチェック
  progressStore.checkMicroAchievements({
    correctStreak: gameData.correctStreak || 0,
    accuracy: gameData.accuracy || 0,
    totalQuestions: gameData.totalQuestions || 1
  })

  // 結果を記録
  const result = recordUnifiedGameResult(gameData)

  // 自動継続プロンプト（中毒性要素）
  if (options.showContinuePrompt !== false && result.accuracy >= 70) {
    return {
      ...result,
      showContinuePrompt: true,
      continueMessage: getRandomContinueMessage(result.accuracy),
      recommendedNextGame: progressStore.getRecommendedPath?.games?.[0]
    }
  }

  return result
}

/**
 * 継続プロンプトメッセージ生成
 * @param {number} accuracy - 正解率
 */
function getRandomContinueMessage(accuracy) {
  const messages = {
    perfect: [
      '🔥 完璧です！連続プレイでもっと経験値を稼ぎませんか？',
      '⚡ 素晴らしい！この調子でレベルアップを続けましょう！',
      '🌟 パーフェクト！次のゲームも挑戦してみませんか？'
    ],
    excellent: [
      '👏 素晴らしい結果です！もう1ゲームいかがですか？',
      '🎯 よくできました！連続プレイでボーナス獲得のチャンス！',
      '✨ 調子がいいですね！この勢いを活かしませんか？'
    ],
    good: [
      '👍 いい感じです！練習を続けてさらに上達しましょう！',
      '📈 成長しています！もう少しプレイしてみませんか？',
      '🎮 順調です！続けてプレイするとボーナスがもらえます！'
    ]
  }

  let category = 'good'
  if (accuracy >= 100) category = 'perfect'
  else if (accuracy >= 90) category = 'excellent'

  const categoryMessages = messages[category]
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)]
}

/**
 * ゲーム別のスキルマッピング設定
 */
export const GAME_SKILL_MAPPING = {
  'sound-master': ['phonics', 'listening'],
  'word-rush': ['vocabulary', 'blending'],
  'be-verb-rush': ['grammar'],
  'grammar-color-code': ['grammar'],
  'sight-word-master': ['vocabulary'],
  'typing-arena': ['vocabulary', 'blending'],
  'phonics-training': ['phonics'],
  'pattern-hunter': ['grammar'],
  'verb-pattern-galaxy': ['grammar', 'vocabulary'],
  'sound-farm': ['phonics', 'rhythm'],
  'voice-puzzle': ['pronunciation'],
  'rhythm-tapper': ['rhythm', 'pronunciation'],
  'sequential-blending': ['blending', 'phonics'],
  'cvc-word-game': ['blending', 'vocabulary'],
  'complex-phoneme': ['blending', 'pronunciation']
}

/**
 * ゲームタイプから推奨される次のゲームを取得
 * @param {string} currentGameType
 * @param {Object} progressStore
 */
export function getRecommendedNextGame(currentGameType, progressStore) {
  const currentSkills = GAME_SKILL_MAPPING[currentGameType] || ['phonics']
  const weakestSkill = progressStore.getWeakestSkill?.name

  // 弱いスキルを強化するゲームを推奨
  if (weakestSkill) {
    const skillGames = progressStore.getGamesForSkill(weakestSkill)
    return skillGames.find(game => game !== currentGameType) || skillGames[0]
  }

  // 現在のスキルを継続
  const relatedGames = progressStore.getGamesForSkill(currentSkills[0])
  return relatedGames.find(game => game !== currentGameType) || relatedGames[0]
}