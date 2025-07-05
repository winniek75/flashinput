// src/data/phonemeLearningSystem.js - 科学的音韻学習システム

/**
 * 真の音韻学習システム
 * - IPA音韻記号と文字表記を明確に分離
 * - 段階的学習プログレッション
 * - 習熟度ベースの進級システム
 */

export const PHONEME_LEARNING_SYSTEM = {
  // 学習段階定義
  stages: {
    // Stage 1: 基礎母音認識（音のみから開始）
    basicVowels: {
      id: 'basicVowels',
      name: 'ピュア・サウンド・ベース',
      description: '基本母音の純粋音認識',
      icon: '🔊',
      unlockRequirement: null, // 常時アンロック
      masteryThreshold: 0.85, // 85%正解率で次段階
      
      phonemes: [
        {
          ipa: '/æ/',           // IPA音韻記号
          letter: 'a',          // 対応文字
          audioFile: 'a.m4a',   // 音声ファイル
          examples: ['cat', 'hat', 'bat'],
          difficulty: 1
        },
        {
          ipa: '/ɪ/',
          letter: 'i', 
          audioFile: 'i1.m4a',
          examples: ['bit', 'hit', 'sit'],
          difficulty: 1
        },
        {
          ipa: '/ʌ/',
          letter: 'u',
          audioFile: 'u1.m4a', 
          examples: ['cup', 'but', 'cut'],
          difficulty: 1
        },
        {
          ipa: '/ɛ/',
          letter: 'e',
          audioFile: 'e1.m4a',
          examples: ['bed', 'red', 'net'],
          difficulty: 1
        },
        {
          ipa: '/ɒ/',
          letter: 'o',
          audioFile: 'o1.m4a',
          examples: ['cot', 'hot', 'pot'],
          difficulty: 1
        }
      ]
    },

    // Stage 2: 基礎子音認識
    basicConsonants: {
      id: 'basicConsonants',
      name: 'コンソナント・マスタリー',
      description: '基本子音の明確認識',
      icon: '🎯',
      unlockRequirement: 'basicVowels',
      masteryThreshold: 0.85,
      
      phonemes: [
        {
          ipa: '/p/',
          letter: 'p',
          audioFile: 'p.m4a',
          examples: ['pat', 'pen', 'pit'],
          difficulty: 2
        },
        {
          ipa: '/b/',
          letter: 'b', 
          audioFile: 'b.m4a',
          examples: ['bat', 'bed', 'bit'],
          difficulty: 2
        },
        {
          ipa: '/t/',
          letter: 't',
          audioFile: 't.m4a', 
          examples: ['tap', 'ten', 'tip'],
          difficulty: 2
        },
        {
          ipa: '/d/',
          letter: 'd',
          audioFile: 'd.m4a',
          examples: ['dad', 'den', 'did'],
          difficulty: 2
        },
        {
          ipa: '/k/',
          letter: 'k',
          audioFile: 'k.m4a',
          examples: ['cat', 'ken', 'kit'],
          difficulty: 2
        },
        {
          ipa: '/g/',
          letter: 'g',
          audioFile: 'g.m4a',
          examples: ['gap', 'get', 'got'],
          difficulty: 2
        }
      ]
    },

    // Stage 3: 摩擦音・鼻音
    fricativesNasals: {
      id: 'fricativesNasals',
      name: 'アドバンス・サウンド',
      description: '摩擦音と鼻音の識別',
      icon: '🌪️',
      unlockRequirement: 'basicConsonants',
      masteryThreshold: 0.85,
      
      phonemes: [
        {
          ipa: '/f/',
          letter: 'f',
          audioFile: 'f.m4a',
          examples: ['fat', 'fun', 'fit'],
          difficulty: 3
        },
        {
          ipa: '/v/',
          letter: 'v',
          audioFile: 'v.m4a',
          examples: ['vat', 'vet', 'vim'],
          difficulty: 3
        },
        {
          ipa: '/s/',
          letter: 's',
          audioFile: 's.m4a',
          examples: ['sat', 'set', 'sit'],
          difficulty: 3
        },
        {
          ipa: '/z/',
          letter: 'z',
          audioFile: 'z.m4a',
          examples: ['zip', 'zen', 'zoo'],
          difficulty: 3
        },
        {
          ipa: '/m/',
          letter: 'm',
          audioFile: 'm.m4a',
          examples: ['mat', 'men', 'mom'],
          difficulty: 3
        },
        {
          ipa: '/n/',
          letter: 'n',
          audioFile: 'n.m4a',
          examples: ['nat', 'net', 'nun'],
          difficulty: 3
        }
      ]
    },

    // Stage 4: 二重音素・複合音
    complexSounds: {
      id: 'complexSounds', 
      name: 'コンプレックス・フォニーム',
      description: '複合音素の高度認識',
      icon: '⚡',
      unlockRequirement: 'fricativesNasals',
      masteryThreshold: 0.90, // より高い習熟度要求
      
      phonemes: [
        {
          ipa: '/ʧ/',
          letter: 'ch',
          audioFile: 'ch.m4a',
          examples: ['chat', 'chip', 'chop'],
          difficulty: 4
        },
        {
          ipa: '/ʃ/',
          letter: 'sh',
          audioFile: 'sh.m4a',
          examples: ['ship', 'shop', 'shut'],
          difficulty: 4
        },
        {
          ipa: '/θ/',
          letter: 'th',
          audioFile: 'th1.m4a',
          examples: ['thin', 'math', 'path'],
          difficulty: 4
        },
        {
          ipa: '/ð/',
          letter: 'th',
          audioFile: 'th2.m4a',
          examples: ['this', 'that', 'the'],
          difficulty: 4
        }
      ]
    }
  },

  // ゲーム設定
  gameSettings: {
    // 速度設定（子供に適した速度）
    speed: {
      beginner: 4.0,    // 4秒で横断（十分な認識時間）
      intermediate: 3.0, // 3秒で横断
      advanced: 2.5,     // 2.5秒で横断
      expert: 2.0        // 2秒で横断
    },

    // 学習セッション設定
    session: {
      questionsPerSession: 10,     // 1セッション10問
      correctAnswersToProgress: 8, // 8/10正解で進歩
      masterySessionsRequired: 3,  // 3セッション連続85%で習得
      maxIncorrectInRow: 3,        // 3連続不正解でヒント表示
      sessionCooldown: 300000      // 5分のクールダウン
    },

    // フィードバック設定
    feedback: {
      immediate: true,              // 即座のフィードバック
      correctSoundRepeat: true,     // 正解時に音素再生
      incorrectPause: 2000,         // 不正解時2秒ポーズ
      showProgressAfterSession: true
    },

    // 適応的難易度
    adaptiveDifficulty: {
      enabled: true,
      adjustSpeedBasedOnAccuracy: true,
      speedIncreaseThreshold: 0.90,   // 90%正解で速度アップ
      speedDecreaseThreshold: 0.60,   // 60%以下で速度ダウン
      maxSpeedAdjustment: 0.5         // ±0.5秒の調整範囲
    }
  },

  // 学習進捗管理
  progressTracking: {
    // 各音素の習熟度データ
    phonemeMastery: {
      /* 
      例: '/æ/': {
        attempts: 45,
        correct: 38,
        accuracy: 0.844,
        lastAccuracy: 0.90,
        sessions: 5,
        masteryAchieved: false,
        averageResponseTime: 1250,
        difficultySetting: 'beginner'
      }
      */
    },

    // ステージ進捗
    stageProgress: {
      /*
      例: 'basicVowels': {
        unlocked: true,
        inProgress: true,
        completed: false,
        overallAccuracy: 0.82,
        sessionsCompleted: 12,
        timeSpent: 1800000 // ミリ秒
      }
      */
    },

    // 学習統計
    learningStats: {
      totalSessions: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      averageSessionAccuracy: 0,
      learningStreak: 0,           // 連続学習日数
      weakestPhonemes: [],         // 苦手音素
      strongestPhonemes: [],       // 得意音素
      recommendedFocus: null       // 推奨練習音素
    }
  }
}

/**
 * 学習プログレッション管理クラス
 */
export class PhonemeProgressionManager {
  constructor() {
    this.loadProgress()
  }

  // 進捗データの読み込み
  loadProgress() {
    const saved = localStorage.getItem('phoneme_learning_progress')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        PHONEME_LEARNING_SYSTEM.progressTracking = {
          ...PHONEME_LEARNING_SYSTEM.progressTracking,
          ...data
        }
      } catch (error) {
        console.error('Failed to load learning progress:', error)
        this.initializeProgress()
      }
    } else {
      this.initializeProgress()
    }
  }

  // 進捗データの初期化
  initializeProgress() {
    const stages = PHONEME_LEARNING_SYSTEM.stages
    
    // 各ステージの初期化
    Object.keys(stages).forEach(stageId => {
      PHONEME_LEARNING_SYSTEM.progressTracking.stageProgress[stageId] = {
        unlocked: stageId === 'basicVowels', // 最初のステージのみアンロック
        inProgress: false,
        completed: false,
        overallAccuracy: 0,
        sessionsCompleted: 0,
        timeSpent: 0
      }

      // 各音素の初期化
      stages[stageId].phonemes.forEach(phoneme => {
        PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery[phoneme.ipa] = {
          attempts: 0,
          correct: 0,
          accuracy: 0,
          lastAccuracy: 0,
          sessions: 0,
          masteryAchieved: false,
          averageResponseTime: 0,
          difficultySetting: 'beginner'
        }
      })
    })

    this.saveProgress()
  }

  // 進捗データの保存
  saveProgress() {
    try {
      localStorage.setItem('phoneme_learning_progress', 
        JSON.stringify(PHONEME_LEARNING_SYSTEM.progressTracking)
      )
    } catch (error) {
      console.error('Failed to save learning progress:', error)
    }
  }

  // アンロック可能なステージの確認
  checkStageUnlock(stageId) {
    const stage = PHONEME_LEARNING_SYSTEM.stages[stageId]
    if (!stage.unlockRequirement) return true // 最初のステージ

    const prerequisite = stage.unlockRequirement
    const prereqProgress = PHONEME_LEARNING_SYSTEM.progressTracking.stageProgress[prerequisite]
    
    return prereqProgress && prereqProgress.completed
  }

  // ステージ完了判定
  evaluateStageCompletion(stageId) {
    const stage = PHONEME_LEARNING_SYSTEM.stages[stageId]
    const phonemeMastery = PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery
    
    // 全音素が習得済みかチェック
    const allPhonemesMastered = stage.phonemes.every(phoneme => 
      phonemeMastery[phoneme.ipa]?.masteryAchieved
    )

    if (allPhonemesMastered) {
      PHONEME_LEARNING_SYSTEM.progressTracking.stageProgress[stageId].completed = true
      this.unlockNextStage(stageId)
      this.saveProgress()
      return true
    }

    return false
  }

  // 次ステージのアンロック
  unlockNextStage(completedStageId) {
    const stages = PHONEME_LEARNING_SYSTEM.stages
    const stageIds = Object.keys(stages)
    
    // 完了ステージの次を見つける
    for (const [stageId, stage] of Object.entries(stages)) {
      if (stage.unlockRequirement === completedStageId) {
        PHONEME_LEARNING_SYSTEM.progressTracking.stageProgress[stageId].unlocked = true
        console.log(`🎉 New stage unlocked: ${stage.name}`)
        break
      }
    }
  }

  // 音素習熟度の更新
  updatePhonemeMastery(ipa, correct, responseTime) {
    const mastery = PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery[ipa]
    if (!mastery) return

    mastery.attempts++
    if (correct) mastery.correct++
    
    mastery.accuracy = mastery.correct / mastery.attempts
    mastery.averageResponseTime = (mastery.averageResponseTime * (mastery.attempts - 1) + responseTime) / mastery.attempts

    // 習得判定
    if (mastery.accuracy >= 0.85 && mastery.attempts >= 20) {
      mastery.masteryAchieved = true
    }

    this.saveProgress()
    return mastery
  }

  // 現在の学習推奨の取得
  getRecommendedFocus() {
    const phonemeMastery = PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery
    
    // 最も正解率の低い音素を見つける
    let lowestAccuracy = 1.0
    let recommendedPhoneme = null

    Object.entries(phonemeMastery).forEach(([ipa, data]) => {
      if (data.attempts >= 5 && data.accuracy < lowestAccuracy && !data.masteryAchieved) {
        lowestAccuracy = data.accuracy
        recommendedPhoneme = ipa
      }
    })

    return recommendedPhoneme
  }

  // 学習セッション結果の処理
  processSessionResult(stageId, results) {
    const stageProgress = PHONEME_LEARNING_SYSTEM.progressTracking.stageProgress[stageId]
    
    stageProgress.sessionsCompleted++
    
    const sessionAccuracy = results.correct / results.total
    stageProgress.overallAccuracy = (
      (stageProgress.overallAccuracy * (stageProgress.sessionsCompleted - 1) + sessionAccuracy)
      / stageProgress.sessionsCompleted
    )

    // 各音素の結果を処理
    results.phonemeResults.forEach(result => {
      this.updatePhonemeMastery(result.ipa, result.correct, result.responseTime)
    })

    // ステージ完了判定
    this.evaluateStageCompletion(stageId)
    
    this.saveProgress()
    return {
      sessionAccuracy,
      stageProgress: stageProgress.overallAccuracy,
      newUnlocks: this.checkStageUnlock(stageId)
    }
  }
}

// シングルトンインスタンス
export const progressionManager = new PhonemeProgressionManager()