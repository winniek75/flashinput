# Character Assets Directory

このディレクトリには Language Galaxy Adventure の主要キャラクターの画像アセットが配置されます。

## ディレクトリ構造

```
src/assets/characters/
├── captain_nova/
│   ├── portrait.png          # メイン立ち絵
│   ├── normal.png           # 通常表情
│   ├── happy.png            # 喜び表情
│   ├── surprised.png        # 驚き表情
│   ├── sad.png              # 悲しみ表情
│   ├── angry.png            # 怒り表情
│   ├── excited.png          # 興奮表情
│   ├── confused.png         # 困惑表情
│   ├── determined.png       # 決意表情
│   └── worried.png          # 心配表情
├── aura/
│   └── (同様の構成)
├── professor_phonix/
│   └── (同様の構成)
├── lexia/
│   └── (同様の構成)
├── grammar_guardian/
│   └── (同様の構成)
├── speed_racer/
│   └── (同様の構成)
├── unity/
│   └── (同様の構成)
└── the_translator/
    └── (同様の構成)
```

## 画像仕様

### ファイル形式
- **形式**: PNG（透過背景）
- **解像度**: 512x640px（基本サイズ）
- **モバイル用**: 256x320px（軽量版、_mobile サフィックス）

### 画像要件
1. **透過背景**: キャラクター以外の背景は完全透過
2. **一貫性**: 同一キャラクターの全表情で統一されたスタイル
3. **高品質**: クリアで鮮明な画像
4. **表情豊か**: 各感情を明確に表現

## キャラクター詳細

### Captain Nova（主人公）
- **テーマ**: 宇宙探検家
- **カラー**: ブルー系（#2563eb）
- **特徴**: スペーススーツ、決意に満ちた表情

### AURA（AI アシスタント）
- **テーマ**: ホログラム AI
- **カラー**: シアン系（#06b6d4）
- **特徴**: 透明感、幾何学模様、光のエフェクト

### Professor Phonix（音の賢者）
- **テーマ**: 古代の賢者
- **カラー**: パープル系（#8b5cf6）
- **特徴**: 白いひげ、音波オーラ、古代風ローブ

### Lexia（単語の妖精）
- **テーマ**: エネルギッシュな妖精
- **カラー**: エメラルド系（#10b981）
- **特徴**: カラフルな羽、文字エフェクト、活発な動き

### Grammar Guardian（文法の守護者）
- **テーマ**: 威厳ある守護者
- **カラー**: レッド系（#dc2626）
- **特徴**: 鎧、文法ルールの刻印、堂々とした姿勢

### Speed Racer（タイピングチャンピオン）
- **テーマ**: サイバネティック・レーサー
- **カラー**: オレンジ系（#f59e0b）
- **特徴**: サイバー装具、LED装飾、流線型デザイン

### Unity（協力の女神）
- **テーマ**: 調和の女神
- **カラー**: パープル系（#a855f7）
- **特徴**: 光の輪、連結エフェクト、温和な微笑み

### The Translator（最終ボス）
- **テーマ**: デジタル存在
- **カラー**: グレー系（#374151）
- **特徴**: 半透明ボディ、デジタルグリッチ、威圧的オーラ

## 使用方法

```typescript
import { CharacterDatabase } from '@/story/characters/CharacterDatabase'

// キャラクター画像パスの取得
const character = CharacterDatabase.captain_nova
const portraitPath = character.assets.portrait
const happyExpression = character.assets.expressions.happy
```

## 注意事項

1. **著作権**: すべての画像は適切なライセンスを確認してください
2. **パフォーマンス**: モバイル環境では軽量版の使用を推奨
3. **一貫性**: キャラクターデザインの統一性を保ってください
4. **将来性**: 新しい表情や衣装の追加を考慮した命名規則

## 将来の拡張

- 衣装バリエーション（costume_01.png など）
- アニメーション用フレーム画像
- VR 用 3D モデルテクスチャ
- 季節限定デザイン