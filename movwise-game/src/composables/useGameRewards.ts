import { ref } from 'vue'
import { useTicketStore } from '@/stores/ticketStore'
import { useMissionStore } from '@/stores/missionStore'
import { useUserStore } from '@/stores/userStore'
import { TICKET_EARN_REASONS } from '@/stores/ticketStore'
import logger from '@/utils/logger'

export interface GameResult {
  gameId: string
  score: number
  accuracy: number
  correctAnswers: number
  totalQuestions: number
  streakCount?: number
  timeElapsed?: number
  difficulty?: string
}

export interface RewardSummary {
  tickets: number
  xp: number
  reasons: string[]
  achievements?: string[]
}

export function useGameRewards() {
  const ticketStore = useTicketStore()
  const missionStore = useMissionStore()
  const userStore = useUserStore()

  const rewardSummary = ref<RewardSummary | null>(null)
  const showRewardModal = ref(false)

  /**
   * ゲーム完了時の報酬計算と付与
   */
  async function processGameCompletion(result: GameResult): Promise<RewardSummary> {
    const rewards: RewardSummary = {
      tickets: 0,
      xp: 0,
      reasons: [],
      achievements: []
    }

    try {
      // 1. 基本ゲームクリア報酬
      const clearReward = calculateClearReward(result)
      if (clearReward.tickets > 0) {
        await ticketStore.earnTicket(clearReward.tickets, TICKET_EARN_REASONS.GAME_CLEAR, {
          gameId: result.gameId,
          score: result.score,
          accuracy: result.accuracy
        })
        rewards.tickets += clearReward.tickets
        rewards.reasons.push(`ゲームクリア: +${clearReward.tickets}枚`)
      }

      // 2. 連続正解ボーナス
      if (result.streakCount && result.streakCount >= 5) {
        const streakBonus = calculateStreakBonus(result.streakCount)
        if (streakBonus > 0) {
          await ticketStore.earnTicket(streakBonus, TICKET_EARN_REASONS.STREAK_BONUS, {
            streakCount: result.streakCount,
            gameId: result.gameId
          })
          rewards.tickets += streakBonus
          rewards.reasons.push(`${result.streakCount}連続正解: +${streakBonus}枚`)

          // 連続正解処理をチケットストアにも通知
          ticketStore.handleStreak(result.streakCount)
        }
      }

      // 3. 高得点ボーナス
      if (result.score >= 95) {
        await ticketStore.earnTicket(1, TICKET_EARN_REASONS.ACHIEVEMENT, {
          achievement: 'perfect_score',
          gameId: result.gameId,
          score: result.score
        })
        rewards.tickets += 1
        rewards.reasons.push('パーフェクトスコア: +1枚')
        rewards.achievements?.push('パーフェクトスコア達成')
      }

      // 4. XP報酬
      const xpReward = calculateXPReward(result)
      userStore.addXP(xpReward)
      rewards.xp = xpReward

      // 5. デイリーミッション進捗更新
      const missionCompleted = missionStore.updateMissionProgress(result.gameId, result.score)
      if (missionCompleted) {
        rewards.reasons.push('ミッション完了!')
      }

      // 6. アチーブメント判定
      const achievements = await checkAchievements(result)
      for (const achievement of achievements) {
        await ticketStore.earnTicket(achievement.tickets, TICKET_EARN_REASONS.ACHIEVEMENT, {
          achievement: achievement.id,
          gameId: result.gameId
        })
        rewards.tickets += achievement.tickets
        rewards.achievements?.push(achievement.name)
        rewards.reasons.push(`${achievement.name}: +${achievement.tickets}枚`)
      }

      // 7. 報酬サマリー保存
      rewardSummary.value = rewards

      logger.log('🎁 Game rewards processed:', rewards)
      return rewards

    } catch (error) {
      logger.error('Failed to process game rewards:', error)
      return rewards
    }
  }

  /**
   * クリア報酬の計算
   */
  function calculateClearReward(result: GameResult): { tickets: number } {
    let tickets = 0

    // 基本報酬: スコアに応じて
    if (result.score >= 90) {
      tickets = 3 // 高得点
    } else if (result.score >= 70) {
      tickets = 2 // 通常
    } else if (result.score >= 50) {
      tickets = 1 // 低得点でも参加賞
    }

    // 難易度ボーナス
    if (result.difficulty === 'expert') {
      tickets += 2
    } else if (result.difficulty === 'advanced') {
      tickets += 1
    }

    return { tickets }
  }

  /**
   * 連続正解ボーナスの計算
   */
  function calculateStreakBonus(streakCount: number): number {
    if (streakCount >= 20) return 5
    if (streakCount >= 15) return 4
    if (streakCount >= 10) return 3
    if (streakCount >= 5) return 2
    return 0
  }

  /**
   * XP報酬の計算
   */
  function calculateXPReward(result: GameResult): number {
    let baseXP = Math.round(result.score * 1.5) // スコアベース

    // 正解率ボーナス
    if (result.accuracy >= 95) {
      baseXP += 50
    } else if (result.accuracy >= 85) {
      baseXP += 25
    }

    // 難易度ボーナス
    const difficultyMultiplier = {
      beginner: 1.0,
      intermediate: 1.2,
      advanced: 1.5,
      expert: 2.0
    }
    const multiplier = difficultyMultiplier[result.difficulty as keyof typeof difficultyMultiplier] || 1.0

    return Math.round(baseXP * multiplier)
  }

  /**
   * アチーブメント判定
   */
  async function checkAchievements(result: GameResult): Promise<Array<{ id: string; name: string; tickets: number }>> {
    const achievements = []

    // 初回クリア
    const isFirstClear = await isFirstGameClear(result.gameId)
    if (isFirstClear) {
      achievements.push({
        id: `first_clear_${result.gameId}`,
        name: '初回クリア',
        tickets: 2
      })
    }

    // 完璧な正解率
    if (result.accuracy === 100) {
      achievements.push({
        id: 'perfect_accuracy',
        name: '完璧な正解率',
        tickets: 3
      })
    }

    // 速度達成
    if (result.timeElapsed && result.timeElapsed < 60 && result.score >= 80) {
      achievements.push({
        id: 'speed_master',
        name: 'スピードマスター',
        tickets: 2
      })
    }

    // 10連続正解
    if (result.streakCount && result.streakCount >= 10) {
      achievements.push({
        id: 'streak_master',
        name: 'ストリークマスター',
        tickets: 3
      })
    }

    return achievements
  }

  /**
   * 初回クリアかどうかを判定
   */
  async function isFirstGameClear(gameId: string): Promise<boolean> {
    // 簡易実装: ローカルストレージでチェック
    const clearedGames = JSON.parse(localStorage.getItem('movwise_cleared_games') || '[]')

    if (!clearedGames.includes(gameId)) {
      clearedGames.push(gameId)
      localStorage.setItem('movwise_cleared_games', JSON.stringify(clearedGames))
      return true
    }

    return false
  }

  /**
   * 報酬モーダルを表示
   */
  function showRewards() {
    if (rewardSummary.value) {
      showRewardModal.value = true
    }
  }

  /**
   * 報酬モーダルを閉じる
   */
  function hideRewards() {
    showRewardModal.value = false
  }

  /**
   * 特定の理由でチケットを付与（外部から呼び出し用）
   */
  async function earnTicketsForReason(amount: number, reason: string, metadata: any = {}) {
    return await ticketStore.earnTicket(amount, reason, metadata)
  }

  /**
   * レベルアップ時のボーナス
   */
  async function handleLevelUp(newLevel: number, oldLevel: number) {
    const levelDiff = newLevel - oldLevel
    const bonusTickets = levelDiff * 2 // レベルアップ1回につき2枚

    if (bonusTickets > 0) {
      await ticketStore.earnTicket(bonusTickets, TICKET_EARN_REASONS.LEVEL_UP, {
        newLevel,
        oldLevel,
        levelDiff
      })
    }
  }

  return {
    // State
    rewardSummary,
    showRewardModal,

    // Methods
    processGameCompletion,
    showRewards,
    hideRewards,
    earnTicketsForReason,
    handleLevelUp
  }
}