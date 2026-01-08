// Space Word Order Quest - Game Data
// 英文並べ替え学習ゲームのデータ定義

// 問題タイプの定義
export const QUESTION_TYPES = {
  AFFIRMATIVE: 'affirmative',    // 肯定文
  NEGATIVE: 'negative',          // 否定文
  INTERROGATIVE: 'interrogative', // 疑問文
  MIXED: 'mixed'                 // 混合
}

// 難易度設定
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',       // 基本
  NORMAL: 'normal',   // 標準
  HARD: 'hard',       // 上級
  EXPERT: 'expert'    // エキスパート
}

export const WORD_ORDER_QUESTIONS = {
  // Level 1: 英検5級相当
  1: {
    // 肯定文（基本）
    affirmative: {
      easy: [
        {
          id: 'l1_aff_e1',
          words: ['I', 'like', 'apples'],
          correctOrder: [0, 1, 2],
          translation: '私はりんごが好きです',
          grammarHint: '主語 + 動詞 + 目的語の順番です',
          structure: 'S + V + O',
          grammarPoint: 'basic_svo'
        },
        {
          id: 'l1_aff_e2',
          words: ['She', 'is', 'happy'],
          correctOrder: [0, 1, 2],
          translation: '彼女は幸せです',
          grammarHint: '主語 + be動詞 + 形容詞の順番です',
          structure: 'S + be + Adj',
          grammarPoint: 'be_adjective'
        },
        {
          id: 'l1_aff_e3',
          words: ['We', 'play', 'soccer'],
          correctOrder: [0, 1, 2],
          translation: '私たちはサッカーをします',
          grammarHint: '主語 + 動詞 + 目的語の順番です',
          structure: 'S + V + O',
          grammarPoint: 'basic_svo'
        },
        {
          id: 'l1_aff_e4',
          words: ['The', 'cat', 'sleeps'],
          correctOrder: [0, 1, 2],
          translation: 'その猫は眠ります',
          grammarHint: '冠詞 + 主語 + 動詞の順番です',
          structure: 'Art + S + V',
          grammarPoint: 'article_subject_verb'
        },
        {
          id: 'l1_aff_e5',
          words: ['He', 'eats', 'lunch'],
          correctOrder: [0, 1, 2],
          translation: '彼は昼食を食べます',
          grammarHint: '主語 + 動詞 + 目的語の順番です',
          structure: 'S + V + O',
          grammarPoint: 'basic_svo'
        },
        {
          id: 'l1_aff_e6',
          words: ['They', 'are', 'students'],
          correctOrder: [0, 1, 2],
          translation: '彼らは学生です',
          grammarHint: '主語 + be動詞 + 名詞の順番です',
          structure: 'S + be + N',
          grammarPoint: 'be_noun'
        },
        {
          id: 'l1_aff_e7',
          words: ['I', 'drink', 'water'],
          correctOrder: [0, 1, 2],
          translation: '私は水を飲みます',
          grammarHint: '主語 + 動詞 + 目的語の順番です',
          structure: 'S + V + O',
          grammarPoint: 'basic_svo'
        },
        {
          id: 'l1_aff_e8',
          words: ['She', 'is', 'kind'],
          correctOrder: [0, 1, 2],
          translation: '彼女は親切です',
          grammarHint: '主語 + be動詞 + 形容詞の順番です',
          structure: 'S + be + Adj',
          grammarPoint: 'be_adjective'
        },
        {
          id: 'l1_aff_e9',
          words: ['We', 'watch', 'TV'],
          correctOrder: [0, 1, 2],
          translation: '私たちはテレビを見ます',
          grammarHint: '主語 + 動詞 + 目的語の順番です',
          structure: 'S + V + O',
          grammarPoint: 'basic_svo'
        },
        {
          id: 'l1_aff_e10',
          words: ['It', 'is', 'hot'],
          correctOrder: [0, 1, 2],
          translation: 'それは暑いです',
          grammarHint: '主語 + be動詞 + 形容詞の順番です',
          structure: 'S + be + Adj',
          grammarPoint: 'be_adjective'
        }
      ],
      normal: [
        {
          id: 'l1_aff_n1',
          words: ['My', 'dog', 'runs', 'fast'],
          correctOrder: [0, 1, 2, 3],
          translation: '私の犬は速く走ります',
          grammarHint: '所有格 + 主語 + 動詞 + 副詞の順番です',
          structure: 'Poss + S + V + Adv',
          grammarPoint: 'possessive_subject_verb_adverb'
        },
        {
          id: 'l1_aff_n2',
          words: ['He', 'reads', 'many', 'books'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼はたくさんの本を読みます',
          grammarHint: '主語 + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'S + V + Adj + O',
          grammarPoint: 'adjective_object'
        },
        {
          id: 'l1_aff_n3',
          words: ['They', 'are', 'good', 'students'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼らは良い学生です',
          grammarHint: '主語 + be動詞 + 形容詞 + 名詞の順番です',
          structure: 'S + be + Adj + N',
          grammarPoint: 'be_adjective_noun'
        },
        {
          id: 'l1_aff_n4',
          words: ['She', 'speaks', 'English', 'well'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼女は英語を上手に話します',
          grammarHint: '主語 + 動詞 + 目的語 + 副詞の順番です',
          structure: 'S + V + O + Adv',
          grammarPoint: 'svo_adverb'
        },
        {
          id: 'l1_aff_n5',
          words: ['The', 'boy', 'is', 'tall'],
          correctOrder: [0, 1, 2, 3],
          translation: 'その男の子は背が高いです',
          grammarHint: '冠詞 + 主語 + be動詞 + 形容詞の順番です',
          structure: 'Art + S + be + Adj',
          grammarPoint: 'article_be_adjective'
        },
        {
          id: 'l1_aff_n6',
          words: ['We', 'eat', 'fresh', 'fruit'],
          correctOrder: [0, 1, 2, 3],
          translation: '私たちは新鮮な果物を食べます',
          grammarHint: '主語 + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'S + V + Adj + O',
          grammarPoint: 'adjective_object'
        },
        {
          id: 'l1_aff_n7',
          words: ['His', 'cat', 'sleeps', 'quietly'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼の猫は静かに眠ります',
          grammarHint: '所有格 + 主語 + 動詞 + 副詞の順番です',
          structure: 'Poss + S + V + Adv',
          grammarPoint: 'possessive_subject_verb_adverb'
        },
        {
          id: 'l1_aff_n8',
          words: ['I', 'am', 'a', 'teacher'],
          correctOrder: [0, 1, 2, 3],
          translation: '私は教師です',
          grammarHint: '主語 + be動詞 + 冠詞 + 名詞の順番です',
          structure: 'S + be + Art + N',
          grammarPoint: 'be_article_noun'
        },
        {
          id: 'l1_aff_n9',
          words: ['You', 'sing', 'beautiful', 'songs'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたは美しい歌を歌います',
          grammarHint: '主語 + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'S + V + Adj + O',
          grammarPoint: 'adjective_object'
        },
        {
          id: 'l1_aff_n10',
          words: ['The', 'children', 'play', 'outside'],
          correctOrder: [0, 1, 2, 3],
          translation: '子どもたちは外で遊びます',
          grammarHint: '冠詞 + 主語 + 動詞 + 副詞の順番です',
          structure: 'Art + S + V + Adv',
          grammarPoint: 'article_subject_verb_adverb'
        }
      ],
      hard: [
        {
          id: 'l1_aff_h1',
          words: ['The', 'little', 'girl', 'plays', 'with', 'toys'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'その小さな女の子はおもちゃで遊びます',
          grammarHint: '冠詞 + 形容詞 + 主語 + 動詞 + 前置詞句の順番です',
          structure: 'Art + Adj + S + V + Prep',
          grammarPoint: 'complex_sentence_structure'
        },
        {
          id: 'l1_aff_h2',
          words: ['My', 'younger', 'brother', 'likes', 'playing', 'games'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '私の弟はゲームをするのが好きです',
          grammarHint: '所有格 + 形容詞 + 主語 + 動詞 + 動名詞 + 目的語の順番です',
          structure: 'Poss + Adj + S + V + Ving + O',
          grammarPoint: 'gerund_object'
        },
        {
          id: 'l1_aff_h3',
          words: ['The', 'smart', 'student', 'studies', 'very', 'hard'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'その賢い学生はとても一生懸命勉強します',
          grammarHint: '冠詞 + 形容詞 + 主語 + 動詞 + 副詞 + 副詞の順番です',
          structure: 'Art + Adj + S + V + Adv + Adv',
          grammarPoint: 'adverb_modification'
        },
        {
          id: 'l1_aff_h4',
          words: ['Our', 'new', 'teacher', 'speaks', 'three', 'languages'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '私たちの新しい先生は3つの言語を話します',
          grammarHint: '所有格 + 形容詞 + 主語 + 動詞 + 数詞 + 目的語の順番です',
          structure: 'Poss + Adj + S + V + Num + O',
          grammarPoint: 'number_object'
        },
        {
          id: 'l1_aff_h5',
          words: ['The', 'old', 'man', 'walks', 'in', 'park'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'その年配の男性は公園を歩きます',
          grammarHint: '冠詞 + 形容詞 + 主語 + 動詞 + 前置詞 + 名詞の順番です',
          structure: 'Art + Adj + S + V + Prep + N',
          grammarPoint: 'prepositional_phrase'
        },
        {
          id: 'l1_aff_h6',
          words: ['Her', 'favorite', 'hobby', 'is', 'reading', 'books'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '彼女の好きな趣味は読書です',
          grammarHint: '所有格 + 形容詞 + 主語 + be動詞 + 動名詞 + 目的語の順番です',
          structure: 'Poss + Adj + S + be + Ving + O',
          grammarPoint: 'gerund_complement'
        },
        {
          id: 'l1_aff_h7',
          words: ['This', 'big', 'house', 'has', 'five', 'rooms'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'この大きな家には5つの部屋があります',
          grammarHint: '指示詞 + 形容詞 + 主語 + 動詞 + 数詞 + 目的語の順番です',
          structure: 'Det + Adj + S + V + Num + O',
          grammarPoint: 'demonstrative_adjective'
        },
        {
          id: 'l1_aff_h8',
          words: ['Those', 'young', 'children', 'learn', 'new', 'words'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'あの若い子どもたちは新しい単語を学びます',
          grammarHint: '指示詞 + 形容詞 + 主語 + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'Det + Adj + S + V + Adj + O',
          grammarPoint: 'multiple_adjectives'
        },
        {
          id: 'l1_aff_h9',
          words: ['A', 'beautiful', 'bird', 'sings', 'in', 'tree'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '美しい鳥が木の中で歌います',
          grammarHint: '冠詞 + 形容詞 + 主語 + 動詞 + 前置詞 + 名詞の順番です',
          structure: 'Art + Adj + S + V + Prep + N',
          grammarPoint: 'prepositional_phrase'
        },
        {
          id: 'l1_aff_h10',
          words: ['Every', 'good', 'student', 'does', 'their', 'homework'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'すべての良い学生は宿題をします',
          grammarHint: '量詞 + 形容詞 + 主語 + 動詞 + 所有格 + 目的語の順番です',
          structure: 'Quant + Adj + S + V + Poss + O',
          grammarPoint: 'quantifier_adjective'
        }
      ]
    },
    
    // 否定文
    negative: {
      easy: [
        {
          id: 'l1_neg_e1',
          words: ['I', 'do', 'not', 'like', 'fish'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私は魚が好きではありません',
          grammarHint: '主語 + do + not + 動詞 + 目的語の順番です',
          structure: 'S + do + not + V + O',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l1_neg_e2',
          words: ['She', 'is', 'not', 'tall'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼女は背が高くありません',
          grammarHint: '主語 + be動詞 + not + 形容詞の順番です',
          structure: 'S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_e3',
          words: ['We', 'are', 'not', 'busy'],
          correctOrder: [0, 1, 2, 3],
          translation: '私たちは忙しくありません',
          grammarHint: '主語 + be動詞 + not + 形容詞の順番です',
          structure: 'S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_e4',
          words: ['He', 'is', 'not', 'hungry'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼はお腹が空いていません',
          grammarHint: '主語 + be動詞 + not + 形容詞の順番です',
          structure: 'S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_e5',
          words: ['I', 'do', 'not', 'play', 'games'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私はゲームをしません',
          grammarHint: '主語 + do + not + 動詞 + 目的語の順番です',
          structure: 'S + do + not + V + O',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l1_neg_e6',
          words: ['They', 'are', 'not', 'tired'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼らは疲れていません',
          grammarHint: '主語 + be動詞 + not + 形容詞の順番です',
          structure: 'S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_e7',
          words: ['You', 'do', 'not', 'like', 'coffee'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'あなたはコーヒーが好きではありません',
          grammarHint: '主語 + do + not + 動詞 + 目的語の順番です',
          structure: 'S + do + not + V + O',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l1_neg_e8',
          words: ['It', 'is', 'not', 'cold'],
          correctOrder: [0, 1, 2, 3],
          translation: 'それは寒くありません',
          grammarHint: '主語 + be動詞 + not + 形容詞の順番です',
          structure: 'S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_e9',
          words: ['We', 'do', 'not', 'walk', 'there'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私たちはそこを歩きません',
          grammarHint: '主語 + do + not + 動詞 + 副詞の順番です',
          structure: 'S + do + not + V + Adv',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l1_neg_e10',
          words: ['She', 'is', 'not', 'happy'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼女は幸せではありません',
          grammarHint: '主語 + be動詞 + not + 形容詞の順番です',
          structure: 'S + be + not + Adj',
          grammarPoint: 'be_negative'
        }
      ],
      normal: [
        {
          id: 'l1_neg_n1',
          words: ['He', 'does', 'not', 'play', 'tennis'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼はテニスをしません',
          grammarHint: '三人称単数では does not を使います',
          structure: 'S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_n2',
          words: ['The', 'cat', 'does', 'not', 'eat', 'vegetables'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'その猫は野菜を食べません',
          grammarHint: '冠詞 + 主語 + does + not + 動詞 + 目的語の順番です',
          structure: 'Art + S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_n3',
          words: ['My', 'dog', 'does', 'not', 'bite'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私の犬は噛みません',
          grammarHint: '所有格 + 主語 + does + not + 動詞の順番です',
          structure: 'Poss + S + does + not + V',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_n4',
          words: ['She', 'does', 'not', 'speak', 'Japanese'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼女は日本語を話しません',
          grammarHint: '三人称単数では does not を使います',
          structure: 'S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_n5',
          words: ['The', 'boy', 'is', 'not', 'short'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'その男の子は背が低くありません',
          grammarHint: '冠詞 + 主語 + be動詞 + not + 形容詞の順番です',
          structure: 'Art + S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_n6',
          words: ['I', 'do', 'not', 'eat', 'meat'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私は肉を食べません',
          grammarHint: '主語 + do + not + 動詞 + 目的語の順番です',
          structure: 'S + do + not + V + O',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l1_neg_n7',
          words: ['His', 'sister', 'does', 'not', 'sing'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼の姉（妹）は歌いません',
          grammarHint: '所有格 + 主語 + does + not + 動詞の順番です',
          structure: 'Poss + S + does + not + V',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_n8',
          words: ['We', 'are', 'not', 'late'],
          correctOrder: [0, 1, 2, 3],
          translation: '私たちは遅刻していません',
          grammarHint: '主語 + be動詞 + not + 形容詞の順番です',
          structure: 'S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_n9',
          words: ['You', 'do', 'not', 'need', 'help'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'あなたは助けが必要ではありません',
          grammarHint: '主語 + do + not + 動詞 + 目的語の順番です',
          structure: 'S + do + not + V + O',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l1_neg_n10',
          words: ['The', 'weather', 'is', 'not', 'nice'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '天気は良くありません',
          grammarHint: '冠詞 + 主語 + be動詞 + not + 形容詞の順番です',
          structure: 'Art + S + be + not + Adj',
          grammarPoint: 'be_negative'
        }
      ],
      hard: [
        {
          id: 'l1_neg_h1',
          words: ['The', 'little', 'girl', 'does', 'not', 'like', 'vegetables'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'その小さな女の子は野菜が好きではありません',
          grammarHint: '冠詞 + 形容詞 + 主語 + does + not + 動詞 + 目的語の順番です',
          structure: 'Art + Adj + S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_h2',
          words: ['My', 'younger', 'brother', 'does', 'not', 'play', 'soccer'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '私の弟はサッカーをしません',
          grammarHint: '所有格 + 形容詞 + 主語 + does + not + 動詞 + 目的語の順番です',
          structure: 'Poss + Adj + S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_h3',
          words: ['The', 'smart', 'student', 'is', 'not', 'lazy'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'その賢い学生は怠惰ではありません',
          grammarHint: '冠詞 + 形容詞 + 主語 + be動詞 + not + 形容詞の順番です',
          structure: 'Art + Adj + S + be + not + Adj',
          grammarPoint: 'be_negative'
        },
        {
          id: 'l1_neg_h4',
          words: ['Our', 'new', 'teacher', 'does', 'not', 'speak', 'loudly'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '私たちの新しい先生は大きな声で話しません',
          grammarHint: '所有格 + 形容詞 + 主語 + does + not + 動詞 + 副詞の順番です',
          structure: 'Poss + Adj + S + does + not + V + Adv',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_h5',
          words: ['The', 'old', 'man', 'does', 'not', 'walk', 'fast'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'その年配の男性は速く歩きません',
          grammarHint: '冠詞 + 形容詞 + 主語 + does + not + 動詞 + 副詞の順番です',
          structure: 'Art + Adj + S + does + not + V + Adv',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_h6',
          words: ['Her', 'favorite', 'hobby', 'is', 'not', 'watching', 'TV'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼女の好きな趣味はテレビを見ることではありません',
          grammarHint: '所有格 + 形容詞 + 主語 + be動詞 + not + 動名詞 + 目的語の順番です',
          structure: 'Poss + Adj + S + be + not + Ving + O',
          grammarPoint: 'gerund_negative'
        },
        {
          id: 'l1_neg_h7',
          words: ['This', 'big', 'house', 'does', 'not', 'have', 'garden'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'この大きな家には庭がありません',
          grammarHint: '指示詞 + 形容詞 + 主語 + does + not + 動詞 + 目的語の順番です',
          structure: 'Det + Adj + S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_h8',
          words: ['Those', 'young', 'children', 'do', 'not', 'understand', 'English'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'あの若い子どもたちは英語が分かりません',
          grammarHint: '指示詞 + 形容詞 + 主語 + do + not + 動詞 + 目的語の順番です',
          structure: 'Det + Adj + S + do + not + V + O',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l1_neg_h9',
          words: ['A', 'beautiful', 'bird', 'does', 'not', 'fly', 'slowly'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '美しい鳥はゆっくり飛びません',
          grammarHint: '冠詞 + 形容詞 + 主語 + does + not + 動詞 + 副詞の順番です',
          structure: 'Art + Adj + S + does + not + V + Adv',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l1_neg_h10',
          words: ['Every', 'good', 'student', 'does', 'not', 'forget', 'homework'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'すべての良い学生は宿題を忘れません',
          grammarHint: '量詞 + 形容詞 + 主語 + does + not + 動詞 + 目的語の順番です',
          structure: 'Quant + Adj + S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        }
      ]
    },
    
    // 疑問文
    interrogative: {
      easy: [
        {
          id: 'l1_int_e1',
          words: ['Do', 'you', 'like', 'music?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたは音楽が好きですか？',
          grammarHint: 'Do + 主語 + 動詞 + 目的語 + ? の順番です',
          structure: 'Do + S + V + O + ?',
          grammarPoint: 'yes_no_question'
        },
        {
          id: 'l1_int_e2',
          words: ['Is', 'she', 'happy?'],
          correctOrder: [0, 1, 2],
          translation: '彼女は幸せですか？',
          grammarHint: 'be動詞 + 主語 + 形容詞 + ? の順番です',
          structure: 'be + S + Adj + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_e3',
          words: ['Are', 'they', 'students?'],
          correctOrder: [0, 1, 2],
          translation: '彼らは学生ですか？',
          grammarHint: 'be動詞 + 主語 + 名詞 + ? の順番です',
          structure: 'be + S + N + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_e4',
          words: ['Are', 'you', 'tired?'],
          correctOrder: [0, 1, 2],
          translation: 'あなたは疲れていますか？',
          grammarHint: 'be動詞 + 主語 + 形容詞 + ? の順番です',
          structure: 'be + S + Adj + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_e5',
          words: ['Do', 'you', 'play', 'soccer?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたはサッカーをしますか？',
          grammarHint: 'Do + 主語 + 動詞 + 目的語 + ? の順番です',
          structure: 'Do + S + V + O + ?',
          grammarPoint: 'yes_no_question'
        },
        {
          id: 'l1_int_e6',
          words: ['Is', 'he', 'hungry?'],
          correctOrder: [0, 1, 2],
          translation: '彼はお腹が空いていますか？',
          grammarHint: 'be動詞 + 主語 + 形容詞 + ? の順番です',
          structure: 'be + S + Adj + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_e7',
          words: ['Do', 'we', 'need', 'help?'],
          correctOrder: [0, 1, 2, 3],
          translation: '私たちは助けが必要ですか？',
          grammarHint: 'Do + 主語 + 動詞 + 目的語 + ? の順番です',
          structure: 'Do + S + V + O + ?',
          grammarPoint: 'yes_no_question'
        },
        {
          id: 'l1_int_e8',
          words: ['Is', 'it', 'hot?'],
          correctOrder: [0, 1, 2],
          translation: 'それは暑いですか？',
          grammarHint: 'be動詞 + 主語 + 形容詞 + ? の順番です',
          structure: 'be + S + Adj + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_e9',
          words: ['Do', 'you', 'eat', 'meat?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたは肉を食べますか？',
          grammarHint: 'Do + 主語 + 動詞 + 目的語 + ? の順番です',
          structure: 'Do + S + V + O + ?',
          grammarPoint: 'yes_no_question'
        },
        {
          id: 'l1_int_e10',
          words: ['Are', 'we', 'late?'],
          correctOrder: [0, 1, 2],
          translation: '私たちは遅刻していますか？',
          grammarHint: 'be動詞 + 主語 + 形容詞 + ? の順番です',
          structure: 'be + S + Adj + ?',
          grammarPoint: 'be_question'
        }
      ],
      normal: [
        {
          id: 'l1_int_n1',
          words: ['Does', 'he', 'play', 'soccer?'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼はサッカーをしますか？',
          grammarHint: '三人称単数では Does を使います',
          structure: 'Does + S + V + O + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_n2',
          words: ['What', 'do', 'you', 'like?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたは何が好きですか？',
          grammarHint: '疑問詞 + do + 主語 + 動詞 + ? の順番です',
          structure: 'Wh + do + S + V + ?',
          grammarPoint: 'wh_question'
        },
        {
          id: 'l1_int_n3',
          words: ['Does', 'she', 'speak', 'English?'],
          correctOrder: [0, 1, 2, 3],
          translation: '彼女は英語を話しますか？',
          grammarHint: '三人称単数では Does を使います',
          structure: 'Does + S + V + O + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_n4',
          words: ['Where', 'do', 'you', 'live?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたはどこに住んでいますか？',
          grammarHint: '疑問詞 + do + 主語 + 動詞 + ? の順番です',
          structure: 'Wh + do + S + V + ?',
          grammarPoint: 'wh_question'
        },
        {
          id: 'l1_int_n5',
          words: ['Is', 'the', 'weather', 'nice?'],
          correctOrder: [0, 1, 2, 3],
          translation: '天気は良いですか？',
          grammarHint: 'be動詞 + 冠詞 + 主語 + 形容詞 + ? の順番です',
          structure: 'be + Art + S + Adj + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_n6',
          words: ['Does', 'the', 'cat', 'sleep?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'その猫は眠りますか？',
          grammarHint: 'Does + 冠詞 + 主語 + 動詞 + ? の順番です',
          structure: 'Does + Art + S + V + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_n7',
          words: ['When', 'do', 'you', 'study?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたはいつ勉強しますか？',
          grammarHint: '疑問詞 + do + 主語 + 動詞 + ? の順番です',
          structure: 'Wh + do + S + V + ?',
          grammarPoint: 'wh_question'
        },
        {
          id: 'l1_int_n8',
          words: ['Are', 'your', 'parents', 'busy?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたのご両親は忙しいですか？',
          grammarHint: 'be動詞 + 所有格 + 主語 + 形容詞 + ? の順番です',
          structure: 'be + Poss + S + Adj + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_n9',
          words: ['Does', 'your', 'dog', 'bite?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたの犬は噛みますか？',
          grammarHint: 'Does + 所有格 + 主語 + 動詞 + ? の順番です',
          structure: 'Does + Poss + S + V + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_n10',
          words: ['How', 'do', 'you', 'feel?'],
          correctOrder: [0, 1, 2, 3],
          translation: 'あなたはどのように感じますか？',
          grammarHint: '疑問詞 + do + 主語 + 動詞 + ? の順番です',
          structure: 'Wh + do + S + V + ?',
          grammarPoint: 'wh_question'
        }
      ],
      hard: [
        {
          id: 'l1_int_h1',
          words: ['Does', 'the', 'little', 'girl', 'like', 'toys?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'その小さな女の子はおもちゃが好きですか？',
          grammarHint: 'Does + 冠詞 + 形容詞 + 主語 + 動詞 + 目的語 + ? の順番です',
          structure: 'Does + Art + Adj + S + V + O + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_h2',
          words: ['What', 'does', 'your', 'brother', 'like', 'to', 'do?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'あなたの弟は何をするのが好きですか？',
          grammarHint: '疑問詞 + does + 所有格 + 主語 + 動詞 + 不定詞 + ? の順番です',
          structure: 'Wh + does + Poss + S + V + to + V + ?',
          grammarPoint: 'wh_question_infinitive'
        },
        {
          id: 'l1_int_h3',
          words: ['Is', 'the', 'smart', 'student', 'very', 'busy?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'その賢い学生はとても忙しいですか？',
          grammarHint: 'be動詞 + 冠詞 + 形容詞 + 主語 + 副詞 + 形容詞 + ? の順番です',
          structure: 'be + Art + Adj + S + Adv + Adj + ?',
          grammarPoint: 'be_question'
        },
        {
          id: 'l1_int_h4',
          words: ['Where', 'does', 'our', 'new', 'teacher', 'come', 'from?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '私たちの新しい先生はどこから来ますか？',
          grammarHint: '疑問詞 + does + 所有格 + 形容詞 + 主語 + 動詞 + 前置詞 + ? の順番です',
          structure: 'Wh + does + Poss + Adj + S + V + Prep + ?',
          grammarPoint: 'wh_question'
        },
        {
          id: 'l1_int_h5',
          words: ['Does', 'the', 'old', 'man', 'walk', 'to', 'work?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'その年配の男性は歩いて仕事に行きますか？',
          grammarHint: 'Does + 冠詞 + 形容詞 + 主語 + 動詞 + 前置詞句 + ? の順番です',
          structure: 'Does + Art + Adj + S + V + Prep + N + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_h6',
          words: ['What', 'is', 'her', 'favorite', 'hobby', 'in', 'school?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼女の学校での好きな趣味は何ですか？',
          grammarHint: '疑問詞 + be動詞 + 所有格 + 形容詞 + 主語 + 前置詞句 + ? の順番です',
          structure: 'Wh + be + Poss + Adj + S + Prep + N + ?',
          grammarPoint: 'wh_question'
        },
        {
          id: 'l1_int_h7',
          words: ['Does', 'this', 'big', 'house', 'have', 'many', 'rooms?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'この大きな家にはたくさんの部屋がありますか？',
          grammarHint: 'Does + 指示詞 + 形容詞 + 主語 + 動詞 + 形容詞 + 目的語 + ? の順番です',
          structure: 'Does + Det + Adj + S + V + Adj + O + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_h8',
          words: ['Why', 'do', 'those', 'young', 'children', 'study', 'English?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'なぜあの若い子どもたちは英語を勉強するのですか？',
          grammarHint: '疑問詞 + do + 指示詞 + 形容詞 + 主語 + 動詞 + 目的語 + ? の順番です',
          structure: 'Wh + do + Det + Adj + S + V + O + ?',
          grammarPoint: 'wh_question'
        },
        {
          id: 'l1_int_h9',
          words: ['Does', 'a', 'beautiful', 'bird', 'sing', 'in', 'trees?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '美しい鳥は木の中で歌いますか？',
          grammarHint: 'Does + 冠詞 + 形容詞 + 主語 + 動詞 + 前置詞句 + ? の順番です',
          structure: 'Does + Art + Adj + S + V + Prep + N + ?',
          grammarPoint: 'third_person_question'
        },
        {
          id: 'l1_int_h10',
          words: ['When', 'do', 'good', 'students', 'do', 'their', 'homework?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '良い学生はいつ宿題をしますか？',
          grammarHint: '疑問詞 + do + 形容詞 + 主語 + 動詞 + 所有格 + 目的語 + ? の順番です',
          structure: 'Wh + do + Adj + S + V + Poss + O + ?',
          grammarPoint: 'wh_question'
        }
      ]
    }
  },

  // Level 2: 英検4級相当
  2: {
    affirmative: {
      easy: [
        {
          id: 'l2_aff_e1',
          words: ['She', 'plays', 'tennis', 'every', 'day'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼女は毎日テニスをします',
          grammarHint: '主語 + 動詞 + 目的語 + 頻度表現の順番です',
          structure: 'S + V + O + Adv',
          grammarPoint: 'frequency_adverb'
        },
        {
          id: 'l2_aff_e2',
          words: ['The', 'big', 'dog', 'runs', 'fast'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'その大きな犬は速く走ります',
          grammarHint: '冠詞 + 形容詞 + 主語 + 動詞 + 副詞の順番です',
          structure: 'Art + Adj + S + V + Adv',
          grammarPoint: 'adjective_adverb'
        },
        {
          id: 'l2_aff_e3',
          words: ['I', 'usually', 'wake', 'up', 'early'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私は普通早く起きます',
          grammarHint: '主語 + 頻度副詞 + 動詞 + 副詞句の順番です',
          structure: 'S + Adv + V + Adv',
          grammarPoint: 'frequency_adverb'
        },
        {
          id: 'l2_aff_e4',
          words: ['He', 'often', 'reads', 'books', 'at', 'night'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '彼はよく夜に本を読みます',
          grammarHint: '主語 + 頻度副詞 + 動詞 + 目的語 + 時間の前置詞句の順番です',
          structure: 'S + Adv + V + O + Time',
          grammarPoint: 'frequency_time'
        },
        {
          id: 'l2_aff_e5',
          words: ['We', 'sometimes', 'go', 'to', 'movies'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私たちは時々映画を見に行きます',
          grammarHint: '主語 + 頻度副詞 + 動詞 + 前置詞句の順番です',
          structure: 'S + Adv + V + Prep',
          grammarPoint: 'frequency_place'
        },
        {
          id: 'l2_aff_e6',
          words: ['My', 'mother', 'always', 'cooks', 'dinner'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私の母はいつも夕食を作ります',
          grammarHint: '所有格 + 主語 + 頻度副詞 + 動詞 + 目的語の順番です',
          structure: 'Poss + S + Adv + V + O',
          grammarPoint: 'frequency_adverb'
        },
        {
          id: 'l2_aff_e7',
          words: ['They', 'never', 'eat', 'fast', 'food'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼らはファストフードを食べません',
          grammarHint: '主語 + 頻度副詞 + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'S + Adv + V + Adj + O',
          grammarPoint: 'frequency_negative'
        },
        {
          id: 'l2_aff_e8',
          words: ['The', 'children', 'always', 'brush', 'their', 'teeth'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '子どもたちはいつも歯を磨きます',
          grammarHint: '冠詞 + 主語 + 頻度副詞 + 動詞 + 所有格 + 目的語の順番です',
          structure: 'Art + S + Adv + V + Poss + O',
          grammarPoint: 'frequency_possessive'
        },
        {
          id: 'l2_aff_e9',
          words: ['She', 'rarely', 'watches', 'TV', 'programs'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼女はめったにテレビ番組を見ません',
          grammarHint: '主語 + 頻度副詞 + 動詞 + 複合目的語の順番です',
          structure: 'S + Adv + V + O',
          grammarPoint: 'frequency_adverb'
        },
        {
          id: 'l2_aff_e10',
          words: ['You', 'can', 'speak', 'English', 'well'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'あなたは英語を上手に話すことができます',
          grammarHint: '主語 + 助動詞 + 動詞 + 目的語 + 副詞の順番です',
          structure: 'S + Aux + V + O + Adv',
          grammarPoint: 'modal_can'
        }
      ],
      normal: [
        {
          id: 'l2_aff_n1',
          words: ['I', 'can', 'swim', 'very', 'well', 'now'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '私は今とても上手に泳ぐことができます',
          grammarHint: '主語 + 助動詞 + 動詞 + 副詞句 + 時間副詞の順番です',
          structure: 'S + Aux + V + Adv + Time',
          grammarPoint: 'modal_can_adverb'
        },
        {
          id: 'l2_aff_n2',
          words: ['My', 'sister', 'will', 'visit', 'us', 'next', 'week'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '私の姉（妹）は来週私たちを訪ねてきます',
          grammarHint: '所有格 + 主語 + 助動詞 + 動詞 + 目的語 + 時間表現の順番です',
          structure: 'Poss + S + Aux + V + O + Time',
          grammarPoint: 'future_will'
        },
        {
          id: 'l2_aff_n3',
          words: ['The', 'students', 'must', 'study', 'hard', 'for', 'exams'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '学生たちは試験のために一生懸命勉強しなければなりません',
          grammarHint: '冠詞 + 主語 + 助動詞 + 動詞 + 副詞 + 前置詞句の順番です',
          structure: 'Art + S + Aux + V + Adv + Prep',
          grammarPoint: 'modal_must'
        },
        {
          id: 'l2_aff_n4',
          words: ['We', 'should', 'eat', 'more', 'vegetables', 'every', 'day'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '私たちは毎日もっと野菜を食べるべきです',
          grammarHint: '主語 + 助動詞 + 動詞 + 数量詞 + 目的語 + 頻度表現の順番です',
          structure: 'S + Aux + V + Quant + O + Freq',
          grammarPoint: 'modal_should'
        },
        {
          id: 'l2_aff_n5',
          words: ['He', 'may', 'come', 'to', 'the', 'party', 'tonight'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼は今夜パーティーに来るかもしれません',
          grammarHint: '主語 + 助動詞 + 動詞 + 前置詞句 + 時間副詞の順番です',
          structure: 'S + Aux + V + Prep + Time',
          grammarPoint: 'modal_may'
        },
        {
          id: 'l2_aff_n6',
          words: ['They', 'could', 'finish', 'their', 'homework', 'before', 'dinner'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼らは夕食前に宿題を終えることができるでしょう',
          grammarHint: '主語 + 助動詞 + 動詞 + 所有格 + 目的語 + 時間前置詞句の順番です',
          structure: 'S + Aux + V + Poss + O + Time',
          grammarPoint: 'modal_could'
        },
        {
          id: 'l2_aff_n7',
          words: ['She', 'would', 'like', 'to', 'learn', 'French', 'someday'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼女はいつかフランス語を学びたいと思っています',
          grammarHint: '主語 + 助動詞 + 動詞 + 不定詞 + 目的語 + 時間副詞の順番です',
          structure: 'S + Aux + V + to V + O + Time',
          grammarPoint: 'modal_would_infinitive'
        },
        {
          id: 'l2_aff_n8',
          words: ['You', 'might', 'find', 'the', 'book', 'in', 'library'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'あなたはその本を図書館で見つけるかもしれません',
          grammarHint: '主語 + 助動詞 + 動詞 + 冠詞 + 目的語 + 場所前置詞句の順番です',
          structure: 'S + Aux + V + Art + O + Place',
          grammarPoint: 'modal_might'
        },
        {
          id: 'l2_aff_n9',
          words: ['We', 'had', 'better', 'leave', 'here', 'right', 'now'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '私たちは今すぐここを出た方が良い',
          grammarHint: '主語 + had better + 動詞 + 場所 + 時間副詞の順番です',
          structure: 'S + had better + V + Place + Time',
          grammarPoint: 'had_better'
        },
        {
          id: 'l2_aff_n10',
          words: ['The', 'teacher', 'used', 'to', 'live', 'in', 'Tokyo'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'その先生は以前東京に住んでいました',
          grammarHint: '冠詞 + 主語 + used to + 動詞 + 場所前置詞句の順番です',
          structure: 'Art + S + used to + V + Place',
          grammarPoint: 'used_to'
        }
      ],
      hard: [
        {
          id: 'l2_aff_h1',
          words: ['My', 'best', 'friend', 'can', 'play', 'the', 'piano', 'beautifully'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '私の親友はピアノを美しく演奏できます',
          grammarHint: '所有格 + 最上級 + 主語 + 助動詞 + 動詞 + 冠詞 + 目的語 + 副詞の順番です',
          structure: 'Poss + Sup + S + Aux + V + Art + O + Adv',
          grammarPoint: 'superlative_modal'
        },
        {
          id: 'l2_aff_h2',
          words: ['The', 'young', 'man', 'should', 'study', 'harder', 'than', 'before'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '若い男性は以前よりも一生懸命勉強すべきです',
          grammarHint: '冠詞 + 形容詞 + 主語 + 助動詞 + 動詞 + 比較級 + 比較表現の順番です',
          structure: 'Art + Adj + S + Aux + V + Comp + Than',
          grammarPoint: 'comparative_modal'
        },
        {
          id: 'l2_aff_h3',
          words: ['She', 'will', 'probably', 'become', 'a', 'famous', 'singer', 'someday'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '彼女はいつか有名な歌手になるでしょう',
          grammarHint: '主語 + 助動詞 + 副詞 + 動詞 + 冠詞 + 形容詞 + 目的語 + 時間副詞の順番です',
          structure: 'S + Aux + Adv + V + Art + Adj + O + Time',
          grammarPoint: 'future_adverb'
        },
        {
          id: 'l2_aff_h4',
          words: ['Our', 'new', 'teacher', 'must', 'have', 'been', 'very', 'busy'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '私たちの新しい先生はとても忙しかったに違いありません',
          grammarHint: '所有格 + 形容詞 + 主語 + 助動詞 + 完了形 + 副詞 + 形容詞の順番です',
          structure: 'Poss + Adj + S + Aux + Perfect + Adv + Adj',
          grammarPoint: 'modal_perfect'
        },
        {
          id: 'l2_aff_h5',
          words: ['Those', 'smart', 'students', 'could', 'have', 'solved', 'the', 'problem'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'あの賢い学生たちはその問題を解くことができたでしょう',
          grammarHint: '指示詞 + 形容詞 + 主語 + 助動詞 + 完了形 + 冠詞 + 目的語の順番です',
          structure: 'Det + Adj + S + Aux + Perfect + Art + O',
          grammarPoint: 'modal_perfect'
        },
        {
          id: 'l2_aff_h6',
          words: ['Every', 'good', 'student', 'should', 'always', 'do', 'their', 'best'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'すべての良い学生はいつも最善を尽くすべきです',
          grammarHint: '量詞 + 形容詞 + 主語 + 助動詞 + 頻度副詞 + 動詞 + 所有格 + 目的語の順番です',
          structure: 'Quant + Adj + S + Aux + Adv + V + Poss + O',
          grammarPoint: 'modal_frequency'
        },
        {
          id: 'l2_aff_h7',
          words: ['This', 'interesting', 'book', 'might', 'help', 'you', 'learn', 'English'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'この興味深い本はあなたが英語を学ぶ助けになるかもしれません',
          grammarHint: '指示詞 + 形容詞 + 主語 + 助動詞 + 動詞 + 目的語 + 動詞 + 目的語の順番です',
          structure: 'Det + Adj + S + Aux + V + O + V + O',
          grammarPoint: 'modal_help_infinitive'
        },
        {
          id: 'l2_aff_h8',
          words: ['A', 'talented', 'musician', 'would', 'never', 'give', 'up', 'easily'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '才能のある音楽家は簡単に諦めることはないでしょう',
          grammarHint: '冠詞 + 形容詞 + 主語 + 助動詞 + 頻度副詞 + 句動詞 + 副詞の順番です',
          structure: 'Art + Adj + S + Aux + Adv + Phrasal V + Adv',
          grammarPoint: 'modal_phrasal_verb'
        },
        {
          id: 'l2_aff_h9',
          words: ['Many', 'young', 'people', 'may', 'not', 'understand', 'this', 'problem'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '多くの若い人たちはこの問題を理解しないかもしれません',
          grammarHint: '量詞 + 形容詞 + 主語 + 助動詞 + 否定 + 動詞 + 指示詞 + 目的語の順番です',
          structure: 'Quant + Adj + S + Aux + Neg + V + Det + O',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_aff_h10',
          words: ['The', 'experienced', 'doctor', 'will', 'definitely', 'help', 'sick', 'patients'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '経験豊富な医師は間違いなく病気の患者を助けるでしょう',
          grammarHint: '冠詞 + 形容詞 + 主語 + 助動詞 + 副詞 + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'Art + Adj + S + Aux + Adv + V + Adj + O',
          grammarPoint: 'future_certainty'
        }
      ]
    },
    negative: {
      easy: [
        {
          id: 'l2_neg_e1',
          words: ['I', 'do', 'not', 'usually', 'eat', 'breakfast'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '私は普通朝食を食べません',
          grammarHint: '主語 + do + not + 副詞 + 動詞 + 目的語の順番です',
          structure: 'S + do + not + Adv + V + O',
          grammarPoint: 'frequency_negative'
        },
        {
          id: 'l2_neg_e2',
          words: ['She', 'does', 'not', 'often', 'watch', 'TV'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '彼女はよくテレビを見ません',
          grammarHint: '主語 + does + not + 副詞 + 動詞 + 目的語の順番です',
          structure: 'S + does + not + Adv + V + O',
          grammarPoint: 'frequency_negative'
        },
        {
          id: 'l2_neg_e3',
          words: ['We', 'do', 'not', 'always', 'go', 'shopping'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '私たちはいつも買い物に行くわけではありません',
          grammarHint: '主語 + do + not + 副詞 + 動詞 + 動名詞の順番です',
          structure: 'S + do + not + Adv + V + Ving',
          grammarPoint: 'frequency_negative'
        },
        {
          id: 'l2_neg_e4',
          words: ['He', 'does', 'not', 'sometimes', 'come', 'late'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '彼は時々遅れて来ることはありません',
          grammarHint: '主語 + does + not + 副詞 + 動詞 + 形容詞の順番です',
          structure: 'S + does + not + Adv + V + Adj',
          grammarPoint: 'frequency_negative'
        },
        {
          id: 'l2_neg_e5',
          words: ['They', 'do', 'not', 'ever', 'eat', 'here'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '彼らはここで食事をすることは決してありません',
          grammarHint: '主語 + do + not + 副詞 + 動詞 + 場所副詞の順番です',
          structure: 'S + do + not + Adv + V + Place',
          grammarPoint: 'frequency_negative'
        },
        {
          id: 'l2_neg_e6',
          words: ['My', 'sister', 'does', 'not', 'like', 'coffee'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '私の姉（妹）はコーヒーが好きではありません',
          grammarHint: '所有格 + 主語 + does + not + 動詞 + 目的語の順番です',
          structure: 'Poss + S + does + not + V + O',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l2_neg_e7',
          words: ['The', 'children', 'do', 'not', 'play', 'outside'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '子どもたちは外で遊びません',
          grammarHint: '冠詞 + 主語 + do + not + 動詞 + 場所副詞の順番です',
          structure: 'Art + S + do + not + V + Place',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l2_neg_e8',
          words: ['You', 'do', 'not', 'need', 'more', 'time'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'あなたはもっと時間が必要ではありません',
          grammarHint: '主語 + do + not + 動詞 + 数量詞 + 目的語の順番です',
          structure: 'S + do + not + V + Quant + O',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l2_neg_e9',
          words: ['It', 'does', 'not', 'rain', 'much', 'here'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'ここではあまり雨が降りません',
          grammarHint: '主語 + does + not + 動詞 + 副詞 + 場所副詞の順番です',
          structure: 'S + does + not + V + Adv + Place',
          grammarPoint: 'third_person_negative'
        },
        {
          id: 'l2_neg_e10',
          words: ['She', 'is', 'not', 'very', 'good', 'student'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '彼女はあまり良い学生ではありません',
          grammarHint: '主語 + be動詞 + not + 副詞 + 形容詞 + 名詞の順番です',
          structure: 'S + be + not + Adv + Adj + N',
          grammarPoint: 'be_negative'
        }
      ],
      normal: [
        {
          id: 'l2_neg_n1',
          words: ['I', 'cannot', 'speak', 'French', 'very', 'well'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '私はフランス語をあまり上手に話せません',
          grammarHint: '主語 + 助動詞否定 + 動詞 + 目的語 + 副詞句の順番です',
          structure: 'S + Aux(neg) + V + O + Adv',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_n2',
          words: ['She', 'will', 'not', 'come', 'to', 'school', 'tomorrow'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼女は明日学校に来ないでしょう',
          grammarHint: '主語 + 助動詞 + not + 動詞 + 前置詞句 + 時間副詞の順番です',
          structure: 'S + Aux + not + V + Prep + Time',
          grammarPoint: 'future_negative'
        },
        {
          id: 'l2_neg_n3',
          words: ['We', 'should', 'not', 'waste', 'too', 'much', 'time'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '私たちはあまり多くの時間を無駄にすべきではありません',
          grammarHint: '主語 + 助動詞 + not + 動詞 + 数量詞句 + 目的語の順番です',
          structure: 'S + Aux + not + V + Quant + O',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_n4',
          words: ['He', 'may', 'not', 'understand', 'this', 'difficult', 'problem'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼はこの難しい問題を理解しないかもしれません',
          grammarHint: '主語 + 助動詞 + not + 動詞 + 指示詞 + 形容詞 + 目的語の順番です',
          structure: 'S + Aux + not + V + Det + Adj + O',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_n5',
          words: ['They', 'must', 'not', 'forget', 'their', 'important', 'meeting'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼らは重要な会議を忘れてはいけません',
          grammarHint: '主語 + 助動詞 + not + 動詞 + 所有格 + 形容詞 + 目的語の順番です',
          structure: 'S + Aux + not + V + Poss + Adj + O',
          grammarPoint: 'modal_prohibition'
        },
        {
          id: 'l2_neg_n6',
          words: ['You', 'could', 'not', 'finish', 'all', 'your', 'homework'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'あなたは宿題をすべて終えることができませんでした',
          grammarHint: '主語 + 助動詞 + not + 動詞 + 量詞 + 所有格 + 目的語の順番です',
          structure: 'S + Aux + not + V + Quant + Poss + O',
          grammarPoint: 'modal_past_negative'
        },
        {
          id: 'l2_neg_n7',
          words: ['The', 'teacher', 'would', 'not', 'give', 'us', 'more', 'time'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '先生は私たちにもっと時間をくださいませんでした',
          grammarHint: '冠詞 + 主語 + 助動詞 + not + 動詞 + 間接目的語 + 数量詞 + 直接目的語の順番です',
          structure: 'Art + S + Aux + not + V + IO + Quant + DO',
          grammarPoint: 'modal_double_object'
        },
        {
          id: 'l2_neg_n8',
          words: ['My', 'parents', 'might', 'not', 'agree', 'with', 'my', 'decision'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '私の両親は私の決定に同意しないかもしれません',
          grammarHint: '所有格 + 主語 + 助動詞 + not + 動詞 + 前置詞 + 所有格 + 目的語の順番です',
          structure: 'Poss + S + Aux + not + V + Prep + Poss + O',
          grammarPoint: 'modal_negative_phrasal'
        },
        {
          id: 'l2_neg_n9',
          words: ['Those', 'students', 'do', 'not', 'study', 'English', 'seriously'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: 'あの学生たちは英語を真剣に勉強しません',
          grammarHint: '指示詞 + 主語 + do + not + 動詞 + 目的語 + 副詞の順番です',
          structure: 'Det + S + do + not + V + O + Adv',
          grammarPoint: 'basic_negative'
        },
        {
          id: 'l2_neg_n10',
          words: ['She', 'does', 'not', 'want', 'to', 'go', 'there', 'alone'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '彼女は一人でそこに行きたくありません',
          grammarHint: '主語 + does + not + 動詞 + 不定詞 + 場所副詞 + 様態副詞の順番です',
          structure: 'S + does + not + V + to V + Place + Manner',
          grammarPoint: 'infinitive_negative'
        }
      ],
      hard: [
        {
          id: 'l2_neg_h1',
          words: ['The', 'talented', 'musician', 'cannot', 'play', 'this', 'difficult', 'piece'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'その才能のある音楽家はこの難しい曲を演奏できません',
          grammarHint: '冠詞 + 形容詞 + 主語 + 助動詞否定 + 動詞 + 指示詞 + 形容詞 + 目的語の順番です',
          structure: 'Art + Adj + S + Aux(neg) + V + Det + Adj + O',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_h2',
          words: ['My', 'younger', 'brother', 'will', 'not', 'become', 'a', 'doctor'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '私の弟は医者にはならないでしょう',
          grammarHint: '所有格 + 比較級 + 主語 + 助動詞 + not + 動詞 + 冠詞 + 目的語の順番です',
          structure: 'Poss + Comp + S + Aux + not + V + Art + O',
          grammarPoint: 'future_negative'
        },
        {
          id: 'l2_neg_h3',
          words: ['Those', 'busy', 'students', 'should', 'not', 'stay', 'up', 'late'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'あの忙しい学生たちは夜更かしをすべきではありません',
          grammarHint: '指示詞 + 形容詞 + 主語 + 助動詞 + not + 句動詞 + 副詞の順番です',
          structure: 'Det + Adj + S + Aux + not + Phrasal V + Adv',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_h4',
          words: ['Every', 'responsible', 'citizen', 'must', 'not', 'ignore', 'environmental', 'problems'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'すべての責任ある市民は環境問題を無視してはいけません',
          grammarHint: '量詞 + 形容詞 + 主語 + 助動詞 + not + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'Quant + Adj + S + Aux + not + V + Adj + O',
          grammarPoint: 'modal_prohibition'
        },
        {
          id: 'l2_neg_h5',
          words: ['She', 'may', 'not', 'have', 'enough', 'time', 'for', 'vacation'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '彼女は休暇のための十分な時間がないかもしれません',
          grammarHint: '主語 + 助動詞 + not + 動詞 + 形容詞 + 目的語 + 前置詞句の順番です',
          structure: 'S + Aux + not + V + Adj + O + Prep',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_h6',
          words: ['Our', 'new', 'neighbors', 'might', 'not', 'like', 'loud', 'music'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '私たちの新しい隣人は大きな音楽を好まないかもしれません',
          grammarHint: '所有格 + 形容詞 + 主語 + 助動詞 + not + 動詞 + 形容詞 + 目的語の順番です',
          structure: 'Poss + Adj + S + Aux + not + V + Adj + O',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_h7',
          words: ['This', 'old', 'computer', 'would', 'not', 'work', 'properly', 'anymore'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'この古いコンピューターはもう正常に動作しないでしょう',
          grammarHint: '指示詞 + 形容詞 + 主語 + 助動詞 + not + 動詞 + 副詞 + 時間副詞の順番です',
          structure: 'Det + Adj + S + Aux + not + V + Adv + Time',
          grammarPoint: 'modal_negative'
        },
        {
          id: 'l2_neg_h8',
          words: ['A', 'good', 'friend', 'should', 'never', 'tell', 'your', 'secrets'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '良い友達はあなたの秘密を決して話すべきではありません',
          grammarHint: '冠詞 + 形容詞 + 主語 + 助動詞 + 頻度副詞 + 動詞 + 所有格 + 目的語の順番です',
          structure: 'Art + Adj + S + Aux + Adv + V + Poss + O',
          grammarPoint: 'modal_frequency_negative'
        },
        {
          id: 'l2_neg_h9',
          words: ['Many', 'teenagers', 'do', 'not', 'always', 'listen', 'to', 'parents'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '多くのティーンエイジャーはいつも両親の言うことを聞くわけではありません',
          grammarHint: '量詞 + 主語 + do + not + 頻度副詞 + 動詞 + 前置詞 + 目的語の順番です',
          structure: 'Quant + S + do + not + Adv + V + Prep + O',
          grammarPoint: 'frequency_negative'
        },
        {
          id: 'l2_neg_h10',
          words: ['The', 'experienced', 'teacher', 'could', 'not', 'solve', 'all', 'problems'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '経験豊富な教師もすべての問題を解決することはできませんでした',
          grammarHint: '冠詞 + 形容詞 + 主語 + 助動詞 + not + 動詞 + 量詞 + 目的語の順番です',
          structure: 'Art + Adj + S + Aux + not + V + Quant + O',
          grammarPoint: 'modal_past_negative'
        }
      ]
    },
    interrogative: {
      easy: [
        {
          id: 'l2_int_e1',
          words: ['Do', 'you', 'often', 'play', 'tennis?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'あなたはよくテニスをしますか？',
          grammarHint: 'Do + 主語 + 副詞 + 動詞 + 目的語 + ? の順番です',
          structure: 'Do + S + Adv + V + O + ?',
          grammarPoint: 'frequency_question'
        },
        {
          id: 'l2_int_e2',
          words: ['Does', 'she', 'usually', 'come', 'early?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼女は普通早く来ますか？',
          grammarHint: 'Does + 主語 + 副詞 + 動詞 + 副詞 + ? の順番です',
          structure: 'Does + S + Adv + V + Adv + ?',
          grammarPoint: 'frequency_question'
        },
        {
          id: 'l2_int_e3',
          words: ['Can', 'you', 'speak', 'English', 'well?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'あなたは英語を上手に話せますか？',
          grammarHint: 'Can + 主語 + 動詞 + 目的語 + 副詞 + ? の順番です',
          structure: 'Can + S + V + O + Adv + ?',
          grammarPoint: 'modal_question'
        },
        {
          id: 'l2_int_e4',
          words: ['Will', 'they', 'come', 'to', 'party?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼らはパーティーに来ますか？',
          grammarHint: 'Will + 主語 + 動詞 + 前置詞句 + ? の順番です',
          structure: 'Will + S + V + Prep + ?',
          grammarPoint: 'future_question'
        },
        {
          id: 'l2_int_e5',
          words: ['Should', 'we', 'study', 'more', 'today?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '私たちは今日もっと勉強すべきですか？',
          grammarHint: 'Should + 主語 + 動詞 + 副詞 + 時間副詞 + ? の順番です',
          structure: 'Should + S + V + Adv + Time + ?',
          grammarPoint: 'modal_question'
        },
        {
          id: 'l2_int_e6',
          words: ['Could', 'you', 'help', 'me', 'please?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'お願いします、私を助けてもらえますか？',
          grammarHint: 'Could + 主語 + 動詞 + 目的語 + 副詞 + ? の順番です',
          structure: 'Could + S + V + O + Adv + ?',
          grammarPoint: 'modal_polite_request'
        },
        {
          id: 'l2_int_e7',
          words: ['May', 'I', 'ask', 'you', 'something?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '何かお聞きしてもよろしいですか？',
          grammarHint: 'May + 主語 + 動詞 + 目的語 + 代名詞 + ? の順番です',
          structure: 'May + S + V + O + Pron + ?',
          grammarPoint: 'modal_permission'
        },
        {
          id: 'l2_int_e8',
          words: ['Must', 'you', 'go', 'home', 'now?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'あなたは今家に帰らなければなりませんか？',
          grammarHint: 'Must + 主語 + 動詞 + 場所 + 時間副詞 + ? の順番です',
          structure: 'Must + S + V + Place + Time + ?',
          grammarPoint: 'modal_necessity'
        },
        {
          id: 'l2_int_e9',
          words: ['Would', 'you', 'like', 'some', 'coffee?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: 'コーヒーはいかがですか？',
          grammarHint: 'Would + 主語 + 動詞 + 数量詞 + 目的語 + ? の順番です',
          structure: 'Would + S + V + Quant + O + ?',
          grammarPoint: 'modal_offer'
        },
        {
          id: 'l2_int_e10',
          words: ['Might', 'she', 'be', 'at', 'home?'],
          correctOrder: [0, 1, 2, 3, 4],
          translation: '彼女は家にいるかもしれませんか？',
          grammarHint: 'Might + 主語 + be動詞 + 前置詞 + 場所 + ? の順番です',
          structure: 'Might + S + be + Prep + Place + ?',
          grammarPoint: 'modal_possibility'
        }
      ],
      normal: [
        {
          id: 'l2_int_n1',
          words: ['What', 'can', 'you', 'do', 'for', 'me?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'あなたは私のために何ができますか？',
          grammarHint: '疑問詞 + can + 主語 + 動詞 + 前置詞句 + ? の順番です',
          structure: 'Wh + Can + S + V + Prep + ?',
          grammarPoint: 'wh_modal_question'
        },
        {
          id: 'l2_int_n2',
          words: ['When', 'will', 'the', 'meeting', 'start', 'tomorrow?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '明日、会議はいつ始まりますか？',
          grammarHint: '疑問詞 + will + 冠詞 + 主語 + 動詞 + 時間副詞 + ? の順番です',
          structure: 'Wh + Will + Art + S + V + Time + ?',
          grammarPoint: 'wh_future_question'
        },
        {
          id: 'l2_int_n3',
          words: ['How', 'often', 'do', 'you', 'exercise', 'regularly?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'あなたはどのくらい頻繁に定期的に運動しますか？',
          grammarHint: '疑問詞 + 頻度副詞 + do + 主語 + 動詞 + 副詞 + ? の順番です',
          structure: 'Wh + Freq + do + S + V + Adv + ?',
          grammarPoint: 'frequency_wh_question'
        },
        {
          id: 'l2_int_n4',
          words: ['Why', 'should', 'we', 'worry', 'about', 'this?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'なぜ私たちはこのことを心配すべきなのですか？',
          grammarHint: '疑問詞 + should + 主語 + 動詞 + 前置詞句 + ? の順番です',
          structure: 'Wh + Should + S + V + Prep + ?',
          grammarPoint: 'wh_modal_question'
        },
        {
          id: 'l2_int_n5',
          words: ['Where', 'could', 'I', 'find', 'good', 'restaurant?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'どこで良いレストランを見つけることができますか？',
          grammarHint: '疑問詞 + could + 主語 + 動詞 + 形容詞 + 目的語 + ? の順番です',
          structure: 'Wh + Could + S + V + Adj + O + ?',
          grammarPoint: 'wh_modal_question'
        },
        {
          id: 'l2_int_n6',
          words: ['Who', 'might', 'help', 'us', 'with', 'problem?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '誰が問題について私たちを助けてくれるかもしれませんか？',
          grammarHint: '疑問詞 + might + 動詞 + 目的語 + 前置詞句 + ? の順番です',
          structure: 'Wh + Might + V + O + Prep + ?',
          grammarPoint: 'wh_modal_question'
        },
        {
          id: 'l2_int_n7',
          words: ['How', 'much', 'does', 'this', 'book', 'cost?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: 'この本はいくらしますか？',
          grammarHint: '疑問詞 + 数量詞 + does + 指示詞 + 主語 + 動詞 + ? の順番です',
          structure: 'Wh + Quant + Does + Det + S + V + ?',
          grammarPoint: 'wh_quantity_question'
        },
        {
          id: 'l2_int_n8',
          words: ['Which', 'movie', 'would', 'you', 'prefer', 'tonight?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '今夜はどの映画がお好みですか？',
          grammarHint: '疑問詞 + 名詞 + would + 主語 + 動詞 + 時間副詞 + ? の順番です',
          structure: 'Wh + N + Would + S + V + Time + ?',
          grammarPoint: 'wh_choice_question'
        },
        {
          id: 'l2_int_n9',
          words: ['Whose', 'car', 'can', 'we', 'use', 'today?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '今日は誰の車を使うことができますか？',
          grammarHint: '疑問詞所有格 + 名詞 + can + 主語 + 動詞 + 時間副詞 + ? の順番です',
          structure: 'Wh(poss) + N + Can + S + V + Time + ?',
          grammarPoint: 'wh_possessive_question'
        },
        {
          id: 'l2_int_n10',
          words: ['How', 'long', 'will', 'the', 'trip', 'take?'],
          correctOrder: [0, 1, 2, 3, 4, 5],
          translation: '旅行はどのくらい時間がかかりますか？',
          grammarHint: '疑問詞 + 形容詞 + will + 冠詞 + 主語 + 動詞 + ? の順番です',
          structure: 'Wh + Adj + Will + Art + S + V + ?',
          grammarPoint: 'wh_duration_question'
        }
      ],
      hard: [
        {
          id: 'l2_int_h1',
          words: ['What', 'kind', 'of', 'music', 'do', 'you', 'usually', 'listen', 'to?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          translation: 'あなたは普通どんな種類の音楽を聞きますか？',
          grammarHint: '疑問詞 + 種類表現 + do + 主語 + 頻度副詞 + 動詞 + 前置詞 + ? の順番です',
          structure: 'Wh + Kind + do + S + Adv + V + Prep + ?',
          grammarPoint: 'wh_type_question'
        },
        {
          id: 'l2_int_h2',
          words: ['How', 'many', 'people', 'can', 'come', 'to', 'our', 'party?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '私たちのパーティーには何人来ることができますか？',
          grammarHint: '疑問詞 + 数量詞 + 名詞 + can + 動詞 + 前置詞 + 所有格 + 目的語 + ? の順番です',
          structure: 'Wh + Quant + N + Can + V + Prep + Poss + O + ?',
          grammarPoint: 'wh_quantity_modal'
        },
        {
          id: 'l2_int_h3',
          words: ['Why', 'should', 'young', 'people', 'learn', 'foreign', 'languages', 'today?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'なぜ若い人たちは今日外国語を学ぶべきなのですか？',
          grammarHint: '疑問詞 + should + 形容詞 + 主語 + 動詞 + 形容詞 + 目的語 + 時間副詞 + ? の順番です',
          structure: 'Wh + Should + Adj + S + V + Adj + O + Time + ?',
          grammarPoint: 'wh_modal_reason'
        },
        {
          id: 'l2_int_h4',
          words: ['When', 'will', 'the', 'new', 'teacher', 'start', 'working', 'here?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '新しい先生はいつここで働き始めますか？',
          grammarHint: '疑問詞 + will + 冠詞 + 形容詞 + 主語 + 動詞 + 動名詞 + 場所副詞 + ? の順番です',
          structure: 'Wh + Will + Art + Adj + S + V + Ving + Place + ?',
          grammarPoint: 'wh_future_gerund'
        },
        {
          id: 'l2_int_h5',
          words: ['Where', 'could', 'we', 'find', 'the', 'best', 'Italian', 'restaurant?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '最高のイタリアンレストランはどこで見つけることができますか？',
          grammarHint: '疑問詞 + could + 主語 + 動詞 + 冠詞 + 最上級 + 形容詞 + 目的語 + ? の順番です',
          structure: 'Wh + Could + S + V + Art + Sup + Adj + O + ?',
          grammarPoint: 'wh_superlative_modal'
        },
        {
          id: 'l2_int_h6',
          words: ['How', 'often', 'should', 'students', 'take', 'practice', 'tests', 'seriously?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '学生はどのくらい頻繁に真剣に練習テストを受けるべきですか？',
          grammarHint: '疑問詞 + 頻度副詞 + should + 主語 + 動詞 + 形容詞 + 目的語 + 副詞 + ? の順番です',
          structure: 'Wh + Freq + Should + S + V + Adj + O + Adv + ?',
          grammarPoint: 'wh_frequency_modal'
        },
        {
          id: 'l2_int_h7',
          words: ['Which', 'subject', 'might', 'be', 'more', 'difficult', 'for', 'you?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: 'どの科目があなたにとってより難しいかもしれませんか？',
          grammarHint: '疑問詞 + 名詞 + might + be動詞 + 比較級 + 前置詞句 + ? の順番です',
          structure: 'Wh + N + Might + be + Comp + Prep + ?',
          grammarPoint: 'wh_comparative_modal'
        },
        {
          id: 'l2_int_h8',
          words: ['What', 'time', 'would', 'you', 'prefer', 'to', 'meet', 'tomorrow?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '明日は何時に会うのがお好みですか？',
          grammarHint: '疑問詞 + 時間名詞 + would + 主語 + 動詞 + 不定詞 + 時間副詞 + ? の順番です',
          structure: 'Wh + Time + Would + S + V + to V + Time + ?',
          grammarPoint: 'wh_time_infinitive'
        },
        {
          id: 'l2_int_h9',
          words: ['How', 'much', 'money', 'will', 'you', 'need', 'for', 'vacation?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '休暇にはどのくらいお金が必要ですか？',
          grammarHint: '疑問詞 + 数量詞 + 名詞 + will + 主語 + 動詞 + 前置詞句 + ? の順番です',
          structure: 'Wh + Quant + N + Will + S + V + Prep + ?',
          grammarPoint: 'wh_quantity_future'
        },
        {
          id: 'l2_int_h10',
          words: ['Who', 'else', 'can', 'help', 'us', 'solve', 'this', 'problem?'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '他に誰がこの問題を解決するのを助けてくれますか？',
          grammarHint: '疑問詞 + 副詞 + can + 動詞 + 目的語 + 動詞 + 指示詞 + 目的語 + ? の順番です',
          structure: 'Wh + Adv + Can + V + O + V + Det + O + ?',
          grammarPoint: 'wh_additional_modal'
        }
      ]
    }
  },

  // Level 3: 英検3級相当
  3: {
    affirmative: {
      easy: [
        {
          id: 'l3_aff_e1',
          words: ['They', 'will', 'go', 'to', 'the', 'park', 'tomorrow'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
          translation: '彼らは明日公園に行く予定です',
          grammarHint: '主語 + 助動詞 + 動詞 + 前置詞句 + 時間表現の順番です',
          structure: 'S + will + V + Prep + Time',
          grammarPoint: 'future_will'
        }
      ]
    }
  },

  // Level 4: 英検準2級相当
  4: {
    affirmative: {
      easy: [
        {
          id: 'l4_aff_e1',
          words: ['The', 'book', 'that', 'I', 'bought', 'yesterday', 'is', 'interesting'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          translation: '私が昨日買った本は面白いです',
          grammarHint: '関係代名詞thatで名詞を修飾します',
          structure: 'S + (that + S + V) + be + Adj',
          grammarPoint: 'relative_pronoun_that'
        }
      ]
    }
  },

  // Level 5: 英検2級相当
  5: {
    affirmative: {
      easy: [
        {
          id: 'l5_aff_e1',
          words: ['If', 'I', 'had', 'studied', 'harder', 'I', 'would', 'have', 'passed', 'the', 'exam'],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          translation: 'もっと一生懸命勉強していたら、試験に合格していたでしょう',
          grammarHint: '仮定法過去完了の語順です',
          structure: 'If + S + had + pp, S + would + have + pp + O',
          grammarPoint: 'subjunctive_past_perfect'
        }
      ]
    }
  }
}

// Planet data for progression system
export const PLANETS = {
  1: {
    id: 'mercury',
    name: '水星',
    image: '/images/planets/mercury.jpg',
    requiredStars: 0,
    description: '基本的な英文構造を学ぶ惑星'
  },
  2: {
    id: 'venus',
    name: '金星',
    image: '/images/planets/venus.jpg',
    requiredStars: 15,
    description: '形容詞と副詞を含む文を学ぶ惑星'
  },
  3: {
    id: 'earth',
    name: '地球',
    image: '/images/planets/earth.jpg',
    requiredStars: 30,
    description: '助動詞と前置詞句を学ぶ惑星'
  },
  4: {
    id: 'mars',
    name: '火星',
    image: '/images/planets/mars.jpg',
    requiredStars: 50,
    description: '関係代名詞と接続詞を学ぶ惑星'
  },
  5: {
    id: 'jupiter',
    name: '木星',
    image: '/images/planets/jupiter.jpg',
    requiredStars: 75,
    description: '複雑な文構造を学ぶ惑星'
  }
}

// Achievement system
export const ACHIEVEMENTS = {
  perfectLevel: {
    id: 'perfect_level',
    name: 'パーフェクト',
    icon: 'fas fa-trophy',
    description: '全問正解でレベルクリア',
    type: 'gold'
  },
  speedMaster: {
    id: 'speed_master',
    name: 'スピードマスター',
    icon: 'fas fa-rocket',
    description: '5分以内でレベルクリア',
    type: 'silver'
  },
  noHints: {
    id: 'no_hints',
    name: 'ヒント不要',
    icon: 'fas fa-brain',
    description: 'ヒントを使わずにレベルクリア',
    type: 'bronze'
  },
  comboKing: {
    id: 'combo_king',
    name: 'コンボキング',
    icon: 'fas fa-fire',
    description: '10問連続正解',
    type: 'gold'
  },
  grammarGuru: {
    id: 'grammar_guru',
    name: '文法の達人',
    icon: 'fas fa-graduation-cap',
    description: '全レベルクリア',
    type: 'platinum'
  }
}

// Grammar point explanations
export const GRAMMAR_EXPLANATIONS = {
  basic_svo: {
    title: '基本的なSVO構造',
    explanation: '英語の基本語順は「主語（Subject）+ 動詞（Verb）+ 目的語（Object）」です。',
    examples: ['I play tennis.', 'She reads books.', 'We study English.']
  },
  be_adjective: {
    title: 'be動詞 + 形容詞',
    explanation: 'be動詞の後には形容詞が来て、主語の状態を表します。',
    examples: ['I am happy.', 'She is beautiful.', 'They are tired.']
  },
  frequency_adverb: {
    title: '頻度副詞',
    explanation: '頻度副詞（always, usually, often, sometimes, never）は動詞の前に置きます。',
    examples: ['I always study.', 'She often plays tennis.', 'We sometimes watch TV.']
  },
  modal_can: {
    title: '助動詞can',
    explanation: 'canは「〜することができる」という意味で、動詞の原形の前に置きます。',
    examples: ['I can swim.', 'She can speak English.', 'We can help you.']
  },
  relative_pronoun_that: {
    title: '関係代名詞that',
    explanation: 'thatは先行詞を修飾する関係代名詞として使われます。',
    examples: ['The book that I read is interesting.', 'The man that came yesterday is my friend.']
  }
}

// Word type classifications for styling
export const WORD_TYPES = {
  SUBJECT_PRONOUNS: ['I', 'you', 'he', 'she', 'it', 'we', 'they'],
  OBJECT_PRONOUNS: ['me', 'you', 'him', 'her', 'it', 'us', 'them'],
  POSSESSIVE: ['my', 'your', 'his', 'her', 'its', 'our', 'their'],
  ARTICLES: ['a', 'an', 'the'],
  BE_VERBS: ['am', 'is', 'are', 'was', 'were', 'be', 'being', 'been'],
  AUXILIARY_VERBS: ['have', 'has', 'had', 'do', 'does', 'did'],
  MODAL_VERBS: ['can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must'],
  PREPOSITIONS: ['in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'over', 'under'],
  CONJUNCTIONS: ['and', 'or', 'but', 'so', 'because', 'if', 'when', 'while', 'although', 'unless'],
  QUESTION_WORDS: ['what', 'when', 'where', 'who', 'why', 'how', 'which'],
  RELATIVE_PRONOUNS: ['that', 'which', 'who', 'whom', 'whose', 'where', 'when'],
  FREQUENCY_ADVERBS: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never', 'every', 'daily'],
  TIME_EXPRESSIONS: ['today', 'tomorrow', 'yesterday', 'now', 'then', 'soon', 'later', 'early', 'late']
}

// Function to get word type
export function getWordType(word) {
  const wordLower = word.toLowerCase()
  
  if (WORD_TYPES.SUBJECT_PRONOUNS.includes(wordLower) || 
      WORD_TYPES.OBJECT_PRONOUNS.includes(wordLower)) {
    return 'subject'
  }
  
  if (WORD_TYPES.BE_VERBS.includes(wordLower) || 
      WORD_TYPES.AUXILIARY_VERBS.includes(wordLower) ||
      WORD_TYPES.MODAL_VERBS.includes(wordLower)) {
    return 'verb'
  }
  
  if (WORD_TYPES.ARTICLES.includes(wordLower)) {
    return 'article'
  }
  
  if (WORD_TYPES.PREPOSITIONS.includes(wordLower)) {
    return 'preposition'
  }
  
  if (WORD_TYPES.CONJUNCTIONS.includes(wordLower)) {
    return 'conjunction'
  }
  
  if (WORD_TYPES.QUESTION_WORDS.includes(wordLower) ||
      WORD_TYPES.RELATIVE_PRONOUNS.includes(wordLower)) {
    return 'question'
  }
  
  if (WORD_TYPES.FREQUENCY_ADVERBS.includes(wordLower)) {
    return 'adverb'
  }
  
  // Check for common verb patterns
  if (wordLower.endsWith('ing') || wordLower.endsWith('ed') || 
      wordLower.endsWith('s') && !wordLower.endsWith('ss')) {
    return 'verb'
  }
  
  // Check for adjective patterns
  if (wordLower.endsWith('ly')) {
    return 'adverb'
  }
  
  if (wordLower.endsWith('ful') || wordLower.endsWith('less') || 
      wordLower.endsWith('ous') || wordLower.endsWith('ive')) {
    return 'adjective'
  }
  
  // Default to noun
  return 'noun'
}

// Difficulty settings
export const DIFFICULTY_SETTINGS = {
  1: {
    timeLimit: null, // No time limit for beginner
    hintsAllowed: 5,
    showTranslation: true
  },
  2: {
    timeLimit: null,
    hintsAllowed: 4,
    showTranslation: true
  },
  3: {
    timeLimit: 180, // 3 minutes
    hintsAllowed: 3,
    showTranslation: false
  },
  4: {
    timeLimit: 150, // 2.5 minutes
    hintsAllowed: 2,
    showTranslation: false
  },
  5: {
    timeLimit: 120, // 2 minutes
    hintsAllowed: 1,
    showTranslation: false
  }
}

export default {
  WORD_ORDER_QUESTIONS,
  PLANETS,
  ACHIEVEMENTS,
  GRAMMAR_EXPLANATIONS,
  WORD_TYPES,
  getWordType,
  DIFFICULTY_SETTINGS
}