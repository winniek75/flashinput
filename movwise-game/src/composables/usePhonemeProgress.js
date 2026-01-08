// src/composables/usePhonemeProgress.js
// 音素学習進捗管理システム

import { ref, computed, watch } from 'vue'
import { NATIVE_PHONEME_PROGRESSION as PHONEME_PROGRESSION, MASTERY_CRITERIA, STAGE_DEPENDENCIES } from '@/data/native-phoneme-database.js'
import logger from '@/utils/logger'

export function usePhonemeProgress() {
  // 状態管理
  const currentStage = ref('group1')
  const attempts = ref([])
  const masteredPhonemes = ref(new Set())
  const learnerProfile = ref({
    strongPhonemes: [],
    weakPhonemes: [],
    confusionPatterns: {},
    preferredLearningSpeed: 'normal'
  })

  // 計算プロパティ
  const currentPhonemes = computed(() => {
    return PHONEME_PROGRESSION[currentStage.value] || []
  })

  const stageProgress = computed(() => {
    const phonemes = currentPhonemes.value
    if (phonemes.length === 0) return 0
    
    const masteredCount = phonemes.filter(p => 
      masteredPhonemes.value.has(p.symbol)
    ).length
    
    return (masteredCount / phonemes.length) * 100
  })

  const overallProgress = computed(() => {
    const allPhonemes = Object.values(PHONEME_PROGRESSION).flat()
    const totalMastered = masteredPhonemes.value.size
    
    return (totalMastered / allPhonemes.length) * 100
  })

  const canAdvanceStage = computed(() => {
    return stageProgress.value >= (MASTERY_CRITERIA.stageCompletion * 100)
  })

  const availableStages = computed(() => {
    logger.log('🔍 Computing available stages...')
    logger.log('STAGE_DEPENDENCIES:', STAGE_DEPENDENCIES)
    
    // 学習目的で全てのジョリーフォニックスグループを選択可能にする
    const allStages = [
      'group1', 'group2', 'group3', 'group4', 'group5', 'group6', 'group7'
    ]
    
    logger.log('✅ Available stages (all groups for learning):', allStages)
    return allStages
  })

  // メソッド
  const recordAttempt = (phoneme, isCorrect, reactionTime) => {
    const attempt = {
      phoneme: phoneme.symbol,
      stage: currentStage.value,
      correct: isCorrect,
      reactionTime,
      timestamp: Date.now(),
      difficulty: phoneme.difficulty
    }
    
    attempts.value.push(attempt)
    
    // マスタリー判定
    checkPhonemeMatery(phoneme)
    
    // エラーパターン分析
    if (!isCorrect) {
      analyzeErrorPattern(attempt)
    }
    
    // ローカルストレージに保存
    saveProgress()
  }

  const checkPhonemeMatery = (phoneme) => {
    const recentAttempts = attempts.value
      .filter(a => a.phoneme === phoneme.symbol)
      .slice(-10) // 直近10回

    if (recentAttempts.length < MASTERY_CRITERIA.minAttempts) {
      return false
    }

    const accuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length
    const consecutiveCorrect = getConsecutiveCorrect(phoneme.symbol)
    
    const isMastered = accuracy >= MASTERY_CRITERIA.singlePhoneme && 
                      consecutiveCorrect >= MASTERY_CRITERIA.consecutiveCorrect

    if (isMastered && !masteredPhonemes.value.has(phoneme.symbol)) {
      masteredPhonemes.value.add(phoneme.symbol)
      updateLearnerProfile(phoneme, 'strong')
    } else if (!isMastered && accuracy < 0.6) {
      updateLearnerProfile(phoneme, 'weak')
    }

    return isMastered
  }

  const getConsecutiveCorrect = (phonemeSymbol) => {
    const phonemeAttempts = attempts.value
      .filter(a => a.phoneme === phonemeSymbol)
      .reverse() // 最新から

    let consecutive = 0
    for (const attempt of phonemeAttempts) {
      if (attempt.correct) {
        consecutive++
      } else {
        break
      }
    }

    return consecutive
  }

  const analyzeErrorPattern = (attempt) => {
    // Tracking of incorrect choices will be added for detailed analytics
    const pattern = `${attempt.phoneme}_error`
    
    if (!learnerProfile.value.confusionPatterns[pattern]) {
      learnerProfile.value.confusionPatterns[pattern] = 0
    }
    
    learnerProfile.value.confusionPatterns[pattern]++
  }

  const updateLearnerProfile = (phoneme, type) => {
    if (type === 'strong') {
      if (!learnerProfile.value.strongPhonemes.includes(phoneme.symbol)) {
        learnerProfile.value.strongPhonemes.push(phoneme.symbol)
      }
      // 弱いリストから削除
      learnerProfile.value.weakPhonemes = learnerProfile.value.weakPhonemes
        .filter(p => p !== phoneme.symbol)
    } else if (type === 'weak') {
      if (!learnerProfile.value.weakPhonemes.includes(phoneme.symbol)) {
        learnerProfile.value.weakPhonemes.push(phoneme.symbol)
      }
    }
  }

  const isStageCompleted = (stage) => {
    const stagePhonemes = PHONEME_PROGRESSION[stage] || []
    const completedCount = stagePhonemes.filter(p => 
      masteredPhonemes.value.has(p.symbol)
    ).length
    
    return (completedCount / stagePhonemes.length) >= MASTERY_CRITERIA.stageCompletion
  }

  const advanceToNextStage = () => {
    const stageOrder = ['group1', 'group2', 'group3', 'group4', 'group5', 'group6', 'group7']
    const currentIndex = stageOrder.indexOf(currentStage.value)
    
    if (currentIndex < stageOrder.length - 1 && canAdvanceStage.value) {
      const nextStage = stageOrder[currentIndex + 1]
      
      // 依存関係チェック
      const dependencies = STAGE_DEPENDENCIES[nextStage] || []
      const canAdvance = dependencies.every(dep => isStageCompleted(dep))
      
      if (canAdvance) {
        currentStage.value = nextStage
        saveProgress()
        return true
      }
    }
    
    return false
  }

  const getWeakPhonemes = () => {
    return currentPhonemes.value.filter(phoneme => {
      const recentAttempts = attempts.value
        .filter(a => a.phoneme === phoneme.symbol)
        .slice(-5)
      
      if (recentAttempts.length === 0) return false
      
      const accuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length
      return accuracy < 0.7
    })
  }

  const getNextRecommendedPhoneme = () => {
    // 弱い音素を優先
    const weakPhonemes = getWeakPhonemes()
    if (weakPhonemes.length > 0) {
      return weakPhonemes[Math.floor(Math.random() * weakPhonemes.length)]
    }
    
    // 未習得の音素
    const unmastered = currentPhonemes.value.filter(p => 
      !masteredPhonemes.value.has(p.symbol)
    )
    
    if (unmastered.length > 0) {
      return unmastered[0] // 順序通り
    }
    
    // 復習（ランダム）
    const mastered = currentPhonemes.value.filter(p => 
      masteredPhonemes.value.has(p.symbol)
    )
    
    return mastered[Math.floor(Math.random() * mastered.length)]
  }

  const generateDetailedReport = () => {
    const report = {
      overview: {
        totalAttempts: attempts.value.length,
        overallAccuracy: attempts.value.filter(a => a.correct).length / attempts.value.length,
        currentStage: currentStage.value,
        masteredPhonemes: Array.from(masteredPhonemes.value),
        overallProgress: overallProgress.value
      },
      stageBreakdown: {},
      learnerProfile: learnerProfile.value,
      recommendations: generateRecommendations()
    }

    // ステージ別詳細
    Object.keys(PHONEME_PROGRESSION).forEach(stage => {
      const stageAttempts = attempts.value.filter(a => a.stage === stage)
      const stagePhonemes = PHONEME_PROGRESSION[stage]
      
      report.stageBreakdown[stage] = {
        phonemes: stagePhonemes.map(phoneme => ({
          symbol: phoneme.symbol,
          attempts: stageAttempts.filter(a => a.phoneme === phoneme.symbol).length,
          accuracy: calculatePhonemeAccuracy(phoneme.symbol),
          isMastered: masteredPhonemes.value.has(phoneme.symbol),
          avgReactionTime: calculateAvgReactionTime(phoneme.symbol)
        })),
        completed: isStageCompleted(stage)
      }
    })

    return report
  }

  const generateRecommendations = () => {
    const recommendations = []
    
    // 弱い音素の特別練習
    if (learnerProfile.value.weakPhonemes.length > 0) {
      recommendations.push({
        type: 'weakness',
        message: `Focus on these challenging sounds: ${learnerProfile.value.weakPhonemes.join(', ')}`,
        action: 'extra_practice'
      })
    }
    
    // 次のステージへの準備状況
    if (canAdvanceStage.value) {
      recommendations.push({
        type: 'advancement',
        message: 'Great progress! You can advance to the next stage.',
        action: 'advance_stage'
      })
    }
    
    // 学習ペースの調整
    const avgAccuracy = attempts.value.filter(a => a.correct).length / attempts.value.length
    if (avgAccuracy > 0.9) {
      recommendations.push({
        type: 'difficulty',
        message: 'Consider increasing difficulty for better challenge.',
        action: 'increase_difficulty'
      })
    } else if (avgAccuracy < 0.6) {
      recommendations.push({
        type: 'difficulty', 
        message: 'Consider decreasing difficulty for better learning.',
        action: 'decrease_difficulty'
      })
    }
    
    return recommendations
  }

  const calculatePhonemeAccuracy = (phonemeSymbol) => {
    const phonemeAttempts = attempts.value.filter(a => a.phoneme === phonemeSymbol)
    if (phonemeAttempts.length === 0) return 0
    
    return phonemeAttempts.filter(a => a.correct).length / phonemeAttempts.length
  }

  const calculateAvgReactionTime = (phonemeSymbol) => {
    const phonemeAttempts = attempts.value.filter(a => a.phoneme === phonemeSymbol)
    if (phonemeAttempts.length === 0) return 0
    
    const total = phonemeAttempts.reduce((sum, a) => sum + a.reactionTime, 0)
    return total / phonemeAttempts.length
  }

  const saveProgress = () => {
    const progressData = {
      currentStage: currentStage.value,
      attempts: attempts.value,
      masteredPhonemes: Array.from(masteredPhonemes.value),
      learnerProfile: learnerProfile.value,
      lastUpdated: Date.now()
    }
    
    localStorage.setItem('movwise_phoneme_progress', JSON.stringify(progressData))
  }

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem('movwise_phoneme_progress')
      if (saved) {
        const data = JSON.parse(saved)
        currentStage.value = data.currentStage || 'group1'
        attempts.value = data.attempts || []
        masteredPhonemes.value = new Set(data.masteredPhonemes || [])
        learnerProfile.value = { ...learnerProfile.value, ...data.learnerProfile }
      }
    } catch (error) {
      logger.error('Failed to load progress:', error)
    }
  }

  const resetProgress = () => {
    currentStage.value = 'group1'
    attempts.value = []
    masteredPhonemes.value = new Set()
    learnerProfile.value = {
      strongPhonemes: [],
      weakPhonemes: [],
      confusionPatterns: {},
      preferredLearningSpeed: 'normal'
    }
    
    localStorage.removeItem('movwise_phoneme_progress')
  }

  // 初期化
  loadProgress()

  // 自動保存の監視
  watch([currentStage, attempts, masteredPhonemes], () => {
    saveProgress()
  }, { deep: true })

  return {
    // 状態
    currentStage,
    currentPhonemes,
    masteredPhonemes,
    learnerProfile,
    
    // 計算プロパティ
    stageProgress,
    overallProgress,
    canAdvanceStage,
    availableStages,
    
    // メソッド
    recordAttempt,
    advanceToNextStage,
    getNextRecommendedPhoneme,
    getWeakPhonemes,
    generateDetailedReport,
    saveProgress,
    loadProgress,
    resetProgress,
    
    // ユーティリティ
    isStageCompleted,
    calculatePhonemeAccuracy,
    calculateAvgReactionTime
  }
}