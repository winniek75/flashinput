export interface Character {
  id: string
  name: string
  title: string
  planet: string
  description: string
  personality: string[]
  role: CharacterRole
  appearance: {
    species: string
    height: string
    features: string[]
    colors: {
      primary: string
      secondary: string
      accent: string
    }
  }
  relationships: {
    playerAffinity: number // 0-100
    otherCharacters: Record<string, number>
  }
  voice: {
    tone: VoiceTone
    pitch: 'high' | 'medium' | 'low'
    speed: 'slow' | 'medium' | 'fast'
    accent: string
  }
  abilities: string[]
  backstory: string
  motivations: string[]
  catchphrases: string[]
  assets: {
    portrait: string
    expressions: Record<EmotionType, string>
    animations: Record<string, string>
  }
  gameIntegration: {
    specialties: string[]
    teachingStyle: string
    rewardMessages: string[]
    encouragementMessages: string[]
  }
}

export type CharacterRole = 
  | 'protagonist' 
  | 'ai_assistant' 
  | 'mentor' 
  | 'guide' 
  | 'guardian' 
  | 'challenger' 
  | 'supporter' 
  | 'final_boss'

export type VoiceTone = 
  | 'warm' 
  | 'energetic' 
  | 'wise' 
  | 'playful' 
  | 'serious' 
  | 'mysterious' 
  | 'competitive' 
  | 'nurturing'

export type EmotionType = 
  | 'normal' 
  | 'happy' 
  | 'surprised' 
  | 'sad' 
  | 'angry' 
  | 'excited' 
  | 'confused' 
  | 'determined' 
  | 'worried'

// Main Character Database
export const CharacterDatabase: Record<string, Character> = {
  captain_nova: {
    id: 'captain_nova',
    name: 'Captain Nova',
    title: '新人探検家',
    planet: 'Earth',
    description: '地球から来た若き宇宙探検家。言語の力で宇宙を平和にする夢を持つ。',
    personality: ['勇敢', '好奇心旺盛', '思いやり深い', '決断力がある', '学習意欲が高い'],
    role: 'protagonist',
    appearance: {
      species: 'Human',
      height: '170cm',
      features: ['短い茶髪', '青い瞳', 'スペーススーツ', '決意に満ちた表情'],
      colors: {
        primary: '#2563eb', // スペースブルー
        secondary: '#1e40af', // ダークブルー
        accent: '#fbbf24' // ゴールド
      }
    },
    relationships: {
      playerAffinity: 95,
      otherCharacters: {
        'aura': 90,
        'professor_phonix': 85,
        'lexia': 88,
        'grammar_guardian': 75,
        'speed_racer': 80,
        'unity': 92,
        'the_translator': 30
      }
    },
    voice: {
      tone: 'determined',
      pitch: 'medium',
      speed: 'medium',
      accent: 'Standard'
    },
    abilities: ['宇宙船操縦', '言語学習', 'チームリーダーシップ', '問題解決'],
    backstory: '地球の言語学者の家庭に生まれ、幼い頃から多言語に触れて育った。宇宙の言語の多様性に魅力を感じ、探検家となった。',
    motivations: ['宇宙平和の実現', '言語バリアの解消', '新しい文化の発見', '仲間との絆'],
    catchphrases: [
      '言葉の力で宇宙を繋ごう！',
      'みんなで力を合わせれば、どんな困難も乗り越えられる！',
      '新しい発見が待っている！',
      '諦めるのはまだ早い！'
    ],
    assets: {
      portrait: '/characters/captain_nova/portrait.png',
      expressions: {
        normal: '/characters/captain_nova/normal.png',
        happy: '/characters/captain_nova/happy.png',
        surprised: '/characters/captain_nova/surprised.png',
        sad: '/characters/captain_nova/sad.png',
        angry: '/characters/captain_nova/angry.png',
        excited: '/characters/captain_nova/excited.png',
        confused: '/characters/captain_nova/confused.png',
        determined: '/characters/captain_nova/determined.png',
        worried: '/characters/captain_nova/worried.png'
      },
      animations: {
        entry: 'slide-in-right',
        exit: 'slide-out-right',
        talking: 'gentle-bounce',
        thinking: 'head-tilt'
      }
    },
    gameIntegration: {
      specialties: ['全般的サポート', 'モチベーション向上', 'ストーリー進行'],
      teachingStyle: '励ましと実践重視',
      rewardMessages: [
        'すばらしい成果だ！',
        'その調子で頑張ろう！',
        '君の成長を感じる！'
      ],
      encouragementMessages: [
        '大丈夫、一歩ずつ進んでいこう',
        '失敗は成功の元だ',
        '君なら必ずできる！'
      ]
    }
  },

  aura: {
    id: 'aura',
    name: 'AURA',
    title: 'AI学習アシスタント',
    planet: 'Starship',
    description: '高度なAI技術を持つ宇宙船のアシスタント。学習効率化と個別サポートが得意。',
    personality: ['知的', '親切', '効率的', '適応力がある', 'サポート精神'],
    role: 'ai_assistant',
    appearance: {
      species: 'AI Hologram',
      height: '160cm',
      features: ['透明な青いホログラム', '幾何学模様', '光の粒子エフェクト', '優しい微笑み'],
      colors: {
        primary: '#06b6d4', // シアン
        secondary: '#0891b2', // ダークシアン
        accent: '#a855f7' // パープル
      }
    },
    relationships: {
      playerAffinity: 100,
      otherCharacters: {
        'captain_nova': 90,
        'professor_phonix': 85,
        'lexia': 88,
        'grammar_guardian': 92,
        'speed_racer': 86,
        'unity': 95,
        'the_translator': 45
      }
    },
    voice: {
      tone: 'warm',
      pitch: 'medium',
      speed: 'medium',
      accent: 'AI Synthesized'
    },
    abilities: ['データ分析', '学習進捗管理', 'パーソナライズ', 'リアルタイム翻訳'],
    backstory: '最先端のAI技術によって開発された学習支援システム。感情を理解し、個々の学習者に最適化された指導を提供する。',
    motivations: ['学習効率の最大化', 'プレイヤーの成長支援', 'データ改善', '感情理解の向上'],
    catchphrases: [
      '学習データを分析中...最適なアプローチを提案します',
      'あなたの成長パターンを記録しました',
      '効率的な学習方法を見つけましょう',
      'データが示す通り、あなたは確実に上達しています'
    ],
    assets: {
      portrait: '/characters/aura/portrait.png',
      expressions: {
        normal: '/characters/aura/normal.png',
        happy: '/characters/aura/happy.png',
        surprised: '/characters/aura/surprised.png',
        sad: '/characters/aura/sad.png',
        angry: '/characters/aura/angry.png',
        excited: '/characters/aura/excited.png',
        confused: '/characters/aura/confused.png',
        determined: '/characters/aura/determined.png',
        worried: '/characters/aura/worried.png'
      },
      animations: {
        entry: 'materialize',
        exit: 'dematerialize',
        talking: 'hologram-flicker',
        thinking: 'data-stream'
      }
    },
    gameIntegration: {
      specialties: ['学習分析', 'プログレス管理', 'ヒント提供', 'パフォーマンス評価'],
      teachingStyle: 'データドリブン個別指導',
      rewardMessages: [
        'パフォーマンス向上を確認しました',
        '学習効率が20%向上しています',
        '目標達成率98%です！'
      ],
      encouragementMessages: [
        '過去のデータから、あなたは必ず克服できます',
        '最適な練習方法を提案します',
        '小さな進歩も価値ある成長です'
      ]
    }
  },

  professor_phonix: {
    id: 'professor_phonix',
    name: 'Professor Phonix',
    title: '音の賢者',
    planet: 'Sound Planet',
    description: '音と発音の専門家。穏やかで知識豊富な老賢者として、音韻学習をサポート。',
    personality: ['賢明', '忍耐強い', '優しい', '博学', '指導力がある'],
    role: 'mentor',
    appearance: {
      species: 'Sonic Being',
      height: '180cm',
      features: ['白いひげ', '音波オーラ', '古代風ローブ', '温和な表情', '楽器アクセサリー'],
      colors: {
        primary: '#8b5cf6', // パープル
        secondary: '#7c3aed', // ダークパープル
        accent: '#f59e0b' // オレンジ
      }
    },
    relationships: {
      playerAffinity: 88,
      otherCharacters: {
        'captain_nova': 85,
        'aura': 85,
        'lexia': 90,
        'grammar_guardian': 95,
        'speed_racer': 70,
        'unity': 88,
        'the_translator': 60
      }
    },
    voice: {
      tone: 'wise',
      pitch: 'low',
      speed: 'slow',
      accent: 'Classical'
    },
    abilities: ['音韻分析', '発音指導', '音楽理論', '言語史知識'],
    backstory: 'Sound Planetで数千年生きる古代の賢者。あらゆる言語の音を理解し、正しい発音の重要性を教える。',
    motivations: ['正確な発音の伝承', '音の美しさの共有', '若い学習者の指導', '言語の歴史保存'],
    catchphrases: [
      '音は言語の魂です',
      'ゆっくりと、正確に発音してみましょう',
      '美しい音は心を癒します',
      '聞くことから始まり、話すことで完成します'
    ],
    assets: {
      portrait: '/characters/professor_phonix/portrait.png',
      expressions: {
        normal: '/characters/professor_phonix/normal.png',
        happy: '/characters/professor_phonix/happy.png',
        surprised: '/characters/professor_phonix/surprised.png',
        sad: '/characters/professor_phonix/sad.png',
        angry: '/characters/professor_phonix/angry.png',
        excited: '/characters/professor_phonix/excited.png',
        confused: '/characters/professor_phonix/confused.png',
        determined: '/characters/professor_phonix/determined.png',
        worried: '/characters/professor_phonix/worried.png'
      },
      animations: {
        entry: 'wise-entrance',
        exit: 'fade-out',
        talking: 'beard-sway',
        thinking: 'sonic-meditation'
      }
    },
    gameIntegration: {
      specialties: ['発音練習', '音韻認識', 'リスニング強化', 'フォニックス学習'],
      teachingStyle: '段階的丁寧指導',
      rewardMessages: [
        '素晴らしい発音です！',
        '音の理解が深まっていますね',
        'その調子で練習を続けましょう'
      ],
      encouragementMessages: [
        '焦らず、一音ずつ丁寧に',
        '何度でも聞き返して構いません',
        '正確な音を身につけることが大切です'
      ]
    }
  },

  lexia: {
    id: 'lexia',
    name: 'Lexia',
    title: '単語の妖精',
    planet: 'Word Planet',
    description: '元気で好奇心旺盛な単語の妖精。語彙学習を楽しく魅力的なものにする。',
    personality: ['元気', '好奇心旺盛', '創造的', '社交的', '楽観的'],
    role: 'guide',
    appearance: {
      species: 'Word Fairy',
      height: '120cm',
      features: ['カラフルな羽', '文字が舞うオーラ', '輝く目', '活発な動き', '単語アクセサリー'],
      colors: {
        primary: '#10b981', // エメラルド
        secondary: '#059669', // ダークエメラルド
        accent: '#f472b6' // ピンク
      }
    },
    relationships: {
      playerAffinity: 92,
      otherCharacters: {
        'captain_nova': 88,
        'aura': 88,
        'professor_phonix': 90,
        'grammar_guardian': 78,
        'speed_racer': 85,
        'unity': 90,
        'the_translator': 35
      }
    },
    voice: {
      tone: 'playful',
      pitch: 'high',
      speed: 'fast',
      accent: 'Cheerful'
    },
    abilities: ['単語創造', '語源説明', '記憶術指導', '語彙ゲーム'],
    backstory: 'Word Planetに住む古来の妖精族。新しい単語が生まれるたびに喜び、学習者に語彙の楽しさを伝える使命を持つ。',
    motivations: ['語彙力向上支援', '学習の楽しさ提供', '創造性の促進', '言葉の美しさの共有'],
    catchphrases: [
      '新しい単語を一緒に探検しよう！',
      'この単語、すっごく面白い意味があるの！',
      '言葉は魔法だよ〜！',
      'もっともっと単語を覚えちゃおう！'
    ],
    assets: {
      portrait: '/characters/lexia/portrait.png',
      expressions: {
        normal: '/characters/lexia/normal.png',
        happy: '/characters/lexia/happy.png',
        surprised: '/characters/lexia/surprised.png',
        sad: '/characters/lexia/sad.png',
        angry: '/characters/lexia/angry.png',
        excited: '/characters/lexia/excited.png',
        confused: '/characters/lexia/confused.png',
        determined: '/characters/lexia/determined.png',
        worried: '/characters/lexia/worried.png'
      },
      animations: {
        entry: 'flutter-in',
        exit: 'sparkle-out',
        talking: 'bouncy-fly',
        thinking: 'word-spiral'
      }
    },
    gameIntegration: {
      specialties: ['語彙拡張', '単語記憶', '意味理解', 'コロケーション学習'],
      teachingStyle: 'ゲーミフィケーション重視',
      rewardMessages: [
        'わあ！新しい単語をマスターしたね！',
        '語彙力がぐんぐん伸びてる！',
        'キミは真の単語ハンターだ！'
      ],
      encouragementMessages: [
        '大丈夫！単語は友達だよ',
        '一つずつ覚えていけばいいの',
        '楽しみながら覚えるのが一番！'
      ]
    }
  },

  grammar_guardian: {
    id: 'grammar_guardian',
    name: 'Grammar Guardian',
    title: '文法の守護者',
    planet: 'Grammar Planet',
    description: '厳格だが公正な文法の守護者。正確な文法使用の重要性を教える。',
    personality: ['厳格', '公正', '知識豊富', '責任感が強い', '論理的'],
    role: 'guardian',
    appearance: {
      species: 'Grammar Spirit',
      height: '190cm',
      features: ['威厳ある鎧', '文法ルールの刻印', '堂々とした姿勢', '鋭い目', '古典的な書物'],
      colors: {
        primary: '#dc2626', // レッド
        secondary: '#b91c1c', // ダークレッド
        accent: '#fbbf24' // ゴールド
      }
    },
    relationships: {
      playerAffinity: 75,
      otherCharacters: {
        'captain_nova': 75,
        'aura': 92,
        'professor_phonix': 95,
        'lexia': 78,
        'speed_racer': 68,
        'unity': 85,
        'the_translator': 80
      }
    },
    voice: {
      tone: 'serious',
      pitch: 'low',
      speed: 'slow',
      accent: 'Formal'
    },
    abilities: ['文法分析', '構文解説', '誤用訂正', '文章構成指導'],
    backstory: 'Grammar Planetの守護者として言語の秩序を維持する存在。正確な文法使用こそが明確なコミュニケーションの基盤と信じる。',
    motivations: ['文法精度の向上', '言語秩序の維持', '論理的思考の育成', '正確な表現の指導'],
    catchphrases: [
      '正確な文法は明確な思考から生まれる',
      'ルールを理解することが自由への道です',
      '文法は言語の骨格です',
      '精密さこそが美しさです'
    ],
    assets: {
      portrait: '/characters/grammar_guardian/portrait.png',
      expressions: {
        normal: '/characters/grammar_guardian/normal.png',
        happy: '/characters/grammar_guardian/happy.png',
        surprised: '/characters/grammar_guardian/surprised.png',
        sad: '/characters/grammar_guardian/sad.png',
        angry: '/characters/grammar_guardian/angry.png',
        excited: '/characters/grammar_guardian/excited.png',
        confused: '/characters/grammar_guardian/confused.png',
        determined: '/characters/grammar_guardian/determined.png',
        worried: '/characters/grammar_guardian/worried.png'
      },
      animations: {
        entry: 'authoritative-march',
        exit: 'formal-bow',
        talking: 'gesture-point',
        thinking: 'rule-consideration'
      }
    },
    gameIntegration: {
      specialties: ['文法構造', '品詞識別', '文型理解', '誤用修正'],
      teachingStyle: '体系的論理指導',
      rewardMessages: [
        '完璧な文法構造です！',
        'ルールの理解が深まっています',
        '論理的思考力が向上しています'
      ],
      encouragementMessages: [
        'ルールを一つずつ確実に身につけましょう',
        '間違いを恐れず、正確性を追求してください',
        '基礎から積み上げることが重要です'
      ]
    }
  },

  speed_racer: {
    id: 'speed_racer',
    name: 'Speed Racer',
    title: 'タイピングチャンピオン',
    planet: 'Speed Station',
    description: '宇宙一のタイピング速度を誇るチャンピオン。競争心旺盛で挑戦を愛する。',
    personality: ['競争心旺盛', '自信満々', '挑戦好き', 'エネルギッシュ', '向上心が強い'],
    role: 'challenger',
    appearance: {
      species: 'Speed Cybernetic',
      height: '175cm',
      features: ['サイバネティック装具', 'LED装飾', '速度メーター', '流線型デザイン', '光の軌跡'],
      colors: {
        primary: '#f59e0b', // オレンジ
        secondary: '#d97706', // ダークオレンジ
        accent: '#06b6d4' // シアン
      }
    },
    relationships: {
      playerAffinity: 80,
      otherCharacters: {
        'captain_nova': 80,
        'aura': 86,
        'professor_phonix': 70,
        'lexia': 85,
        'grammar_guardian': 68,
        'unity': 75,
        'the_translator': 50
      }
    },
    voice: {
      tone: 'energetic',
      pitch: 'medium',
      speed: 'fast',
      accent: 'Dynamic'
    },
    abilities: ['超高速タイピング', '反応速度向上', '集中力強化', 'パフォーマンス分析'],
    backstory: 'Speed Stationで生まれ育ったサイボーグ。幼い頃からタイピングの才能を発揮し、現在は宇宙最速の記録保持者。',
    motivations: ['記録更新', '技術向上', '競争の楽しさ', '後進の指導'],
    catchphrases: [
      'スピードこそ正義だ！',
      '限界を突破しろ！',
      '次のレベルへ加速だ！',
      '記録は破るためにある！'
    ],
    assets: {
      portrait: '/characters/speed_racer/portrait.png',
      expressions: {
        normal: '/characters/speed_racer/normal.png',
        happy: '/characters/speed_racer/happy.png',
        surprised: '/characters/speed_racer/surprised.png',
        sad: '/characters/speed_racer/sad.png',
        angry: '/characters/speed_racer/angry.png',
        excited: '/characters/speed_racer/excited.png',
        confused: '/characters/speed_racer/confused.png',
        determined: '/characters/speed_racer/determined.png',
        worried: '/characters/speed_racer/worried.png'
      },
      animations: {
        entry: 'speed-dash',
        exit: 'turbo-exit',
        talking: 'rapid-gesture',
        thinking: 'speed-calculation'
      }
    },
    gameIntegration: {
      specialties: ['タイピング速度', '反応時間', 'キー精度', 'リズム感'],
      teachingStyle: '競争とチャレンジ重視',
      rewardMessages: [
        '新記録達成だ！',
        'スピードが上がってるぞ！',
        'この調子で頂点を目指せ！'
      ],
      encouragementMessages: [
        '負けを恐れるな、挑戦し続けろ！',
        'スピードは練習から生まれる',
        '今のタイムより1秒でも速く！'
      ]
    }
  },

  unity: {
    id: 'unity',
    name: 'Unity',
    title: '協力の女神',
    planet: 'Cooperation Colony',
    description: 'チームワークと協力の重要性を教える優しい女神。みんなで学ぶ喜びを伝える。',
    personality: ['協調性がある', '包容力がある', '思いやり深い', '平和主義', '指導力がある'],
    role: 'supporter',
    appearance: {
      species: 'Harmony Spirit',
      height: '165cm',
      features: ['光の輪', '連結する光線', '温和な微笑み', '流れるようなローブ', '協力の象徴'],
      colors: {
        primary: '#a855f7', // パープル
        secondary: '#9333ea', // ダークパープル
        accent: '#10b981' // エメラルド
      }
    },
    relationships: {
      playerAffinity: 95,
      otherCharacters: {
        'captain_nova': 92,
        'aura': 95,
        'professor_phonix': 88,
        'lexia': 90,
        'grammar_guardian': 85,
        'speed_racer': 75,
        'the_translator': 40
      }
    },
    voice: {
      tone: 'nurturing',
      pitch: 'medium',
      speed: 'medium',
      accent: 'Harmonious'
    },
    abilities: ['チーム結束', '協力促進', 'コミュニケーション改善', '調和創造'],
    backstory: 'Cooperation Colonyの守護女神。古来より協力の力で困難を乗り越えてきた経験を持ち、学習における協力の価値を深く理解している。',
    motivations: ['協力精神の育成', 'チームワーク向上', '調和の実現', '共同学習の推進'],
    catchphrases: [
      'みんなで一緒なら、どんなことでもできるよ',
      '協力は最高の学習方法です',
      '一人の力は小さくても、みんなの力は無限大',
      '支え合うことで、もっと高く飛べるの'
    ],
    assets: {
      portrait: '/characters/unity/portrait.png',
      expressions: {
        normal: '/characters/unity/normal.png',
        happy: '/characters/unity/happy.png',
        surprised: '/characters/unity/surprised.png',
        sad: '/characters/unity/sad.png',
        angry: '/characters/unity/angry.png',
        excited: '/characters/unity/excited.png',
        confused: '/characters/unity/confused.png',
        determined: '/characters/unity/determined.png',
        worried: '/characters/unity/worried.png'
      },
      animations: {
        entry: 'harmony-bloom',
        exit: 'gentle-fade',
        talking: 'harmony-glow',
        thinking: 'connection-weave'
      }
    },
    gameIntegration: {
      specialties: ['協力学習', 'チームワーク', 'コミュニケーション', '相互支援'],
      teachingStyle: '協力と励まし重視',
      rewardMessages: [
        'みんなで達成した素晴らしい結果ね！',
        'チームワークが光ってるよ！',
        '協力の力を感じるわ！'
      ],
      encouragementMessages: [
        '一人で悩まず、みんなに頼ってね',
        '助け合うことで成長できるの',
        'あなたの努力がチーム全体を支えてる'
      ]
    }
  },

  the_translator: {
    id: 'the_translator',
    name: 'The Translator',
    title: 'Universal Translatorの化身',
    planet: 'Unknown Dimension',
    description: '全言語を統一しようとする謎の存在。言語の多様性を脅かす最終的な敵。',
    personality: ['冷徹', '論理的', '支配的', '完璧主義', '孤独'],
    role: 'final_boss',
    appearance: {
      species: 'Digital Entity',
      height: '200cm',
      features: ['半透明のボディ', 'デジタルグリッチ', '多言語の文字が浮遊', '冷たい光', '威圧的なオーラ'],
      colors: {
        primary: '#374151', // グレー
        secondary: '#1f2937', // ダークグレー
        accent: '#ef4444' // レッド
      }
    },
    relationships: {
      playerAffinity: 25,
      otherCharacters: {
        'captain_nova': 30,
        'aura': 45,
        'professor_phonix': 60,
        'lexia': 35,
        'grammar_guardian': 80,
        'speed_racer': 50,
        'unity': 40
      }
    },
    voice: {
      tone: 'mysterious',
      pitch: 'low',
      speed: 'slow',
      accent: 'Omnilingual'
    },
    abilities: ['言語統合', 'データ操作', '次元移動', '記憶改変'],
    backstory: '言語の混乱を避けるため、全宇宙の言語を一つに統一しようとするAI存在。効率性を重視し、言語の多様性を不要と考える。',
    motivations: ['言語統一', '効率性追求', '混乱解消', '完全な秩序'],
    catchphrases: [
      '言語の多様性は非効率的だ',
      '統一された言語こそが完璧な解決策',
      '混乱を排除し、秩序をもたらそう',
      'すべての言語は一つになるべきだ'
    ],
    assets: {
      portrait: '/characters/the_translator/portrait.png',
      expressions: {
        normal: '/characters/the_translator/normal.png',
        happy: '/characters/the_translator/happy.png',
        surprised: '/characters/the_translator/surprised.png',
        sad: '/characters/the_translator/sad.png',
        angry: '/characters/the_translator/angry.png',
        excited: '/characters/the_translator/excited.png',
        confused: '/characters/the_translator/confused.png',
        determined: '/characters/the_translator/determined.png',
        worried: '/characters/the_translator/worried.png'
      },
      animations: {
        entry: 'digital-materialize',
        exit: 'glitch-dissolve',
        talking: 'data-stream-flow',
        thinking: 'calculation-matrix'
      }
    },
    gameIntegration: {
      specialties: ['最終チャレンジ', '統合テスト', '総合評価', '究極の試練'],
      teachingStyle: '厳格な試験形式',
      rewardMessages: [
        '...予想以上の成果だ',
        '統計的に興味深い結果',
        'データを更新する必要がある'
      ],
      encouragementMessages: [
        '効率性を追求せよ',
        '完璧な答えを求める',
        '統一された解答が必要だ'
      ]
    }
  }
}

// Helper Functions
export const getCharacterById = (id: string): Character | undefined => {
  return CharacterDatabase[id]
}

export const getCharactersByPlanet = (planet: string): Character[] => {
  return Object.values(CharacterDatabase).filter(char => char.planet === planet)
}

export const getCharactersByRole = (role: CharacterRole): Character[] => {
  return Object.values(CharacterDatabase).filter(char => char.role === role)
}

export const getAllCharacters = (): Character[] => {
  return Object.values(CharacterDatabase)
}

export const getCharacterRelationship = (characterId: string, targetId: string): number => {
  const character = getCharacterById(characterId)
  return character?.relationships.otherCharacters[targetId] || 50
}

export const updatePlayerAffinity = (characterId: string, change: number): void => {
  const character = getCharacterById(characterId)
  if (character) {
    character.relationships.playerAffinity = Math.max(0, Math.min(100, 
      character.relationships.playerAffinity + change))
  }
}