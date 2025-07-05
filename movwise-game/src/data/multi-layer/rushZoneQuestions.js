// Rush Zone Question Database - Eiken Grade 5 to Grade 3
// Multi-Layer Learning Galaxy - 高速反復練習用問題集

export const EIKEN_LEVELS = {
  grade5: {
    name: "英検5級",
    description: "基本的な単語・文法",
    difficulty: "beginner",
    timeLimit: 15 // seconds per question
  },
  grade4: {
    name: "英検4級", 
    description: "日常会話レベル",
    difficulty: "beginner-intermediate",
    timeLimit: 12
  },
  grade3: {
    name: "英検3級",
    description: "中学修了レベル", 
    difficulty: "intermediate",
    timeLimit: 10
  }
}

// Rush Zone Questions by Eiken Level
export const RUSH_ZONE_QUESTIONS = {
  grade5: [
    // Be動詞基本
    {
      id: "g5_be_001",
      question: "I ___ a student.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 0,
      grammarTopic: "Be動詞",
      level: "grade5",
      points: 10,
      explanation: "Iの後にはamを使います"
    },
    {
      id: "g5_be_002", 
      question: "She ___ my sister.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 1,
      grammarTopic: "Be動詞",
      level: "grade5",
      points: 10,
      explanation: "He/She/Itの後にはisを使います"
    },
    {
      id: "g5_be_003",
      question: "They ___ from Canada.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 2,
      grammarTopic: "Be動詞",
      level: "grade5", 
      points: 10,
      explanation: "You/We/Theyの後にはareを使います"
    },
    {
      id: "g5_be_004",
      question: "You ___ very kind.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 2,
      grammarTopic: "Be動詞",
      level: "grade5",
      points: 10,
      explanation: "Youの後にはareを使います"
    },
    {
      id: "g5_be_005",
      question: "It ___ a beautiful day.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 1,
      grammarTopic: "Be動詞",
      level: "grade5",
      points: 10,
      explanation: "Itの後にはisを使います"
    },
    
    // 一般動詞現在形
    {
      id: "g5_verb_001",
      question: "I ___ English every day.",
      options: ["study", "studies", "studied", "studying"],
      correctAnswer: 0,
      grammarTopic: "一般動詞現在形",
      level: "grade5",
      points: 10,
      explanation: "Iの後は動詞の原形を使います"
    },
    {
      id: "g5_verb_002",
      question: "He ___ soccer on Sundays.",
      options: ["play", "plays", "played", "playing"],
      correctAnswer: 1,
      grammarTopic: "一般動詞現在形",
      level: "grade5",
      points: 10,
      explanation: "三人称単数（He/She/It）の後は動詞にsをつけます"
    },
    {
      id: "g5_verb_003",
      question: "We ___ lunch at 12 o'clock.",
      options: ["have", "has", "had", "having"],
      correctAnswer: 0,
      grammarTopic: "一般動詞現在形",
      level: "grade5",
      points: 10,
      explanation: "Weの後は動詞の原形を使います"
    },
    {
      id: "g5_verb_004",
      question: "She ___ to school by bus.",
      options: ["go", "goes", "went", "going"],
      correctAnswer: 1,
      grammarTopic: "一般動詞現在形",
      level: "grade5",
      points: 10,
      explanation: "Sheの後は動詞にsをつけます"
    },
    {
      id: "g5_verb_005",
      question: "They ___ TV in the evening.",
      options: ["watch", "watches", "watched", "watching"],
      correctAnswer: 0,
      grammarTopic: "一般動詞現在形", 
      level: "grade5",
      points: 10,
      explanation: "Theyの後は動詞の原形を使います"
    },

    // 疑問文
    {
      id: "g5_question_001",
      question: "___ you a teacher?",
      options: ["Are", "Is", "Am", "Do"],
      correctAnswer: 0,
      grammarTopic: "Be動詞疑問文",
      level: "grade5",
      points: 15,
      explanation: "Youを使ったBe動詞の疑問文はAreで始めます"
    },
    {
      id: "g5_question_002",
      question: "___ she like music?",
      options: ["Do", "Does", "Is", "Are"],
      correctAnswer: 1,
      grammarTopic: "一般動詞疑問文",
      level: "grade5",
      points: 15,
      explanation: "三人称単数の一般動詞疑問文はDoesを使います"
    },
    {
      id: "g5_question_003",
      question: "___ they students?",
      options: ["Are", "Is", "Do", "Does"],
      correctAnswer: 0,
      grammarTopic: "Be動詞疑問文",
      level: "grade5",
      points: 15,
      explanation: "Theyを使ったBe動詞の疑問文はAreで始めます"
    },
    {
      id: "g5_question_004",
      question: "___ you play tennis?",
      options: ["Do", "Does", "Are", "Is"],
      correctAnswer: 0,
      grammarTopic: "一般動詞疑問文",
      level: "grade5",
      points: 15,
      explanation: "Youを使った一般動詞の疑問文はDoを使います"
    },
    {
      id: "g5_question_005",
      question: "___ he from Japan?",
      options: ["Is", "Are", "Do", "Does"],
      correctAnswer: 0,
      grammarTopic: "Be動詞疑問文",
      level: "grade5",
      points: 15,
      explanation: "Heを使ったBe動詞の疑問文はIsで始めます"
    },

    // 否定文
    {
      id: "g5_negative_001",
      question: "I ___ not a doctor.",
      options: ["am", "is", "are", "do"],
      correctAnswer: 0,
      grammarTopic: "Be動詞否定文",
      level: "grade5",
      points: 15,
      explanation: "Iの否定文は 'am not' を使います"
    },
    {
      id: "g5_negative_002",
      question: "She ___ not like coffee.",
      options: ["do", "does", "is", "are"],
      correctAnswer: 1,
      grammarTopic: "一般動詞否定文",
      level: "grade5",
      points: 15,
      explanation: "三人称単数の否定文は 'does not' を使います"
    },
    {
      id: "g5_negative_003",
      question: "We ___ not busy today.",
      options: ["am", "is", "are", "do"],
      correctAnswer: 2,
      grammarTopic: "Be動詞否定文",
      level: "grade5",
      points: 15,
      explanation: "Weの否定文は 'are not' を使います"
    },
    {
      id: "g5_negative_004",
      question: "They ___ not play basketball.",
      options: ["do", "does", "is", "are"],
      correctAnswer: 0,
      grammarTopic: "一般動詞否定文",
      level: "grade5",
      points: 15,
      explanation: "They/We/Youの否定文は 'do not' を使います"
    },
    {
      id: "g5_negative_005",
      question: "It ___ not cold today.",
      options: ["am", "is", "are", "do"],
      correctAnswer: 1,
      grammarTopic: "Be動詞否定文",
      level: "grade5",
      points: 15,
      explanation: "Itの否定文は 'is not' を使います"
    },

    // 基本語彙
    {
      id: "g5_vocab_001",
      question: "I go to ___ every day.",
      options: ["school", "hospital", "bank", "library"],
      correctAnswer: 0,
      grammarTopic: "基本語彙",
      level: "grade5",
      points: 10,
      explanation: "毎日行くのは学校(school)です"
    },
    {
      id: "g5_vocab_002",
      question: "She has a ___ dog.",
      options: ["big", "small", "red", "fast"],
      correctAnswer: 0,
      grammarTopic: "形容詞",
      level: "grade5",
      points: 10,
      explanation: "犬の大きさを表すのはbig(大きい)が自然です"
    },
    {
      id: "g5_vocab_003",
      question: "We eat ___ in the morning.",
      options: ["breakfast", "lunch", "dinner", "snack"],
      correctAnswer: 0,
      grammarTopic: "基本語彙",
      level: "grade5",
      points: 10,
      explanation: "朝に食べるのは朝食(breakfast)です"
    },
    {
      id: "g5_vocab_004",
      question: "The ___ is shining today.",
      options: ["sun", "moon", "star", "cloud"],
      correctAnswer: 0,
      grammarTopic: "基本語彙",
      level: "grade5",
      points: 10,
      explanation: "日中に輝いているのは太陽(sun)です"
    },
    {
      id: "g5_vocab_005",
      question: "I have ___ books.",
      options: ["three", "tree", "free", "flee"],
      correctAnswer: 0,
      grammarTopic: "数字",
      level: "grade5",
      points: 10,
      explanation: "本の数を表すのはthree(3)です"
    }
  ],

  grade4: [
    // 過去形
    {
      id: "g4_past_001",
      question: "I ___ to Tokyo yesterday.",
      options: ["go", "went", "gone", "going"],
      correctAnswer: 1,
      grammarTopic: "過去形",
      level: "grade4",
      points: 15,
      explanation: "goの過去形はwentです"
    },
    {
      id: "g4_past_002",
      question: "She ___ a movie last night.",
      options: ["watch", "watched", "watches", "watching"],
      correctAnswer: 1,
      grammarTopic: "過去形",
      level: "grade4",
      points: 15,
      explanation: "規則動詞watchの過去形はwatchedです"
    },
    {
      id: "g4_past_003",
      question: "They ___ at the restaurant.",
      options: ["eat", "ate", "eaten", "eating"],
      correctAnswer: 1,
      grammarTopic: "過去形",
      level: "grade4",
      points: 15,
      explanation: "eatの過去形はateです"
    },
    {
      id: "g4_past_004",
      question: "We ___ very happy.",
      options: ["was", "were", "are", "am"],
      correctAnswer: 1,
      grammarTopic: "Be動詞過去形",
      level: "grade4", 
      points: 15,
      explanation: "Weの過去形はwereです"
    },
    {
      id: "g4_past_005",
      question: "He ___ soccer when he was young.",
      options: ["play", "played", "plays", "playing"],
      correctAnswer: 1,
      grammarTopic: "過去形",
      level: "grade4",
      points: 15,
      explanation: "規則動詞playの過去形はplayedです"
    },

    // 未来形
    {
      id: "g4_future_001",
      question: "I ___ go to the party tomorrow.",
      options: ["will", "would", "should", "could"],
      correctAnswer: 0,
      grammarTopic: "未来形",
      level: "grade4",
      points: 15,
      explanation: "未来を表すにはwillを使います"
    },
    {
      id: "g4_future_002",
      question: "She ___ be here soon.",
      options: ["will", "would", "should", "could"],
      correctAnswer: 0,
      grammarTopic: "未来形",
      level: "grade4",
      points: 15,
      explanation: "近い未来を表すにはwillを使います"
    },
    {
      id: "g4_future_003",
      question: "We ___ going to travel next week.",
      options: ["am", "is", "are", "will"],
      correctAnswer: 2,
      grammarTopic: "be going to未来",
      level: "grade4",
      points: 15,
      explanation: "Weと一緒に使うのはareです"
    },
    {
      id: "g4_future_004",
      question: "They ___ study English next year.",
      options: ["will", "would", "should", "could"],
      correctAnswer: 0,
      grammarTopic: "未来形",
      level: "grade4",
      points: 15,
      explanation: "未来の予定を表すにはwillを使います"
    },
    {
      id: "g4_future_005",
      question: "It ___ rain tomorrow.",
      options: ["will", "would", "should", "could"],
      correctAnswer: 0,
      grammarTopic: "未来形",
      level: "grade4",
      points: 15,
      explanation: "天気の予報を表すにはwillを使います"
    },

    // 比較級
    {
      id: "g4_comp_001",
      question: "This book is ___ than that one.",
      options: ["interesting", "more interesting", "most interesting", "interestinger"],
      correctAnswer: 1,
      grammarTopic: "比較級",
      level: "grade4",
      points: 20,
      explanation: "長い形容詞の比較級はmore + 形容詞です"
    },
    {
      id: "g4_comp_002", 
      question: "She is ___ than her sister.",
      options: ["tall", "taller", "tallest", "more tall"],
      correctAnswer: 1,
      grammarTopic: "比較級",
      level: "grade4",
      points: 20,
      explanation: "短い形容詞の比較級は語尾に-erをつけます"
    },
    {
      id: "g4_comp_003",
      question: "This test is ___ than the last one.",
      options: ["easy", "easier", "easiest", "more easy"],
      correctAnswer: 1,
      grammarTopic: "比較級",
      level: "grade4",
      points: 20,
      explanation: "easyの比較級はeasierです（y→i+er）"
    },
    {
      id: "g4_comp_004",
      question: "Tokyo is ___ than Osaka.",
      options: ["big", "bigger", "biggest", "more big"],
      correctAnswer: 1,
      grammarTopic: "比較級",
      level: "grade4",
      points: 20,
      explanation: "bigの比較級はbiggerです（子音字を重ねて-er）"
    },
    {
      id: "g4_comp_005",
      question: "English is ___ than math.",
      options: ["difficult", "more difficult", "most difficult", "difficulter"],
      correctAnswer: 1,
      grammarTopic: "比較級",
      level: "grade4",
      points: 20,
      explanation: "長い形容詞difficultの比較級はmore difficultです"
    },

    // 現在進行形
    {
      id: "g4_progressive_001",
      question: "I ___ watching TV now.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 0,
      grammarTopic: "現在進行形",
      level: "grade4",
      points: 15,
      explanation: "現在進行形はbe動詞 + ing形です。Iにはamを使います"
    },
    {
      id: "g4_progressive_002",
      question: "She ___ cooking dinner.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 1,
      grammarTopic: "現在進行形",
      level: "grade4",
      points: 15,
      explanation: "Sheには is を使います"
    },
    {
      id: "g4_progressive_003",
      question: "They ___ playing soccer.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 2,
      grammarTopic: "現在進行形",
      level: "grade4",
      points: 15,
      explanation: "Theyには are を使います"
    },
    {
      id: "g4_progressive_004",
      question: "We ___ studying English.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 2,
      grammarTopic: "現在進行形",
      level: "grade4",
      points: 15,
      explanation: "Weには are を使います"
    },
    {
      id: "g4_progressive_005",
      question: "He ___ reading a book.",
      options: ["am", "is", "are", "be"],
      correctAnswer: 1,
      grammarTopic: "現在進行形",
      level: "grade4",
      points: 15,
      explanation: "Heには is を使います"
    },

    // 疑問詞
    {
      id: "g4_wh_001",
      question: "___ do you live?",
      options: ["What", "Where", "When", "Who"],
      correctAnswer: 1,
      grammarTopic: "疑問詞",
      level: "grade4",
      points: 20,
      explanation: "場所を聞く時はWhereを使います"
    },
    {
      id: "g4_wh_002",
      question: "___ is your birthday?",
      options: ["What", "Where", "When", "Who"],
      correctAnswer: 2,
      grammarTopic: "疑問詞",
      level: "grade4",
      points: 20,
      explanation: "時期を聞く時はWhenを使います"
    },
    {
      id: "g4_wh_003",
      question: "___ is your favorite color?",
      options: ["What", "Where", "When", "Who"],
      correctAnswer: 0,
      grammarTopic: "疑問詞",
      level: "grade4",
      points: 20,
      explanation: "物事を聞く時はWhatを使います"
    },
    {
      id: "g4_wh_004",
      question: "___ is that man?",
      options: ["What", "Where", "When", "Who"],
      correctAnswer: 3,
      grammarTopic: "疑問詞",
      level: "grade4",
      points: 20,
      explanation: "人を聞く時はWhoを使います"
    },
    {
      id: "g4_wh_005",
      question: "___ do you get up?",
      options: ["What time", "Where", "Why", "Who"],
      correctAnswer: 0,
      grammarTopic: "疑問詞",
      level: "grade4",
      points: 20,
      explanation: "時刻を聞く時はWhat timeを使います"
    }
  ],

  grade3: [
    // 現在完了形
    {
      id: "g3_perfect_001",
      question: "I ___ lived in Tokyo for 5 years.",
      options: ["have", "has", "had", "having"],
      correctAnswer: 0,
      grammarTopic: "現在完了形",
      level: "grade3",
      points: 25,
      explanation: "Iの現在完了形はhave + 過去分詞です"
    },
    {
      id: "g3_perfect_002",
      question: "She ___ finished her homework.",
      options: ["have", "has", "had", "having"],
      correctAnswer: 1,
      grammarTopic: "現在完了形",
      level: "grade3", 
      points: 25,
      explanation: "三人称単数の現在完了形はhas + 過去分詞です"
    },
    {
      id: "g3_perfect_003",
      question: "We ___ been to France twice.",
      options: ["have", "has", "had", "having"],
      correctAnswer: 0,
      grammarTopic: "現在完了形",
      level: "grade3",
      points: 25,
      explanation: "Weの現在完了形はhave + 過去分詞です"
    },
    {
      id: "g3_perfect_004",
      question: "They ___ never seen this movie.",
      options: ["have", "has", "had", "having"],
      correctAnswer: 0,
      grammarTopic: "現在完了形",
      level: "grade3",
      points: 25,
      explanation: "Theyの現在完了形はhave + 過去分詞です"
    },
    {
      id: "g3_perfect_005",
      question: "He ___ just arrived.",
      options: ["have", "has", "had", "having"],
      correctAnswer: 1,
      grammarTopic: "現在完了形",
      level: "grade3",
      points: 25,
      explanation: "Heの現在完了形はhas + 過去分詞です"
    },

    // 受動態
    {
      id: "g3_passive_001",
      question: "This book ___ written by a famous author.",
      options: ["is", "are", "was", "were"],
      correctAnswer: 2,
      grammarTopic: "受動態",
      level: "grade3",
      points: 30,
      explanation: "過去の受動態はwas/were + 過去分詞です"
    },
    {
      id: "g3_passive_002",
      question: "English ___ spoken all over the world.",
      options: ["is", "are", "was", "were"],
      correctAnswer: 0,
      grammarTopic: "受動態",
      level: "grade3",
      points: 30,
      explanation: "現在の受動態はis/are + 過去分詞です"
    },
    {
      id: "g3_passive_003",
      question: "The windows ___ cleaned yesterday.",
      options: ["is", "are", "was", "were"],
      correctAnswer: 3,
      grammarTopic: "受動態",
      level: "grade3",
      points: 30,
      explanation: "複数形の過去受動態はwere + 過去分詞です"
    },
    {
      id: "g3_passive_004",
      question: "This song ___ loved by many people.",
      options: ["is", "are", "was", "were"],
      correctAnswer: 0,
      grammarTopic: "受動態", 
      level: "grade3",
      points: 30,
      explanation: "現在の受動態で単数形はis + 過去分詞です"
    },
    {
      id: "g3_passive_005",
      question: "These cars ___ made in Japan.",
      options: ["is", "are", "was", "were"],
      correctAnswer: 1,
      grammarTopic: "受動態",
      level: "grade3",
      points: 30,
      explanation: "現在の受動態で複数形はare + 過去分詞です"
    },

    // 関係代名詞
    {
      id: "g3_relative_001",
      question: "The man ___ is standing there is my father.",
      options: ["who", "which", "where", "when"],
      correctAnswer: 0,
      grammarTopic: "関係代名詞",
      level: "grade3",
      points: 35,
      explanation: "人を先行詞とする関係代名詞はwhoです"
    },
    {
      id: "g3_relative_002",
      question: "This is the book ___ I bought yesterday.",
      options: ["who", "which", "where", "when"],
      correctAnswer: 1,
      grammarTopic: "関係代名詞",
      level: "grade3",
      points: 35,
      explanation: "物を先行詞とする関係代名詞はwhichです"
    },
    {
      id: "g3_relative_003",
      question: "I know the place ___ he lives.",
      options: ["who", "which", "where", "when"],
      correctAnswer: 2,
      grammarTopic: "関係代名詞",
      level: "grade3",
      points: 35,
      explanation: "場所を先行詞とする関係副詞はwhereです"
    },
    {
      id: "g3_relative_004",
      question: "Do you remember the day ___ we first met?",
      options: ["who", "which", "where", "when"],
      correctAnswer: 3,
      grammarTopic: "関係代名詞",
      level: "grade3",
      points: 35,
      explanation: "時を先行詞とする関係副詞はwhenです"
    },
    {
      id: "g3_relative_005",
      question: "The girl ___ is singing is my sister.",
      options: ["who", "which", "where", "when"],
      correctAnswer: 0,
      grammarTopic: "関係代名詞",
      level: "grade3",
      points: 35,
      explanation: "人を先行詞とする関係代名詞はwhoです"
    },

    // 仮定法
    {
      id: "g3_conditional_001",
      question: "If I ___ rich, I would travel around the world.",
      options: ["am", "was", "were", "are"],
      correctAnswer: 2,
      grammarTopic: "仮定法",
      level: "grade3",
      points: 40,
      explanation: "仮定法過去ではbe動詞はwereを使います"
    },
    {
      id: "g3_conditional_002",
      question: "If it ___ tomorrow, we will stay home.",
      options: ["rain", "rains", "rained", "raining"],
      correctAnswer: 1,
      grammarTopic: "条件文",
      level: "grade3",
      points: 35,
      explanation: "If節では現在形を使います"
    },
    {
      id: "g3_conditional_003",
      question: "I wish I ___ speak English fluently.",
      options: ["can", "could", "will", "would"],
      correctAnswer: 1,
      grammarTopic: "仮定法",
      level: "grade3",
      points: 40,
      explanation: "wishの後の仮定法ではcouldを使います"
    },
    {
      id: "g3_conditional_004",
      question: "If she ___ harder, she would pass the exam.",
      options: ["study", "studies", "studied", "studying"],
      correctAnswer: 2,
      grammarTopic: "仮定法",
      level: "grade3",
      points: 40,
      explanation: "仮定法過去では動詞の過去形を使います"
    },
    {
      id: "g3_conditional_005",
      question: "What would you do if you ___ a million dollars?",
      options: ["have", "has", "had", "having"],
      correctAnswer: 2,
      grammarTopic: "仮定法",
      level: "grade3",
      points: 40,
      explanation: "仮定法過去では動詞の過去形を使います"
    },

    // 最上級
    {
      id: "g3_superlative_001",
      question: "This is the ___ book I have ever read.",
      options: ["interesting", "more interesting", "most interesting", "interestingest"],
      correctAnswer: 2,
      grammarTopic: "最上級",
      level: "grade3",
      points: 25,
      explanation: "長い形容詞の最上級はthe most + 形容詞です"
    },
    {
      id: "g3_superlative_002",
      question: "She is the ___ student in our class.",
      options: ["smart", "smarter", "smartest", "most smart"],
      correctAnswer: 2,
      grammarTopic: "最上級",
      level: "grade3",
      points: 25,
      explanation: "短い形容詞の最上級はthe + 形容詞 + estです"
    },
    {
      id: "g3_superlative_003",
      question: "Mt. Fuji is the ___ mountain in Japan.",
      options: ["high", "higher", "highest", "most high"],
      correctAnswer: 2,
      grammarTopic: "最上級",
      level: "grade3",
      points: 25,
      explanation: "highの最上級はthe highestです"
    },
    {
      id: "g3_superlative_004",
      question: "This is the ___ delicious cake I've ever eaten.",
      options: ["delicious", "more delicious", "most delicious", "deliciousest"],
      correctAnswer: 2,
      grammarTopic: "最上級",
      level: "grade3",
      points: 25,
      explanation: "長い形容詞deliciousの最上級はthe most deliciousです"
    },
    {
      id: "g3_superlative_005",
      question: "He is the ___ runner in the team.",
      options: ["fast", "faster", "fastest", "most fast"],
      correctAnswer: 2,
      grammarTopic: "最上級",
      level: "grade3",
      points: 25,
      explanation: "fastの最上級はthe fastestです"
    }
  ]
}

// Random question selection utility
export const getRandomQuestions = (level, count = 30) => {
  const questions = RUSH_ZONE_QUESTIONS[level] || []
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Get questions by grammar topic
export const getQuestionsByTopic = (level, topic) => {
  const questions = RUSH_ZONE_QUESTIONS[level] || []
  return questions.filter(q => q.grammarTopic === topic)
}

// Get mixed difficulty questions
export const getMixedQuestions = (levels = ['grade5', 'grade4', 'grade3'], count = 30) => {
  const allQuestions = []
  levels.forEach(level => {
    allQuestions.push(...(RUSH_ZONE_QUESTIONS[level] || []))
  })
  
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}