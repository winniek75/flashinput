# Firebase セットアップガイド

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名を入力（例: movwise-game）
4. Google Analyticsの設定（任意）

## 2. Firebase認証情報の取得

1. プロジェクトの設定画面を開く
2. 「プロジェクトの設定」→「全般」タブ
3. 「マイアプリ」セクションでWebアプリを追加
4. アプリのニックネームを入力
5. Firebase SDKの設定が表示される

## 3. 必要なFirebaseサービスの有効化

### Authentication（認証）
1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで以下を有効化：
   - メール/パスワード

### Realtime Database
1. 左メニューから「Realtime Database」を選択
2. 「データベースを作成」をクリック
3. セキュリティルールで「テストモード」を選択（開発用）
4. ロケーションを選択（asia-northeast1推奨）

### Storage（オプション）
1. 左メニューから「Storage」を選択
2. 「始める」をクリック
3. セキュリティルールを設定

## 4. .envファイルの更新

Firebase Consoleから取得した認証情報を`.env`ファイルに設定：

```env
# Firebase Configuration - 実際の値に置き換える
VITE_FIREBASE_API_KEY=AIzaSy...（あなたのAPIキー）
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 5. テストユーザーの作成

### Firebase Consoleから作成
1. Authentication → Users タブ
2. 「ユーザーを追加」をクリック
3. メールアドレスとパスワードを入力

### 推奨テストユーザー
- 先生用: teacher@test.com (パスワード: Test1234!)
- 生徒用: student@test.com (パスワード: Test1234!)

## 6. データベース初期化

Realtime Databaseに初期データを設定：

```json
{
  "users": {
    "userId1": {
      "email": "teacher@test.com",
      "role": "teacher",
      "displayName": "テスト先生",
      "progress": {
        "level": 1,
        "exp": 0,
        "totalExp": 0
      }
    },
    "userId2": {
      "email": "student@test.com",
      "role": "student",
      "displayName": "テスト生徒",
      "progress": {
        "level": 1,
        "exp": 0,
        "totalExp": 0
      }
    }
  }
}
```

## 7. アプリケーションの起動とテスト

1. 依存関係のインストール：
```bash
npm install
```

2. 開発サーバーの起動：
```bash
npm run dev
```

3. ブラウザで http://localhost:3011/ にアクセス

4. テストユーザーでログイン

## レベルアップの仕組み

### 経験値の獲得
- ゲームクリア: 10-50 EXP
- 正答率ボーナス: 最大20 EXP
- 連続プレイボーナス: 5-15 EXP

### レベルアップ条件
- レベル1→2: 100 EXP
- レベル2→3: 200 EXP
- レベル3→4: 400 EXP
- 以降倍増

### ゲームアンロック
各セクションのレベルが上がると新しいゲームが解放されます：
- レベル2: 2つ目のゲーム解放
- レベル3: 3つ目のゲーム解放
- レベル5: 全ゲーム解放

## トラブルシューティング

### エラー: Firebase App not initialized
→ `.env`ファイルの設定を確認

### エラー: Permission denied
→ Realtime Databaseのルールを確認（テストモードになっているか）

### ログインできない
→ Authenticationでメール/パスワード認証が有効になっているか確認