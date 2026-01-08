import type { PhraseQuestion, LevelInfo } from '@/types/phraseGalaxy'

// レベル情報
export const levelInfo: LevelInfo[] = [
  {
    id: 'eiken5',
    name: '英検5級',
    description: '基本的な動詞+名詞の組み合わせ',
    icon: '⭐',
    difficulty: 1,
    questionCount: 30,
    estimatedTime: '12分'
  },
  {
    id: 'eiken4',
    name: '英検4級',
    description: '日常的な動作フレーズ',
    icon: '🌟',
    difficulty: 2,
    requiredAccuracy: 70,
    unlockRequirement: '英検5級 70%以上',
    questionCount: 50,
    estimatedTime: '12分'
  },
  {
    id: 'eiken3',
    name: '英検3級',
    description: 'やや複雑な表現',
    icon: '✨',
    difficulty: 3,
    requiredAccuracy: 75,
    unlockRequirement: '英検4級 75%以上',
    questionCount: 50,
    estimatedTime: '15分'
  },
  {
    id: 'eiken-pre2',
    name: '英検準2級',
    description: '慣用的な表現',
    icon: '💫',
    difficulty: 4,
    requiredAccuracy: 80,
    unlockRequirement: '英検3級 80%以上',
    questionCount: 50,
    estimatedTime: '18分'
  },
  {
    id: 'eiken2',
    name: '英検2級',
    description: '高度な熟語',
    icon: '🌠',
    difficulty: 5,
    requiredAccuracy: 85,
    unlockRequirement: '英検準2級 85%以上',
    questionCount: 50,
    estimatedTime: '20分'
  }
]

// 問題データ（各レベル10問ずつで先行実装）
// 注意: 画像ファイルは public/images/phrase-galaxy/ フォルダに配置してください
export const phraseQuestions: PhraseQuestion[] = [
  // 英検5級 (10問)
  {
    id: 'eiken5_001',
    level: 'eiken5',
    phrase: 'drink water',
    imageUrl: '/images/phrase-galaxy/eiken5/drink-water.jpg',
    imageAlt: 'Person drinking water',
    distractors: ['eat water', 'swim water'],
    difficulty: 1,
    category: '日常生活'
  },
  {
    id: 'eiken5_002',
    level: 'eiken5',
    phrase: 'kick the ball',
    imageUrl: '/images/phrase-galaxy/eiken5/kick-ball.jpg',
    imageAlt: 'Child kicking a soccer ball',
    distractors: ['throw the ball', 'hit the ball'],
    difficulty: 1,
    category: 'スポーツ'
  },
  {
    id: 'eiken5_003',
    level: 'eiken5',
    phrase: 'open the door',
    imageUrl: '/images/phrase-galaxy/eiken5/open-door.jpg',
    imageAlt: 'Hand opening a door',
    distractors: ['close the door', 'break the door'],
    difficulty: 1,
    category: '日常動作'
  },
  {
    id: 'eiken5_004',
    level: 'eiken5',
    phrase: 'read a book',
    imageUrl: '/images/phrase-galaxy/eiken5/read-book.jpg',
    imageAlt: 'Person reading a book',
    distractors: ['write a book', 'eat a book'],
    difficulty: 1,
    category: '学習'
  },
  {
    id: 'eiken5_005',
    level: 'eiken5',
    phrase: 'brush teeth',
    imageUrl: '/images/phrase-galaxy/eiken5/brush-teeth.jpg',
    imageAlt: 'Child brushing teeth',
    distractors: ['wash teeth', 'cut teeth'],
    difficulty: 1,
    category: '日常生活'
  },
  {
    id: 'eiken5_006',
    level: 'eiken5',
    phrase: 'watch TV',
    imageUrl: '/images/phrase-galaxy/eiken5/watch-tv.jpg',
    imageAlt: 'Family watching television',
    distractors: ['hear TV', 'touch TV'],
    difficulty: 1,
    category: '娯楽'
  },
  {
    id: 'eiken5_007',
    level: 'eiken5',
    phrase: 'eat lunch',
    imageUrl: '/images/phrase-galaxy/eiken5/eat-lunch.jpg',
    imageAlt: 'Person eating lunch',
    distractors: ['drink lunch', 'sleep lunch'],
    difficulty: 1,
    category: '食事'
  },
  {
    id: 'eiken5_008',
    level: 'eiken5',
    phrase: 'wash hands',
    imageUrl: '/images/phrase-galaxy/eiken5/wash-hands.jpg',
    imageAlt: 'Hands being washed with soap',
    distractors: ['dry hands', 'cut hands'],
    difficulty: 1,
    category: '衛生'
  },
  {
    id: 'eiken5_009',
    level: 'eiken5',
    phrase: 'go to school',
    imageUrl: '/images/phrase-galaxy/eiken5/go-school.jpg',
    imageAlt: 'Students walking to school',
    distractors: ['come to school', 'stay to school'],
    difficulty: 1,
    category: '学校'
  },
  {
    id: 'eiken5_010',
    level: 'eiken5',
    phrase: 'play games',
    imageUrl: '/images/phrase-galaxy/eiken5/play-games.jpg',
    imageAlt: 'Children playing board games',
    distractors: ['do games', 'make games'],
    difficulty: 1,
    category: '遊び'
  },
  {
    id: 'eiken5_011',
    level: 'eiken5',
    phrase: 'cook dinner',
    imageUrl: '/images/phrase-galaxy/eiken5/cook-dinner.jpg',
    imageAlt: 'Person cooking dinner in kitchen',
    distractors: ['make dinner', 'do dinner'],
    difficulty: 1,
    category: '料理'
  },
  {
    id: 'eiken5_012',
    level: 'eiken5',
    phrase: 'walk the dog',
    imageUrl: '/images/phrase-galaxy/eiken5/walk-dog.jpg',
    imageAlt: 'Person walking dog in park',
    distractors: ['run the dog', 'take the dog'],
    difficulty: 1,
    category: 'ペット'
  },
  {
    id: 'eiken5_013',
    level: 'eiken5',
    phrase: 'write a letter',
    imageUrl: '/images/phrase-galaxy/eiken5/write-letter.jpg',
    imageAlt: 'Person writing a letter with pen',
    distractors: ['make a letter', 'do a letter'],
    difficulty: 1,
    category: '文字'
  },
  {
    id: 'eiken5_014',
    level: 'eiken5',
    phrase: 'take a bath',
    imageUrl: '/images/phrase-galaxy/eiken5/take-bath.jpg',
    imageAlt: 'Person taking a relaxing bath',
    distractors: ['make a bath', 'do a bath'],
    difficulty: 1,
    category: '入浴'
  },
  {
    id: 'eiken5_015',
    level: 'eiken5',
    phrase: 'buy food',
    imageUrl: '/images/phrase-galaxy/eiken5/buy-food.jpg',
    imageAlt: 'Person buying food at supermarket',
    distractors: ['get food', 'take food'],
    difficulty: 1,
    category: '買い物'
  },
  {
    id: 'eiken5_016',
    level: 'eiken5',
    phrase: 'drive a car',
    imageUrl: '/images/phrase-galaxy/eiken5/drive-car.jpg',
    imageAlt: 'Person driving a car',
    distractors: ['ride a car', 'take a car'],
    difficulty: 1,
    category: '交通'
  },
  {
    id: 'eiken5_017',
    level: 'eiken5',
    phrase: 'make coffee',
    imageUrl: '/images/phrase-galaxy/eiken5/make-coffee.jpg',
    imageAlt: 'Person making coffee in kitchen',
    distractors: ['do coffee', 'cook coffee'],
    difficulty: 1,
    category: '飲み物'
  },
  {
    id: 'eiken5_018',
    level: 'eiken5',
    phrase: 'call mom',
    imageUrl: '/images/phrase-galaxy/eiken5/call-mom.jpg',
    imageAlt: 'Person calling mother on phone',
    distractors: ['phone mom', 'speak mom'],
    difficulty: 1,
    category: '電話'
  },
  {
    id: 'eiken5_019',
    level: 'eiken5',
    phrase: 'feed the cat',
    imageUrl: '/images/phrase-galaxy/eiken5/feed-cat.jpg',
    imageAlt: 'Person feeding cat with food bowl',
    distractors: ['give the cat', 'eat the cat'],
    difficulty: 1,
    category: 'ペット'
  },
  {
    id: 'eiken5_020',
    level: 'eiken5',
    phrase: 'cut paper',
    imageUrl: '/images/phrase-galaxy/eiken5/cut-paper.jpg',
    imageAlt: 'Hands cutting paper with scissors',
    distractors: ['break paper', 'tear paper'],
    difficulty: 1,
    category: '工作'
  },
  {
    id: 'eiken5_021',
    level: 'eiken5',
    phrase: 'swim fast',
    imageUrl: '/images/phrase-galaxy/eiken5/swim-fast.jpg',
    imageAlt: 'Person swimming fast in pool',
    distractors: ['run fast', 'walk fast'],
    difficulty: 1,
    category: 'スポーツ'
  },
  {
    id: 'eiken5_022',
    level: 'eiken5',
    phrase: 'jump high',
    imageUrl: '/images/phrase-galaxy/eiken5/jump-high.jpg',
    imageAlt: 'Person jumping high in the air',
    distractors: ['fly high', 'run high'],
    difficulty: 1,
    category: '運動'
  },
  {
    id: 'eiken5_023',
    level: 'eiken5',
    phrase: 'sing a song',
    imageUrl: '/images/phrase-galaxy/eiken5/sing-song.jpg',
    imageAlt: 'Person singing with microphone',
    distractors: ['play a song', 'do a song'],
    difficulty: 1,
    category: '音楽'
  },
  {
    id: 'eiken5_024',
    level: 'eiken5',
    phrase: 'draw a picture',
    imageUrl: '/images/phrase-galaxy/eiken5/draw-picture.jpg',
    imageAlt: 'Child drawing picture with crayons',
    distractors: ['make a picture', 'write a picture'],
    difficulty: 1,
    category: '芸術'
  },
  {
    id: 'eiken5_025',
    level: 'eiken5',
    phrase: 'climb a tree',
    imageUrl: '/images/phrase-galaxy/eiken5/climb-tree.jpg',
    imageAlt: 'Child climbing up a tree',
    distractors: ['walk a tree', 'run a tree'],
    difficulty: 1,
    category: '遊び'
  },
  {
    id: 'eiken5_026',
    level: 'eiken5',
    phrase: 'help mom',
    imageUrl: '/images/phrase-galaxy/eiken5/help-mom.jpg',
    imageAlt: 'Child helping mother with household chores',
    distractors: ['work mom', 'do mom'],
    difficulty: 1,
    category: '家事'
  },
  {
    id: 'eiken5_027',
    level: 'eiken5',
    phrase: 'wear a hat',
    imageUrl: '/images/phrase-galaxy/eiken5/wear-hat.jpg',
    imageAlt: 'Person wearing a hat outdoors',
    distractors: ['put a hat', 'take a hat'],
    difficulty: 1,
    category: '服装'
  },
  {
    id: 'eiken5_028',
    level: 'eiken5',
    phrase: 'count money',
    imageUrl: '/images/phrase-galaxy/eiken5/count-money.jpg',
    imageAlt: 'Person counting coins and bills',
    distractors: ['make money', 'do money'],
    difficulty: 1,
    category: 'お金'
  },
  {
    id: 'eiken5_029',
    level: 'eiken5',
    phrase: 'fix the bike',
    imageUrl: '/images/phrase-galaxy/eiken5/fix-bike.jpg',
    imageAlt: 'Person repairing bicycle with tools',
    distractors: ['make the bike', 'do the bike'],
    difficulty: 1,
    category: '修理'
  },
  {
    id: 'eiken5_030',
    level: 'eiken5',
    phrase: 'plant flowers',
    imageUrl: '/images/phrase-galaxy/eiken5/plant-flowers.jpg',
    imageAlt: 'Person planting flowers in garden',
    distractors: ['make flowers', 'grow flowers'],
    difficulty: 1,
    category: '園芸'
  },

  // 英検4級 (10問)
  {
    id: 'eiken4_001',
    level: 'eiken4',
    phrase: 'take a picture',
    imageUrl: '/images/phrase-galaxy/eiken4/take-picture.jpg',
    imageAlt: 'Tourist taking a photo with camera',
    distractors: ['make a picture', 'do a picture'],
    difficulty: 2,
    category: '写真'
  },
  {
    id: 'eiken4_002',
    level: 'eiken4',
    phrase: 'make a mistake',
    imageUrl: '/images/phrase-galaxy/eiken4/make-mistake.jpg',
    imageAlt: 'Student looking confused at homework',
    distractors: ['do a mistake', 'have a mistake'],
    difficulty: 2,
    category: '学習'
  },
  {
    id: 'eiken4_003',
    level: 'eiken4',
    phrase: 'catch a cold',
    imageUrl: '/images/phrase-galaxy/eiken4/catch-cold.jpg',
    imageAlt: 'Person with tissue, looking sick',
    distractors: ['get a cold', 'take a cold'],
    difficulty: 2,
    category: '健康'
  },
  {
    id: 'eiken4_004',
    level: 'eiken4',
    phrase: 'have a good time',
    imageUrl: '/images/phrase-galaxy/eiken4/have-good-time.jpg',
    imageAlt: 'Friends laughing and having fun',
    distractors: ['make a good time', 'do a good time'],
    difficulty: 2,
    category: '感情'
  },
  {
    id: 'eiken4_005',
    level: 'eiken4',
    phrase: 'tell a story',
    imageUrl: '/images/phrase-galaxy/eiken4/tell-story.jpg',
    imageAlt: 'Grandmother reading story to child',
    distractors: ['say a story', 'speak a story'],
    difficulty: 2,
    category: 'コミュニケーション'
  },
  {
    id: 'eiken4_006',
    level: 'eiken4',
    phrase: 'do homework',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    imageAlt: 'Student doing homework at desk',
    distractors: ['make homework', 'work homework'],
    difficulty: 2,
    category: '学習'
  },
  {
    id: 'eiken4_007',
    level: 'eiken4',
    phrase: 'clean the room',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    imageAlt: 'Person cleaning and organizing room',
    distractors: ['wash the room', 'fix the room'],
    difficulty: 2,
    category: '家事'
  },
  {
    id: 'eiken4_008',
    level: 'eiken4',
    phrase: 'listen to music',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    imageAlt: 'Person with headphones listening to music',
    distractors: ['hear to music', 'sound to music'],
    difficulty: 2,
    category: '音楽'
  },
  {
    id: 'eiken4_009',
    level: 'eiken4',
    phrase: 'ride a bike',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-e1c4c9e41c0c?w=400&h=300&fit=crop',
    imageAlt: 'Person riding bicycle in park',
    distractors: ['drive a bike', 'walk a bike'],
    difficulty: 2,
    category: '交通'
  },
  {
    id: 'eiken4_010',
    level: 'eiken4',
    phrase: 'turn on the light',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    imageAlt: 'Hand turning on light switch',
    distractors: ['open the light', 'start the light'],
    difficulty: 2,
    category: '日常動作'
  },

  // 英検3級 (10問)
  {
    id: 'eiken3_001',
    level: 'eiken3',
    phrase: 'look forward to',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    imageAlt: 'Person excitedly looking at calendar',
    distractors: ['look ahead to', 'look up to'],
    difficulty: 3,
    category: '感情'
  },
  {
    id: 'eiken3_002',
    level: 'eiken3',
    phrase: 'take care of',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
    imageAlt: 'Person caring for elderly grandmother',
    distractors: ['take watch of', 'take look of'],
    difficulty: 3,
    category: '介護'
  },
  {
    id: 'eiken3_003',
    level: 'eiken3',
    phrase: 'get used to',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop',
    imageAlt: 'Person adapting to new workplace',
    distractors: ['become used to', 'make used to'],
    difficulty: 3,
    category: '適応'
  },
  {
    id: 'eiken3_004',
    level: 'eiken3',
    phrase: 'give up',
    imageUrl: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=400&h=300&fit=crop',
    imageAlt: 'Person looking defeated and giving up',
    distractors: ['give away', 'give out'],
    difficulty: 3,
    category: '諦め'
  },
  {
    id: 'eiken3_005',
    level: 'eiken3',
    phrase: 'pick up',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    imageAlt: 'Person picking up books from floor',
    distractors: ['take up', 'lift up'],
    difficulty: 3,
    category: '動作'
  },
  {
    id: 'eiken3_006',
    level: 'eiken3',
    phrase: 'find out',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    imageAlt: 'Person discovering information in book',
    distractors: ['look out', 'see out'],
    difficulty: 3,
    category: '発見'
  },
  {
    id: 'eiken3_007',
    level: 'eiken3',
    phrase: 'turn off',
    imageUrl: 'https://images.unsplash.com/photo-1586892478025-2b5472316cfb?w=400&h=300&fit=crop',
    imageAlt: 'Hand turning off electronic device',
    distractors: ['close off', 'stop off'],
    difficulty: 3,
    category: '操作'
  },
  {
    id: 'eiken3_008',
    level: 'eiken3',
    phrase: 'put on',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    imageAlt: 'Person putting on jacket',
    distractors: ['wear on', 'dress on'],
    difficulty: 3,
    category: '服装'
  },
  {
    id: 'eiken3_009',
    level: 'eiken3',
    phrase: 'wake up',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
    imageAlt: 'Person waking up in bed with alarm clock',
    distractors: ['get up', 'stand up'],
    difficulty: 3,
    category: '睡眠'
  },
  {
    id: 'eiken3_010',
    level: 'eiken3',
    phrase: 'break down',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-e1c4c9e41c0c?w=400&h=300&fit=crop',
    imageAlt: 'Broken down car on roadside',
    distractors: ['fall down', 'cut down'],
    difficulty: 3,
    category: '故障'
  },

  // 英検準2級 (10問)
  {
    id: 'eiken-pre2_001',
    level: 'eiken-pre2',
    phrase: 'get along with',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
    imageAlt: 'Group of friends getting along well',
    distractors: ['go along with', 'come along with'],
    difficulty: 4,
    category: '人間関係'
  },
  {
    id: 'eiken-pre2_002',
    level: 'eiken-pre2',
    phrase: 'run out of',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    imageAlt: 'Empty gas tank or container',
    distractors: ['run off of', 'run away from'],
    difficulty: 4,
    category: '不足'
  },
  {
    id: 'eiken-pre2_003',
    level: 'eiken-pre2',
    phrase: 'deal with',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    imageAlt: 'Business person dealing with problems',
    distractors: ['work with', 'handle with'],
    difficulty: 4,
    category: '対処'
  },
  {
    id: 'eiken-pre2_004',
    level: 'eiken-pre2',
    phrase: 'carry out',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    imageAlt: 'Person carrying out a plan or task',
    distractors: ['bring out', 'take out'],
    difficulty: 4,
    category: '実行'
  },
  {
    id: 'eiken-pre2_005',
    level: 'eiken-pre2',
    phrase: 'bring up',
    imageUrl: 'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=300&fit=crop',
    imageAlt: 'Parent raising/bringing up child',
    distractors: ['grow up', 'raise up'],
    difficulty: 4,
    category: '育児'
  },
  {
    id: 'eiken-pre2_006',
    level: 'eiken-pre2',
    phrase: 'set up',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop',
    imageAlt: 'Person setting up equipment or meeting',
    distractors: ['put up', 'make up'],
    difficulty: 4,
    category: '準備'
  },
  {
    id: 'eiken-pre2_007',
    level: 'eiken-pre2',
    phrase: 'look after',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
    imageAlt: 'Person looking after elderly person',
    distractors: ['look for', 'look at'],
    difficulty: 4,
    category: '世話'
  },
  {
    id: 'eiken-pre2_008',
    level: 'eiken-pre2',
    phrase: 'keep in touch',
    imageUrl: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=400&h=300&fit=crop',
    imageAlt: 'Friends talking on phone staying in touch',
    distractors: ['stay in touch', 'hold in touch'],
    difficulty: 4,
    category: '連絡'
  },
  {
    id: 'eiken-pre2_009',
    level: 'eiken-pre2',
    phrase: 'make sure',
    imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop',
    imageAlt: 'Person double-checking and making sure of something',
    distractors: ['be sure', 'check sure'],
    difficulty: 4,
    category: '確認'
  },
  {
    id: 'eiken-pre2_010',
    level: 'eiken-pre2',
    phrase: 'point out',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    imageAlt: 'Teacher pointing out something on board',
    distractors: ['show out', 'tell out'],
    difficulty: 4,
    category: '指摘'
  },

  // 英検2級 (10問)
  {
    id: 'eiken2_001',
    level: 'eiken2',
    phrase: 'come up with',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
    imageAlt: 'Person having creative idea with lightbulb',
    distractors: ['come out with', 'come down with'],
    difficulty: 5,
    category: '発想'
  },
  {
    id: 'eiken2_002',
    level: 'eiken2',
    phrase: 'put up with',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    imageAlt: 'Person tolerating difficult situation',
    distractors: ['put down with', 'put off with'],
    difficulty: 5,
    category: '我慢'
  },
  {
    id: 'eiken2_003',
    level: 'eiken2',
    phrase: 'live up to',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    imageAlt: 'Person meeting high expectations',
    distractors: ['live down to', 'live through to'],
    difficulty: 5,
    category: '期待'
  },
  {
    id: 'eiken2_004',
    level: 'eiken2',
    phrase: 'cut down on',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    imageAlt: 'Person reducing consumption of something',
    distractors: ['cut back on', 'cut off on'],
    difficulty: 5,
    category: '削減'
  },
  {
    id: 'eiken2_005',
    level: 'eiken2',
    phrase: 'break into',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-e1c4c9e41c0c?w=400&h=300&fit=crop',
    imageAlt: 'Person starting new career field',
    distractors: ['break out into', 'break through into'],
    difficulty: 5,
    category: '参入'
  },
  {
    id: 'eiken2_006',
    level: 'eiken2',
    phrase: 'fall behind',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    imageAlt: 'Student falling behind in studies',
    distractors: ['fall back', 'fall away'],
    difficulty: 5,
    category: '遅れ'
  },
  {
    id: 'eiken2_007',
    level: 'eiken2',
    phrase: 'turn down',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    imageAlt: 'Person declining job offer',
    distractors: ['turn away', 'turn back'],
    difficulty: 5,
    category: '拒否'
  },
  {
    id: 'eiken2_008',
    level: 'eiken2',
    phrase: 'figure out',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    imageAlt: 'Person solving complex problem',
    distractors: ['work out', 'think out'],
    difficulty: 5,
    category: '解決'
  },
  {
    id: 'eiken2_009',
    level: 'eiken2',
    phrase: 'account for',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    imageAlt: 'Person explaining or accounting for results',
    distractors: ['count for', 'explain for'],
    difficulty: 5,
    category: '説明'
  },
  {
    id: 'eiken2_010',
    level: 'eiken2',
    phrase: 'back up',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-e1c4c9e41c0c?w=400&h=300&fit=crop',
    imageAlt: 'Person supporting colleague or backing up data',
    distractors: ['support up', 'help up'],
    difficulty: 5,
    category: '支援'
  }
]

// カテゴリー別の問題取得
export function getQuestionsByCategory(category: string): PhraseQuestion[] {
  return phraseQuestions.filter(q => q.category === category)
}

// レベル別の問題取得
export function getQuestionsByLevel(level: string): PhraseQuestion[] {
  return phraseQuestions.filter(q => q.level === level)
}

// 難易度別の問題取得
export function getQuestionsByDifficulty(difficulty: number): PhraseQuestion[] {
  return phraseQuestions.filter(q => q.difficulty === difficulty)
}

// ランダムな問題取得
export function getRandomQuestions(count: number, level?: string): PhraseQuestion[] {
  let availableQuestions = phraseQuestions

  if (level) {
    availableQuestions = getQuestionsByLevel(level)
  }

  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 未回答の問題取得
export function getUnansweredQuestions(answeredIds: string[], level?: string): PhraseQuestion[] {
  let availableQuestions = phraseQuestions

  if (level) {
    availableQuestions = getQuestionsByLevel(level)
  }

  return availableQuestions.filter(q => !answeredIds.includes(q.id))
}