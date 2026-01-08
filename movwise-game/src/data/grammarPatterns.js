// Grammar pattern corrections data
export const getSentencePatternCorrections = () => {
  return {
    // === Wh疑問文パターン ===
    'What is this?': { 'What': 'subject', 'is': 'verb', 'this': 'object' },
    'What is that?': { 'What': 'subject', 'is': 'verb', 'that': 'object' },
    'Who is he?': { 'Who': 'subject', 'is': 'verb', 'he': 'object' },
    'Who is she?': { 'Who': 'subject', 'is': 'verb', 'she': 'object' },
    'Where are you?': { 'Where': 'subject', 'are': 'verb', 'you': 'object' },
    'How are you?': { 'How': 'subject', 'are': 'verb', 'you': 'object' },
    'When is it?': { 'When': 'subject', 'is': 'verb', 'it': 'object' },
    'Why is that?': { 'Why': 'subject', 'is': 'verb', 'that': 'object' },

    // === 肯定文パターン ===
    'I am happy': { 'I': 'subject', 'am': 'verb', 'happy': 'object' },
    'You are a student': { 'You': 'subject', 'are': 'verb', 'a student': 'object' },
    'She is tired': { 'She': 'subject', 'is': 'verb', 'tired': 'object' },
    'We are friends': { 'We': 'subject', 'are': 'verb', 'friends': 'object' },
    'They are students': { 'They': 'subject', 'are': 'verb', 'students': 'object' },
    'It is a book': { 'It': 'subject', 'is': 'verb', 'a book': 'object' },

    // === 否定文パターン ===
    'I am not sad': { 'I': 'subject', 'am not': 'verb', 'sad': 'object' },
    'I am not tired': { 'I': 'subject', 'am not': 'verb', 'tired': 'object' },
    'You are not late': { 'You': 'subject', 'are not': 'verb', 'late': 'object' },

    // === 一般動詞パターン ===
    'I play soccer': { 'I': 'subject', 'play': 'verb', 'soccer': 'object' },
    'She reads books': { 'She': 'subject', 'reads': 'verb', 'books': 'object' },
    'He likes music': { 'He': 'subject', 'likes': 'verb', 'music': 'object' },
    'We eat lunch': { 'We': 'subject', 'eat': 'verb', 'lunch': 'object' },
    'They watch TV': { 'They': 'subject', 'watch': 'verb', 'TV': 'object' },

    // === 基本パターンのみ（パフォーマンス最適化のため大幅削減）===
    'Do you like music?': { 'Do': 'auxiliary', 'you': 'subject', 'like': 'verb', 'music': 'object' },
    'Can you swim?': { 'Can': 'auxiliary', 'you': 'subject', 'swim': 'verb' },
    'I like apples': { 'I': 'subject', 'like': 'verb', 'apples': 'object' }
  }
}

// Additional problems - reduced set for performance
export const additionalProblems = [
  // 基本的な5級レベル問題のみ（パフォーマンス最適化）
  { target_sentence: 'I like apples', hint_ja: '私はりんごが好きです', level: 'beginner', eiken_level: '5', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'like', position: 'verb' }, { word: 'apples', position: 'object' }
  ]},
  { target_sentence: 'She has a cat', hint_ja: '彼女は猫を飼っています', level: 'beginner', eiken_level: '5', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'has', position: 'verb' }, { word: 'a cat', position: 'object' }
  ]},
  { target_sentence: 'We are busy', hint_ja: '私たちは忙しいです', level: 'beginner', eiken_level: '5', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'are', position: 'verb' }, { word: 'busy', position: 'object' }
  ]},
  { target_sentence: 'Do you like music?', hint_ja: '音楽は好きですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Do', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'like', position: 'verb' }, { word: 'music', position: 'object' }
  ]},
  { target_sentence: 'Can you swim?', hint_ja: '泳げますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Can', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'swim', position: 'verb' }
  ]}
]