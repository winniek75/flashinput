// Battle Zone Question Database - Eiken Grade 5 to Grade 3
// Multi-Layer Learning Galaxy - 競技バトル用問題集

export const BATTLE_MODES = {
  individual: {
    name: "個人戦",
    description: "1対1の直接対決",
    maxPlayers: 4,
    timePerQuestion: 10,
    pointsSystem: "speed_accuracy"
  },
  team: {
    name: "チーム戦", 
    description: "チーム協力バトル",
    maxPlayers: 8,
    timePerQuestion: 15,
    pointsSystem: "collaborative"
  },
  tournament: {
    name: "トーナメント",
    description: "勝ち抜き戦",
    maxPlayers: 16,
    timePerQuestion: 8,
    pointsSystem: "elimination"
  }
}

export const POWER_UPS = {
  timeFreeze: {
    id: "timeFreeze",
    name: "時間停止",
    icon: "❄️",
    description: "相手の時間を3秒停止",
    cost: 100,
    duration: 3000,
    rarity: "common"
  },
  doublePoints: {
    id: "doublePoints", 
    name: "ダブルポイント",
    icon: "⭐",
    description: "次の正解で2倍ポイント",
    cost: 150,
    duration: 10000,
    rarity: "uncommon"
  },
  hintReveal: {
    id: "hintReveal",
    name: "ヒント表示",
    icon: "💡",
    description: "正解のヒントを表示",
    cost: 75,
    duration: 5000,
    rarity: "common"
  },
  shieldProtection: {
    id: "shieldProtection",
    name: "シールド",
    icon: "🛡️", 
    description: "次の攻撃を無効化",
    cost: 200,
    duration: 15000,
    rarity: "rare"
  },
  rapidFire: {
    id: "rapidFire",
    name: "高速射撃",
    icon: "🚀",
    description: "制限時間が半分に",
    cost: 120,
    duration: 20000,
    rarity: "uncommon"
  }
}

// Battle Zone Questions by Eiken Level and Battle Type
export const BATTLE_ZONE_QUESTIONS = {
  grade5: {
    quickFire: [
      // 超高速バトル用（5秒制限）
      {
        id: "g5_qf_001",
        question: "I ___ happy.",
        options: ["am", "is"],
        correctAnswer: 0,
        level: "grade5",
        battleType: "quickFire",
        points: 50,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g5_qf_002",
        question: "She ___ a student.",
        options: ["is", "are"],
        correctAnswer: 0,
        level: "grade5",
        battleType: "quickFire", 
        points: 50,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g5_qf_003",
        question: "They ___ friends.",
        options: ["is", "are"],
        correctAnswer: 1,
        level: "grade5",
        battleType: "quickFire",
        points: 50,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g5_qf_004",
        question: "I ___ English.",
        options: ["study", "studies"],
        correctAnswer: 0,
        level: "grade5",
        battleType: "quickFire",
        points: 50,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g5_qf_005",
        question: "He ___ soccer.",
        options: ["play", "plays"],
        correctAnswer: 1,
        level: "grade5",
        battleType: "quickFire",
        points: 50,
        timeLimit: 5,
        difficulty: "easy"
      }
    ],
    
    standard: [
      // 標準バトル用（10秒制限）
      {
        id: "g5_std_001",
        question: "___ you a teacher?",
        options: ["Are", "Is", "Am", "Do"],
        correctAnswer: 0,
        level: "grade5",
        battleType: "standard",
        points: 100,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g5_std_002",
        question: "She ___ not like coffee.",
        options: ["do", "does", "is", "are"],
        correctAnswer: 1,
        level: "grade5",
        battleType: "standard",
        points: 100,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g5_std_003",
        question: "Where ___ you from?",
        options: ["is", "are", "do", "does"],
        correctAnswer: 1,
        level: "grade5",
        battleType: "standard",
        points: 100,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g5_std_004",
        question: "I go to ___ every day.",
        options: ["school", "hospital", "bank", "library"],
        correctAnswer: 0,
        level: "grade5",
        battleType: "standard",
        points: 100,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g5_std_005",
        question: "What ___ your name?",
        options: ["is", "are", "do", "does"],
        correctAnswer: 0,
        level: "grade5",
        battleType: "standard",
        points: 100,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      }
    ],

    challenge: [
      // 挑戦バトル用（15秒制限、複雑な問題）
      {
        id: "g5_chg_001",
        question: "Complete the conversation: A: How are you? B: I ___ fine, thank you.",
        options: ["am", "is", "are", "be"],
        correctAnswer: 0,
        level: "grade5",
        battleType: "challenge",
        points: 200,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "会話では I am fine が正しい返答です"
      },
      {
        id: "g5_chg_002",
        question: "Choose the correct sentence:",
        options: [
          "She don't like music.",
          "She doesn't like music.", 
          "She not like music.",
          "She no like music."
        ],
        correctAnswer: 1,
        level: "grade5",
        battleType: "challenge",
        points: 200,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "三人称単数の否定文は doesn't を使います"
      },
      {
        id: "g5_chg_003",
        question: "What is the correct question for the answer 'I am 12 years old'?",
        options: [
          "How are you?",
          "How old are you?",
          "What are you?",
          "Where are you?"
        ],
        correctAnswer: 1,
        level: "grade5",
        battleType: "challenge",
        points: 200,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "年齢を聞く時は How old are you? を使います"
      }
    ]
  },

  grade4: [
    quickFire: [
      {
        id: "g4_qf_001",
        question: "I ___ to Tokyo yesterday.",
        options: ["go", "went"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "quickFire",
        points: 75,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g4_qf_002",
        question: "She ___ watching TV.",
        options: ["is", "are"],
        correctAnswer: 0,
        level: "grade4",
        battleType: "quickFire",
        points: 75,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g4_qf_003",
        question: "This book is ___ than that one.",
        options: ["big", "bigger"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "quickFire",
        points: 75,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g4_qf_004",
        question: "I ___ go to the party tomorrow.",
        options: ["will", "would"],
        correctAnswer: 0,
        level: "grade4",
        battleType: "quickFire",
        points: 75,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g4_qf_005",
        question: "___ do you live?",
        options: ["What", "Where"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "quickFire",
        points: 75,
        timeLimit: 5,
        difficulty: "easy"
      }
    ],

    standard: [
      {
        id: "g4_std_001",
        question: "She ___ dinner when I called her.",
        options: ["cooked", "was cooking", "is cooking", "cooks"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "standard",
        points: 150,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g4_std_002",
        question: "Which is correct? Tokyo is ___ than Osaka.",
        options: ["more big", "bigger", "most big", "biggest"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "standard",
        points: 150,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g4_std_003",
        question: "___ is your birthday?",
        options: ["What", "When", "Where", "Who"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "standard",
        points: 150,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g4_std_004",
        question: "I ___ going to visit my grandmother next week.",
        options: ["am", "is", "are", "will"],
        correctAnswer: 0,
        level: "grade4",
        battleType: "standard",
        points: 150,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g4_std_005",
        question: "They ___ tennis every Sunday.",
        options: ["played", "play", "are playing", "will play"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "standard",
        points: 150,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      }
    ],

    challenge: [
      {
        id: "g4_chg_001",
        question: "Complete the dialogue: A: What were you doing at 8 PM? B: I ___ my homework.",
        options: ["did", "was doing", "have done", "do"],
        correctAnswer: 1,
        level: "grade4",
        battleType: "challenge",
        points: 300,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "過去の特定の時間での動作は過去進行形を使います"
      },
      {
        id: "g4_chg_002",
        question: "Choose the most natural sentence:",
        options: [
          "This test is more easy than that test.",
          "This test is easier than that test.",
          "This test is more easier than that test.",
          "This test is easyer than that test."
        ],
        correctAnswer: 1,
        level: "grade4",
        battleType: "challenge",
        points: 300,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "easy の比較級は easier です"
      },
      {
        id: "g4_chg_003",
        question: "What's the correct response to 'How long have you been studying English?'",
        options: [
          "Since 2 years.",
          "For 2 years.",
          "2 years ago.",
          "In 2 years."
        ],
        correctAnswer: 1,
        level: "grade4",
        battleType: "challenge",
        points: 300,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "期間を表すには for を使います"
      }
    ]
  },

  grade3: [
    quickFire: [
      {
        id: "g3_qf_001",
        question: "I ___ lived here for 5 years.",
        options: ["have", "has"],
        correctAnswer: 0,
        level: "grade3",
        battleType: "quickFire",
        points: 100,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g3_qf_002",
        question: "This book ___ written by Shakespeare.",
        options: ["was", "were"],
        correctAnswer: 0,
        level: "grade3",
        battleType: "quickFire",
        points: 100,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g3_qf_003",
        question: "The man ___ is standing there is my father.",
        options: ["who", "which"],
        correctAnswer: 0,
        level: "grade3",
        battleType: "quickFire",
        points: 100,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g3_qf_004",
        question: "If I ___ rich, I would travel.",
        options: ["was", "were"],
        correctAnswer: 1,
        level: "grade3",
        battleType: "quickFire",
        points: 100,
        timeLimit: 5,
        difficulty: "easy"
      },
      {
        id: "g3_qf_005",
        question: "This is the ___ book I have ever read.",
        options: ["most interesting", "more interesting"],
        correctAnswer: 0,
        level: "grade3",
        battleType: "quickFire",
        points: 100,
        timeLimit: 5,
        difficulty: "easy"
      }
    ],

    standard: [
      {
        id: "g3_std_001",
        question: "She ___ never been to France before.",
        options: ["have", "has", "had", "having"],
        correctAnswer: 1,
        level: "grade3",
        battleType: "standard",
        points: 200,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g3_std_002",
        question: "The letter ___ delivered yesterday.",
        options: ["is", "was", "has", "had"],
        correctAnswer: 1,
        level: "grade3",
        battleType: "standard",
        points: 200,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g3_std_003",
        question: "I know the place ___ we first met.",
        options: ["who", "which", "where", "when"],
        correctAnswer: 2,
        level: "grade3",
        battleType: "standard",
        points: 200,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g3_std_004",
        question: "What would you do if you ___ a million dollars?",
        options: ["have", "had", "has", "having"],
        correctAnswer: 1,
        level: "grade3",
        battleType: "standard",
        points: 200,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      },
      {
        id: "g3_std_005",
        question: "Mt. Fuji is ___ mountain in Japan.",
        options: ["high", "higher", "the highest", "highest"],
        correctAnswer: 2,
        level: "grade3",
        battleType: "standard",
        points: 200,
        timeLimit: 10,
        difficulty: "medium",
        powerUpEligible: true
      }
    ],

    challenge: [
      {
        id: "g3_chg_001",
        question: "Complete the complex sentence: The book ___ was written by the author ___ won the Nobel Prize is very popular.",
        options: [
          "which, who",
          "that, which", 
          "who, that",
          "where, when"
        ],
        correctAnswer: 0,
        level: "grade3",
        battleType: "challenge",
        points: 400,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "本（物）にはwhich、作者（人）にはwhoを使います"
      },
      {
        id: "g3_chg_002",
        question: "Choose the correct passive voice transformation of 'Someone has stolen my bike.'",
        options: [
          "My bike has stolen by someone.",
          "My bike has been stolen by someone.",
          "My bike was stolen by someone.",
          "My bike is stolen by someone."
        ],
        correctAnswer: 1,
        level: "grade3",
        battleType: "challenge",
        points: 400,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "現在完了の受動態は has/have been + 過去分詞です"
      },
      {
        id: "g3_chg_003",
        question: "What's the most appropriate conditional sentence?",
        options: [
          "If I will have time, I will visit you.",
          "If I have time, I will visit you.",
          "If I had time, I will visit you.",
          "If I would have time, I visit you."
        ],
        correctAnswer: 1,
        level: "grade3",
        battleType: "challenge",
        points: 400,
        timeLimit: 15,
        difficulty: "hard",
        powerUpEligible: true,
        explanation: "第1条件文：If + 現在形, will + 動詞の原形"
      }
    ]
  }
}

// Team Battle Special Challenges
export const TEAM_CHALLENGES = {
  relay: [
    {
      id: "team_relay_001",
      name: "Grammar Relay",
      description: "チームメンバーが順番に答える継続チャレンジ",
      questions: [
        {
          question: "I ___ a student.",
          options: ["am", "is", "are"],
          correctAnswer: 0,
          player: 1
        },
        {
          question: "She ___ very happy.",
          options: ["am", "is", "are"],
          correctAnswer: 1,
          player: 2
        },
        {
          question: "They ___ from Japan.",
          options: ["am", "is", "are"],
          correctAnswer: 2,
          player: 3
        }
      ],
      bonusPoints: 500,
      timeLimit: 30
    }
  ],
  
  collaborative: [
    {
      id: "team_collab_001",
      name: "Sentence Building Challenge",
      description: "チーム全員で長い文を構築",
      task: {
        targetSentence: "The book that I bought yesterday was written by a famous author who lives in Tokyo.",
        wordBank: ["The", "book", "that", "I", "bought", "yesterday", "was", "written", "by", "a", "famous", "author", "who", "lives", "in", "Tokyo"],
        teamRoles: {
          player1: "Subject selection",
          player2: "Verb selection", 
          player3: "Object/Complement selection",
          player4: "Final arrangement"
        }
      },
      bonusPoints: 1000,
      timeLimit: 60
    }
  ]
}

// Utility functions for Battle Zone
export const getRandomBattleQuestions = (level, battleType, count = 10) => {
  const questions = BATTLE_ZONE_QUESTIONS[level]?.[battleType] || []
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export const getMixedDifficultyBattle = (level, count = 15) => {
  const allQuestions = []
  const levelQuestions = BATTLE_ZONE_QUESTIONS[level] || {}
  
  Object.keys(levelQuestions).forEach(battleType => {
    allQuestions.push(...levelQuestions[battleType])
  })
  
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export const getEscalatingDifficulty = (level) => {
  const levelQuestions = BATTLE_ZONE_QUESTIONS[level] || {}
  const sequence = []
  
  // Start with quickFire (easy)
  if (levelQuestions.quickFire) {
    sequence.push(...levelQuestions.quickFire.slice(0, 3))
  }
  
  // Add standard (medium)
  if (levelQuestions.standard) {
    sequence.push(...levelQuestions.standard.slice(0, 4))
  }
  
  // Finish with challenge (hard)
  if (levelQuestions.challenge) {
    sequence.push(...levelQuestions.challenge.slice(0, 3))
  }
  
  return sequence
}

export const getTeamBattleQuestions = (levels = ['grade5', 'grade4', 'grade3']) => {
  const teamQuestions = []
  
  levels.forEach(level => {
    const levelQuestions = BATTLE_ZONE_QUESTIONS[level] || {}
    Object.keys(levelQuestions).forEach(battleType => {
      const questions = levelQuestions[battleType].filter(q => q.powerUpEligible)
      teamQuestions.push(...questions)
    })
  })
  
  return teamQuestions.sort(() => Math.random() - 0.5)
}