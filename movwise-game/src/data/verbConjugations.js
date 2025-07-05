// Verb Conjugations Database for VerbTimeMachine Game
// 動詞活用データベース - 時制別学習システム

// Be動詞の活用
export const beVerbConjugations = {
  present: {
    'I': 'am',
    'you': 'are',
    'he': 'is',
    'she': 'is',
    'it': 'is',
    'we': 'are',
    'they': 'are'
  },
  past: {
    'I': 'was',
    'you': 'were',
    'he': 'was',
    'she': 'was',
    'it': 'was',
    'we': 'were',
    'they': 'were'
  },
  perfect: {
    'I': 'have been',
    'you': 'have been',
    'he': 'has been',
    'she': 'has been',
    'it': 'has been',
    'we': 'have been',
    'they': 'have been'
  }
}

// 規則動詞の活用パターン
export const regularVerbPatterns = {
  // 基本的な規則動詞
  basic: [
    {
      infinitive: 'play',
      present: 'play/plays',
      past: 'played',
      pastParticiple: 'played',
      presentParticiple: 'playing',
      meaning: '遊ぶ、演奏する',
      examples: {
        present: 'I play soccer every day.',
        past: 'I played soccer yesterday.',
        perfect: 'I have played soccer for 5 years.',
        progressive: 'I am playing soccer now.'
      }
    },
    {
      infinitive: 'study',
      present: 'study/studies',
      past: 'studied',
      pastParticiple: 'studied',
      presentParticiple: 'studying',
      meaning: '勉強する',
      examples: {
        present: 'She studies English.',
        past: 'She studied English last night.',
        perfect: 'She has studied English for 3 years.',
        progressive: 'She is studying English now.'
      }
    },
    {
      infinitive: 'walk',
      present: 'walk/walks',
      past: 'walked',
      pastParticiple: 'walked',
      presentParticiple: 'walking',
      meaning: '歩く',
      examples: {
        present: 'We walk to school.',
        past: 'We walked to school yesterday.',
        perfect: 'We have walked this route many times.',
        progressive: 'We are walking to school now.'
      }
    },
    {
      infinitive: 'talk',
      present: 'talk/talks',
      past: 'talked',
      pastParticiple: 'talked',
      presentParticiple: 'talking',
      meaning: '話す',
      examples: {
        present: 'They talk loudly.',
        past: 'They talked for hours.',
        perfect: 'They have talked about this before.',
        progressive: 'They are talking right now.'
      }
    },
    {
      infinitive: 'work',
      present: 'work/works',
      past: 'worked',
      pastParticiple: 'worked',
      presentParticiple: 'working',
      meaning: '働く',
      examples: {
        present: 'He works hard.',
        past: 'He worked late yesterday.',
        perfect: 'He has worked here for 2 years.',
        progressive: 'He is working on a project.'
      }
    }
  ],
  
  // Y ending verbs (y → ied)
  yEnding: [
    {
      infinitive: 'try',
      present: 'try/tries',
      past: 'tried',
      pastParticiple: 'tried',
      presentParticiple: 'trying',
      meaning: '試す、努力する',
      examples: {
        present: 'I try my best.',
        past: 'I tried to call you.',
        perfect: 'I have tried this before.',
        progressive: 'I am trying to understand.'
      }
    },
    {
      infinitive: 'cry',
      present: 'cry/cries',
      past: 'cried',
      pastParticiple: 'cried',
      presentParticiple: 'crying',
      meaning: '泣く',
      examples: {
        present: 'The baby cries often.',
        past: 'The baby cried all night.',
        perfect: 'The baby has cried for an hour.',
        progressive: 'The baby is crying now.'
      }
    }
  ]
}

// 不規則動詞データベース
export const irregularVerbDatabase = {
  // 頻出不規則動詞（初級）
  beginner: [
    {
      infinitive: 'go',
      present: 'go/goes',
      past: 'went',
      pastParticiple: 'gone',
      presentParticiple: 'going',
      meaning: '行く',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I go to school.',
        past: 'I went to the store.',
        perfect: 'I have gone there many times.',
        progressive: 'I am going home now.'
      },
      timeTravel: {
        present: { scene: '現在の教室', action: 'go to school' },
        past: { scene: '昨日の店', action: 'went to the store' },
        perfect: { scene: '経験の蓄積', action: 'have gone there before' }
      }
    },
    {
      infinitive: 'eat',
      present: 'eat/eats',
      past: 'ate',
      pastParticiple: 'eaten',
      presentParticiple: 'eating',
      meaning: '食べる',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I eat breakfast.',
        past: 'I ate dinner.',
        perfect: 'I have eaten sushi.',
        progressive: 'I am eating lunch.'
      },
      timeTravel: {
        present: { scene: '朝の食卓', action: 'eat breakfast' },
        past: { scene: '昨夜の食卓', action: 'ate dinner' },
        perfect: { scene: '寿司の経験', action: 'have eaten sushi' }
      }
    },
    {
      infinitive: 'see',
      present: 'see/sees',
      past: 'saw',
      pastParticiple: 'seen',
      presentParticiple: 'seeing',
      meaning: '見る',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I see the bird.',
        past: 'I saw a movie.',
        perfect: 'I have seen this before.',
        progressive: 'I am seeing a doctor.'
      },
      timeTravel: {
        present: { scene: '窓の外', action: 'see the bird' },
        past: { scene: '映画館', action: 'saw a movie' },
        perfect: { scene: '既視感', action: 'have seen this before' }
      }
    },
    {
      infinitive: 'come',
      present: 'come/comes',
      past: 'came',
      pastParticiple: 'come',
      presentParticiple: 'coming',
      meaning: '来る',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'Please come here.',
        past: 'She came yesterday.',
        perfect: 'They have come early.',
        progressive: 'He is coming now.'
      },
      timeTravel: {
        present: { scene: '招待の瞬間', action: 'come here' },
        past: { scene: '昨日の訪問', action: 'came yesterday' },
        perfect: { scene: '早期到着', action: 'have come early' }
      }
    },
    {
      infinitive: 'take',
      present: 'take/takes',
      past: 'took',
      pastParticiple: 'taken',
      presentParticiple: 'taking',
      meaning: '取る、持っていく',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I take the bus.',
        past: 'I took a photo.',
        perfect: 'I have taken this class.',
        progressive: 'I am taking notes.'
      },
      timeTravel: {
        present: { scene: 'バス停', action: 'take the bus' },
        past: { scene: '写真撮影', action: 'took a photo' },
        perfect: { scene: '授業経験', action: 'have taken this class' }
      }
    }
  ],
  
  // 中級不規則動詞
  intermediate: [
    {
      infinitive: 'make',
      present: 'make/makes',
      past: 'made',
      pastParticiple: 'made',
      presentParticiple: 'making',
      meaning: '作る',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I make cookies.',
        past: 'I made a mistake.',
        perfect: 'I have made progress.',
        progressive: 'I am making dinner.'
      }
    },
    {
      infinitive: 'give',
      present: 'give/gives',
      past: 'gave',
      pastParticiple: 'given',
      presentParticiple: 'giving',
      meaning: '与える',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I give presents.',
        past: 'I gave him a book.',
        perfect: 'I have given my best.',
        progressive: 'I am giving a speech.'
      }
    },
    {
      infinitive: 'know',
      present: 'know/knows',
      past: 'knew',
      pastParticiple: 'known',
      presentParticiple: 'knowing',
      meaning: '知っている',
      difficulty: 'hard',
      frequency: 'very-high',
      examples: {
        present: 'I know the answer.',
        past: 'I knew it was true.',
        perfect: 'I have known him for years.',
        progressive: 'I am knowing more each day.' // Note: usually not used in progressive
      }
    }
  ],
  
  // 上級不規則動詞
  advanced: [
    {
      infinitive: 'bring',
      present: 'bring/brings',
      past: 'brought',
      pastParticiple: 'brought',
      presentParticiple: 'bringing',
      meaning: '持ってくる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'Please bring your book.',
        past: 'I brought lunch.',
        perfect: 'You have brought good news.',
        progressive: 'I am bringing a friend.'
      }
    },
    {
      infinitive: 'choose',
      present: 'choose/chooses',
      past: 'chose',
      pastParticiple: 'chosen',
      presentParticiple: 'choosing',
      meaning: '選ぶ',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'I choose carefully.',
        past: 'I chose the red one.',
        perfect: 'I have chosen my path.',
        progressive: 'I am choosing a career.'
      }
    },
    {
      infinitive: 'begin',
      present: 'begin/begins',
      past: 'began',
      pastParticiple: 'begun',
      presentParticiple: 'beginning',
      meaning: '始める',
      difficulty: 'hard',
      frequency: 'high',
      examples: {
        present: 'Classes begin at 9.',
        past: 'The show began early.',
        perfect: 'We have begun our journey.',
        progressive: 'We are beginning to understand.'
      }
    }
  ]
}

// ゲーム用のチャレンジセット
export const verbChallenges = {
  timeTravel: {
    easy: {
      name: 'タイムトラベル初級',
      verbs: ['go', 'eat', 'see', 'come', 'take'],
      timeLimit: 60,
      targetAccuracy: 80,
      energyReduction: 10
    },
    medium: {
      name: 'タイムトラベル中級', 
      verbs: ['make', 'give', 'know', 'think', 'get'],
      timeLimit: 90,
      targetAccuracy: 75,
      energyReduction: 15
    },
    hard: {
      name: 'タイムトラベル上級',
      verbs: ['bring', 'choose', 'begin', 'break', 'build'],
      timeLimit: 120,
      targetAccuracy: 70,
      energyReduction: 20
    }
  },
  
  rapidFire: {
    beVerbs: {
      name: 'Be動詞ラピッドファイア',
      forms: ['am', 'is', 'are', 'was', 'were', 'been'],
      timeLimit: 30,
      targetScore: 20
    },
    irregular: {
      name: '不規則動詞ラピッドファイア',
      verbs: ['go/went/gone', 'eat/ate/eaten', 'see/saw/seen'],
      timeLimit: 45,
      targetScore: 15
    }
  }
}

// 時制変換ルール
export const tenseTransformRules = {
  presentToPast: {
    regular: verb => verb.endsWith('e') ? verb + 'd' : verb + 'ed',
    irregular: verb => {
      const found = Object.values(irregularVerbDatabase)
        .flat()
        .find(v => v.infinitive === verb)
      return found ? found.past : null
    }
  },
  
  presentToPerfect: {
    regular: verb => 'have ' + (verb.endsWith('e') ? verb + 'd' : verb + 'ed'),
    irregular: verb => {
      const found = Object.values(irregularVerbDatabase)
        .flat()
        .find(v => v.infinitive === verb)
      return found ? 'have ' + found.pastParticiple : null
    }
  }
}

// スコアリングシステム
export const verbGameScoring = {
  correct: {
    easy: 10,
    medium: 15,
    hard: 20
  },
  bonus: {
    perfectTime: 50,     // 制限時間内完了
    noMistakes: 100,     // ミスなし
    comboMultiplier: 1.5 // 連続正解ボーナス
  },
  penalty: {
    incorrect: -5,
    timeout: -10
  }
}

// エネルギーシステム（宇宙船のエネルギー管理）
export const spaceshipEnergy = {
  maxEnergy: 100,
  startingEnergy: 100,
  consumption: {
    timeTravel: 20,      // 時代移動時
    wrongAnswer: 15,     // 不正解時
    timeout: 25          // タイムアウト時
  },
  restoration: {
    correctAnswer: 10,   // 正解時
    perfectRound: 30,    // パーフェクトラウンド
    levelComplete: 50    // レベル完了時
  }
}