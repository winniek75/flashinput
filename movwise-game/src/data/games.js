// ゲームマスターデータ
export const GAME_PRIORITY = {
  CORE: 'core',         // コアゲーム（大きく表示）
  OPTIONAL: 'optional', // オプションゲーム（小さく表示）
  HIDDEN: 'hidden'      // 隠しゲーム（設定でONにしない限り非表示）
}

export const GAME_CATEGORIES = {
  PHONICS: 'phonics',
  GRAMMAR: 'grammar',
  TYPING: 'typing',
  VOCABULARY: 'vocabulary',
  RHYTHM: 'rhythm',
  COMPETITIVE: 'competitive',
  VR: 'vr'
}

// 全ゲームのマスターデータ
export const ALL_GAMES = [
  // === コアゲーム（今週のおすすめ） ===
  {
    id: 'pure-sound-lab',
    name: 'Pure Sound Lab',
    jaName: 'ピュア・サウンド・ラボ',
    description: '音素の純粋な音を聞き分け、正確な発音を身につける基礎トレーニング',
    icon: '🔬',
    routeName: 'pure-sound-lab',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.CORE,
    difficulty: 'beginner',
    estimatedTime: '10-15分',
    xpReward: 100,
    vrEnabled: true,
    featured: true,
    isNew: false,
    unlocked: true,
    requiredLevel: 1
  },
  {
    id: 'word-rush-arena',
    name: 'Word Rush Arena',
    jaName: 'ワード・ラッシュ・アリーナ',
    description: '高速で流れてくる単語を正確にタイピング！反射神経と語彙力の究極バトル',
    icon: '⚡',
    routeName: 'WordRushGame',
    category: GAME_CATEGORIES.COMPETITIVE,
    priority: GAME_PRIORITY.CORE,
    difficulty: 'intermediate',
    estimatedTime: '5-10分',
    xpReward: 150,
    vrEnabled: false,
    featured: true,
    isNew: false,
    unlocked: true,
    requiredLevel: 3
  },
  {
    id: 'grammar-color-code',
    name: 'Grammar Color Code',
    jaName: 'グラマー・カラーコード',
    description: '文法要素を色でビジュアル化！直感的に英文法構造を理解する革新的学習法',
    icon: '🎨',
    routeName: 'grammar-color-code',
    category: GAME_CATEGORIES.GRAMMAR,
    priority: GAME_PRIORITY.CORE,
    difficulty: 'intermediate',
    estimatedTime: '15-20分',
    xpReward: 120,
    vrEnabled: false,
    featured: true,
    isNew: false,
    unlocked: true,
    requiredLevel: 5
  },

  // === オプションゲーム ===
  {
    id: 'cv-pronunciation-trainer',
    name: 'CV Pronunciation Trainer',
    jaName: 'CV発音トレーナー',
    description: '子音と母音の組み合わせを完璧にマスター',
    icon: '🎯',
    routeName: 'cv-pronunciation-trainer',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'beginner',
    estimatedTime: '10-15分',
    xpReward: 80,
    vrEnabled: false,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 2
  },
  {
    id: 'sound-master-tower',
    name: 'Sound Master Tower',
    jaName: 'サウンド・マスター・タワー',
    description: '音韻の塔を登りながら段階的に音素を習得',
    icon: '🏗️',
    routeName: 'sound-master-game',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'intermediate',
    estimatedTime: '20-30分',
    xpReward: 100,
    vrEnabled: false,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 4
  },
  {
    id: 'magic-e-galaxy-builder',
    name: 'Magic E Galaxy Builder',
    jaName: 'マジックE・ギャラクシービルダー',
    description: 'Magic Eルールを使って銀河を建設！楽しく音韻規則を習得',
    icon: '🌌',
    routeName: 'magic-e-galaxy-builder',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'intermediate',
    estimatedTime: '15-25分',
    xpReward: 110,
    vrEnabled: true,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 6
  },
  {
    id: 'rhythm-phonics-dance',
    name: 'Rhythm Phonics Dance',
    jaName: 'リズム・フォニックス・ダンス',
    description: 'リズムに合わせて音素をマスター！音楽で英語のリズムを体得',
    icon: '🎵',
    routeName: 'rhythm-phonics-dance',
    category: GAME_CATEGORIES.RHYTHM,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'beginner',
    estimatedTime: '10-15分',
    xpReward: 90,
    vrEnabled: true,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 3
  },
  {
    id: 'be-verb-rush',
    name: 'Be Verb Rush',
    jaName: 'Be動詞ラッシュ',
    description: 'Be動詞を高速で選択！瞬間的な文法判断力を鍛える',
    icon: '⚡',
    routeName: 'be-verb-rush',
    category: GAME_CATEGORIES.GRAMMAR,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'beginner',
    estimatedTime: '5-10分',
    xpReward: 70,
    vrEnabled: false,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 2
  },
  {
    id: 'pattern-hunter-game',
    name: 'Pattern Hunter',
    jaName: 'パターン・ハンター',
    description: '文法パターンを見つけて狩る！パターン認識で文法マスター',
    icon: '🎯',
    routeName: 'pattern-hunter',
    category: GAME_CATEGORIES.GRAMMAR,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'intermediate',
    estimatedTime: '15-20分',
    xpReward: 100,
    vrEnabled: false,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 7
  },
  {
    id: 'typing-arena',
    name: 'Typing Arena',
    jaName: 'タイピング・アリーナ',
    description: '英検レベル別タイピング練習！正確性と速度を同時に鍛える',
    icon: '⌨️',
    routeName: 'typing-arena',
    category: GAME_CATEGORIES.TYPING,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'beginner',
    estimatedTime: '10-15分',
    xpReward: 80,
    vrEnabled: false,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 1
  },
  {
    id: 'sound-battle-arena',
    name: 'Sound Battle Arena',
    jaName: 'サウンド・バトル・アリーナ',
    description: '音素バトルで他のプレイヤーと対戦！競争しながら学習',
    icon: '⚔️',
    routeName: 'sound-battle-arena',
    category: GAME_CATEGORIES.COMPETITIVE,
    priority: GAME_PRIORITY.OPTIONAL,
    difficulty: 'advanced',
    estimatedTime: '10-20分',
    xpReward: 130,
    vrEnabled: false,
    featured: false,
    isNew: false,
    unlocked: true,
    requiredLevel: 8
  },

  // === 隠しゲーム（高度な機能） ===
  {
    id: 'customizable-phonics',
    name: 'Customizable Phonics Journey',
    jaName: 'カスタマイズ・フォニックス・ジャーニー',
    description: '完全カスタマイズ可能な音韻学習システム（上級者向け）',
    icon: '🛠️',
    routeName: 'customizable-phonics',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.HIDDEN,
    difficulty: 'expert',
    estimatedTime: '30-45分',
    xpReward: 200,
    vrEnabled: true,
    featured: false,
    isNew: true,
    unlocked: false,
    requiredLevel: 15
  },
  {
    id: 'cosmic-sound-chain',
    name: 'Cosmic Sound Chain',
    jaName: 'コズミック・サウンドチェーン',
    description: '音素の連鎖を宇宙で構築する超高度学習システム',
    icon: '🔗',
    routeName: 'cosmic-sound-chain',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.HIDDEN,
    difficulty: 'expert',
    estimatedTime: '25-35分',
    xpReward: 180,
    vrEnabled: true,
    featured: false,
    isNew: false,
    unlocked: false,
    requiredLevel: 20
  },
  {
    id: 'phonics-path-game',
    name: 'Phonics Path Adventure',
    jaName: 'フォニックス・パス・アドベンチャー',
    description: '音韻の道を冒険しながら学習する長編アドベンチャー',
    icon: '🗺️',
    routeName: 'phonics-path-game',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.HIDDEN,
    difficulty: 'advanced',
    estimatedTime: '40-60分',
    xpReward: 250,
    vrEnabled: true,
    featured: false,
    isNew: false,
    unlocked: false,
    requiredLevel: 12
  },
  {
    id: 'ghost-letter-hunters',
    name: 'Ghost Letter Hunters',
    jaName: 'ゴーストレター・ハンターズ',
    description: 'サイレントレターを探し出すホラー風学習ゲーム',
    icon: '👻',
    routeName: 'ghost-letter-hunters',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.HIDDEN,
    difficulty: 'advanced',
    estimatedTime: '20-30分',
    xpReward: 140,
    vrEnabled: true,
    featured: false,
    isNew: false,
    unlocked: false,
    requiredLevel: 10
  },
  {
    id: 'sound-magic-arena',
    name: 'Sound Magic Arena',
    jaName: 'サウンド・マジック・アリーナ',
    description: '音素魔法を使った対戦型学習ゲーム',
    icon: '🪄',
    routeName: 'sound-magic-arena',
    category: GAME_CATEGORIES.COMPETITIVE,
    priority: GAME_PRIORITY.HIDDEN,
    difficulty: 'expert',
    estimatedTime: '15-25分',
    xpReward: 160,
    vrEnabled: true,
    featured: false,
    isNew: false,
    unlocked: false,
    requiredLevel: 18
  },
  {
    id: 'true-sound-impact',
    name: 'True Sound Impact',
    jaName: 'トゥルー・サウンド・インパクト',
    description: '音素の真の力を解放する究極の音韻マスターゲーム',
    icon: '💥',
    routeName: 'true-sound-impact',
    category: GAME_CATEGORIES.PHONICS,
    priority: GAME_PRIORITY.HIDDEN,
    difficulty: 'expert',
    estimatedTime: '20-30分',
    xpReward: 190,
    vrEnabled: false,
    featured: false,
    isNew: false,
    unlocked: false,
    requiredLevel: 25
  }
]

// カテゴリー別にゲームを取得
export function getGamesByCategory(category) {
  return ALL_GAMES.filter(game => game.category === category)
}

// 優先度別にゲームを取得
export function getGamesByPriority(priority, includeHidden = false) {
  if (priority === GAME_PRIORITY.HIDDEN && !includeHidden) {
    return []
  }
  return ALL_GAMES.filter(game => game.priority === priority)
}

// レベルでアンロックされているゲームを取得
export function getUnlockedGames(playerLevel) {
  return ALL_GAMES.filter(game => game.requiredLevel <= playerLevel)
}

// IDでゲームを取得
export function getGameById(gameId) {
  return ALL_GAMES.find(game => game.id === gameId)
}

// 今週のおすすめゲーム（コアゲーム）を取得
export function getWeeklyRecommendedGames() {
  return ALL_GAMES.filter(game => game.priority === GAME_PRIORITY.CORE)
}

// デイリーミッション用にランダムで3つのゲームを選択
export function getDailyMissionGames(playerLevel, seed = null) {
  const unlockedGames = getUnlockedGames(playerLevel)
    .filter(game => game.priority !== GAME_PRIORITY.HIDDEN)

  // シード値を使って一貫性のあるランダム選択
  if (seed) {
    const seededRandom = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash)
    }

    const shuffled = [...unlockedGames].sort((a, b) => {
      return seededRandom(seed + a.id) - seededRandom(seed + b.id)
    })

    return shuffled.slice(0, 3)
  }

  // 通常のランダム選択
  const shuffled = [...unlockedGames].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

// ゲームの進捗情報を含めて取得
export function getGameWithProgress(gameId, userProgress = {}) {
  const game = getGameById(gameId)
  if (!game) return null

  return {
    ...game,
    bestScore: userProgress[gameId]?.bestScore || 0,
    playCount: userProgress[gameId]?.playCount || 0,
    lastPlayed: userProgress[gameId]?.lastPlayed || null,
    completed: (userProgress[gameId]?.bestScore || 0) >= 90,
    available: game.unlocked && (userProgress.playerLevel || 1) >= game.requiredLevel
  }
}