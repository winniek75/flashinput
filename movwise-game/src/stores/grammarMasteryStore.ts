/**
 * MovWISE Grammar Mastery Store
 * 英検5級～準1級完全文法網羅システム
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface GrammarTopic {
  id: string
  name: string
  description: string
  eikenLevel: '5' | '4' | '3' | 'pre2' | '2' | 'pre1'
  phase: 1 | 2 | 3 | 4
  category: string
  prerequisites: string[]
  masteryLevel: number // 0-100
  lastStudied: Date | null
  totalStudyTime: number // minutes
  correctAnswers: number
  totalAttempts: number
  isUnlocked: boolean
  gameIds: string[]
}

export interface GrammarPhase {
  id: number
  name: string
  description: string
  eikenLevels: string[]
  topics: string[]
  estimatedDuration: number // hours
  isCompleted: boolean
  completionRate: number
}

export interface MasteryRequirement {
  topicId: string
  minimumMastery: number
  requiredGames: string[]
  estimatedTime: number
}

export const useGrammarMasteryStore = defineStore('grammarMastery', () => {
  // State
  const grammarTopics = ref<Map<string, GrammarTopic>>(new Map())
  const grammarPhases = ref<Map<number, GrammarPhase>>(new Map())
  const currentPhase = ref<number>(1)
  const overallMastery = ref<number>(0)
  const studyStreak = ref<number>(0)
  const totalStudyHours = ref<number>(0)

  // Grammar Topics Definition
  const initializeGrammarTopics = () => {
    const topics: GrammarTopic[] = [
      // Phase 1 - 英検5級 Foundation
      {
        id: 'be_verbs_basic',
        name: 'Be動詞の基本',
        description: 'am/is/are の使い分けと基本文型',
        eikenLevel: '5',
        phase: 1,
        category: 'verbs',
        prerequisites: [],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: true,
        gameIds: ['BeVerbRush', 'GrammarReflexArena', 'PatternHunterGame']
      },
      {
        id: 'general_verbs_basic',
        name: '一般動詞の基本',
        description: '現在形の一般動詞と三人称単数',
        eikenLevel: '5',
        phase: 1,
        category: 'verbs',
        prerequisites: ['be_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: true, // 開発中につき全てアンロック
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      },
      {
        id: 'pronouns_basic',
        name: '代名詞',
        description: '主格・所有格・目的格の代名詞',
        eikenLevel: '5',
        phase: 1,
        category: 'pronouns',
        prerequisites: ['be_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['PatternHunterGame', 'GrammarColorCodeGame']
      },
      {
        id: 'question_words_basic',
        name: '疑問詞',
        description: 'what/when/where/who/why/how の基本',
        eikenLevel: '5',
        phase: 1,
        category: 'questions',
        prerequisites: ['be_verbs_basic', 'general_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      },
      {
        id: 'sentence_patterns_basic',
        name: '基本文型',
        description: 'SV/SVC/SVO の基本文型',
        eikenLevel: '5',
        phase: 1,
        category: 'sentence_structure',
        prerequisites: ['general_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['PatternHunterGame', 'TimeZoneNavigatorGame']
      },
      {
        id: 'prepositions_basic',
        name: '前置詞',
        description: '場所・時間・方向の前置詞',
        eikenLevel: '5',
        phase: 1,
        category: 'prepositions',
        prerequisites: ['sentence_patterns_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['PatternHunterGame', 'GrammarColorCodeGame']
      },

      // Phase 2 - 英検4級 Expansion
      {
        id: 'past_tense',
        name: '過去形',
        description: '規則・不規則動詞の過去形',
        eikenLevel: '4',
        phase: 2,
        category: 'tenses',
        prerequisites: ['general_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['TimeZoneNavigatorGame', 'GrammarReflexArena']
      },
      {
        id: 'future_tense',
        name: '未来形',
        description: 'will と be going to の使い分け',
        eikenLevel: '4',
        phase: 2,
        category: 'tenses',
        prerequisites: ['past_tense'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['TimeZoneNavigatorGame', 'PatternHunterGame']
      },
      {
        id: 'present_continuous',
        name: '現在進行形',
        description: 'be + ing の現在進行形',
        eikenLevel: '4',
        phase: 2,
        category: 'tenses',
        prerequisites: ['be_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      },
      {
        id: 'comparative_superlative',
        name: '比較級・最上級',
        description: '形容詞・副詞の比較表現',
        eikenLevel: '4',
        phase: 2,
        category: 'adjectives',
        prerequisites: ['sentence_patterns_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'GrammarColorCodeGame']
      },
      {
        id: 'modal_verbs_basic',
        name: '助動詞基本',
        description: 'can/may/must/should の基本用法',
        eikenLevel: '4',
        phase: 2,
        category: 'modals',
        prerequisites: ['general_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      },

      // Phase 3 - 英検3級 Complex Structures
      {
        id: 'present_perfect',
        name: '現在完了',
        description: 'have/has + 過去分詞の完了・経験・継続',
        eikenLevel: '3',
        phase: 3,
        category: 'tenses',
        prerequisites: ['past_tense'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['TimeZoneNavigatorGame', 'GrammarReflexArena']
      },
      {
        id: 'passive_voice',
        name: '受動態',
        description: 'be + 過去分詞の受動文',
        eikenLevel: '3',
        phase: 3,
        category: 'voice',
        prerequisites: ['past_tense'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      },
      {
        id: 'relative_pronouns',
        name: '関係代名詞',
        description: 'who/which/that を使った関係詞節',
        eikenLevel: '3',
        phase: 3,
        category: 'relative_clauses',
        prerequisites: ['sentence_patterns_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      },
      {
        id: 'conditionals_basic',
        name: '仮定法基礎',
        description: 'if節を使った条件文',
        eikenLevel: '3',
        phase: 3,
        category: 'conditionals',
        prerequisites: ['past_tense', 'modal_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'TimeZoneNavigatorGame']
      },
      {
        id: 'gerunds_infinitives',
        name: '動名詞・不定詞',
        description: 'to不定詞とing形の使い分け',
        eikenLevel: '3',
        phase: 3,
        category: 'verbals',
        prerequisites: ['general_verbs_basic'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      },

      // Phase 4 - 英検準2級 Advanced
      {
        id: 'past_perfect',
        name: '過去完了',
        description: 'had + 過去分詞の大過去',
        eikenLevel: 'pre2',
        phase: 4,
        category: 'tenses',
        prerequisites: ['present_perfect'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['TimeZoneNavigatorGame', 'GrammarReflexArena']
      },
      {
        id: 'subjunctive_mood',
        name: '仮定法',
        description: '仮定法過去・過去完了',
        eikenLevel: 'pre2',
        phase: 4,
        category: 'conditionals',
        prerequisites: ['conditionals_basic', 'past_perfect'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena']
      },
      {
        id: 'complex_relative_clauses',
        name: '複雑な関係詞',
        description: 'whose/whom/前置詞+関係代名詞',
        eikenLevel: 'pre2',
        phase: 4,
        category: 'relative_clauses',
        prerequisites: ['relative_pronouns'],
        masteryLevel: 0,
        lastStudied: null,
        totalStudyTime: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        isUnlocked: false,
        gameIds: ['GrammarReflexArena', 'PatternHunterGame']
      }
    ]

    topics.forEach(topic => {
      grammarTopics.value.set(topic.id, topic)
    })
  }

  // Grammar Phases Definition
  const initializeGrammarPhases = () => {
    const phases: GrammarPhase[] = [
      {
        id: 1,
        name: 'Foundation Phase',
        description: '英語文法の基礎固め',
        eikenLevels: ['5'],
        topics: ['be_verbs_basic', 'general_verbs_basic', 'pronouns_basic', 'question_words_basic', 'sentence_patterns_basic', 'prepositions_basic'],
        estimatedDuration: 20,
        isCompleted: false,
        completionRate: 0
      },
      {
        id: 2,
        name: 'Expansion Phase',
        description: '時制と文型の拡張',
        eikenLevels: ['4'],
        topics: ['past_tense', 'future_tense', 'present_continuous', 'comparative_superlative', 'modal_verbs_basic'],
        estimatedDuration: 25,
        isCompleted: false,
        completionRate: 0
      },
      {
        id: 3,
        name: 'Complex Structures',
        description: '複文と高度な文法',
        eikenLevels: ['3'],
        topics: ['present_perfect', 'passive_voice', 'relative_pronouns', 'conditionals_basic', 'gerunds_infinitives'],
        estimatedDuration: 30,
        isCompleted: false,
        completionRate: 0
      },
      {
        id: 4,
        name: 'Advanced Mastery',
        description: '上級文法の完全習得',
        eikenLevels: ['pre2', '2', 'pre1'],
        topics: ['past_perfect', 'subjunctive_mood', 'complex_relative_clauses'],
        estimatedDuration: 35,
        isCompleted: false,
        completionRate: 0
      }
    ]

    phases.forEach(phase => {
      grammarPhases.value.set(phase.id, phase)
    })
  }

  // Computed
  const unlockedTopics = computed(() => {
    return Array.from(grammarTopics.value.values()).filter(topic => topic.isUnlocked)
  })

  const currentPhaseTopics = computed(() => {
    return Array.from(grammarTopics.value.values()).filter(topic => topic.phase === currentPhase.value)
  })

  const masteredTopics = computed(() => {
    return Array.from(grammarTopics.value.values()).filter(topic => topic.masteryLevel >= 80)
  })

  const weakTopics = computed(() => {
    return Array.from(grammarTopics.value.values())
      .filter(topic => topic.totalAttempts > 0 && topic.masteryLevel < 60)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
  })

  const phaseProgress = computed(() => {
    const phase = grammarPhases.value.get(currentPhase.value)
    if (!phase) return 0

    const phaseTopics = phase.topics.map(id => grammarTopics.value.get(id)).filter(Boolean)
    const totalMastery = phaseTopics.reduce((sum, topic) => sum + topic!.masteryLevel, 0)
    return Math.round(totalMastery / phaseTopics.length)
  })

  // Actions
  const recordProgress = (topicId: string, isCorrect: boolean, studyTime: number) => {
    const topic = grammarTopics.value.get(topicId)
    if (!topic) return

    topic.totalAttempts++
    if (isCorrect) {
      topic.correctAnswers++
    }

    topic.totalStudyTime += studyTime
    topic.lastStudied = new Date()

    // Calculate mastery level
    const accuracy = topic.correctAnswers / topic.totalAttempts
    const consistencyBonus = Math.min(topic.totalAttempts / 50, 1) * 20
    const timeBonus = Math.min(topic.totalStudyTime / 60, 1) * 10

    topic.masteryLevel = Math.min(
      Math.round(accuracy * 70 + consistencyBonus + timeBonus),
      100
    )

    // Update total study hours
    totalStudyHours.value += studyTime / 60

    // Update overall mastery
    updateOverallMastery()

    // Check for unlocks
    checkForUnlocks()

    // Update phase completion
    updatePhaseCompletion()
  }

  const updateOverallMastery = () => {
    const allTopics = Array.from(grammarTopics.value.values())
    const totalMastery = allTopics.reduce((sum, topic) => sum + topic.masteryLevel, 0)
    overallMastery.value = Math.round(totalMastery / allTopics.length)
  }

  const checkForUnlocks = () => {
    Array.from(grammarTopics.value.values()).forEach(topic => {
      if (!topic.isUnlocked && topic.prerequisites.length > 0) {
        const prerequisitesMet = topic.prerequisites.every(prereqId => {
          const prereq = grammarTopics.value.get(prereqId)
          return prereq && prereq.masteryLevel >= 70
        })

        if (prerequisitesMet) {
          topic.isUnlocked = true
        }
      }
    })
  }

  const updatePhaseCompletion = () => {
    grammarPhases.value.forEach(phase => {
      const phaseTopics = phase.topics.map(id => grammarTopics.value.get(id)).filter(Boolean)
      const avgMastery = phaseTopics.reduce((sum, topic) => sum + topic!.masteryLevel, 0) / phaseTopics.length
      
      phase.completionRate = Math.round(avgMastery)
      phase.isCompleted = avgMastery >= 80

      // Auto-advance to next phase
      if (phase.isCompleted && phase.id === currentPhase.value && phase.id < 4) {
        currentPhase.value = phase.id + 1
      }
    })
  }

  const getTopicById = (topicId: string) => {
    return grammarTopics.value.get(topicId)
  }

  const getRecommendedTopics = () => {
    const availableTopics = unlockedTopics.value.filter(topic => topic.masteryLevel < 80)
    return availableTopics
      .sort((a, b) => {
        // Prioritize current phase topics
        if (a.phase === currentPhase.value && b.phase !== currentPhase.value) return -1
        if (b.phase === currentPhase.value && a.phase !== currentPhase.value) return 1
        
        // Then by mastery level (lower first)
        return a.masteryLevel - b.masteryLevel
      })
      .slice(0, 3)
  }

  const getWeakestTopics = () => {
    return weakTopics.value.slice(0, 5)
  }

  const resetProgress = () => {
    grammarTopics.value.forEach(topic => {
      topic.masteryLevel = 0
      topic.lastStudied = null
      topic.totalStudyTime = 0
      topic.correctAnswers = 0
      topic.totalAttempts = 0
      topic.isUnlocked = topic.id === 'be_verbs_basic'
    })

    grammarPhases.value.forEach(phase => {
      phase.isCompleted = false
      phase.completionRate = 0
    })

    currentPhase.value = 1
    overallMastery.value = 0
    totalStudyHours.value = 0
  }

  const exportProgress = () => {
    return {
      topics: Array.from(grammarTopics.value.entries()),
      phases: Array.from(grammarPhases.value.entries()),
      currentPhase: currentPhase.value,
      overallMastery: overallMastery.value,
      studyStreak: studyStreak.value,
      totalStudyHours: totalStudyHours.value,
      exportDate: new Date().toISOString()
    }
  }

  const importProgress = (data: any) => {
    if (data.topics) {
      grammarTopics.value = new Map(data.topics)
    }
    if (data.phases) {
      grammarPhases.value = new Map(data.phases)
    }
    if (data.currentPhase) {
      currentPhase.value = data.currentPhase
    }
    if (data.overallMastery) {
      overallMastery.value = data.overallMastery
    }
    if (data.totalStudyHours) {
      totalStudyHours.value = data.totalStudyHours
    }
  }

  // Initialize data
  initializeGrammarTopics()
  initializeGrammarPhases()

  return {
    // State
    grammarTopics: grammarTopics,
    grammarPhases: grammarPhases,
    currentPhase,
    overallMastery,
    studyStreak,
    totalStudyHours,

    // Computed
    unlockedTopics,
    currentPhaseTopics,
    masteredTopics,
    weakTopics,
    phaseProgress,

    // Actions
    recordProgress,
    getTopicById,
    getRecommendedTopics,
    getWeakestTopics,
    resetProgress,
    exportProgress,
    importProgress
  }
}, {
  persist: {
    key: 'movwise-grammar-mastery',
    storage: localStorage
  }
})