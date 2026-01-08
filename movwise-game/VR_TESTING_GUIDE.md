# 🥽 Meta Quest 3s での MovWISE VR テスト手順

## 事前準備

### 1. 開発環境セットアップ

```bash
# プロジェクトディレクトリに移動
cd movwise-game

# 依存関係をインストール
npm install

# HTTPS開発サーバーを起動
npm run dev
```

### 2. ネットワーク設定確認

```bash
# 自分のIPアドレスを確認（MacOS）
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows の場合
ipconfig | findstr "IPv4"
```

開発サーバーが起動したら、表示されるネットワークURLをメモ：
```
Local:   https://localhost:3002/
Network: https://192.168.1.XXX:3002/
```

## Meta Quest 3s での接続手順

### Step 1: Quest 3s の準備

1. **開発者モードを有効化**
   - Meta Quest Mobile アプリを開く
   - 設定 → 高度な設定 → 開発者モード を有効化
   - Quest 3s を再起動

2. **ブラウザを起動**
   - Quest 3s のホーム画面で「ブラウザ」アプリを開く
   - または「Meta Quest Browser」を検索

### Step 2: WebXR対応確認

1. **WebXR APIテストサイトにアクセス**
   ```
   https://immersive-web.github.io/webxr-samples/
   ```

2. **動作確認**
   - 「VR Sample」のいずれかをクリック
   - 「Enter VR」ボタンが表示されるか確認
   - VRモードに入れるかテスト

### Step 3: MovWISE VRアプリへアクセス

1. **アドレスバーに入力**
   ```
   https://[あなたのIPアドレス]:3002/vr-academy
   ```
   例: `https://192.168.1.100:3002/vr-academy`

2. **SSL証明書の警告を許可**
   - 「詳細設定」→「安全でないサイトに進む」をクリック
   - または「このサイトにアクセスする（安全ではありません）」

3. **VR Academy にアクセス**
   - ページが正常に読み込まれることを確認
   - 「Phonetics Planet VR」カードが表示されることを確認

### Step 4: VRゲームのテスト

1. **チケットの確認**
   - VRチケットが1枚以上あることを確認
   - 不足している場合は、通常のゲームでチケットを獲得

2. **Phonetics Planet VR を起動**
   - 「Phonetics Planet VR」カードをタップ
   - ゲーム設定画面が表示されることを確認

3. **WebXR セッションの開始**
   - 「🚀 VR体験を開始」ボタンをタップ
   - VRセッション許可のポップアップで「許可」をタップ
   - Quest 3s がVRモードに切り替わることを確認

## 動作確認チェックリスト

### ✅ 基本機能

- [ ] ページの読み込み（HTTPS接続）
- [ ] VR Academy Hub の表示
- [ ] Phonetics Planet VR カードの表示
- [ ] チケット残高の表示
- [ ] ゲーム設定の変更

### ✅ WebXR機能

- [ ] 「Enter VR」ボタンの表示
- [ ] VRセッションの開始
- [ ] VRモードへの切り替え
- [ ] 3D空間の表示（宇宙背景、惑星）
- [ ] VRからの正常終了

### ✅ コントローラー

- [ ] 左右コントローラーの認識
- [ ] レーザーポインターの表示
- [ ] トリガーボタンの反応
- [ ] グリップボタンの反応
- [ ] コントローラーの位置追跡

### ✅ ハンドトラッキング

- [ ] 手の認識（コントローラーを置いた状態）
- [ ] 指の動きの追跡
- [ ] ジェスチャー操作
- [ ] ハンドトラッキング ↔ コントローラー の切り替え

### ✅ ゲームプレイ

- [ ] 音素プロジェクタイルの出現
- [ ] プロジェクタイルの移動
- [ ] トリガーでの射撃
- [ ] ヒット判定
- [ ] スコア表示の更新
- [ ] パーティクルエフェクト

### ✅ 音響システム

- [ ] 背景音楽の再生
- [ ] 効果音（スポーン、ヒット、ミス）
- [ ] 3D位置音響
- [ ] 音量レベルの適切さ

### ✅ 音声認識

- [ ] マイク権限の許可
- [ ] 音声認識の開始
- [ ] 日本語音素の認識
- [ ] 発音判定の精度
- [ ] 音声でのプロジェクタイルヒット

## トラブルシューティング

### 🔧 接続できない場合

**症状**: Quest 3s からアクセスできない

**解決方法**:
1. ファイアウォールの確認
   ```bash
   # Mac でポート3002を開放
   sudo pfctl -f /etc/pf.conf
   ```

2. 同一ネットワーク確認
   - Quest 3s と開発PCが同じWiFiネットワークに接続されているか確認

3. IP アドレスの再確認
   ```bash
   # ネットワークインターフェースを確認
   networksetup -listallhardwareports
   ```

### 🔧 VRモードに入れない場合

**症状**: 「Enter VR」ボタンが表示されない

**解決方法**:
1. WebXR対応ブラウザを使用しているか確認
2. HTTPS接続を確認
3. Quest 3s のブラウザを最新版に更新
4. 開発者モードが有効になっているか確認

### 🔧 パフォーマンスが悪い場合

**症状**: カクツキ、フレームドロップ

**解決方法**:
1. Quest 3s の他のアプリを終了
2. ゲーム設定で難易度を「beginner」に設定
3. ブラウザのタブを他に開いていないか確認
4. 開発者ツールを閉じる

### 🔧 音声認識が動作しない場合

**症状**: 音声が認識されない

**解決方法**:
1. マイク権限を許可
2. Quest 3s の音声設定を確認
3. 静かな環境でテスト
4. ブラウザの音声設定をチェック

## デバッグ方法

### 1. Quest 3s でのコンソール確認

1. **Remote Debugging を有効化**
   ```
   adb connect [Quest 3s の IP アドレス]
   ```

2. **Chrome DevTools を使用**
   - PC で Chrome を開く
   - `chrome://inspect/#devices` にアクセス
   - Quest 3s のブラウザタブを選択
   - 「Inspect」をクリック

### 2. ログ確認

**JavaScript Console で確認すべきログ**:
```javascript
// WebXR サポート確認
console.log('WebXR supported:', 'xr' in navigator);

// VR セッション確認
navigator.xr.isSessionSupported('immersive-vr')
  .then(supported => console.log('VR supported:', supported));

// コントローラー接続確認
// VRシーン内で出力されるログを確認
```

### 3. パフォーマンス監視

**VR Stats を表示**:
```javascript
// ブラウザコンソールで実行
window.vrScene.renderer.info; // Three.js 描画統計
```

## 推奨テスト環境

- **Quest 3s ファームウェア**: 最新版
- **Quest Browser**: 最新版
- **ネットワーク**: 5GHz WiFi 推奨
- **開発PC**: 同一LAN内
- **ブラウザ**: Meta Quest Browser (Chromium ベース)

## 本番環境での確認

最終的には、本番環境 (HTTPS ドメイン) でのテストも推奨：

1. **Vercel/Netlify等にデプロイ**
2. **独自ドメインでHTTPS設定**
3. **パブリックアクセスでのテスト**

この手順により、Meta Quest 3s でのMovWISE VRアプリケーションの完全な動作確認が可能です。