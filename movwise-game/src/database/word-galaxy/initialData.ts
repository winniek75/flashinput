/**
 * Initial Word Data
 * Word Galaxyの初期単語データセット
 */

import type { Word } from '@/types/word-galaxy/word.types';
import { DifficultyLevel } from '@/types/word-galaxy/word.types';

// ===== 初期単語データ =====
export const initialWordData: Omit<Word, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // 英検5級レベル（基礎語彙）
  {
    word: 'cat',
    meanings: ['猫'],
    pronunciation: '/kæt/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['animals', 'pets'],
    tags: ['basic', 'daily-life'],
    examples: [
      {
        sentence: 'I have a cat.',
        translation: '私は猫を飼っています。'
      }
    ],
    synonyms: ['feline'],
    antonyms: ['dog'],
    relatedWords: ['kitten', 'pet'],
    source: 'BasicVocabulary'
  },
  {
    word: 'dog',
    meanings: ['犬'],
    pronunciation: '/dɔːg/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['animals', 'pets'],
    tags: ['basic', 'daily-life'],
    examples: [
      {
        sentence: 'The dog is running.',
        translation: '犬が走っています。'
      }
    ],
    synonyms: ['canine'],
    antonyms: ['cat'],
    relatedWords: ['puppy', 'pet'],
    source: 'BasicVocabulary'
  },
  {
    word: 'book',
    meanings: ['本'],
    pronunciation: '/bʊk/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['education', 'objects'],
    tags: ['basic', 'school'],
    examples: [
      {
        sentence: 'I read a book every day.',
        translation: '私は毎日本を読みます。'
      }
    ],
    synonyms: ['volume', 'text'],
    antonyms: [],
    relatedWords: ['library', 'reading'],
    source: 'BasicVocabulary'
  },
  {
    word: 'school',
    meanings: ['学校'],
    pronunciation: '/skuːl/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 2,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['education', 'places'],
    tags: ['basic', 'education'],
    examples: [
      {
        sentence: 'I go to school every day.',
        translation: '私は毎日学校に行きます。'
      }
    ],
    synonyms: ['institution', 'academy'],
    antonyms: [],
    relatedWords: ['student', 'teacher', 'classroom'],
    source: 'BasicVocabulary'
  },

  // 英検4級レベル
  {
    word: 'beautiful',
    meanings: ['美しい'],
    pronunciation: '/ˈbjuːtɪfl/',
    eikenLevel: DifficultyLevel.EIKEN_4,
    toeicLevel: DifficultyLevel.TOEIC_ELEMENTARY,
    difficulty: 3,
    frequency: 8,
    partOfSpeech: ['adjective'],
    categories: ['descriptive'],
    tags: ['emotional', 'appearance'],
    examples: [
      {
        sentence: 'She is very beautiful.',
        translation: '彼女はとても美しいです。'
      }
    ],
    synonyms: ['pretty', 'lovely', 'gorgeous'],
    antonyms: ['ugly'],
    relatedWords: ['beauty', 'handsome'],
    source: 'GrammarConstructor'
  },
  {
    word: 'important',
    meanings: ['重要な'],
    pronunciation: '/ɪmˈpɔːrtənt/',
    eikenLevel: DifficultyLevel.EIKEN_4,
    toeicLevel: DifficultyLevel.TOEIC_ELEMENTARY,
    difficulty: 4,
    frequency: 9,
    partOfSpeech: ['adjective'],
    categories: ['descriptive'],
    tags: ['academic', 'formal'],
    examples: [
      {
        sentence: 'This is very important.',
        translation: 'これはとても重要です。'
      }
    ],
    synonyms: ['significant', 'crucial'],
    antonyms: ['unimportant', 'trivial'],
    relatedWords: ['importance'],
    source: 'GrammarConstructor'
  },

  // 英検3級レベル
  {
    word: 'environment',
    meanings: ['環境'],
    pronunciation: '/ɪnˈvaɪrənmənt/',
    eikenLevel: DifficultyLevel.EIKEN_3,
    toeicLevel: DifficultyLevel.TOEIC_INTERMEDIATE,
    difficulty: 6,
    frequency: 7,
    partOfSpeech: ['noun'],
    categories: ['science', 'nature'],
    tags: ['academic', 'ecology'],
    examples: [
      {
        sentence: 'We must protect the environment.',
        translation: '私たちは環境を守らなければなりません。'
      }
    ],
    synonyms: ['surroundings', 'habitat'],
    antonyms: [],
    relatedWords: ['ecology', 'nature', 'pollution'],
    source: 'AdditionalWordList'
  },
  {
    word: 'technology',
    meanings: ['技術', 'テクノロジー'],
    pronunciation: '/tekˈnɑːləʤi/',
    eikenLevel: DifficultyLevel.EIKEN_3,
    toeicLevel: DifficultyLevel.TOEIC_INTERMEDIATE,
    difficulty: 6,
    frequency: 8,
    partOfSpeech: ['noun'],
    categories: ['science', 'modern'],
    tags: ['academic', 'business'],
    examples: [
      {
        sentence: 'Technology is changing our lives.',
        translation: 'テクノロジーは私たちの生活を変えています。'
      }
    ],
    synonyms: ['innovation', 'advancement'],
    antonyms: [],
    relatedWords: ['computer', 'internet', 'digital'],
    source: 'TypingArena'
  },

  // 英検準2級レベル
  {
    word: 'development',
    meanings: ['開発', '発展'],
    pronunciation: '/dɪˈveləpmənt/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_2,
    toeicLevel: DifficultyLevel.TOEIC_INTERMEDIATE,
    difficulty: 7,
    frequency: 6,
    partOfSpeech: ['noun'],
    categories: ['business', 'progress'],
    tags: ['academic', 'formal'],
    examples: [
      {
        sentence: 'The development of new technology is rapid.',
        translation: '新しい技術の開発は急速です。'
      }
    ],
    synonyms: ['growth', 'progress', 'advancement'],
    antonyms: ['decline', 'regression'],
    relatedWords: ['develop', 'developer'],
    source: 'AdditionalWordList'
  },
  {
    word: 'communication',
    meanings: ['コミュニケーション', '意思疎通'],
    pronunciation: '/kəˌmjuːnɪˈkeɪʃən/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_2,
    toeicLevel: DifficultyLevel.TOEIC_INTERMEDIATE,
    difficulty: 7,
    frequency: 7,
    partOfSpeech: ['noun'],
    categories: ['social', 'business'],
    tags: ['academic', 'interpersonal'],
    examples: [
      {
        sentence: 'Good communication is essential.',
        translation: '良いコミュニケーションは不可欠です。'
      }
    ],
    synonyms: ['interaction', 'correspondence'],
    antonyms: ['silence'],
    relatedWords: ['communicate', 'language'],
    source: 'AdditionalWordList'
  },

  // 英検2級レベル
  {
    word: 'responsibility',
    meanings: ['責任'],
    pronunciation: '/rɪˌspɑːnsəˈbɪləti/',
    eikenLevel: DifficultyLevel.EIKEN_2,
    toeicLevel: DifficultyLevel.TOEIC_ADVANCED,
    difficulty: 8,
    frequency: 5,
    partOfSpeech: ['noun'],
    categories: ['abstract', 'ethics'],
    tags: ['formal', 'business'],
    examples: [
      {
        sentence: 'Taking responsibility is important.',
        translation: '責任を取ることは重要です。'
      }
    ],
    synonyms: ['duty', 'obligation'],
    antonyms: ['irresponsibility'],
    relatedWords: ['responsible', 'accountability'],
    source: 'AdditionalWordList'
  },

  // 英検準1級レベル
  {
    word: 'comprehensive',
    meanings: ['包括的な', '総合的な'],
    pronunciation: '/ˌkɑːmprɪˈhensɪv/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_1,
    toeicLevel: DifficultyLevel.TOEIC_ADVANCED,
    difficulty: 9,
    frequency: 4,
    partOfSpeech: ['adjective'],
    categories: ['academic', 'formal'],
    tags: ['academic', 'advanced'],
    examples: [
      {
        sentence: 'We need a comprehensive solution.',
        translation: '包括的な解決策が必要です。'
      }
    ],
    synonyms: ['complete', 'thorough', 'extensive'],
    antonyms: ['partial', 'incomplete'],
    relatedWords: ['comprehension', 'comprehend'],
    source: 'AdditionalWordList'
  },

  // 英検1級レベル
  {
    word: 'sophisticated',
    meanings: ['洗練された', '高度な'],
    pronunciation: '/səˈfɪstɪkeɪtɪd/',
    eikenLevel: DifficultyLevel.EIKEN_1,
    toeicLevel: DifficultyLevel.TOEIC_EXPERT,
    difficulty: 10,
    frequency: 3,
    partOfSpeech: ['adjective'],
    categories: ['advanced', 'formal'],
    tags: ['advanced', 'academic'],
    examples: [
      {
        sentence: 'This is a sophisticated system.',
        translation: 'これは洗練されたシステムです。'
      }
    ],
    synonyms: ['refined', 'complex', 'advanced'],
    antonyms: ['simple', 'primitive'],
    relatedWords: ['sophistication'],
    source: 'AdditionalWordList'
  },

  // ===== 追加の基礎語彙（英検5級〜4級レベル）=====
  {
    word: 'apple',
    meanings: ['りんご'],
    pronunciation: '/ˈæpl/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['food', 'fruits'],
    tags: ['basic', 'daily-life'],
    examples: [{ sentence: 'I eat an apple.', translation: '私はりんごを食べます。' }],
    synonyms: [],
    antonyms: [],
    relatedWords: ['fruit', 'tree'],
    source: 'BasicVocabulary'
  },
  {
    word: 'water',
    meanings: ['水'],
    pronunciation: '/ˈwɔːtər/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['drinks', 'basic-needs'],
    tags: ['basic', 'daily-life'],
    examples: [{ sentence: 'I drink water.', translation: '私は水を飲みます。' }],
    synonyms: [],
    antonyms: [],
    relatedWords: ['drink', 'liquid'],
    source: 'BasicVocabulary'
  },
  {
    word: 'house',
    meanings: ['家'],
    pronunciation: '/haʊs/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 2,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['places', 'housing'],
    tags: ['basic', 'daily-life'],
    examples: [{ sentence: 'This is my house.', translation: 'これは私の家です。' }],
    synonyms: ['home'],
    antonyms: [],
    relatedWords: ['family', 'room'],
    source: 'BasicVocabulary'
  },
  {
    word: 'friend',
    meanings: ['友達'],
    pronunciation: '/frend/',
    eikenLevel: DifficultyLevel.EIKEN_4,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 2,
    frequency: 9,
    partOfSpeech: ['noun'],
    categories: ['relationships', 'people'],
    tags: ['basic', 'social'],
    examples: [{ sentence: 'He is my friend.', translation: '彼は私の友達です。' }],
    synonyms: ['buddy', 'pal'],
    antonyms: ['enemy'],
    relatedWords: ['friendship', 'friendly'],
    source: 'BasicVocabulary'
  },
  {
    word: 'happy',
    meanings: ['幸せな', '嬉しい'],
    pronunciation: '/ˈhæpi/',
    eikenLevel: DifficultyLevel.EIKEN_4,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 2,
    frequency: 9,
    partOfSpeech: ['adjective'],
    categories: ['emotions', 'feelings'],
    tags: ['basic', 'emotional'],
    examples: [{ sentence: 'I am happy today.', translation: '今日は嬉しいです。' }],
    synonyms: ['glad', 'joyful'],
    antonyms: ['sad'],
    relatedWords: ['happiness', 'smile'],
    source: 'BasicVocabulary'
  },

  // ===== 中級語彙（英検3級〜準2級レベル）=====
  {
    word: 'exercise',
    meanings: ['運動', '練習'],
    pronunciation: '/ˈeksərsaɪz/',
    eikenLevel: DifficultyLevel.EIKEN_3,
    toeicLevel: DifficultyLevel.TOEIC_ELEMENTARY,
    difficulty: 4,
    frequency: 7,
    partOfSpeech: ['noun', 'verb'],
    categories: ['health', 'fitness'],
    tags: ['intermediate', 'health'],
    examples: [{ sentence: 'I exercise every morning.', translation: '私は毎朝運動します。' }],
    synonyms: ['workout', 'training'],
    antonyms: ['rest'],
    relatedWords: ['fitness', 'gym'],
    source: 'IntermediateVocabulary'
  },
  {
    word: 'adventure',
    meanings: ['冒険'],
    pronunciation: '/ədˈventʃər/',
    eikenLevel: DifficultyLevel.EIKEN_3,
    toeicLevel: DifficultyLevel.TOEIC_ELEMENTARY,
    difficulty: 5,
    frequency: 6,
    partOfSpeech: ['noun'],
    categories: ['travel', 'experience'],
    tags: ['intermediate', 'exciting'],
    examples: [{ sentence: 'Going to space is an adventure.', translation: '宇宙に行くのは冒険です。' }],
    synonyms: ['journey', 'expedition'],
    antonyms: ['routine'],
    relatedWords: ['adventurous', 'explore'],
    source: 'IntermediateVocabulary'
  },
  {
    word: 'knowledge',
    meanings: ['知識'],
    pronunciation: '/ˈnɑːlɪdʒ/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_2,
    toeicLevel: DifficultyLevel.TOEIC_INTERMEDIATE,
    difficulty: 6,
    frequency: 8,
    partOfSpeech: ['noun'],
    categories: ['education', 'learning'],
    tags: ['intermediate', 'academic'],
    examples: [{ sentence: 'Knowledge is power.', translation: '知識は力です。' }],
    synonyms: ['wisdom', 'information'],
    antonyms: ['ignorance'],
    relatedWords: ['know', 'knowledgeable'],
    source: 'IntermediateVocabulary'
  },

  // ===== 上級語彙（英検2級〜1級レベル）=====
  {
    word: 'magnificent',
    meanings: ['壮大な', '素晴らしい'],
    pronunciation: '/mæɡˈnɪfɪsənt/',
    eikenLevel: DifficultyLevel.EIKEN_2,
    toeicLevel: DifficultyLevel.TOEIC_ADVANCED,
    difficulty: 8,
    frequency: 4,
    partOfSpeech: ['adjective'],
    categories: ['descriptive', 'praise'],
    tags: ['advanced', 'formal'],
    examples: [{ sentence: 'The view was magnificent.', translation: 'その景色は壮大でした。' }],
    synonyms: ['splendid', 'spectacular'],
    antonyms: ['ordinary'],
    relatedWords: ['magnificence'],
    source: 'AdvancedVocabulary'
  },
  {
    word: 'contemporary',
    meanings: ['現代の', '同時代の'],
    pronunciation: '/kənˈtempəreri/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_1,
    toeicLevel: DifficultyLevel.TOEIC_ADVANCED,
    difficulty: 9,
    frequency: 5,
    partOfSpeech: ['adjective', 'noun'],
    categories: ['time', 'modern'],
    tags: ['advanced', 'academic'],
    examples: [{ sentence: 'Contemporary art is interesting.', translation: '現代美術は興味深いです。' }],
    synonyms: ['modern', 'current'],
    antonyms: ['ancient'],
    relatedWords: ['contemporary'],
    source: 'AdvancedVocabulary'
  },

  // ===== 追加の基礎語彙セット2（英検5級〜4級）=====
  {
    word: 'car',
    meanings: ['車'],
    pronunciation: '/kɑːr/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['transportation', 'vehicles'],
    tags: ['basic', 'daily-life'],
    examples: [{ sentence: 'I drive a car.', translation: '私は車を運転します。' }],
    synonyms: ['automobile'],
    antonyms: [],
    relatedWords: ['drive', 'road'],
    source: 'BasicVocabulary'
  },
  {
    word: 'family',
    meanings: ['家族'],
    pronunciation: '/ˈfæməli/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['relationships', 'people'],
    tags: ['basic', 'social'],
    examples: [{ sentence: 'I love my family.', translation: '私は家族を愛しています。' }],
    synonyms: ['relatives'],
    antonyms: [],
    relatedWords: ['mother', 'father', 'children'],
    source: 'BasicVocabulary'
  },
  {
    word: 'food',
    meanings: ['食べ物', '食料'],
    pronunciation: '/fuːd/',
    eikenLevel: DifficultyLevel.EIKEN_5,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 1,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['nutrition', 'basic-needs'],
    tags: ['basic', 'daily-life'],
    examples: [{ sentence: 'This food is delicious.', translation: 'この食べ物は美味しいです。' }],
    synonyms: ['meal'],
    antonyms: [],
    relatedWords: ['eat', 'cooking'],
    source: 'BasicVocabulary'
  },
  {
    word: 'time',
    meanings: ['時間'],
    pronunciation: '/taɪm/',
    eikenLevel: DifficultyLevel.EIKEN_4,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 2,
    frequency: 10,
    partOfSpeech: ['noun'],
    categories: ['temporal', 'abstract'],
    tags: ['basic', 'concept'],
    examples: [{ sentence: 'What time is it?', translation: '今何時ですか？' }],
    synonyms: ['moment'],
    antonyms: [],
    relatedWords: ['clock', 'hour'],
    source: 'BasicVocabulary'
  },
  {
    word: 'work',
    meanings: ['仕事', '働く'],
    pronunciation: '/wɜːrk/',
    eikenLevel: DifficultyLevel.EIKEN_4,
    toeicLevel: DifficultyLevel.TOEIC_BEGINNER,
    difficulty: 2,
    frequency: 10,
    partOfSpeech: ['noun', 'verb'],
    categories: ['employment', 'activity'],
    tags: ['basic', 'professional'],
    examples: [{ sentence: 'I work at a company.', translation: '私は会社で働いています。' }],
    synonyms: ['job', 'employment'],
    antonyms: ['play', 'rest'],
    relatedWords: ['worker', 'office'],
    source: 'BasicVocabulary'
  },

  // ===== 追加の中級語彙セット2（英検3級〜準2級）=====
  {
    word: 'culture',
    meanings: ['文化'],
    pronunciation: '/ˈkʌltʃər/',
    eikenLevel: DifficultyLevel.EIKEN_3,
    toeicLevel: DifficultyLevel.TOEIC_ELEMENTARY,
    difficulty: 4,
    frequency: 7,
    partOfSpeech: ['noun'],
    categories: ['society', 'arts'],
    tags: ['intermediate', 'social'],
    examples: [{ sentence: 'Japanese culture is unique.', translation: '日本の文化は独特です。' }],
    synonyms: ['civilization'],
    antonyms: [],
    relatedWords: ['cultural', 'tradition'],
    source: 'IntermediateVocabulary'
  },
  {
    word: 'opportunity',
    meanings: ['機会', 'チャンス'],
    pronunciation: '/ˌɑːpərˈtuːnəti/',
    eikenLevel: DifficultyLevel.EIKEN_3,
    toeicLevel: DifficultyLevel.TOEIC_ELEMENTARY,
    difficulty: 5,
    frequency: 8,
    partOfSpeech: ['noun'],
    categories: ['chance', 'possibility'],
    tags: ['intermediate', 'business'],
    examples: [{ sentence: 'This is a great opportunity.', translation: 'これは素晴らしい機会です。' }],
    synonyms: ['chance', 'possibility'],
    antonyms: ['obstacle'],
    relatedWords: ['opportunistic'],
    source: 'IntermediateVocabulary'
  },
  {
    word: 'experience',
    meanings: ['経験'],
    pronunciation: '/ɪkˈspɪriəns/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_2,
    toeicLevel: DifficultyLevel.TOEIC_INTERMEDIATE,
    difficulty: 5,
    frequency: 8,
    partOfSpeech: ['noun', 'verb'],
    categories: ['learning', 'life'],
    tags: ['intermediate', 'personal'],
    examples: [{ sentence: 'I have experience in teaching.', translation: '私は教育の経験があります。' }],
    synonyms: ['expertise', 'background'],
    antonyms: ['inexperience'],
    relatedWords: ['experienced', 'expert'],
    source: 'IntermediateVocabulary'
  },
  {
    word: 'popular',
    meanings: ['人気の', '流行の'],
    pronunciation: '/ˈpɑːpjələr/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_2,
    toeicLevel: DifficultyLevel.TOEIC_INTERMEDIATE,
    difficulty: 4,
    frequency: 8,
    partOfSpeech: ['adjective'],
    categories: ['social', 'trending'],
    tags: ['intermediate', 'social'],
    examples: [{ sentence: 'This song is very popular.', translation: 'この歌はとても人気です。' }],
    synonyms: ['famous', 'well-liked'],
    antonyms: ['unpopular'],
    relatedWords: ['popularity'],
    source: 'IntermediateVocabulary'
  },

  // ===== 追加の上級語彙セット2（英検2級〜1級）=====
  {
    word: 'intellectual',
    meanings: ['知的な', '知識人'],
    pronunciation: '/ˌɪntəˈlektʃuəl/',
    eikenLevel: DifficultyLevel.EIKEN_2,
    toeicLevel: DifficultyLevel.TOEIC_ADVANCED,
    difficulty: 7,
    frequency: 5,
    partOfSpeech: ['adjective', 'noun'],
    categories: ['mental', 'academic'],
    tags: ['advanced', 'academic'],
    examples: [{ sentence: 'She has intellectual curiosity.', translation: '彼女は知的好奇心があります。' }],
    synonyms: ['mental', 'cerebral'],
    antonyms: ['physical'],
    relatedWords: ['intellect', 'intelligence'],
    source: 'AdvancedVocabulary'
  },
  {
    word: 'phenomenon',
    meanings: ['現象'],
    pronunciation: '/fəˈnɑːmənɑːn/',
    eikenLevel: DifficultyLevel.EIKEN_PRE_1,
    toeicLevel: DifficultyLevel.TOEIC_ADVANCED,
    difficulty: 9,
    frequency: 4,
    partOfSpeech: ['noun'],
    categories: ['science', 'observation'],
    tags: ['advanced', 'scientific'],
    examples: [{ sentence: 'This is an interesting phenomenon.', translation: 'これは興味深い現象です。' }],
    synonyms: ['occurrence', 'event'],
    antonyms: [],
    relatedWords: ['phenomenal'],
    source: 'AdvancedVocabulary'
  },
  {
    word: 'inevitable',
    meanings: ['避けられない', '必然的な'],
    pronunciation: '/ɪnˈevɪtəbl/',
    eikenLevel: DifficultyLevel.EIKEN_1,
    toeicLevel: DifficultyLevel.TOEIC_EXPERT,
    difficulty: 10,
    frequency: 3,
    partOfSpeech: ['adjective'],
    categories: ['certainty', 'fate'],
    tags: ['advanced', 'philosophical'],
    examples: [{ sentence: 'Change is inevitable.', translation: '変化は避けられません。' }],
    synonyms: ['unavoidable', 'certain'],
    antonyms: ['avoidable'],
    relatedWords: ['inevitably'],
    source: 'AdvancedVocabulary'
  }
];

/**
 * 初期データを生成してIDと日時を追加
 */
export function generateInitialWords(): Word[] {
  console.log('🔄 Generating initial words...');

  try {
    // Simple UUID generator fallback
    function generateUUID(): string {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }

      // Fallback UUID generator
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    const words = initialWordData.map((wordData, index) => {
      try {
        const word: Word = {
          ...wordData,
          id: generateUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log(`✅ Generated word ${index + 1}: ${word.word} (${word.id})`);
        return word;
      } catch (error) {
        console.error(`❌ Failed to generate word ${index + 1}:`, error);
        throw error;
      }
    });

    console.log(`✅ Successfully generated ${words.length} words`);
    return words;
  } catch (error) {
    console.error('❌ Failed to generate initial words:', error);
    throw error;
  }
}

/**
 * 難易度別の単語数を取得
 */
export function getWordCountByDifficulty(): Record<DifficultyLevel, number> {
  const counts = {} as Record<DifficultyLevel, number>;

  // 全レベルを0で初期化
  Object.values(DifficultyLevel).forEach(level => {
    counts[level] = 0;
  });

  // 実際の単語数をカウント
  initialWordData.forEach(word => {
    counts[word.eikenLevel]++;
  });

  return counts;
}

/**
 * カテゴリ別の単語数を取得
 */
export function getWordCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};

  initialWordData.forEach(word => {
    word.categories.forEach(category => {
      counts[category] = (counts[category] || 0) + 1;
    });
  });

  return counts;
}

/**
 * 初期データの統計を取得
 */
export function getInitialDataStats() {
  const totalWords = initialWordData.length;
  const difficultyDistribution = getWordCountByDifficulty();
  const categoryDistribution = getWordCountByCategory();

  const averageDifficulty = initialWordData.reduce((sum, word) => sum + word.difficulty, 0) / totalWords;
  const averageFrequency = initialWordData.reduce((sum, word) => sum + word.frequency, 0) / totalWords;

  return {
    totalWords,
    difficultyDistribution,
    categoryDistribution,
    averageDifficulty: Math.round(averageDifficulty * 10) / 10,
    averageFrequency: Math.round(averageFrequency * 10) / 10,
    partOfSpeechCount: {
      noun: initialWordData.filter(w => w.partOfSpeech.includes('noun')).length,
      adjective: initialWordData.filter(w => w.partOfSpeech.includes('adjective')).length,
      verb: initialWordData.filter(w => w.partOfSpeech.includes('verb')).length,
      adverb: initialWordData.filter(w => w.partOfSpeech.includes('adverb')).length
    }
  };
}