# 🥽 Meta Quest 3s セットアップガイド - HTTPS証明書問題の解決

## ⚠️ 「このサイトは安全に接続できません」エラーの解決方法

### 方法1: ngrokを使用（推奨） ✅

ngrokを使って、ローカル開発環境を安全なHTTPSトンネル経由で公開します。

#### 1. ngrokのインストール

```bash
# Mac (Homebrew)
brew install ngrok

# または直接ダウンロード
# https://ngrok.com/download
```

#### 2. ngrokアカウント作成（無料）

1. https://ngrok.com にアクセス
2. 無料アカウントを作成
3. Authトークンを取得

```bash
# Authトークンを設定
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 3. 開発サーバーとngrokを起動

```bash
# ターミナル1: 開発サーバーを起動
cd movwise-game
npm run dev

# ターミナル2: ngrokトンネルを開始
ngrok http 3002
```

#### 4. Quest 3s でアクセス

ngrokが表示する公開URLを使用：
```
https://abc123.ngrok-free.app/vr-academy
```

✅ **メリット**:
- 有効なSSL証明書
- 外部ネットワークからもアクセス可能
- エラーメッセージなし

---

### 方法2: localtunnelを使用 🚇

ngrokの代替として、localtunnelも使えます。

```bash
# インストール
npm install -g localtunnel

# 開発サーバーを起動
npm run dev

# localtunnelを起動
lt --port 3002 --subdomain movwise-vr
```

アクセスURL:
```
https://movwise-vr.loca.lt/vr-academy
```

---

### 方法3: HTTPで一時的にテスト（制限あり） ⚠️

WebXRの一部機能は制限されますが、基本的な動作確認は可能です。

```bash
# HTTPで開発サーバーを起動
npm run dev
```

Quest 3s でアクセス：
```
http://192.168.x.x:3002/vr-academy
```

**注意**:
- 音声認識が使えない
- カメラ/マイクアクセスが制限される
- 本番環境のテストにはならない

---

### 方法4: ローカルSSL証明書を作成 🔐

自己署名証明書を作成してHTTPSを有効化します。

#### 1. mkcertのインストール

```bash
# Mac
brew install mkcert
brew install nss # Firefoxサポート用

# mkcertを初期化
mkcert -install
```

#### 2. 証明書を生成

```bash
cd movwise-game

# 証明書ディレクトリを作成
mkdir -p .cert

# ローカル証明書を生成
mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 ::1 192.168.1.100

# あなたのIPアドレスも追加
mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost $(ipconfig getifaddr en0)
```

#### 3. Vite設定を更新

`vite.config.js` を編集：

```javascript
import fs from 'fs'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3002,
    https: {
      key: fs.readFileSync('.cert/key.pem'),
      cert: fs.readFileSync('.cert/cert.pem')
    }
  }
})
```

---

### 方法5: Quest 3s のブラウザ設定変更 🔧

#### Chrome フラグを有効化

1. Quest 3s のブラウザで `chrome://flags` にアクセス
2. 以下のフラグを検索して有効化：
   - `#allow-insecure-localhost` → Enabled
   - `#unsafely-treat-insecure-origin-as-secure` → Enabled

3. 「Insecure origins treated as secure」に追加：
   ```
   https://192.168.1.100:3002
   ```

4. ブラウザを再起動

---

## 🎯 クイックスタート（最も簡単な方法）

### ngrokを使った3ステップセットアップ

```bash
# Step 1: 開発サーバー起動
cd movwise-game
npm run dev

# Step 2: ngrokトンネル開始
ngrok http 3002

# Step 3: Quest 3s でngrok URLにアクセス
# https://xxx.ngrok-free.app/vr-academy
```

---

## ⚡ トラブルシューティング

### 問題: ngrokが起動しない
```bash
# ポートが使用中の場合
lsof -i :3002
kill -9 [PID]
```

### 問題: localtunnelが遅い
```bash
# 別のサブドメインを試す
lt --port 3002 --subdomain movwise-vr-$(date +%s)
```

### 問題: Quest 3s がネットワークに接続できない
1. WiFi設定を確認（5GHz推奨）
2. ファイアウォールを一時的に無効化
3. モバイルホットスポットを使用

---

## 📱 Quest 3s ブラウザでの確認手順

1. **アドレスバーのアイコンを確認**
   - 🔒 緑の鍵アイコン = 安全な接続
   - ⚠️ 黄色の警告 = 証明書の問題あり
   - 🚫 赤いアイコン = 接続拒否

2. **証明書エラーの詳細を見る**
   - アドレスバーの警告アイコンをタップ
   - 「詳細」または「証明書を表示」
   - エラーの種類を確認

3. **一時的に許可する場合**
   - 「詳細設定」をタップ
   - 「安全でないサイトに進む」を選択
   - ⚠️ 開発時のみ使用

---

## ✅ 推奨セットアップまとめ

| 方法 | 難易度 | 安定性 | WebXR対応 | 推奨度 |
|------|--------|--------|-----------|--------|
| ngrok | 簡単 | 高 | 完全対応 | ⭐⭐⭐⭐⭐ |
| localtunnel | 簡単 | 中 | 完全対応 | ⭐⭐⭐⭐ |
| mkcert | 中 | 高 | 完全対応 | ⭐⭐⭐ |
| HTTP | 簡単 | 高 | 制限あり | ⭐⭐ |
| ブラウザ設定 | 簡単 | 低 | 完全対応 | ⭐ |

**結論**: ngrokが最も簡単で確実な方法です！

---

## 🚀 次のステップ

1. ngrokをセットアップ
2. Quest 3s でVRアプリにアクセス
3. VRモードで動作確認
4. `VR_TESTING_GUIDE.md` のチェックリストを実行

問題が解決しない場合は、具体的なエラーメッセージと共にお知らせください。