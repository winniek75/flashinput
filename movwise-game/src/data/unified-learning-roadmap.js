// MovWISE Unified Learning Roadmap
// 統合学習ロードマップ - レベル別推奨学習順序

export const LEARNING_PHASES = {
  foundation: {
    id: 'foundation',
    name: '基礎フェーズ',
    description: '英語学習の土台作り',
    level: '英検5級レベル',
    duration: '2-3ヶ月',
    priority: 1,
    color: '#10B981', // green
    icon: '🌱',
    requiredCompletion: 80
  },
  building: {
    id: 'building', 
    name: '構築フェーズ',
    description: '基礎を組み合わせて応用力を身につける',
    level: '英検4級レベル',
    duration: '3-4ヶ月', 
    priority: 2,
    color: '#3B82F6', // blue
    icon: '🏗️',
    requiredCompletion: 80
  },
  expansion: {
    id: 'expansion',
    name: '拡張フェーズ',
    description: '複雑な表現と高度な文法をマスター',
    level: '英検3級レベル',
    duration: '4-5ヶ月',
    priority: 3,
    color: '#8B5CF6', // purple
    icon: '🚀',
    requiredCompletion: 80
  },
  mastery: {
    id: 'mastery',
    name: 'マスタリーフェーズ',
    description: '総合的な英語運用能力の完成',
    level: '英検準2級以上',
    duration: '継続学習',
    priority: 4,
    color: '#F59E0B', // amber
    icon: '👑',
    requiredCompletion: 90
  }
}

export const UNIFIED_LEARNING_PATH = {
  // Phase 1: Foundation (基礎フェーズ)
  foundation: {
    phase: 'foundation',
    sequence: [
      // Step 1: Sound Recognition (音認識)
      {
        step: 1,
        category: 'phonics',
        title: '音の基礎認識',
        description: '英語の音を正確に聞き分ける力を身につける',
        games: [
          { 
            id: 'pureSoundLab', 
            name: 'Pure Sound Lab',
            route: '/games/pure-sound-lab',
            zone: 'sound',
            type: 'core',
            estimatedTime: '30分',
            priority: 'required'
          },
          { 
            id: 'soundToSymbol', 
            name: 'Sound → Symbol',
            route: '/games/sound-to-symbol', 
            zone: 'sound',
            type: 'practice',
            estimatedTime: '20分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 80,
          consecutiveSessions: 3
        },
        unlockNext: 'step2_foundation'
      },

      // Step 2: Basic Grammar (基本文法)
      {
        step: 2,
        category: 'grammar',
        title: 'Be動詞の完全習得',
        description: '英語の基礎となるBe動詞をマスター',
        games: [
          { 
            id: 'grammarColorCode', 
            name: 'Grammar Color Code',
            route: '/grammar-galaxy/color-code/beVerb',
            zone: 'grammar',
            type: 'core',
            estimatedTime: '25分',
            priority: 'required'
          },
          { 
            id: 'beVerbRush', 
            name: 'Be Verb Rush',
            route: '/grammar-galaxy/be-verb-rush',
            zone: 'rush',
            type: 'speed',
            estimatedTime: '15分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 85,
          speed: 'average'
        },
        unlockNext: 'step3_foundation'
      },

      // Step 3: Blending (音素結合)
      {
        step: 3,
        category: 'phonics',
        title: 'CVC単語の音素結合',
        description: '子音-母音-子音の組み合わせをマスター',
        games: [
          { 
            id: 'sequentialBlending', 
            name: 'Sequential Blending',
            route: '/games/sequential-blending',
            zone: 'sound',
            type: 'core',
            estimatedTime: '30分',
            priority: 'required'
          },
          { 
            id: 'cvcWordFactory', 
            name: 'CVC Word Factory',
            route: '/games/cvc-word-factory',
            zone: 'sound',
            type: 'practice',
            estimatedTime: '25分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 80,
          consistency: 'stable'
        },
        unlockNext: 'step4_foundation'
      },

      // Step 4: General Verbs (一般動詞)
      {
        step: 4,
        category: 'grammar',
        title: '一般動詞の基礎',
        description: 'Do/Does、don\'t/doesn\'tの使い分け',
        games: [
          { 
            id: 'grammarReflexArena', 
            name: 'Grammar Reflex Arena',
            route: '/grammar-galaxy/grammar-reflex-arena',
            zone: 'grammar',
            type: 'core',
            estimatedTime: '25分',
            priority: 'required'
          },
          { 
            id: 'verbRush', 
            name: 'Verb Rush',
            route: '/grammar-galaxy/verb-rush',
            zone: 'rush',
            type: 'speed',
            estimatedTime: '15分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 85,
          speed: 'good'
        },
        unlockNext: 'building_phase'
      }
    ]
  },

  // Phase 2: Building (構築フェーズ)
  building: {
    phase: 'building', 
    sequence: [
      // Step 5: Magic E & Silent Letters
      {
        step: 5,
        category: 'phonics',
        title: 'Magic E ルールの習得',
        description: '長母音変化のルールをマスター',
        games: [
          { 
            id: 'magicECastle', 
            name: 'Magic E Castle',
            route: '/games/magic-e-castle',
            zone: 'sound',
            type: 'core',
            estimatedTime: '35分',
            priority: 'required'
          },
          { 
            id: 'silentLetterDetective', 
            name: 'Silent Letter Detective',
            route: '/games/silent-letter-detective',
            zone: 'sound',
            type: 'practice',
            estimatedTime: '25分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 85,
          patternRecognition: 'good'
        },
        unlockNext: 'step6_building'
      },

      // Step 6: Past Tense & Progressive
      {
        step: 6,
        category: 'grammar',
        title: '時制の基礎（過去形・進行形）',
        description: '時間表現の基本をマスター',
        games: [
          { 
            id: 'progressiveTense', 
            name: 'Progressive Tense Flow',
            route: '/grammar-galaxy/progressive-tense',
            zone: 'grammar',
            type: 'core',
            estimatedTime: '30分',
            priority: 'required'
          },
          { 
            id: 'multiLayerConstruction', 
            name: 'Construction Zone',
            route: '/multi-layer/construction-zone',
            zone: 'construction',
            type: 'detailed',
            estimatedTime: '40分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 85,
          application: 'practical'
        },
        unlockNext: 'step7_building'
      },

      // Step 7: Sight Words & High-frequency Vocabulary
      {
        step: 7,
        category: 'vocabulary',
        title: 'サイトワード・高頻度語彙',
        description: '重要な基本語彙200語の瞬間認識',
        games: [
          { 
            id: 'sightWordMaster', 
            name: 'Sight Word Master',
            route: '/games/sight-word-master',
            zone: 'sound',
            type: 'core',
            estimatedTime: '25分',
            priority: 'required'
          },
          { 
            id: 'wordRushBasic', 
            name: 'Word Rush (Basic)',
            route: '/games/word-rush?level=kids',
            zone: 'rush',
            type: 'speed',
            estimatedTime: '15分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 90,
          speed: 'fast'
        },
        unlockNext: 'step8_building'
      },

      // Step 8: Comparatives & Modal Verbs
      {
        step: 8,
        category: 'grammar',
        title: '比較表現・助動詞',
        description: '表現力を豊かにする文法項目',
        games: [
          { 
            id: 'comparisonMaster', 
            name: 'Comparison Master',
            route: '/grammar-galaxy/comparison-master',
            zone: 'grammar',
            type: 'core',
            estimatedTime: '30分',
            priority: 'required'
          },
          { 
            id: 'modalVerbChallenge', 
            name: 'Modal Verb Challenge',
            route: '/grammar-galaxy/modal-verb-challenge',
            zone: 'grammar',
            type: 'practice',
            estimatedTime: '25分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 85,
          variety: 'good'
        },
        unlockNext: 'expansion_phase'
      }
    ]
  },

  // Phase 3: Expansion (拡張フェーズ)
  expansion: {
    phase: 'expansion',
    sequence: [
      // Step 9: Advanced Phonics
      {
        step: 9,
        category: 'phonics',
        title: 'ダイグラフ・R制御母音',
        description: '複雑な音韻パターンの習得',
        games: [
          { 
            id: 'digraphMaster', 
            name: 'Digraph Master',
            route: '/games/digraph-master',
            zone: 'sound',
            type: 'core',
            estimatedTime: '35分',
            priority: 'required'
          },
          { 
            id: 'rControlledVowels', 
            name: 'R-Controlled Vowels',
            route: '/games/r-controlled-vowels',
            zone: 'sound',
            type: 'practice',
            estimatedTime: '30分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 85,
          complexPatterns: 'good'
        },
        unlockNext: 'step10_expansion'
      },

      // Step 10: Present Perfect & Passive Voice
      {
        step: 10,
        category: 'grammar',
        title: '現在完了形・受動態',
        description: '中学修了レベルの高度文法',
        games: [
          { 
            id: 'multiLayerAdvanced', 
            name: 'Multi-Layer Advanced',
            route: '/multi-layer/rush-zone?level=grade3',
            zone: 'rush',
            type: 'adaptive',
            estimatedTime: '30分',
            priority: 'required'
          },
          { 
            id: 'battleZoneBasic', 
            name: 'Battle Zone (Basic)',
            route: '/multi-layer/battle-zone',
            zone: 'battle',
            type: 'competitive',
            estimatedTime: '20分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 80,
          consistency: 'stable'
        },
        unlockNext: 'step11_expansion'
      },

      // Step 11: Advanced Vocabulary
      {
        step: 11,
        category: 'vocabulary',
        title: 'TOEIC・日常英語語彙',
        description: '実用的な語彙力の大幅拡張',
        games: [
          { 
            id: 'wordRushIntermediate', 
            name: 'Word Rush (Intermediate)',
            route: '/games/word-rush?level=toeic',
            zone: 'rush',
            type: 'speed',
            estimatedTime: '20分',
            priority: 'required'
          },
          { 
            id: 'patternHunter', 
            name: 'Pattern Hunter',
            route: '/grammar-galaxy/pattern-hunter',
            zone: 'grammar',
            type: 'search',
            estimatedTime: '25分',
            priority: 'recommended'
          }
        ],
        completionCriteria: {
          accuracy: 85,
          breadth: 'wide'
        },
        unlockNext: 'mastery_phase'
      }
    ]
  },

  // Phase 4: Mastery (マスタリーフェーズ) 
  mastery: {
    phase: 'mastery',
    sequence: [
      // Step 12: Integration & Application
      {
        step: 12,
        category: 'integration',
        title: '総合的英語運用',
        description: '全スキルを統合した実践的活動',
        games: [
          { 
            id: 'aiAdaptiveChallenge', 
            name: 'AI Adaptive Challenge',
            route: '/multi-layer/rush-zone?mode=adaptive',
            zone: 'rush',
            type: 'adaptive',
            estimatedTime: '25分',
            priority: 'required'
          },
          { 
            id: 'battleZoneAdvanced', 
            name: 'Battle Zone (Advanced)',
            route: '/multi-layer/battle-zone?level=advanced',
            zone: 'battle',
            type: 'competitive',
            estimatedTime: '30分',
            priority: 'recommended'
          },
          { 
            id: 'phonicsBossChallenge', 
            name: 'Phonics Boss Challenge',
            route: '/games/phonics-boss-challenge',
            zone: 'sound',
            type: 'boss',
            estimatedTime: '45分',
            priority: 'challenge'
          }
        ],
        completionCriteria: {
          accuracy: 90,
          speed: 'excellent',
          adaptability: 'high'
        },
        unlockNext: 'continuous_learning'
      }
    ]
  }
}

// Rush Zone Consolidation Mapping
export const RUSH_ZONE_MAPPING = {
  // 統合Rush Zoneのカテゴリ別マッピング
  phonics: {
    name: 'Phonics Rush',
    icon: '🔤', 
    color: '#10B981',
    description: '音韻認識の高速練習',
    games: ['pureSoundLab', 'soundToSymbol', 'sequentialBlending', 'cvcWordFactory']
  },
  grammar: {
    name: 'Grammar Rush',
    icon: '⚡',
    color: '#3B82F6', 
    description: '文法パターンの瞬間認識',
    games: ['beVerbRush', 'verbRush', 'grammarReflexArena']
  },
  vocabulary: {
    name: 'Vocabulary Rush',
    icon: '📚',
    color: '#8B5CF6',
    description: '語彙認識の速度向上',
    games: ['sightWordMaster', 'wordRushBasic', 'wordRushIntermediate']
  },
  adaptive: {
    name: 'AI Adaptive Rush',
    icon: '🤖',
    color: '#F59E0B',
    description: 'AI によるパーソナライズ学習',
    games: ['multiLayerRush', 'aiAdaptiveChallenge']
  }
}

// Progress Tracking Functions
export const getRecommendedNextStep = (currentProgress) => {
  // Safety check for currentProgress
  if (!currentProgress || typeof currentProgress !== 'object') {
    // Return first step if no progress data
    const firstPhase = Object.values(UNIFIED_LEARNING_PATH)[0]
    const firstStep = firstPhase?.sequence[0]
    if (firstStep) {
      return {
        phase: firstPhase.phase,
        step: firstStep.step,
        title: firstStep.title,
        category: firstStep.category,
        nextGames: firstStep.games.filter(game => game.priority === 'required'),
        reason: 'no_progress_data'
      }
    }
  }
  
  // 現在の進捗に基づいて次の推奨ステップを返す
  for (const phase of Object.values(UNIFIED_LEARNING_PATH)) {
    for (const step of phase.sequence) {
      const stepProgress = currentProgress[`step_${step.step}`] || { completed: false, accuracy: 0 }
      
      if (!stepProgress.completed || 
          stepProgress.accuracy < (step.completionCriteria?.accuracy || 0)) {
        return {
          phase: phase.phase,
          step: step.step,
          title: step.title,
          category: step.category,
          nextGames: step.games.filter(game => game.priority === 'required'),
          reason: !stepProgress.completed ? 'incomplete' : 'accuracy_low'
        }
      }
    }
  }
  
  return {
    phase: 'mastery',
    step: 'continuous',
    title: '継続学習・チャレンジ',
    category: 'mastery',
    nextGames: [],
    reason: 'completed_all'
  }
}

export const getCurrentPhase = (currentProgress) => {
  const recommendation = getRecommendedNextStep(currentProgress)
  return LEARNING_PHASES[recommendation.phase] || LEARNING_PHASES.foundation
}

export const getPhaseProgress = (phase, currentProgress) => {
  const phaseData = UNIFIED_LEARNING_PATH[phase]
  if (!phaseData) return 0
  
  // Safety check for currentProgress
  if (!currentProgress || typeof currentProgress !== 'object') {
    return 0
  }
  
  const totalSteps = phaseData.sequence.length
  let completedSteps = 0
  
  phaseData.sequence.forEach(step => {
    const stepProgress = currentProgress[`step_${step.step}`]
    if (stepProgress?.completed && 
        stepProgress.accuracy >= (step.completionCriteria?.accuracy || 0)) {
      completedSteps++
    }
  })
  
  return Math.round((completedSteps / totalSteps) * 100)
}