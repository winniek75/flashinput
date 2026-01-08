import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import verbData from '@/data/verb-patterns/verb-data.json'

export const useVerbPatternStore = defineStore('verbPattern', () => {
  // State
  const collectedVerbs = ref([])  // 収集した動詞カード
  const currentLevel = ref(1)
  const totalScore = ref(0)
  const gameProgress = ref({
    stage1Completed: true,  // 開発用: 全ステージをアンロック
    stage2Completed: true,  // 開発用: 全ステージをアンロック
    stage3Completed: false
  })
  const weakVerbs = ref([])  // 苦手な動詞
  const accuracy = ref({})   // 動詞ごとの正答率
  const sessionStats = ref({
    questionsAnswered: 0,
    correctAnswers: 0,
    streakCount: 0,
    bestStreak: 0
  })

  // Getters
  const unlockedVerbs = computed(() => {
    return verbData.verbs.filter(v => v.level <= currentLevel.value)
  })

  const masteredVerbs = computed(() => {
    return collectedVerbs.value.filter(verbId => {
      const acc = accuracy.value[verbId]
      return acc && (acc.correct / acc.total) >= 0.9 && acc.total >= 5
    })
  })

  const collectionRate = computed(() => {
    const total = unlockedVerbs.value.length
    return total > 0 ? (collectedVerbs.value.length / total) * 100 : 0
  })

  const overallAccuracy = computed(() => {
    const accuracyValues = Object.values(accuracy.value)
    if (accuracyValues.length === 0) return 0

    const totalCorrect = accuracyValues.reduce((sum, acc) => sum + acc.correct, 0)
    const totalQuestions = accuracyValues.reduce((sum, acc) => sum + acc.total, 0)

    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  })

  const nextLevelProgress = computed(() => {
    const requiredScore = currentLevel.value * 1000
    return Math.min((totalScore.value % requiredScore) / requiredScore * 100, 100)
  })

  // Actions
  function collectVerb(verbId) {
    if (!collectedVerbs.value.includes(verbId)) {
      collectedVerbs.value.push(verbId)
    }
  }

  function updateAccuracy(verbId, isCorrect) {
    if (!accuracy.value[verbId]) {
      accuracy.value[verbId] = { correct: 0, total: 0 }
    }

    accuracy.value[verbId].total++
    if (isCorrect) {
      accuracy.value[verbId].correct++
      sessionStats.value.correctAnswers++
      sessionStats.value.streakCount++
      sessionStats.value.bestStreak = Math.max(
        sessionStats.value.bestStreak,
        sessionStats.value.streakCount
      )
    } else {
      sessionStats.value.streakCount = 0
    }

    sessionStats.value.questionsAnswered++

    // 苦手動詞の更新
    const rate = accuracy.value[verbId].correct / accuracy.value[verbId].total
    if (rate < 0.6 && accuracy.value[verbId].total >= 3) {
      if (!weakVerbs.value.includes(verbId)) {
        weakVerbs.value.push(verbId)
      }
    } else if (rate >= 0.8) {
      // 改善した場合は苦手リストから削除
      const index = weakVerbs.value.indexOf(verbId)
      if (index > -1) {
        weakVerbs.value.splice(index, 1)
      }
    }
  }

  function completeStage(stageNumber) {
    gameProgress.value[`stage${stageNumber}Completed`] = true

    // レベルアップ条件
    if (stageNumber === 3 && allStagesCompleted.value) {
      levelUp()
    }
  }

  function levelUp() {
    currentLevel.value++
    // レベルアップボーナス
    addScore(currentLevel.value * 500)
  }

  function addScore(points) {
    totalScore.value += points
  }

  function getVerbById(verbId) {
    return verbData.verbs.find(v => v.id === verbId)
  }

  function getRandomVerbs(count, levelRange = null) {
    let pool = unlockedVerbs.value

    if (levelRange) {
      pool = verbData.verbs.filter(v =>
        v.level >= levelRange.min && v.level <= levelRange.max
      )
    }

    return pool
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
  }

  function getWeakVerbsForPractice() {
    return weakVerbs.value
      .map(id => getVerbById(id))
      .filter(Boolean)
  }

  function resetSessionStats() {
    sessionStats.value = {
      questionsAnswered: 0,
      correctAnswers: 0,
      streakCount: 0,
      bestStreak: 0
    }
  }

  // Computed for all stages completed
  const allStagesCompleted = computed(() => {
    return gameProgress.value.stage1Completed &&
           gameProgress.value.stage2Completed &&
           gameProgress.value.stage3Completed
  })

  return {
    // State
    collectedVerbs,
    currentLevel,
    totalScore,
    gameProgress,
    weakVerbs,
    accuracy,
    sessionStats,

    // Getters
    unlockedVerbs,
    masteredVerbs,
    collectionRate,
    overallAccuracy,
    nextLevelProgress,
    allStagesCompleted,

    // Actions
    collectVerb,
    updateAccuracy,
    completeStage,
    levelUp,
    addScore,
    getVerbById,
    getRandomVerbs,
    getWeakVerbsForPractice,
    resetSessionStats
  }
}, {
  persist: true  // pinia-plugin-persistedstate
})