/**
 * Jolly Phonics System - 完全カスタマイズ可能な段階的学習システム
 * 講師が選択した音素で4段階の学習を提供
 */

import logger from '@/utils/logger'

// Jolly Phonics 42音素の完全データ
export const JOLLY_PHONICS_SOUNDS = {
  // Group 1 - 最初に学ぶ基本音素
  group1: {
    name: 'Group 1 - 基本音素',
    description: '最も頻出する音素から学習開始',
    sounds: [
      { symbol: 's', ipa: '/s/', examples: ['sun', 'sand', 'sock'], action: '蛇のようにシューシュー' },
      { symbol: 'a', ipa: '/æ/', examples: ['ant', 'apple', 'at'], action: 'アリが腕を登る動作' },
      { symbol: 't', ipa: '/t/', examples: ['tent', 'top', 'bat'], action: 'テニスを打つ動作' },
      { symbol: 'i', ipa: '/ɪ/', examples: ['ink', 'insect', 'sit'], action: 'インクをつける動作' },
      { symbol: 'p', ipa: '/p/', examples: ['pen', 'pink', 'cup'], action: 'ろうそくを吹き消す動作' },
      { symbol: 'n', ipa: '/n/', examples: ['net', 'nose', 'sun'], action: '飛行機の音真似' }
    ]
  },

  // Group 2
  group2: {
    name: 'Group 2 - 子音と母音の拡張',
    description: '基本音素を補完する音',
    sounds: [
      { symbol: 'c', ipa: '/k/', examples: ['cat', 'cup', 'picnic'], action: 'カスタネットを叩く' },
      { symbol: 'k', ipa: '/k/', examples: ['kite', 'key', 'book'], action: 'カスタネットを叩く' },
      { symbol: 'e', ipa: '/e/', examples: ['egg', 'elephant', 'bed'], action: '卵を割る動作' },
      { symbol: 'h', ipa: '/h/', examples: ['hat', 'hop', 'behind'], action: 'マラソン後の息切れ' },
      { symbol: 'r', ipa: '/r/', examples: ['rabbit', 'run', 'car'], action: '犬のうなり声' },
      { symbol: 'm', ipa: '/m/', examples: ['mouse', 'man', 'ham'], action: 'お腹をさする' },
      { symbol: 'd', ipa: '/d/', examples: ['dog', 'dad', 'and'], action: 'ドラムを叩く' }
    ]
  },

  // Group 3
  group3: {
    name: 'Group 3 - 音素の多様性',
    description: '音の幅を広げる',
    sounds: [
      { symbol: 'g', ipa: '/g/', examples: ['goat', 'green', 'bag'], action: '水をゴクゴク飲む' },
      { symbol: 'o', ipa: '/ɒ/', examples: ['orange', 'on', 'hot'], action: '「オー」と驚く' },
      { symbol: 'u', ipa: '/ʌ/', examples: ['umbrella', 'up', 'sun'], action: '傘を開く動作' },
      { symbol: 'l', ipa: '/l/', examples: ['lollipop', 'leg', 'bell'], action: 'アイスを舐める' },
      { symbol: 'f', ipa: '/f/', examples: ['fish', 'fun', 'off'], action: '魚が泳ぐ動作' },
      { symbol: 'b', ipa: '/b/', examples: ['bat', 'bus', 'crab'], action: 'ボールを弾ませる' }
    ]
  },

  // Group 4 - 二重音字
  group4: {
    name: 'Group 4 - 二重音字入門',
    description: '2文字で1音を表す',
    sounds: [
      { symbol: 'ai', ipa: '/eɪ/', examples: ['rain', 'train', 'snail'], action: '痛い！と言う' },
      { symbol: 'j', ipa: '/dʒ/', examples: ['jam', 'jump', 'badge'], action: 'ゼリーをプルプル' },
      { symbol: 'oa', ipa: '/əʊ/', examples: ['boat', 'goat', 'coat'], action: 'ボートを漕ぐ' },
      { symbol: 'ie', ipa: '/aɪ/', examples: ['tie', 'pie', 'cried'], action: '敬礼する' },
      { symbol: 'ee', ipa: '/iː/', examples: ['bee', 'tree', 'green'], action: 'ロバの鳴き声' },
      { symbol: 'or', ipa: '/ɔː/', examples: ['fork', 'horse', 'morning'], action: '馬の鳴き声' }
    ]
  },

  // Group 5
  group5: {
    name: 'Group 5 - 発展音素',
    description: 'より複雑な音',
    sounds: [
      { symbol: 'z', ipa: '/z/', examples: ['zebra', 'buzz', 'fizzy'], action: '蜂のブンブン音' },
      { symbol: 'w', ipa: '/w/', examples: ['web', 'worm', 'window'], action: '風の音' },
      { symbol: 'ng', ipa: '/ŋ/', examples: ['ring', 'king', 'strong'], action: 'ゴングを鳴らす' },
      { symbol: 'v', ipa: '/v/', examples: ['van', 'vest', 'love'], action: '車のエンジン音' },
      { symbol: 'oo', ipa: '/uː/', examples: ['moon', 'spoon', 'zoo'], action: '幽霊の声' },
      { symbol: 'oo', ipa: '/ʊ/', examples: ['book', 'cook', 'foot'], action: '時計の音' }
    ]
  },

  // Group 6
  group6: {
    name: 'Group 6 - 特殊音素',
    description: '英語特有の音',
    sounds: [
      { symbol: 'y', ipa: '/j/', examples: ['yak', 'yellow', 'yes'], action: 'ヨーヨーで遊ぶ' },
      { symbol: 'x', ipa: '/ks/', examples: ['box', 'fox', 'six'], action: 'レントゲン写真' },
      { symbol: 'ch', ipa: '/tʃ/', examples: ['chip', 'chat', 'lunch'], action: '電車の音' },
      { symbol: 'sh', ipa: '/ʃ/', examples: ['shop', 'wish', 'fish'], action: 'シーッと静かに' },
      { symbol: 'th', ipa: '/θ/', examples: ['thin', 'bath', 'three'], action: '舌を出す（無声）' },
      { symbol: 'th', ipa: '/ð/', examples: ['this', 'that', 'mother'], action: '舌を出す（有声）' }
    ]
  },

  // Group 7
  group7: {
    name: 'Group 7 - 上級二重音字',
    description: '最も複雑な音の組み合わせ',
    sounds: [
      { symbol: 'qu', ipa: '/kw/', examples: ['queen', 'quick', 'quiet'], action: 'アヒルの鳴き声' },
      { symbol: 'ou', ipa: '/aʊ/', examples: ['out', 'house', 'mouse'], action: '注射で痛い' },
      { symbol: 'oi', ipa: '/ɔɪ/', examples: ['oil', 'coin', 'voice'], action: '船乗りの挨拶' },
      { symbol: 'ue', ipa: '/juː/', examples: ['rescue', 'argue', 'value'], action: '救急車のサイレン' },
      { symbol: 'er', ipa: '/ɜː/', examples: ['her', 'letter', 'computer'], action: 'ミキサーの音' },
      { symbol: 'ar', ipa: '/ɑː/', examples: ['car', 'star', 'farm'], action: '口を大きく開ける' }
    ]
  }
}

/**
 * 段階的学習フレームワーク
 */
export const LEARNING_STAGES = {
  stage1: {
    id: 'pure_sound',
    name: 'ピュア・サウンド認識',
    description: '音の純粋な識別と発音',
    skills: [
      'sound_discrimination', // 音の識別
      'sound_reproduction',    // 音の再現
      'sound_position',        // 音の位置認識
      'sound_isolation'        // 音の分離
    ],
    activities: [
      {
        type: 'listen_and_identify',
        instruction: '音を聞いて正しい絵を選ぶ'
      },
      {
        type: 'sound_matching',
        instruction: '同じ音で始まる単語を見つける'
      },
      {
        type: 'pronunciation_practice',
        instruction: '音を正確に発音する'
      }
    ]
  },

  stage2: {
    id: 'sound_blending',
    name: 'サウンド・ブレンディング',
    description: '音の組み合わせと融合',
    skills: [
      'onset_rime',     // 音節の分解
      'phoneme_blend',  // 音素の融合
      'segmentation',   // 音の分割
      'manipulation'    // 音の操作
    ],
    activities: [
      {
        type: 'blend_sounds',
        instruction: '音を組み合わせて単語を作る'
      },
      {
        type: 'segment_words',
        instruction: '単語を音に分解する'
      },
      {
        type: 'sound_substitution',
        instruction: '音を入れ替えて新しい単語を作る'
      }
    ]
  },

  stage3: {
    id: 'letter_matching',
    name: 'レター・マッチング',
    description: '音と文字の対応関係',
    skills: [
      'grapheme_recognition',  // 文字認識
      'sound_symbol_match',    // 音記号対応
      'letter_formation',      // 文字の書き方
      'visual_discrimination'  // 視覚的識別
    ],
    activities: [
      {
        type: 'match_sound_to_letter',
        instruction: '音を聞いて文字を選ぶ'
      },
      {
        type: 'letter_tracing',
        instruction: '文字をなぞって書く'
      },
      {
        type: 'find_letter_in_words',
        instruction: '単語の中から文字を見つける'
      }
    ]
  },

  stage4: {
    id: 'word_building',
    name: 'ワード・ビルディング',
    description: '単語の構築と応用',
    skills: [
      'word_construction',  // 単語構築
      'spelling',          // スペリング
      'word_families',     // 単語家族
      'sentence_building'  // 文構築
    ],
    activities: [
      {
        type: 'build_words',
        instruction: '音素を使って単語を作る'
      },
      {
        type: 'word_families',
        instruction: '同じパターンの単語を見つける'
      },
      {
        type: 'sentence_creation',
        instruction: '学習した単語で文を作る'
      }
    ]
  }
}

/**
 * カスタマイズ可能な学習プラン生成
 */
export class CustomPhonicsPlanner {
  constructor() {
    this.selectedPhonemes = []
    this.stages = ['stage1', 'stage2', 'stage3', 'stage4']
    this.difficulty = 'normal'
    this.studentProfile = null
  }

  /**
   * 講師が音素を選択
   */
  selectPhonemes(phonemes) {
    this.selectedPhonemes = phonemes
    logger.log('📚 Selected phonemes:', phonemes)
    return this
  }

  /**
   * 学習段階を設定
   */
  setStages(stages) {
    this.stages = stages
    logger.log('📈 Selected stages:', stages)
    return this
  }

  /**
   * 難易度を設定
   */
  setDifficulty(level) {
    this.difficulty = level
    logger.log('⚡ Difficulty set to:', level)
    return this
  }

  /**
   * 生徒プロファイルを設定
   */
  setStudent(profile) {
    this.studentProfile = profile
    logger.log('👤 Student profile:', profile)
    return this
  }

  /**
   * カスタム学習プランを生成
   */
  generatePlan() {
    const plan = {
      id: `plan_${Date.now()}`,
      created: new Date().toISOString(),
      student: this.studentProfile,
      phonemes: this.selectedPhonemes,
      stages: this.stages.map(stageId => ({
        ...LEARNING_STAGES[stageId],
        phonemes: this.selectedPhonemes,
        activities: this.generateActivities(stageId)
      })),
      difficulty: this.difficulty,
      estimatedDuration: this.calculateDuration(),
      assessments: this.generateAssessments()
    }

    logger.log('📋 Generated custom plan:', plan)
    return plan
  }

  /**
   * 各段階のアクティビティを生成
   */
  generateActivities(stageId) {
    const stage = LEARNING_STAGES[stageId]
    const activities = []

    // 選択された音素ごとにアクティビティを生成
    this.selectedPhonemes.forEach(phoneme => {
      stage.activities.forEach(activityTemplate => {
        activities.push({
          ...activityTemplate,
          phoneme: phoneme,
          difficulty: this.difficulty,
          content: this.generateActivityContent(phoneme, activityTemplate.type)
        })
      })
    })

    return activities
  }

  /**
   * アクティビティの具体的な内容を生成
   */
  generateActivityContent(phoneme, activityType) {
    const content = {
      phoneme: phoneme,
      type: activityType
    }

    switch (activityType) {
      case 'listen_and_identify':
        content.options = this.generateSoundOptions(phoneme)
        content.correctAnswer = phoneme
        break

      case 'blend_sounds':
        content.components = this.generateBlendComponents(phoneme)
        content.result = content.components.join('')
        break

      case 'match_sound_to_letter':
        content.sounds = this.generateSoundSet(phoneme)
        content.letters = this.generateLetterSet(phoneme)
        break

      case 'build_words':
        content.targetWords = this.generateTargetWords(phoneme)
        content.letterBank = this.generateLetterBank(phoneme)
        break

      default:
        content.data = null
    }

    return content
  }

  /**
   * 音の選択肢を生成
   */
  generateSoundOptions(correctPhoneme) {
    const options = [correctPhoneme]
    const allPhonemes = this.getAllPhonemes()

    // 混同しやすい音を優先的に選択肢に含める
    const confusingSounds = this.getConfusingSounds(correctPhoneme)
    options.push(...confusingSounds.slice(0, 2))

    // ランダムな音を追加
    while (options.length < 4) {
      const randomPhoneme = allPhonemes[Math.floor(Math.random() * allPhonemes.length)]
      if (!options.includes(randomPhoneme)) {
        options.push(randomPhoneme)
      }
    }

    return options.sort(() => Math.random() - 0.5)
  }

  /**
   * ブレンディング用の音素セットを生成
   */
  generateBlendComponents(phoneme) {
    const components = []

    if (this.selectedPhonemes.length >= 2) {
      // 選択された音素から2-3個を組み合わせ
      components.push(phoneme)
      const others = this.selectedPhonemes.filter(p => p !== phoneme)
      const numComponents = Math.min(2, others.length)

      for (let i = 0; i < numComponents; i++) {
        components.push(others[Math.floor(Math.random() * others.length)])
      }
    } else {
      // 音素が少ない場合は基本音素を追加
      components.push(phoneme)
      components.push('a')
      if (phoneme !== 't') components.push('t')
    }

    return components
  }

  /**
   * 音素セットを生成
   */
  generateSoundSet(targetPhoneme) {
    return this.selectedPhonemes.map(phoneme => ({
      phoneme: phoneme,
      audioFile: `${phoneme}.mp3`,
      matched: false
    }))
  }

  /**
   * 文字セットを生成
   */
  generateLetterSet(targetPhoneme) {
    return this.selectedPhonemes.map(phoneme => ({
      letter: phoneme,
      matched: false
    }))
  }

  /**
   * 目標単語を生成
   */
  generateTargetWords(phoneme) {
    const words = []

    // CVC (Consonant-Vowel-Consonant) パターンの単語を生成
    const vowels = this.selectedPhonemes.filter(p => ['a', 'e', 'i', 'o', 'u'].includes(p))
    const consonants = this.selectedPhonemes.filter(p => !['a', 'e', 'i', 'o', 'u'].includes(p))

    if (vowels.length > 0 && consonants.length > 1) {
      // 開始音として指定された音素を使用
      if (consonants.includes(phoneme)) {
        vowels.forEach(vowel => {
          consonants.forEach(endConsonant => {
            if (endConsonant !== phoneme) {
              words.push(`${phoneme}${vowel}${endConsonant}`)
            }
          })
        })
      }
    }

    // 実在する単語を優先
    const realWords = this.filterRealWords(words)
    return realWords.length > 0 ? realWords : words.slice(0, 5)
  }

  /**
   * 文字バンクを生成
   */
  generateLetterBank(phoneme) {
    const bank = [...this.selectedPhonemes]

    // 追加の文字を含める（混乱要素として）
    const additionalLetters = ['x', 'q', 'z'].filter(l => !bank.includes(l))
    bank.push(...additionalLetters.slice(0, 2))

    return bank.sort(() => Math.random() - 0.5)
  }

  /**
   * 混同しやすい音を取得
   */
  getConfusingSounds(phoneme) {
    const confusingPairs = {
      's': ['z', 'sh', 'th'],
      'z': ['s', 'th'],
      'f': ['v', 'th'],
      'v': ['f', 'b'],
      'b': ['p', 'v'],
      'p': ['b', 't'],
      't': ['d', 'p'],
      'd': ['t', 'th'],
      'l': ['r', 'n'],
      'r': ['l', 'w'],
      'th': ['s', 'f', 'd'],
      'sh': ['s', 'ch'],
      'ch': ['sh', 'j']
    }

    return confusingPairs[phoneme] || []
  }

  /**
   * 全音素を取得
   */
  getAllPhonemes() {
    const allPhonemes = []
    Object.values(JOLLY_PHONICS_SOUNDS).forEach(group => {
      group.sounds.forEach(sound => {
        allPhonemes.push(sound.symbol)
      })
    })
    return allPhonemes
  }

  /**
   * 実在する単語をフィルタ
   */
  filterRealWords(words) {
    const realWords = [
      'sat', 'sit', 'pat', 'pit', 'tap', 'tip', 'nap', 'nip',
      'cat', 'cap', 'can', 'pan', 'tan', 'pin', 'tin', 'sin',
      'mat', 'map', 'man', 'ham', 'jam', 'ram', 'dam',
      'bat', 'bit', 'bet', 'but', 'bad', 'bed', 'bud',
      'hat', 'hit', 'hot', 'hut', 'hen', 'hop',
      'rat', 'rot', 'rut', 'ran', 'run', 'red',
      'get', 'got', 'gun', 'gap', 'gum',
      'let', 'lit', 'lot', 'lap', 'lip', 'log',
      'net', 'not', 'nut', 'nod'
    ]

    return words.filter(word => realWords.includes(word))
  }

  /**
   * 学習期間を計算
   */
  calculateDuration() {
    const minutesPerActivity = 5
    const activitiesPerPhoneme = 4
    const totalActivities = this.selectedPhonemes.length * activitiesPerPhoneme * this.stages.length
    const totalMinutes = totalActivities * minutesPerActivity

    return {
      totalMinutes: totalMinutes,
      estimatedDays: Math.ceil(totalMinutes / 30), // 1日30分として計算
      activitiesPerDay: Math.ceil(totalActivities / Math.ceil(totalMinutes / 30))
    }
  }

  /**
   * 評価方法を生成
   */
  generateAssessments() {
    return this.stages.map(stageId => ({
      stage: stageId,
      assessmentType: this.getAssessmentType(stageId),
      passingScore: this.difficulty === 'easy' ? 70 : (this.difficulty === 'hard' ? 90 : 80),
      retryAllowed: true,
      feedbackProvided: true
    }))
  }

  /**
   * 段階別の評価方法を取得
   */
  getAssessmentType(stageId) {
    const assessmentTypes = {
      'stage1': 'sound_recognition_test',
      'stage2': 'blending_test',
      'stage3': 'matching_test',
      'stage4': 'word_building_test'
    }
    return assessmentTypes[stageId] || 'general_test'
  }
}

/**
 * プリセットテンプレート
 */
export const PRESET_TEMPLATES = {
  absolute_beginners: {
    name: '完全初心者向け',
    description: 's, a, tの3音素から始める最も基礎的なプラン',
    phonemes: ['s', 'a', 't'],
    stages: ['stage1', 'stage2', 'stage3', 'stage4'],
    difficulty: 'easy'
  },

  jolly_group1: {
    name: 'Jolly Phonics Group 1',
    description: '標準的な第1グループ（s, a, t, i, p, n）',
    phonemes: ['s', 'a', 't', 'i', 'p', 'n'],
    stages: ['stage1', 'stage2', 'stage3', 'stage4'],
    difficulty: 'normal'
  },

  vowel_focus: {
    name: '母音重点学習',
    description: '母音の識別が苦手な学習者向け',
    phonemes: ['a', 'e', 'i', 'o', 'u'],
    stages: ['stage1', 'stage2', 'stage3'],
    difficulty: 'normal'
  },

  consonant_clusters: {
    name: '子音クラスター特訓',
    description: 'bl, cr, st等の子音連続に焦点',
    phonemes: ['b', 'l', 'c', 'r', 's', 't'],
    stages: ['stage2', 'stage3', 'stage4'],
    difficulty: 'hard'
  },

  digraph_intensive: {
    name: '二重音字集中',
    description: 'ch, sh, th, ai, ee等の二重音字',
    phonemes: ['ch', 'sh', 'th', 'ai', 'ee', 'oa'],
    stages: ['stage1', 'stage2', 'stage3', 'stage4'],
    difficulty: 'hard'
  },

  japanese_difficult: {
    name: '日本人苦手音素',
    description: 'l/r, f/v, th等の識別困難音',
    phonemes: ['l', 'r', 'f', 'v', 'th'],
    stages: ['stage1', 'stage2', 'stage3'],
    difficulty: 'hard'
  }
}

export default {
  JOLLY_PHONICS_SOUNDS,
  LEARNING_STAGES,
  CustomPhonicsPlanner,
  PRESET_TEMPLATES
}