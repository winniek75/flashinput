# 🌟 英検タイピング・アリーナ 強化版

## 概要
英検タイピング・アリーナの強化版では、既存の練習モードに加えて没入感のあるストーリーモードと包括的なキャラクター育成システムを追加しました。

## 🎮 主要機能

### ストーリーモード「銀河英語救出作戦」
- **5つの章構成**: 地球の危機から英語銀河の平和まで
- **段階的難易度**: 英検5級〜2級レベルに対応
- **ボスバトルシステム**: 各章の最後に強力なボスとの戦闘
- **プログレッション**: クリア状況に応じた新章解禁

### キャラクター育成システム
- **6つのステータス**: スピード、精度、持久力、語彙力、集中力、指導力
- **レベルアップ**: タイピング成績に応じた経験値獲得
- **スキルツリー**: アクティブ/パッシブスキルの解禁・強化
- **称号システム**: 達成度に応じた称号付与

### ペットコンパニオンシステム
- **基本ペット**: アルファベット・バード
- **進化システム**: レベルアップによる能力向上
- **親密度システム**: 相互作用による絆の深化
- **サポート能力**: ヒント提供、応援、単語記憶

### 統合進捗管理
- **データ同期**: ストーリー・練習モード間でのデータ共有
- **実績システム**: 様々な条件達成による報酬
- **統計追跡**: 詳細なパフォーマンス分析

## 📁 ファイル構成

```
src/components/games/
├── TypingArenaEnhanced.vue          # メインコンポーネント
├── typing-arena/
│   ├── StoryModeHub.vue             # ストーリーモードハブ
│   ├── CharacterStatusPanel.vue     # キャラクター状態表示
│   ├── BossBattleUI.vue             # ボスバトルインターface
│   ├── PetHelper.vue                # ペットサポート機能
│   ├── ActiveSkillBar.vue           # アクティブスキル管理
│   └── ResultsScreen.vue            # 結果画面
└── stores/
    └── typingArenaStore.js          # Pinia状態管理
```

## 🛠️ セットアップ

### 1. 依存関係
既存のVue.js + Pinia + Tailwind CSS環境で動作します。

### 2. ルート設定
```javascript
// router/index.js
import TypingArenaEnhanced from '@/components/games/TypingArenaEnhanced.vue'

const routes = [
  {
    path: '/typing-arena-enhanced',
    name: 'TypingArenaEnhanced',
    component: TypingArenaEnhanced
  }
]
```

### 3. ストア統合
```javascript
// main.js または適切な場所
import { useTypingArenaStore } from '@/stores/typingArenaStore'

// アプリケーション初期化時
const arenaStore = useTypingArenaStore()
arenaStore.loadProgress() // 保存データの読み込み
```

## 🎯 使用方法

### 基本的な使用
```vue
<template>
  <TypingArenaEnhanced />
</template>

<script setup>
import TypingArenaEnhanced from '@/components/games/TypingArenaEnhanced.vue'
</script>
```

### ストアとの連携
```javascript
import { useTypingArenaStore } from '@/stores/typingArenaStore'

const arenaStore = useTypingArenaStore()

// 進捗の保存
arenaStore.saveProgress()

// 特定のチャプターの解禁状況確認
const isChapterUnlocked = arenaStore.storyMode.chapters[2].unlocked

// キャラクターレベル確認
const playerLevel = arenaStore.character.level
```

## 🎨 カスタマイズ

### ストーリーコンテンツの追加
```javascript
// stores/typingArenaStore.js のcontentDatabaseを編集
const contentDatabase = {
  // 新しい難易度レベルを追加
  customLevel: {
    words: [
      { text: 'example', translation: '例' }
    ],
    sentences: [
      { text: 'This is an example.', translation: 'これは例です。' }
    ]
  }
}
```

### 新しいペットの追加
```javascript
// pets.valueオブジェクトに新しいペットを追加
pets.value.petData.newPet = {
  id: 'newPet',
  name: '新しいペット',
  type: 'サポート',
  level: 1,
  // その他の設定...
}
```

### ボスの追加・カスタマイズ
```javascript
// StoryModeHub.vueのgetBossData関数を編集
function getBossData(bossId) {
  const bosses = {
    // 新しいボスを追加
    newBoss: {
      id: 'newBoss',
      name: '新ボス',
      icon: '🆕',
      description: '新しく追加されたボス',
      requiredWPM: 50,
      requiredAccuracy: 90,
      hp: 2000
    }
  }
  return bosses[bossId] || {}
}
```

## 📊 パフォーマンス最適化

### 遅延読み込み
```javascript
// 大きなコンポーネントの遅延読み込み
const StoryModeHub = defineAsyncComponent(() => 
  import('./typing-arena/StoryModeHub.vue')
)
```

### データの軽量化
```javascript
// 不要なデータの除外
const lightweightSave = {
  essential: {
    level: character.level,
    experience: character.experience,
    // 必要最小限のデータのみ
  }
}
```

## 🐛 トラブルシューティング

### よくある問題

1. **進捗が保存されない**
   - LocalStorageの容量確認
   - ブラウザの設定確認

2. **パフォーマンスの問題**
   - アニメーションの無効化
   - データの軽量化

3. **スタイルの崩れ**
   - Tailwind CSSのバージョン確認
   - カスタムCSSの競合確認

### デバッグ方法
```javascript
// 開発者ツールでのデバッグ
console.log('Arena Store State:', arenaStore.$state)

// パフォーマンス測定
console.time('render')
// レンダリング処理
console.timeEnd('render')
```

## 🚀 今後の拡張予定

- [ ] マルチプレイヤー機能
- [ ] より多様なペット種類
- [ ] カスタムキーボード設定
- [ ] 音声認識による発音練習
- [ ] AR/VR対応

## 📝 ライセンス
MIT License

---
⚡ **英検タイピング・アリーナ強化版で、楽しく効率的な英語学習を！** ⚡