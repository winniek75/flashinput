# 🎥 観戦モード実装ガイド

MovWISE Gameの観戦モード機能の実装が完了しました。講師が生徒のゲーム画面をリアルタイムで観戦できる機能です。

## 📁 実装されたファイル構造

```
MovWISE Game/
├── server/
│   ├── index.js                    # Socket.ioサーバーのメインエントリポイント
│   └── socket/
│       └── spectatorSocket.js      # 観戦モード専用Socket.ioハンドラー
├── src/
│   ├── components/
│   │   └── spectator/
│   │       ├── SpectatorOverlay.vue      # メインオーバーレイUI
│   │       ├── RoomControls.vue          # ルーム作成・参加UI
│   │       └── ParticipantsList.vue      # 参加者リスト表示
│   ├── composables/
│   │   └── useSpectatorMode.js           # 観戦モード統合用コンポーザブル
│   ├── services/
│   │   └── spectatorService.js           # Socket.io接続・管理サービス
│   ├── stores/
│   │   └── spectatorStore.js             # Pinia状態管理ストア
│   └── views/
│       └── SpectatorModeView.vue         # 観戦モード専用ページ
```

## 🚀 使用方法

### 📋 ステップ1: サーバー起動

1. Socket.ioサーバーを起動:
```bash
npm run server
```
または開発モード（自動再起動）:
```bash
npm run dev-server
```
サーバーはポート3002で起動します。

**注意**: プロジェクトはES6モジュール（"type": "module"）を使用しているため、すべてのサーバーコードはimport/export文で記述されています。

### 👨‍🏫 ステップ2: 講師としてルーム作成

1. ホーム画面で「*」を3回クリックして講師モードを有効化
2. 「観戦モード」ボタンをクリック
3. 「講師として開始」を選択
4. 講師名を入力してルームを作成
5. 6桁のルームコードが生成される

### 🎓 ステップ3: 生徒としてルーム参加

1. 別のブラウザ/デバイスで観戦モードにアクセス
2. 「生徒として参加」を選択
3. 生徒名とルームコードを入力
4. 自動的にゲーム画面に遷移

### 👁️ ステップ4: 観戦開始

- 講師画面では参加者リストが表示
- 生徒を選択すると画面がリアルタイムで同期
- 生徒がゲームをプレイすると講師画面に反映

## 🔧 既存ゲームへの統合

既存のゲームコンポーネントに観戦モードを追加するには：

### 基本的な統合

```vue
<script setup>
import { useSpectatorMode } from '@/composables/useSpectatorMode';

// 観戦モード初期化
const spectatorMode = useSpectatorMode('ゲーム名');

// 必要な機能を分解
const {
  isInteractionDisabled,
  notifyGameStart,
  notifyAnswer,
  notifyScoreUpdate,
  wrapClickHandler
} = spectatorMode;

// ゲーム開始時
onMounted(() => {
  notifyGameStart();
});

// クリックハンドラーをラップ
const handleClick = wrapClickHandler((event) => {
  // 元のクリック処理
});
</script>

<template>
  <button 
    @click="handleClick"
    :disabled="isInteractionDisabled"
  >
    選択肢
  </button>
</template>
```

### 高度な統合例

詳細な統合例は `src/components/games/SpectatorModeExample.vue` を参照してください。

## 📡 Socket.ioイベント

### 講師用イベント

| イベント名 | 説明 |
|-----------|------|
| `spectator:create-room` | ルーム作成 |
| `spectator:room-created` | ルーム作成完了 |
| `spectator:student-joined` | 生徒参加通知 |
| `spectator:game-state-updated` | ゲーム状態更新 |
| `spectator:select-student` | 生徒選択 |

### 生徒用イベント

| イベント名 | 説明 |
|-----------|------|
| `spectator:join-room` | ルーム参加 |
| `spectator:joined-room` | ルーム参加完了 |
| `spectator:sync-game-state` | ゲーム状態同期 |
| `spectator:game-action` | ゲームアクション送信 |

## 🛡️ セキュリティ・パフォーマンス

### セキュリティ機能
- ルームコードによるアクセス制御
- 最大10名の参加者制限
- 24時間後の自動ルーム削除

### パフォーマンス最適化
- デバウンス処理（50ms）
- 送信データの最小化
- 差分同期

## 🔧 設定とカスタマイズ

### サーバー設定

**ES6モジュール対応**: プロジェクトは`"type": "module"`を使用しているため、すべてのサーバーファイルでimport/export文を使用しています。

`server/index.js` でポート変更:
```javascript
const PORT = process.env.PORT || 3002;
```

**利用可能スクリプト**:
- `npm run server` - 本番モードでサーバー起動
- `npm run dev-server` - 開発モードでサーバー起動（nodemon使用）

### 最大参加者数変更

`server/socket/spectatorSocket.js`:
```javascript
this.maxStudents = 10; // ここを変更
```

### デバウンス設定

`src/services/spectatorService.js`:
```javascript
this.actionDebounceTimer = setTimeout(() => {
  // 処理
}, 50); // デバウンス時間を変更
```

## ❗ トラブルシューティング

### 接続エラー
1. Socket.ioサーバーが起動しているか確認
2. ポート3002が利用可能か確認
3. CORSエラーの場合、サーバーのCORS設定を確認

### ゲーム状態が同期されない
1. `useSpectatorMode`コンポーザブルが正しく初期化されているか確認
2. `notifyGameStart()`が呼ばれているか確認
3. ブラウザの開発者ツールでSocket.ioイベントを確認

### UI表示問題
1. `SpectatorOverlay`コンポーネントが`App.vue`に追加されているか確認
2. Teleportが正しく動作しているか確認

## 🧪 テスト方法

### 完全テスト手順

1. **サーバー起動確認**
   ```bash
   node server/index.js
   ```
   
2. **講師ルーム作成**
   - ブラウザでホーム画面へ
   - 3回クリックで講師モード有効化
   - 観戦モードでルーム作成

3. **生徒参加**
   - 別ブラウザでルーム参加
   - ルームコード入力

4. **ゲーム観戦**
   - 生徒がゲームを開始
   - 講師画面での同期確認

### 開発者ツール確認項目

- Socket.io接続状態
- `spectator:`で始まるイベント
- Pinia storeの状態変化

## 🔮 今後の拡張可能性

- 複数ゲーム同時観戦
- 録画・再生機能
- リアルタイムチャット
- 統計・分析機能
- QRコード参加機能

## 📞 サポート

実装に関する質問やバグ報告は開発チームまでお願いします。

---

**実装完了日**: 2025年7月2日  
**対応バージョン**: Vue 3.5.13, Socket.io 4.x  
**開発者**: Claude Code Assistant