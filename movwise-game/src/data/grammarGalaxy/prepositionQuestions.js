export const prepositionQuestions = {
  place: {
    title: '場所の前置詞',
    description: '物や人の位置を表す前置詞を学習',
    questions: [
      {
        id: 'place_001',
        sentence: 'The cat is ___ the box.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '箱の中にいる場合',
        explanation: 'inは「〜の中に」を表します。容器や空間の内部にいる時に使います。',
        image: 'cat_in_box'
      },
      {
        id: 'place_002',
        sentence: 'The book is ___ the table.',
        options: ['on', 'in', 'under'],
        correct: 'on',
        hint: 'テーブルの上にある場合',
        explanation: 'onは「〜の上に」を表します。表面に接触している時に使います。',
        image: 'book_on_table'
      },
      {
        id: 'place_003',
        sentence: 'She is waiting ___ the bus stop.',
        options: ['at', 'on', 'in'],
        correct: 'at',
        hint: '特定の場所で待っている',
        explanation: 'atは特定の地点や場所を示す時に使います。',
        image: 'person_at_busstop'
      },
      {
        id: 'place_004',
        sentence: 'The dog is hiding ___ the sofa.',
        options: ['under', 'on', 'at'],
        correct: 'under',
        hint: 'ソファの下に隠れている',
        explanation: 'underは「〜の下に」を表します。',
        image: 'dog_under_sofa'
      },
      {
        id: 'place_005',
        sentence: 'The picture is ___ the wall.',
        options: ['on', 'in', 'at'],
        correct: 'on',
        hint: '壁に掛かっている',
        explanation: 'onは壁などの垂直な表面にも使います。',
        image: 'picture_on_wall'
      },
      {
        id: 'place_006',
        sentence: 'They live ___ Tokyo.',
        options: ['in', 'at', 'on'],
        correct: 'in',
        hint: '都市に住んでいる',
        explanation: 'inは都市、国、大きな地域に使います。',
        image: 'tokyo_city'
      },
      {
        id: 'place_007',
        sentence: 'The car is parked ___ the house.',
        options: ['behind', 'on', 'at'],
        correct: 'behind',
        hint: '家の後ろに駐車',
        explanation: 'behindは「〜の後ろに」を表します。',
        image: 'car_behind_house'
      },
      {
        id: 'place_008',
        sentence: 'The shop is ___ the bank and the post office.',
        options: ['between', 'among', 'at'],
        correct: 'between',
        hint: '2つの建物の間',
        explanation: 'betweenは2つのものの間を表します。',
        image: 'shop_between_buildings'
      },
      {
        id: 'place_009',
        sentence: 'The bird is sitting ___ the tree.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '木の中（枝の間）',
        explanation: '木の中にいる鳥はinを使います（枝に囲まれているイメージ）。',
        image: 'bird_in_tree'
      },
      {
        id: 'place_010',
        sentence: 'Please sit ___ me.',
        options: ['next to', 'on', 'at'],
        correct: 'next to',
        hint: '隣に座る',
        explanation: 'next toは「〜の隣に」を表します。',
        image: 'sit_next_to'
      }
    ]
  },
  
  time: {
    title: '時間の前置詞',
    description: '時間や期間を表す前置詞を学習',
    questions: [
      {
        id: 'time_001',
        sentence: 'The meeting is ___ 3 o\'clock.',
        options: ['at', 'on', 'in'],
        correct: 'at',
        hint: '特定の時刻',
        explanation: 'atは特定の時刻を表す時に使います。',
        image: 'clock_3'
      },
      {
        id: 'time_002',
        sentence: 'I was born ___ July.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '月を表す',
        explanation: 'inは月、年、季節に使います。',
        image: 'calendar_july'
      },
      {
        id: 'time_003',
        sentence: 'The party is ___ Saturday.',
        options: ['on', 'in', 'at'],
        correct: 'on',
        hint: '曜日を表す',
        explanation: 'onは曜日と日付に使います。',
        image: 'calendar_saturday'
      },
      {
        id: 'time_004',
        sentence: 'We go skiing ___ winter.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '季節を表す',
        explanation: 'inは季節を表す時に使います。',
        image: 'winter_scene'
      },
      {
        id: 'time_005',
        sentence: 'I\'ll see you ___ the morning.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '朝という時間帯',
        explanation: 'inは朝・午後・夕方などの時間帯に使います。',
        image: 'morning_sun'
      },
      {
        id: 'time_006',
        sentence: 'The shop closes ___ night.',
        options: ['at', 'in', 'on'],
        correct: 'at',
        hint: '夜（night）の場合',
        explanation: 'at nightは固定表現です。',
        image: 'night_shop'
      },
      {
        id: 'time_007',
        sentence: 'I\'ve been waiting ___ 2 hours.',
        options: ['for', 'since', 'at'],
        correct: 'for',
        hint: '期間を表す',
        explanation: 'forは期間の長さを表します。',
        image: 'waiting_clock'
      },
      {
        id: 'time_008',
        sentence: 'She has lived here ___ 2010.',
        options: ['since', 'for', 'from'],
        correct: 'since',
        hint: '開始時点を表す',
        explanation: 'sinceは開始時点を表します。',
        image: 'calendar_2010'
      },
      {
        id: 'time_009',
        sentence: 'Please finish this ___ Friday.',
        options: ['by', 'until', 'on'],
        correct: 'by',
        hint: '期限を表す',
        explanation: 'byは「〜までに」という期限を表します。',
        image: 'deadline_friday'
      },
      {
        id: 'time_010',
        sentence: 'The library is open ___ 9 PM.',
        options: ['until', 'by', 'at'],
        correct: 'until',
        hint: '継続の終点',
        explanation: 'untilは「〜まで（ずっと）」という継続を表します。',
        image: 'library_hours'
      }
    ]
  },
  
  date: {
    title: '日付の前置詞',
    description: '日付や特定の日を表す前置詞を学習',
    questions: [
      {
        id: 'date_001',
        sentence: 'My birthday is ___ April 15th.',
        options: ['on', 'in', 'at'],
        correct: 'on',
        hint: '特定の日付',
        explanation: 'onは特定の日付に使います。',
        image: 'birthday_cake'
      },
      {
        id: 'date_002',
        sentence: 'We have a holiday ___ Christmas.',
        options: ['at', 'on', 'in'],
        correct: 'at',
        hint: '祝日・休日期間',
        explanation: 'atは祝日期間全体を指す時に使います（at Christmas = クリスマス期間）。',
        image: 'christmas_tree'
      },
      {
        id: 'date_003',
        sentence: 'The concert is ___ New Year\'s Eve.',
        options: ['on', 'at', 'in'],
        correct: 'on',
        hint: '特定の日のイベント',
        explanation: 'onは特定の日のイベントに使います。',
        image: 'new_year_eve'
      },
      {
        id: 'date_004',
        sentence: 'I graduated ___ 2020.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '年を表す',
        explanation: 'inは年を表す時に使います。',
        image: 'graduation_2020'
      },
      {
        id: 'date_005',
        sentence: 'The meeting is ___ Monday morning.',
        options: ['on', 'in', 'at'],
        correct: 'on',
        hint: '曜日＋時間帯',
        explanation: '曜日が含まれる場合はonを使います。',
        image: 'monday_morning'
      },
      {
        id: 'date_006',
        sentence: 'It happened ___ the 20th century.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '世紀を表す',
        explanation: 'inは世紀や長い期間に使います。',
        image: '20th_century'
      },
      {
        id: 'date_007',
        sentence: 'Let\'s meet ___ the weekend.',
        options: ['on', 'at', 'in'],
        correct: 'on',
        hint: '週末期間全体（アメリカ英語）',
        explanation: 'アメリカ英語では on the weekend を使います。イギリス英語では at the weekend。',
        image: 'weekend_calendar'
      },
      {
        id: 'date_008',
        sentence: 'The project starts ___ the beginning of May.',
        options: ['at', 'in', 'on'],
        correct: 'at',
        hint: '時期の始まり',
        explanation: 'at the beginning/endなど、時期の境目にはatを使います。',
        image: 'may_beginning'
      },
      {
        id: 'date_009',
        sentence: 'We go on vacation ___ August.',
        options: ['in', 'on', 'at'],
        correct: 'in',
        hint: '月を表す',
        explanation: 'inは月に使います。',
        image: 'august_vacation'
      },
      {
        id: 'date_010',
        sentence: 'The sale ends ___ midnight.',
        options: ['at', 'in', 'on'],
        correct: 'at',
        hint: '特定の時刻',
        explanation: 'atは特定の時刻（midnight, noon, dawn）に使います。',
        image: 'midnight_clock'
      }
    ]
  },
  
  method: {
    title: '方法・手段の前置詞',
    description: '方法や手段を表す前置詞を学習',
    questions: [
      {
        id: 'method_001',
        sentence: 'I go to school ___ bus.',
        options: ['by', 'with', 'on'],
        correct: 'by',
        hint: '交通手段',
        explanation: 'byは交通手段を表します（by bus, by car, by train）。',
        image: 'school_bus'
      },
      {
        id: 'method_002',
        sentence: 'She cut the paper ___ scissors.',
        options: ['with', 'by', 'using'],
        correct: 'with',
        hint: '道具を使って',
        explanation: 'withは道具を使うことを表します。',
        image: 'scissors_paper'
      },
      {
        id: 'method_003',
        sentence: 'You can pay ___ credit card.',
        options: ['by', 'with', 'in'],
        correct: 'by',
        hint: '支払い方法',
        explanation: 'byは方法・手段を表します。',
        image: 'credit_card'
      },
      {
        id: 'method_004',
        sentence: 'The message was sent ___ email.',
        options: ['by', 'through', 'with'],
        correct: 'by',
        hint: '通信手段',
        explanation: 'byは通信手段にも使います（by email, by phone）。',
        image: 'email_send'
      },
      {
        id: 'method_005',
        sentence: 'He succeeded ___ hard work.',
        options: ['through', 'by', 'with'],
        correct: 'through',
        hint: '〜を通じて成功',
        explanation: 'throughは「〜を通じて、〜によって」結果を得ることを表します。',
        image: 'success_work'
      },
      {
        id: 'method_006',
        sentence: 'Please write ___ a pen.',
        options: ['with', 'by', 'in'],
        correct: 'with',
        hint: 'ペンを使って',
        explanation: 'withは具体的な道具を表します。',
        image: 'write_pen'
      },
      {
        id: 'method_007',
        sentence: 'The door opened ___ a key.',
        options: ['with', 'by', 'using'],
        correct: 'with',
        hint: '鍵を使って',
        explanation: 'withは道具を使った動作を表します。',
        image: 'door_key'
      },
      {
        id: 'method_008',
        sentence: 'Travel ___ air is fastest.',
        options: ['by', 'with', 'on'],
        correct: 'by',
        hint: '空路で',
        explanation: 'by airは「空路で」という意味の固定表現です。',
        image: 'airplane'
      },
      {
        id: 'method_009',
        sentence: 'She learned English ___ watching movies.',
        options: ['by', 'through', 'with'],
        correct: 'by',
        hint: '〜することによって',
        explanation: 'by + 動名詞で「〜することによって」を表します。',
        image: 'learn_movies'
      },
      {
        id: 'method_010',
        sentence: 'Cook the vegetables ___ low heat.',
        options: ['on', 'with', 'at'],
        correct: 'on',
        hint: '火加減の設定',
        explanation: 'on low/high heatは料理の火加減を表す固定表現です。',
        image: 'cooking_heat'
      }
    ]
  },
  
  relation: {
    title: '関係の前置詞',
    description: '人や物との関係を表す前置詞を学習',
    questions: [
      {
        id: 'relation_001',
        sentence: 'This gift is ___ you.',
        options: ['for', 'to', 'with'],
        correct: 'for',
        hint: '〜のための贈り物',
        explanation: 'forは「〜のために」を表します。',
        image: 'gift_for_you'
      },
      {
        id: 'relation_002',
        sentence: 'She is angry ___ me.',
        options: ['with', 'to', 'at'],
        correct: 'with',
        hint: '人に対して怒る',
        explanation: 'angry withは「人に対して怒っている」を表します。',
        image: 'angry_person'
      },
      {
        id: 'relation_003',
        sentence: 'I agree ___ your opinion.',
        options: ['with', 'to', 'on'],
        correct: 'with',
        hint: '意見に同意',
        explanation: 'agree withは「〜に同意する」を表します。',
        image: 'agree_opinion'
      },
      {
        id: 'relation_004',
        sentence: 'Let\'s talk ___ the problem.',
        options: ['about', 'of', 'with'],
        correct: 'about',
        hint: '〜について話す',
        explanation: 'aboutは「〜について」を表します。',
        image: 'talk_problem'
      },
      {
        id: 'relation_005',
        sentence: 'He is proud ___ his son.',
        options: ['of', 'with', 'about'],
        correct: 'of',
        hint: '〜を誇りに思う',
        explanation: 'proud ofは「〜を誇りに思う」という固定表現です。',
        image: 'proud_parent'
      },
      {
        id: 'relation_006',
        sentence: 'This book belongs ___ me.',
        options: ['to', 'with', 'for'],
        correct: 'to',
        hint: '〜に属する',
        explanation: 'belong toは「〜に属する、〜のものである」を表します。',
        image: 'book_belongs'
      },
      {
        id: 'relation_007',
        sentence: 'She is good ___ math.',
        options: ['at', 'with', 'in'],
        correct: 'at',
        hint: '〜が得意',
        explanation: 'good atは「〜が得意」を表します。',
        image: 'good_at_math'
      },
      {
        id: 'relation_008',
        sentence: 'I received a letter ___ my friend.',
        options: ['from', 'by', 'of'],
        correct: 'from',
        hint: '〜から受け取る',
        explanation: 'fromは「〜から」という起点を表します。',
        image: 'letter_from'
      },
      {
        id: 'relation_009',
        sentence: 'We\'re excited ___ the trip.',
        options: ['about', 'for', 'with'],
        correct: 'about',
        hint: '〜にわくわくする',
        explanation: 'excited aboutは「〜にわくわくする」を表します。',
        image: 'excited_trip'
      },
      {
        id: 'relation_010',
        sentence: 'The team is fighting ___ pollution.',
        options: ['against', 'with', 'to'],
        correct: 'against',
        hint: '〜と戦う、対抗する',
        explanation: 'againstは「〜に対して、〜と戦う」を表します。',
        image: 'fight_pollution'
      }
    ]
  }
}

export const getRandomQuestions = (category, count = 10) => {
  const questions = prepositionQuestions[category]?.questions || []
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  
  // Shuffle options for each question
  return shuffled.slice(0, count).map(question => ({
    ...question,
    options: [...question.options].sort(() => Math.random() - 0.5)
  }))
}

export const getQuestionById = (category, questionId) => {
  return prepositionQuestions[category]?.questions.find(q => q.id === questionId)
}

export const getAllCategories = () => {
  return Object.keys(prepositionQuestions).map(key => ({
    id: key,
    title: prepositionQuestions[key].title,
    description: prepositionQuestions[key].description,
    questionCount: prepositionQuestions[key].questions.length
  }))
}