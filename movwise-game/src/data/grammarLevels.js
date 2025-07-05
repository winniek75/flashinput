// Grammar Galaxy Foundation - Learning Levels Data
// 段階的な文法学習システム

export const grammarLevels = {
  beginner: {
    id: 'beginner',
    name: '初級惑星 - Grammar Explorer',
    description: '英検5級レベル - 基本的な文法要素の習得',
    icon: '🌍',
    color: '#3B82F6',
    requiredStars: 0,
    
    verbTimeMachine: [
      {
        level: 1,
        title: 'Be動詞タイムトラベル',
        description: 'am, is, are の基本形を習得',
        verbs: ['be/am/was', 'be/is/was', 'be/are/were'],
        examples: [
          { present: 'I am happy', past: 'I was happy', perfect: 'I have been happy' },
          { present: 'He is here', past: 'He was here', perfect: 'He has been here' },
          { present: 'They are ready', past: 'They were ready', perfect: 'They have been ready' }
        ],
        targetTime: 60,
        passingScore: 80
      },
      {
        level: 2,
        title: '一般動詞タイムトラベル',
        description: '規則動詞の現在・過去・過去分詞',
        verbs: ['play/played/played', 'study/studied/studied', 'walk/walked/walked'],
        examples: [
          { present: 'I play tennis', past: 'I played tennis', perfect: 'I have played tennis' },
          { present: 'She studies hard', past: 'She studied hard', perfect: 'She has studied hard' },
          { present: 'We walk home', past: 'We walked home', perfect: 'We have walked home' }
        ],
        targetTime: 90,
        passingScore: 75
      },
      {
        level: 3,
        title: '不規則動詞チャレンジ',
        description: '重要な不規則動詞の習得',
        verbs: ['go/went/gone', 'eat/ate/eaten', 'see/saw/seen', 'take/took/taken', 'come/came/come'],
        examples: [
          { present: 'I go to school', past: 'I went to school', perfect: 'I have gone to school' },
          { present: 'He eats lunch', past: 'He ate lunch', perfect: 'He has eaten lunch' },
          { present: 'We see the movie', past: 'We saw the movie', perfect: 'We have seen the movie' }
        ],
        targetTime: 120,
        passingScore: 70
      }
    ],
    
    questionWordDetective: [
      {
        level: 1,
        title: 'What探偵',
        description: '物や事について質問する',
        questionWord: 'What',
        items: [
          { image: 'apple.jpg', answer: 'What is this?', description: 'りんご' },
          { image: 'book.jpg', answer: 'What are you reading?', description: '本' },
          { image: 'car.jpg', answer: 'What is that?', description: '車' },
          { image: 'food.jpg', answer: 'What did you eat?', description: '食べ物' },
          { image: 'game.jpg', answer: 'What are you playing?', description: 'ゲーム' }
        ],
        targetReactionTime: 2.0,
        passingAccuracy: 80
      },
      {
        level: 2,
        title: 'Who探偵',
        description: '人について質問する',
        questionWord: 'Who',
        items: [
          { image: 'teacher.jpg', answer: 'Who is your teacher?', description: '先生' },
          { image: 'friend.jpg', answer: 'Who is your friend?', description: '友達' },
          { image: 'family.jpg', answer: 'Who are they?', description: '家族' },
          { image: 'student.jpg', answer: 'Who is studying?', description: '生徒' },
          { image: 'doctor.jpg', answer: 'Who helps sick people?', description: '医者' }
        ],
        targetReactionTime: 1.8,
        passingAccuracy: 75
      },
      {
        level: 3,
        title: 'Where探偵',
        description: '場所について質問する',
        questionWord: 'Where',
        items: [
          { image: 'school.jpg', answer: 'Where do you study?', description: '学校' },
          { image: 'park.jpg', answer: 'Where do you play?', description: '公園' },
          { image: 'home.jpg', answer: 'Where do you live?', description: '家' },
          { image: 'library.jpg', answer: 'Where are the books?', description: '図書館' },
          { image: 'store.jpg', answer: 'Where do you shop?', description: '店' }
        ],
        targetReactionTime: 1.5,
        passingAccuracy: 85
      }
    ],
    
    grammarConstructor: [
      {
        level: 1,
        title: '基本文構築',
        description: '主語 + 動詞 + 目的語の基本構造',
        patterns: [
          {
            structure: 'Subject + Verb + Object',
            blocks: [
              { type: 'subject', options: ['I', 'You', 'He', 'She', 'We', 'They'], color: '#EF4444' },
              { type: 'verb', options: ['like', 'eat', 'play', 'watch', 'read'], color: '#10B981' },
              { type: 'object', options: ['apples', 'books', 'games', 'movies', 'music'], color: '#3B82F6' }
            ],
            examples: ['I like apples', 'She reads books', 'We play games']
          }
        ],
        targetTime: 45,
        passingScore: 90
      },
      {
        level: 2,
        title: 'Be動詞文構築',
        description: 'Be動詞を使った文の構造',
        patterns: [
          {
            structure: 'Subject + Be Verb + Complement',
            blocks: [
              { type: 'subject', options: ['I', 'You', 'He', 'She', 'It', 'We', 'They'], color: '#EF4444' },
              { type: 'be-verb', options: ['am', 'is', 'are'], color: '#F59E0B' },
              { type: 'complement', options: ['happy', 'tall', 'a student', 'at home', 'hungry'], color: '#8B5CF6' }
            ],
            examples: ['I am happy', 'He is tall', 'They are students']
          }
        ],
        targetTime: 50,
        passingScore: 85
      },
      {
        level: 3,
        title: '疑問文構築',
        description: 'Do/Does疑問文の構造',
        patterns: [
          {
            structure: 'Do/Does + Subject + Verb + Object?',
            blocks: [
              { type: 'auxiliary', options: ['Do', 'Does'], color: '#EC4899' },
              { type: 'subject', options: ['you', 'he', 'she', 'we', 'they'], color: '#EF4444' },
              { type: 'verb', options: ['like', 'eat', 'play', 'study', 'want'], color: '#10B981' },
              { type: 'object', options: ['soccer', 'pizza', 'English', 'movies', 'books'], color: '#3B82F6' }
            ],
            examples: ['Do you like soccer?', 'Does he eat pizza?', 'Do they study English?']
          }
        ],
        targetTime: 60,
        passingScore: 80
      }
    ]
  },
  
  intermediate: {
    id: 'intermediate',
    name: '中級惑星 - Grammar Voyager',
    description: '英検4級レベル - 応用的な文法構造の習得',
    icon: '🪐',
    color: '#8B5CF6',
    requiredStars: 15,
    
    verbTimeMachine: [
      {
        level: 4,
        title: '進行形タイムマシン',
        description: '現在進行形・過去進行形の習得',
        verbs: ['playing', 'studying', 'running', 'swimming', 'cooking'],
        examples: [
          { present: 'I am playing', past: 'I was playing', future: 'I will be playing' },
          { present: 'She is studying', past: 'She was studying', future: 'She will be studying' },
          { present: 'They are running', past: 'They were running', future: 'They will be running' }
        ],
        targetTime: 90,
        passingScore: 75
      },
      {
        level: 5,
        title: '完了形エクスプローラー',
        description: '現在完了形の概念と使い方',
        verbs: ['have/has finished', 'have/has visited', 'have/has lived', 'have/has worked'],
        examples: [
          { perfect: 'I have finished my homework', meaning: '宿題を終えた（今も影響がある）' },
          { perfect: 'She has visited Japan', meaning: '日本を訪れたことがある（経験）' },
          { perfect: 'We have lived here for 5 years', meaning: '5年間ここに住んでいる（継続）' }
        ],
        targetTime: 120,
        passingScore: 70
      }
    ],
    
    questionWordDetective: [
      {
        level: 4,
        title: 'When & Why探偵コンボ',
        description: '時間と理由を同時に推理',
        questionWords: ['When', 'Why'],
        scenarios: [
          { 
            situation: 'school_schedule.jpg', 
            whenAnswer: 'When do you go to school?', 
            whyAnswer: 'Why do you study?',
            hints: ['morning', 'education', 'future']
          },
          { 
            situation: 'birthday_party.jpg', 
            whenAnswer: 'When is your birthday?', 
            whyAnswer: 'Why are you happy?',
            hints: ['celebration', 'gifts', 'friends']
          }
        ],
        targetReactionTime: 1.2,
        passingAccuracy: 80
      }
    ],
    
    grammarConstructor: [
      {
        level: 4,
        title: '複合文アーキテクト',
        description: '接続詞を使った複合文の構築',
        patterns: [
          {
            structure: 'Sentence + Conjunction + Sentence',
            blocks: [
              { type: 'sentence1', options: ['I study hard', 'She likes music', 'We play sports'], color: '#EF4444' },
              { type: 'conjunction', options: ['and', 'but', 'because', 'so'], color: '#F59E0B' },
              { type: 'sentence2', options: ['I get good grades', 'she plays piano', 'we are healthy'], color: '#10B981' }
            ],
            examples: ['I study hard because I want good grades', 'She likes music and she plays piano']
          }
        ],
        targetTime: 75,
        passingScore: 80
      }
    ]
  },
  
  advanced: {
    id: 'advanced',
    name: '上級惑星 - Grammar Master',
    description: '英検3級レベル - 複雑な文法構造の習得',
    icon: '🌌',
    color: '#EC4899',
    requiredStars: 30,
    
    verbTimeMachine: [
      {
        level: 6,
        title: '仮定法タイムライン',
        description: '仮定法過去・仮定法過去完了',
        verbs: ['would have', 'could have', 'should have', 'might have'],
        examples: [
          { 
            conditional: 'If I had studied harder, I would have passed the test',
            meaning: '一生懸命勉強していたら、テストに合格していただろう（過去の事実に反する仮定）'
          },
          { 
            conditional: 'If she were here, she would help us',
            meaning: '彼女がここにいたら、私たちを助けてくれるだろう（現在の事実に反する仮定）'
          }
        ],
        targetTime: 150,
        passingScore: 65
      }
    ],
    
    questionWordDetective: [
      {
        level: 5,
        title: 'How探偵マスター',
        description: '方法・程度・状態の複合推理',
        questionWord: 'How',
        complexScenarios: [
          {
            scenario: 'cooking_process.jpg',
            questions: ['How do you cook?', 'How long does it take?', 'How much do you need?'],
            multiAnswers: ['by following recipe', 'about 30 minutes', 'two cups of flour']
          }
        ],
        targetReactionTime: 1.0,
        passingAccuracy: 85
      }
    ],
    
    grammarConstructor: [
      {
        level: 5,
        title: '関係代名詞マスター',
        description: '関係代名詞を使った複文構築',
        patterns: [
          {
            structure: 'Noun + Relative Pronoun + Clause',
            blocks: [
              { type: 'main-clause', options: ['The book', 'The person', 'The place'], color: '#EF4444' },
              { type: 'relative-pronoun', options: ['that', 'which', 'who', 'where'], color: '#F59E0B' },
              { type: 'relative-clause', options: ['I read yesterday', 'lives next door', 'we visited'], color: '#10B981' }
            ],
            examples: ['The book that I read yesterday was interesting', 'The person who lives next door is kind']
          }
        ],
        targetTime: 90,
        passingScore: 75
      }
    ]
  }
}

// レベル判定関数
export const getPlayerLevel = (totalStars) => {
  if (totalStars >= 30) return grammarLevels.advanced
  if (totalStars >= 15) return grammarLevels.intermediate
  return grammarLevels.beginner
}

// 次のレベルまでの必要スター数
export const getStarsToNextLevel = (totalStars) => {
  if (totalStars < 15) return 15 - totalStars
  if (totalStars < 30) return 30 - totalStars
  return 0 // 最高レベル達成
}

// 難易度別の色設定
export const difficultyColors = {
  beginner: {
    primary: '#3B82F6',
    secondary: '#93C5FD',
    background: 'rgba(59, 130, 246, 0.1)'
  },
  intermediate: {
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    background: 'rgba(139, 92, 246, 0.1)'
  },
  advanced: {
    primary: '#EC4899',
    secondary: '#F9A8D4',
    background: 'rgba(236, 72, 153, 0.1)'
  }
}