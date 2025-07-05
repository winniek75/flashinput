// Construction Zone Learning Modules - Eiken Grade 5 to Grade 3
// Multi-Layer Learning Galaxy - 段階的構築学習用モジュール

export const CONSTRUCTION_MODULES = {
  grade5: [
    {
      id: "g5_be_verbs_foundation",
      title: "Be動詞の基礎構築",
      level: "grade5",
      complexity: 2,
      estimatedTime: 15, // minutes
      explanation: {
        title: "Be動詞を完全マスター",
        content: `
          <p><strong>Be動詞</strong>は英語の基礎中の基礎です。主語によって形が変わる特別な動詞です。</p>
          <div class="grammar-rule">
            <h4>基本ルール:</h4>
            <ul>
              <li><strong>I</strong> → am</li>
              <li><strong>He/She/It</strong> → is</li>
              <li><strong>You/We/They</strong> → are</li>
            </ul>
          </div>
          <p>これらの組み合わせを確実に覚えることで、英語の文の土台が完成します。</p>
        `
      },
      examples: [
        {
          sentence: "I am a student.",
          translation: "私は学生です。",
          highlight: "I + am の組み合わせ"
        },
        {
          sentence: "She is very kind.",
          translation: "彼女はとても親切です。",
          highlight: "She + is の組み合わせ"
        },
        {
          sentence: "They are from Japan.",
          translation: "彼らは日本出身です。",
          highlight: "They + are の組み合わせ"
        }
      ],
      constructionTasks: [
        {
          id: "be_verb_basic_1",
          type: "sentence_building",
          title: "Be動詞文を組み立てよう",
          instruction: "単語を正しい順序で並べて、Be動詞の文を完成させてください。",
          targetSentence: "I am happy.",
          availableWords: ["am", "I", "happy", "sad", "is"],
          correctOrder: ["I", "am", "happy"],
          hints: ["主語が I の時は am を使います", "形容詞は最後に置きます"]
        },
        {
          id: "be_verb_basic_2", 
          type: "sentence_building",
          title: "三人称単数のBe動詞",
          instruction: "He/She/It と is の組み合わせを作りましょう。",
          targetSentence: "He is tall.",
          availableWords: ["He", "is", "tall", "am", "are"],
          correctOrder: ["He", "is", "tall"],
          hints: ["He の後には is を使います", "tall は「背が高い」という意味です"]
        },
        {
          id: "be_verb_basic_3",
          type: "sentence_building", 
          title: "複数主語のBe動詞",
          instruction: "We/You/They と are の組み合わせを作りましょう。",
          targetSentence: "We are friends.",
          availableWords: ["We", "are", "friends", "is", "am"],
          correctOrder: ["We", "are", "friends"],
          hints: ["We の後には are を使います", "friends は「友達」という意味です"]
        }
      ],
      assessments: [
        {
          question: "I ___ a teacher.",
          options: ["am", "is", "are"],
          correctAnswer: 0,
          explanation: "主語が I の時は am を使います"
        },
        {
          question: "She ___ my sister.",
          options: ["am", "is", "are"],
          correctAnswer: 1,
          explanation: "主語が She の時は is を使います"
        },
        {
          question: "They ___ students.",
          options: ["am", "is", "are"],
          correctAnswer: 2,
          explanation: "主語が They の時は are を使います"
        }
      ]
    },

    {
      id: "g5_general_verbs_foundation",
      title: "一般動詞の基礎構築",
      level: "grade5",
      complexity: 3,
      estimatedTime: 20,
      explanation: {
        title: "一般動詞をマスターしよう",
        content: `
          <p><strong>一般動詞</strong>は動作や状態を表す動詞です。主語によって形が変わります。</p>
          <div class="grammar-rule">
            <h4>基本ルール:</h4>
            <ul>
              <li><strong>I/You/We/They</strong> → 動詞の原形</li>
              <li><strong>He/She/It</strong> → 動詞 + s</li>
            </ul>
          </div>
          <p>三人称単数（He/She/It）の時だけ、動詞に s をつけることを忘れずに！</p>
        `
      },
      examples: [
        {
          sentence: "I play tennis.",
          translation: "私はテニスをします。",
          highlight: "I + play（原形）"
        },
        {
          sentence: "She plays tennis.",
          translation: "彼女はテニスをします。",
          highlight: "She + plays（s をつける）"
        },
        {
          sentence: "We study English.",
          translation: "私たちは英語を勉強します。",
          highlight: "We + study（原形）"
        }
      ],
      constructionTasks: [
        {
          id: "general_verb_basic_1",
          type: "sentence_building",
          title: "一般動詞文の基本",
          instruction: "I/You/We/They には動詞の原形を使います。",
          targetSentence: "I study English.",
          availableWords: ["I", "study", "studies", "English", "Japanese"],
          correctOrder: ["I", "study", "English"],
          hints: ["I の後は動詞の原形", "study は「勉強する」という意味"]
        },
        {
          id: "general_verb_basic_2",
          type: "sentence_building",
          title: "三人称単数 + s",
          instruction: "He/She/It には動詞に s をつけます。",
          targetSentence: "He likes music.",
          availableWords: ["He", "like", "likes", "music", "sports"],
          correctOrder: ["He", "likes", "music"],
          hints: ["He の後は動詞に s をつける", "likes は「好きだ」という意味"]
        },
        {
          id: "general_verb_basic_3",
          type: "sentence_building",
          title: "複数主語の一般動詞",
          instruction: "複数の主語には動詞の原形を使います。",
          targetSentence: "They watch TV.",
          availableWords: ["They", "watch", "watches", "TV", "movies"],
          correctOrder: ["They", "watch", "TV"],
          hints: ["They の後は動詞の原形", "watch は「見る」という意味"]
        }
      ],
      assessments: [
        {
          question: "I ___ breakfast every morning.",
          options: ["eat", "eats"],
          correctAnswer: 0,
          explanation: "主語が I の時は動詞の原形を使います"
        },
        {
          question: "She ___ to school by bus.",
          options: ["go", "goes"],
          correctAnswer: 1,
          explanation: "主語が She の時は動詞に s をつけます"
        },
        {
          question: "We ___ soccer on weekends.",
          options: ["play", "plays"],
          correctAnswer: 0,
          explanation: "主語が We の時は動詞の原形を使います"
        }
      ]
    },

    {
      id: "g5_basic_questions",
      title: "基本的な疑問文の構築",
      level: "grade5",
      complexity: 3,
      estimatedTime: 25,
      explanation: {
        title: "疑問文の作り方を覚えよう",
        content: `
          <p><strong>疑問文</strong>は相手に質問する時に使います。動詞の種類によって作り方が違います。</p>
          <div class="grammar-rule">
            <h4>Be動詞の疑問文:</h4>
            <p>Be動詞を文の最初に移動させます</p>
            <p>例：You are happy. → Are you happy?</p>
            
            <h4>一般動詞の疑問文:</h4>
            <p>Do/Does を文の最初に置きます</p>
            <p>例：You like music. → Do you like music?</p>
            <p>例：She likes music. → Does she like music?</p>
          </div>
        `
      },
      examples: [
        {
          sentence: "Are you a student?",
          translation: "あなたは学生ですか？",
          highlight: "Be動詞の疑問文"
        },
        {
          sentence: "Do you play tennis?",
          translation: "あなたはテニスをしますか？",
          highlight: "一般動詞の疑問文（Do）"
        },
        {
          sentence: "Does she like music?",
          translation: "彼女は音楽が好きですか？",
          highlight: "一般動詞の疑問文（Does）"
        }
      ],
      constructionTasks: [
        {
          id: "question_be_verb",
          type: "sentence_building",
          title: "Be動詞の疑問文",
          instruction: "Be動詞を最初に移動させて疑問文を作りましょう。",
          targetSentence: "Are you happy?",
          availableWords: ["Are", "you", "happy", "Is", "Am"],
          correctOrder: ["Are", "you", "happy"],
          hints: ["You の疑問文は Are で始める", "語順は Are + you + 形容詞"]
        },
        {
          id: "question_general_verb_do",
          type: "sentence_building",
          title: "Do を使った疑問文",
          instruction: "Do を使って疑問文を作りましょう。",
          targetSentence: "Do you like sports?",
          availableWords: ["Do", "you", "like", "sports", "Does"],
          correctOrder: ["Do", "you", "like", "sports"],
          hints: ["You の一般動詞疑問文は Do で始める", "動詞は原形に戻す"]
        },
        {
          id: "question_general_verb_does",
          type: "sentence_building",
          title: "Does を使った疑問文",
          instruction: "Does を使って疑問文を作りましょう。",
          targetSentence: "Does he play piano?",
          availableWords: ["Does", "he", "play", "piano", "plays"],
          correctOrder: ["Does", "he", "play", "piano"],
          hints: ["He の一般動詞疑問文は Does で始める", "動詞は原形に戻す"]
        }
      ],
      assessments: [
        {
          question: "___ you a teacher?",
          options: ["Are", "Do", "Is"],
          correctAnswer: 0,
          explanation: "You + be動詞の疑問文は Are で始めます"
        },
        {
          question: "___ she like music?",
          options: ["Do", "Does", "Is"],
          correctAnswer: 1,
          explanation: "三人称単数の一般動詞疑問文は Does を使います"
        },
        {
          question: "___ they students?",
          options: ["Are", "Do", "Is"],
          correctAnswer: 0,
          explanation: "They + be動詞の疑問文は Are で始めます"
        }
      ]
    }
  ],

  grade4: [
    {
      id: "g4_past_tense_construction",
      title: "過去形の構築マスター",
      level: "grade4",
      complexity: 3,
      estimatedTime: 30,
      explanation: {
        title: "過去形を完全習得",
        content: `
          <p><strong>過去形</strong>は過去に起こった出来事を表現する時に使います。</p>
          <div class="grammar-rule">
            <h4>規則動詞の過去形:</h4>
            <p>動詞の語尾に -ed をつけます</p>
            <p>例：play → played, study → studied</p>
            
            <h4>不規則動詞の過去形:</h4>
            <p>特別な形に変化します</p>
            <p>例：go → went, eat → ate, come → came</p>
            
            <h4>Be動詞の過去形:</h4>
            <p>was (I/He/She/It), were (You/We/They)</p>
          </div>
        `
      },
      examples: [
        {
          sentence: "I played tennis yesterday.",
          translation: "私は昨日テニスをしました。",
          highlight: "規則動詞の過去形（played）"
        },
        {
          sentence: "She went to Tokyo last week.",
          translation: "彼女は先週東京に行きました。",
          highlight: "不規則動詞の過去形（went）"
        },
        {
          sentence: "We were happy.",
          translation: "私たちは幸せでした。",
          highlight: "Be動詞の過去形（were）"
        }
      ],
      constructionTasks: [
        {
          id: "past_regular_verbs",
          type: "sentence_building",
          title: "規則動詞の過去形",
          instruction: "規則動詞に -ed をつけて過去の文を作りましょう。",
          targetSentence: "I watched a movie yesterday.",
          availableWords: ["I", "watched", "watch", "a", "movie", "yesterday"],
          correctOrder: ["I", "watched", "a", "movie", "yesterday"],
          hints: ["watch の過去形は watched", "yesterday は「昨日」という意味"]
        },
        {
          id: "past_irregular_verbs",
          type: "sentence_building",
          title: "不規則動詞の過去形",
          instruction: "不規則動詞の特別な過去形を使いましょう。",
          targetSentence: "She ate lunch at home.",
          availableWords: ["She", "ate", "eat", "lunch", "at", "home"],
          correctOrder: ["She", "ate", "lunch", "at", "home"],
          hints: ["eat の過去形は ate", "at home は「家で」という意味"]
        },
        {
          id: "past_be_verbs",
          type: "sentence_building",
          title: "Be動詞の過去形",
          instruction: "was/were を正しく使い分けましょう。",
          targetSentence: "They were at school.",
          availableWords: ["They", "were", "was", "at", "school"],
          correctOrder: ["They", "were", "at", "school"],
          hints: ["They の過去形は were", "at school は「学校で」という意味"]
        }
      ],
      assessments: [
        {
          question: "I ___ to the park yesterday.",
          options: ["go", "went", "gone"],
          correctAnswer: 1,
          explanation: "go の過去形は went です"
        },
        {
          question: "She ___ very busy last week.",
          options: ["is", "was", "were"],
          correctAnswer: 1,
          explanation: "She の be動詞過去形は was です"
        },
        {
          question: "We ___ a good time.",
          options: ["have", "had", "has"],
          correctAnswer: 1,
          explanation: "have の過去形は had です"
        }
      ]
    },

    {
      id: "g4_progressive_construction",
      title: "進行形の構築システム",
      level: "grade4",
      complexity: 3,
      estimatedTime: 25,
      explanation: {
        title: "進行形で「〜している」を表現",
        content: `
          <p><strong>現在進行形</strong>は今まさに行っている動作を表します。</p>
          <div class="grammar-rule">
            <h4>現在進行形の作り方:</h4>
            <p>be動詞 + 動詞のing形</p>
            <p>I am playing / He is playing / They are playing</p>
            
            <h4>ing形の作り方:</h4>
            <ul>
              <li>基本：動詞 + ing (play → playing)</li>
              <li>eで終わる：e を取って ing (make → making)</li>
              <li>短子音で終わる：子音を重ねて ing (run → running)</li>
            </ul>
          </div>
        `
      },
      examples: [
        {
          sentence: "I am reading a book now.",
          translation: "私は今本を読んでいます。",
          highlight: "am + reading（現在進行形）"
        },
        {
          sentence: "She is cooking dinner.",
          translation: "彼女は夕食を作っています。",
          highlight: "is + cooking（現在進行形）"
        },
        {
          sentence: "They are playing soccer.",
          translation: "彼らはサッカーをしています。",
          highlight: "are + playing（現在進行形）"
        }
      ],
      constructionTasks: [
        {
          id: "progressive_basic",
          type: "sentence_building",
          title: "基本の現在進行形",
          instruction: "be動詞 + ing形 で現在進行形を作りましょう。",
          targetSentence: "I am studying English.",
          availableWords: ["I", "am", "studying", "study", "English"],
          correctOrder: ["I", "am", "studying", "English"],
          hints: ["I の後は am", "study + ing = studying"]
        },
        {
          id: "progressive_third_person",
          type: "sentence_building",
          title: "三人称単数の現在進行形",
          instruction: "He/She/It には is を使います。",
          targetSentence: "He is watching TV.",
          availableWords: ["He", "is", "watching", "watch", "TV"],
          correctOrder: ["He", "is", "watching", "TV"],
          hints: ["He の後は is", "watch + ing = watching"]
        },
        {
          id: "progressive_plural",
          type: "sentence_building",
          title: "複数主語の現在進行形",
          instruction: "We/You/They には are を使います。",
          targetSentence: "They are running fast.",
          availableWords: ["They", "are", "running", "run", "fast"],
          correctOrder: ["They", "are", "running", "fast"],
          hints: ["They の後は are", "run + ning = running（子音を重ねる）"]
        }
      ],
      assessments: [
        {
          question: "She ___ cooking dinner now.",
          options: ["am", "is", "are"],
          correctAnswer: 1,
          explanation: "She の現在進行形は is + ing形 です"
        },
        {
          question: "I ___ watching a movie.",
          options: ["am", "is", "are"],
          correctAnswer: 0,
          explanation: "I の現在進行形は am + ing形 です"
        },
        {
          question: "They ___ playing tennis.",
          options: ["am", "is", "are"],
          correctAnswer: 2,
          explanation: "They の現在進行形は are + ing形 です"
        }
      ]
    },

    {
      id: "g4_comparative_construction",
      title: "比較級の構築ラボ",
      level: "grade4",
      complexity: 4,
      estimatedTime: 35,
      explanation: {
        title: "比較級で「〜より」を表現",
        content: `
          <p><strong>比較級</strong>は2つのものを比べる時に使います。</p>
          <div class="grammar-rule">
            <h4>短い形容詞（1〜2音節）:</h4>
            <p>形容詞 + er + than</p>
            <p>例：tall → taller, big → bigger</p>
            
            <h4>長い形容詞（3音節以上）:</h4>
            <p>more + 形容詞 + than</p>
            <p>例：beautiful → more beautiful</p>
            
            <h4>不規則変化:</h4>
            <p>good → better, bad → worse</p>
          </div>
        `
      },
      examples: [
        {
          sentence: "This book is more interesting than that one.",
          translation: "この本はあの本より面白いです。",
          highlight: "long adjective + more...than"
        },
        {
          sentence: "She is taller than her sister.",
          translation: "彼女は姉妹より背が高いです。",
          highlight: "short adjective + er...than"
        },
        {
          sentence: "Today is better than yesterday.",
          translation: "今日は昨日より良いです。",
          highlight: "irregular comparative (good → better)"
        }
      ],
      constructionTasks: [
        {
          id: "comparative_short_adj",
          type: "sentence_building",
          title: "短い形容詞の比較級",
          instruction: "短い形容詞に -er をつけて比較しましょう。",
          targetSentence: "This bag is bigger than that bag.",
          availableWords: ["This", "bag", "is", "bigger", "big", "than", "that"],
          correctOrder: ["This", "bag", "is", "bigger", "than", "that", "bag"],
          hints: ["big + ger = bigger（子音を重ねる）", "than で「〜より」を表す"]
        },
        {
          id: "comparative_long_adj",
          type: "sentence_building",
          title: "長い形容詞の比較級",
          instruction: "長い形容詞には more を使いましょう。",
          targetSentence: "English is more difficult than math.",
          availableWords: ["English", "is", "more", "difficult", "than", "math"],
          correctOrder: ["English", "is", "more", "difficult", "than", "math"],
          hints: ["長い形容詞は more + 形容詞", "difficult は「難しい」という意味"]
        },
        {
          id: "comparative_irregular",
          type: "sentence_building",
          title: "不規則変化の比較級",
          instruction: "good/bad の特別な比較級を使いましょう。",
          targetSentence: "Today is better than yesterday.",
          availableWords: ["Today", "is", "better", "good", "than", "yesterday"],
          correctOrder: ["Today", "is", "better", "than", "yesterday"],
          hints: ["good の比較級は better", "yesterday は「昨日」という意味"]
        }
      ],
      assessments: [
        {
          question: "This test is ___ than the last one.",
          options: ["easy", "easier", "more easy"],
          correctAnswer: 1,
          explanation: "短い形容詞 easy の比較級は easier です"
        },
        {
          question: "The movie was ___ than I expected.",
          options: ["interesting", "more interesting", "interestinger"],
          correctAnswer: 1,
          explanation: "長い形容詞 interesting の比較級は more interesting です"
        },
        {
          question: "She feels ___ today.",
          options: ["good", "better", "more good"],
          correctAnswer: 1,
          explanation: "good の比較級は better です"
        }
      ]
    }
  ],

  grade3: [
    {
      id: "g3_present_perfect_construction",
      title: "現在完了形の構築マスタリー",
      level: "grade3",
      complexity: 4,
      estimatedTime: 40,
      explanation: {
        title: "現在完了形で経験・継続・完了を表現",
        content: `
          <p><strong>現在完了形</strong>は過去から現在まで続く状況を表現します。</p>
          <div class="grammar-rule">
            <h4>現在完了形の作り方:</h4>
            <p>have/has + 過去分詞</p>
            <p>I/You/We/They have + 過去分詞</p>
            <p>He/She/It has + 過去分詞</p>
            
            <h4>3つの用法:</h4>
            <ul>
              <li><strong>経験</strong>：〜したことがある (ever, never)</li>
              <li><strong>継続</strong>：〜し続けている (for, since)</li>
              <li><strong>完了</strong>：〜し終わった (just, already, yet)</li>
            </ul>
          </div>
        `
      },
      examples: [
        {
          sentence: "I have lived in Tokyo for 5 years.",
          translation: "私は5年間東京に住んでいます。",
          highlight: "継続用法（for 5 years）"
        },
        {
          sentence: "She has just finished her homework.",
          translation: "彼女はちょうど宿題を終えました。",
          highlight: "完了用法（just）"
        },
        {
          sentence: "Have you ever been to France?",
          translation: "フランスに行ったことがありますか？",
          highlight: "経験用法（ever）"
        }
      ],
      constructionTasks: [
        {
          id: "perfect_experience",
          type: "sentence_building",
          title: "経験の現在完了形",
          instruction: "have/has + 過去分詞 で経験を表現しましょう。",
          targetSentence: "I have been to Japan twice.",
          availableWords: ["I", "have", "has", "been", "to", "Japan", "twice"],
          correctOrder: ["I", "have", "been", "to", "Japan", "twice"],
          hints: ["I の後は have", "be の過去分詞は been", "twice は「2回」"]
        },
        {
          id: "perfect_continuation",
          type: "sentence_building",
          title: "継続の現在完了形",
          instruction: "for/since と一緒に継続を表現しましょう。",
          targetSentence: "She has studied English for 3 years.",
          availableWords: ["She", "has", "have", "studied", "English", "for", "3", "years"],
          correctOrder: ["She", "has", "studied", "English", "for", "3", "years"],
          hints: ["She の後は has", "study の過去分詞は studied", "for + 期間"]
        },
        {
          id: "perfect_completion",
          type: "sentence_building",
          title: "完了の現在完了形",
          instruction: "just/already/yet で完了を表現しましょう。",
          targetSentence: "They have already finished dinner.",
          availableWords: ["They", "have", "has", "already", "finished", "dinner"],
          correctOrder: ["They", "have", "already", "finished", "dinner"],
          hints: ["They の後は have", "already は have と過去分詞の間", "finish の過去分詞は finished"]
        }
      ],
      assessments: [
        {
          question: "I ___ lived here since 2020.",
          options: ["have", "has", "had"],
          correctAnswer: 0,
          explanation: "I の現在完了形は have + 過去分詞 です"
        },
        {
          question: "She ___ never seen this movie.",
          options: ["have", "has", "had"],
          correctAnswer: 1,
          explanation: "She の現在完了形は has + 過去分詞 です"
        },
        {
          question: "Have you ___ been to Australia?",
          options: ["ever", "never", "just"],
          correctAnswer: 0,
          explanation: "疑問文での経験用法には ever を使います"
        }
      ]
    },

    {
      id: "g3_passive_voice_construction",
      title: "受動態の構築システム",
      level: "grade3",
      complexity: 4,
      estimatedTime: 35,
      explanation: {
        title: "受動態で「〜される」を表現",
        content: `
          <p><strong>受動態</strong>は動作を受ける側に焦点を当てた表現です。</p>
          <div class="grammar-rule">
            <h4>受動態の作り方:</h4>
            <p>be動詞 + 過去分詞 (+ by 〜)</p>
            <p>現在：is/are + 過去分詞</p>
            <p>過去：was/were + 過去分詞</p>
            
            <h4>能動態から受動態への変換:</h4>
            <p>能動態：Tom wrote this book.</p>
            <p>受動態：This book was written by Tom.</p>
          </div>
        `
      },
      examples: [
        {
          sentence: "This castle was built in 1600.",
          translation: "この城は1600年に建てられました。",
          highlight: "過去の受動態（was built）"
        },
        {
          sentence: "English is spoken all over the world.",
          translation: "英語は世界中で話されています。",
          highlight: "現在の受動態（is spoken）"
        },
        {
          sentence: "The windows were cleaned yesterday.",
          translation: "窓は昨日掃除されました。",
          highlight: "複数形の過去受動態（were cleaned）"
        }
      ],
      constructionTasks: [
        {
          id: "passive_present",
          type: "sentence_building",
          title: "現在の受動態",
          instruction: "is/are + 過去分詞 で現在の受動態を作りましょう。",
          targetSentence: "This song is loved by many people.",
          availableWords: ["This", "song", "is", "are", "loved", "by", "many", "people"],
          correctOrder: ["This", "song", "is", "loved", "by", "many", "people"],
          hints: ["単数形なので is", "love の過去分詞は loved", "by で「〜によって」"]
        },
        {
          id: "passive_past",
          type: "sentence_building",
          title: "過去の受動態",
          instruction: "was/were + 過去分詞 で過去の受動態を作りましょう。",
          targetSentence: "The letter was written by Tom.",
          availableWords: ["The", "letter", "was", "were", "written", "by", "Tom"],
          correctOrder: ["The", "letter", "was", "written", "by", "Tom"],
          hints: ["単数形なので was", "write の過去分詞は written"]
        },
        {
          id: "passive_plural",
          type: "sentence_building",
          title: "複数形の受動態",
          instruction: "複数形の主語には are/were を使いましょう。",
          targetSentence: "These cars are made in Japan.",
          availableWords: ["These", "cars", "are", "is", "made", "in", "Japan"],
          correctOrder: ["These", "cars", "are", "made", "in", "Japan"],
          hints: ["複数形なので are", "make の過去分詞は made"]
        }
      ],
      assessments: [
        {
          question: "This book ___ written by Shakespeare.",
          options: ["is", "was", "were"],
          correctAnswer: 1,
          explanation: "過去に書かれた本なので was を使います"
        },
        {
          question: "The windows ___ cleaned every week.",
          options: ["is", "are", "was"],
          correctAnswer: 1,
          explanation: "複数形で習慣的なことなので are を使います"
        },
        {
          question: "Japanese ___ spoken in Japan.",
          options: ["is", "are", "was"],
          correctAnswer: 0,
          explanation: "現在の事実で単数形なので is を使います"
        }
      ]
    },

    {
      id: "g3_relative_pronoun_construction",
      title: "関係代名詞の構築マスタリー",
      level: "grade3",
      complexity: 5,
      estimatedTime: 45,
      explanation: {
        title: "関係代名詞で文を自然につなげよう",
        content: `
          <p><strong>関係代名詞</strong>は2つの文を1つにまとめる時に使います。</p>
          <div class="grammar-rule">
            <h4>関係代名詞の種類:</h4>
            <ul>
              <li><strong>who</strong>：人が主語の時</li>
              <li><strong>which</strong>：物が主語の時</li>
              <li><strong>that</strong>：人・物どちらでも</li>
            </ul>
            
            <h4>関係副詞:</h4>
            <ul>
              <li><strong>where</strong>：場所</li>
              <li><strong>when</strong>：時</li>
            </ul>
          </div>
        `
      },
      examples: [
        {
          sentence: "The man who is standing there is my father.",
          translation: "そこに立っている男性は私の父です。",
          highlight: "who（人を先行詞とする関係代名詞）"
        },
        {
          sentence: "This is the book which I bought yesterday.",
          translation: "これは私が昨日買った本です。",
          highlight: "which（物を先行詞とする関係代名詞）"
        },
        {
          sentence: "I know the place where he lives.",
          translation: "私は彼が住んでいる場所を知っています。",
          highlight: "where（場所を表す関係副詞）"
        }
      ],
      constructionTasks: [
        {
          id: "relative_who",
          type: "sentence_building",
          title: "who を使った関係代名詞",
          instruction: "人を説明する時は who を使いましょう。",
          targetSentence: "The girl who is singing is my sister.",
          availableWords: ["The", "girl", "who", "which", "is", "singing", "my", "sister"],
          correctOrder: ["The", "girl", "who", "is", "singing", "is", "my", "sister"],
          hints: ["人（girl）なので who", "who is singing で「歌っている」"]
        },
        {
          id: "relative_which",
          type: "sentence_building",
          title: "which を使った関係代名詞",
          instruction: "物を説明する時は which を使いましょう。",
          targetSentence: "This is the pen which I lost.",
          availableWords: ["This", "is", "the", "pen", "which", "who", "I", "lost"],
          correctOrder: ["This", "is", "the", "pen", "which", "I", "lost"],
          hints: ["物（pen）なので which", "which I lost で「私が失くした」"]
        },
        {
          id: "relative_where",
          type: "sentence_building",
          title: "where を使った関係副詞",
          instruction: "場所を説明する時は where を使いましょう。",
          targetSentence: "This is the school where I study.",
          availableWords: ["This", "is", "the", "school", "where", "which", "I", "study"],
          correctOrder: ["This", "is", "the", "school", "where", "I", "study"],
          hints: ["場所（school）なので where", "where I study で「私が勉強する」"]
        }
      ],
      assessments: [
        {
          question: "The woman ___ is cooking is my mother.",
          options: ["who", "which", "where"],
          correctAnswer: 0,
          explanation: "人（woman）を先行詞とする時は who を使います"
        },
        {
          question: "I like the book ___ you gave me.",
          options: ["who", "which", "when"],
          correctAnswer: 1,
          explanation: "物（book）を先行詞とする時は which を使います"
        },
        {
          question: "Do you know the place ___ they met?",
          options: ["who", "which", "where"],
          correctAnswer: 2,
          explanation: "場所（place）を先行詞とする時は where を使います"
        }
      ]
    }
  ]
}

// Utility functions for Construction Zone
export const getModulesByLevel = (level) => {
  return CONSTRUCTION_MODULES[level] || []
}

export const getRandomModule = (level) => {
  const modules = CONSTRUCTION_MODULES[level] || []
  if (modules.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * modules.length)
  return modules[randomIndex]
}

export const getModulesByComplexity = (level, maxComplexity = 3) => {
  const modules = CONSTRUCTION_MODULES[level] || []
  return modules.filter(module => module.complexity <= maxComplexity)
}

export const getMixedLevelModules = (levels = ['grade5', 'grade4', 'grade3']) => {
  const allModules = []
  levels.forEach(level => {
    allModules.push(...(CONSTRUCTION_MODULES[level] || []))
  })
  return allModules.sort(() => Math.random() - 0.5)
}