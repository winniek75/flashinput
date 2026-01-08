import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCharacterStore = defineStore('character', () => {
  // キャラクターの状態管理
  const characters = ref({
    echo: {
      id: 'echo',
      name: 'ECHO',
      title: 'AIコンパニオン',
      description: '音響銀河のAI守護者。学習をサポートし、多言語翻訳も担当',
      avatar: '🤖',
      level: 1,
      unlocked: true,
      abilities: ['学習サポート', '多言語翻訳', '進捗分析', 'ヒント提供'],
      personality: 'supportive',
      phrases: {
        greeting: [
          'こんにちは、サウンド・ガーディアン！今日も一緒に学習しましょう！',
          '音響銀河へようこそ！ECHOがあなたの冒険をサポートします。',
          '準備はいいですか？新しい音素エネルギーを見つけに行きましょう！'
        ],
        encouragement: [
          '素晴らしい進歩です！その調子で続けましょう！',
          'あなたの努力が音響銀河を救っています！',
          'もう少しで次のレベルです！頑張って！'
        ],
        hint: [
          'ヒント：この音素は唇を使って発音します。',
          'この文法パターンをもう一度見てみましょう。',
          '以前学習した内容を思い出してください。'
        ]
      }
    },
    sonic: {
      id: 'sonic',
      name: 'Sonic',
      title: '音素の妖精',
      description: '44の音素エネルギーを守る妖精たちのリーダー',
      avatar: '🌟',
      level: 1,
      unlocked: true,
      abilities: ['音素収集', '発音ガイド', 'エネルギー変換', '音素図鑑管理'],
      personality: 'energetic',
      collection: [], // 収集した音素妖精のリスト
      phrases: {
        greeting: [
          'やあ！音素の世界へようこそ！一緒に44の音を集めよう！',
          '新しい音素エネルギーを感じる？探しに行こう！',
          '今日はどの音素妖精に会えるかな？'
        ],
        discovery: [
          'わあ！新しい音素を発見したよ！',
          'この音素エネルギー、とってもきれい！',
          'また一つ、音響銀河が明るくなった！'
        ]
      }
    },
    grammar: {
      id: 'grammar',
      name: 'Grammar',
      title: '文法の魔法使い',
      description: '言語構造の秘密を解き明かす賢者',
      avatar: '🎯',
      level: 1,
      unlocked: false,
      unlockCondition: 'phonics_progress_20',
      abilities: ['文法解説', 'パターン認識', '構造分析', '魔法の呪文'],
      personality: 'wise',
      spells: [], // 習得した文法魔法
      phrases: {
        greeting: [
          '言葉の魔法へようこそ。文法の秘密を解き明かしましょう。',
          '構造を理解することで、言語の真の力が解放されます。',
          '準備はよろしいですか？文法の冒険を始めましょう。'
        ],
        teaching: [
          'この構造に注目してください。パターンが見えてきませんか？',
          '言葉の順序には理由があります。一緒に探ってみましょう。',
          '素晴らしい！文法の魔法が身についてきています。'
        ]
      }
    },
    captain: {
      id: 'captain',
      name: 'Captain Phrase',
      title: '実践英語の船長',
      description: 'Practice Portで実践的な英語使用をナビゲート',
      avatar: '🚀',
      level: 1,
      unlocked: false,
      unlockCondition: 'grammar_progress_30',
      abilities: ['実践会話', 'シチュエーション案内', 'VR連携', 'ミッション指揮'],
      personality: 'adventurous',
      missions: [], // 完了したミッション
      phrases: {
        greeting: [
          '船員よ、実践の海へ出航だ！本物の英語を使う時が来た！',
          'Practice Portへようこそ！ここでは本当のコミュニケーションを学ぶぞ！',
          '準備はいいか？現実世界の英語に挑戦しよう！'
        ],
        mission: [
          'ミッション開始！今回は[situation]での会話に挑戦だ！',
          'よくやった、船員！次のミッションに進もう！',
          'この経験は君を真のコミュニケーターに成長させる！'
        ]
      }
    }
  })

  // 音素妖精コレクション（42音素）
  const phonemeSprites = ref({
    // 母音
    'iː': { name: 'イー', type: 'vowel', color: '#FF6B6B', unlocked: false },
    'ɪ': { name: 'イ', type: 'vowel', color: '#4ECDC4', unlocked: false },
    'e': { name: 'エ', type: 'vowel', color: '#45B7D1', unlocked: false },
    'æ': { name: 'ア', type: 'vowel', color: '#96CEB4', unlocked: false },
    'ɑː': { name: 'アー', type: 'vowel', color: '#FECA57', unlocked: false },
    'ɒ': { name: 'オ', type: 'vowel', color: '#FF9FF3', unlocked: false },
    'ɔː': { name: 'オー', type: 'vowel', color: '#54A0FF', unlocked: false },
    'ʊ': { name: 'ウ', type: 'vowel', color: '#48DBFB', unlocked: false },
    'uː': { name: 'ウー', type: 'vowel', color: '#1DD1A1', unlocked: false },
    'ʌ': { name: 'ア', type: 'vowel', color: '#FF6B9D', unlocked: false },
    'ɜː': { name: 'アー', type: 'vowel', color: '#C44569', unlocked: false },
    'ə': { name: 'ア', type: 'vowel', color: '#F8B500', unlocked: false },
    // 二重母音
    'eɪ': { name: 'エイ', type: 'diphthong', color: '#667EEA', unlocked: false },
    'aɪ': { name: 'アイ', type: 'diphthong', color: '#764BA2', unlocked: false },
    'ɔɪ': { name: 'オイ', type: 'diphthong', color: '#F093FB', unlocked: false },
    'aʊ': { name: 'アウ', type: 'diphthong', color: '#4FACFE', unlocked: false },
    'əʊ': { name: 'オウ', type: 'diphthong', color: '#43E97B', unlocked: false },
    'ɪə': { name: 'イア', type: 'diphthong', color: '#FA7268', unlocked: false },
    'eə': { name: 'エア', type: 'diphthong', color: '#F8D030', unlocked: false },
    'ʊə': { name: 'ウア', type: 'diphthong', color: '#30CFD0', unlocked: false },
    // 子音（一部抜粋）
    'p': { name: 'プ', type: 'consonant', color: '#6C5CE7', unlocked: false },
    'b': { name: 'ブ', type: 'consonant', color: '#A29BFE', unlocked: false },
    't': { name: 'ト', type: 'consonant', color: '#74B9FF', unlocked: false },
    'd': { name: 'ド', type: 'consonant', color: '#81ECEC', unlocked: false },
    'k': { name: 'ク', type: 'consonant', color: '#55A3FF', unlocked: false },
    'g': { name: 'グ', type: 'consonant', color: '#FD79A8', unlocked: false },
    'f': { name: 'フ', type: 'consonant', color: '#FDCB6E', unlocked: false },
    'v': { name: 'ヴ', type: 'consonant', color: '#6C5CE7', unlocked: false },
    'θ': { name: 'ス', type: 'consonant', color: '#E17055', unlocked: false },
    'ð': { name: 'ズ', type: 'consonant', color: '#00B894', unlocked: false },
    's': { name: 'ス', type: 'consonant', color: '#00CEC9', unlocked: false },
    'z': { name: 'ズ', type: 'consonant', color: '#0984E3', unlocked: false },
    'ʃ': { name: 'シュ', type: 'consonant', color: '#6C5CE7', unlocked: false },
    'ʒ': { name: 'ジュ', type: 'consonant', color: '#A29BFE', unlocked: false },
    'h': { name: 'ハ', type: 'consonant', color: '#FFEAA7', unlocked: false },
    'm': { name: 'ム', type: 'consonant', color: '#FAB1A0', unlocked: false },
    'n': { name: 'ン', type: 'consonant', color: '#74B9FF', unlocked: false },
    'ŋ': { name: 'ング', type: 'consonant', color: '#A29BFE', unlocked: false },
    'l': { name: 'ル', type: 'consonant', color: '#55A3FF', unlocked: false },
    'r': { name: 'ル', type: 'consonant', color: '#FF7675', unlocked: false },
    'w': { name: 'ウ', type: 'consonant', color: '#FD79A8', unlocked: false },
    'j': { name: 'ユ', type: 'consonant', color: '#FDCB6E', unlocked: false },
    'tʃ': { name: 'チ', type: 'consonant', color: '#636E72', unlocked: false },
    'dʒ': { name: 'ジ', type: 'consonant', color: '#00B894', unlocked: false }
  })

  // 現在のアクティブキャラクター
  const activeCharacter = ref('echo')

  // キャラクターメッセージ取得
  const getCharacterMessage = (characterId, messageType) => {
    const character = characters.value[characterId]
    if (!character || !character.phrases[messageType]) return ''
    
    const messages = character.phrases[messageType]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // キャラクターアンロック
  const unlockCharacter = (characterId) => {
    if (characters.value[characterId]) {
      characters.value[characterId].unlocked = true
    }
  }

  // 音素妖精収集
  const collectPhonemeSprite = (phoneme) => {
    if (phonemeSprites.value[phoneme]) {
      phonemeSprites.value[phoneme].unlocked = true
      characters.value.sonic.collection.push(phoneme)
    }
  }

  // 収集進捗
  const phonemeProgress = computed(() => {
    const total = Object.keys(phonemeSprites.value).length
    const collected = Object.values(phonemeSprites.value).filter(p => p.unlocked).length
    return {
      collected,
      total,
      percentage: Math.round((collected / total) * 100)
    }
  })

  // キャラクターレベルアップ
  const levelUpCharacter = (characterId) => {
    if (characters.value[characterId]) {
      characters.value[characterId].level++
    }
  }

  return {
    characters,
    phonemeSprites,
    activeCharacter,
    getCharacterMessage,
    unlockCharacter,
    collectPhonemeSprite,
    phonemeProgress,
    levelUpCharacter
  }
})