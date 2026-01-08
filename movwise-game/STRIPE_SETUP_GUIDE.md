# 🚀 MovWise Game - Stripe決済システムセットアップガイド

## ✅ 実装完了事項

### 1. 支払いシステム基盤
- ✅ Stripe.js統合サービス (`src/services/subscriptionService.js`)
- ✅ Pinia状態管理 (`src/stores/subscriptionStore.js`)
- ✅ 料金プランUI (`src/views/SubscriptionView.vue`)
- ✅ Express.jsサーバーAPI (`server/routes/subscription.js`)
- ✅ 環境変数設定 (`.env`)

### 2. サブスクリプションプラン
- 🆓 **フリープラン**: ¥0/月 (基本ゲーム10種類、生徒1名)
- 🌟 **スタータープラン**: ¥2,980/月 (全ゲーム、生徒30名)
- 💎 **プロフェッショナル**: ¥4,980/月 (教師3名、生徒100名、VR機能)
- 🏢 **エンタープライズ**: ¥9,980/月 (無制限、API連携、専属サポート)

### 3. 技術実装
- 💳 Stripe Checkout統合
- 🔄 Webhook処理
- 📊 使用量制限チェック
- 🎯 ゲームアクセス制御
- 💾 状態永続化

## 🔧 セットアップ手順

### ステップ 1: Stripeアカウント設定

1. [Stripe Dashboard](https://dashboard.stripe.com/) でアカウント作成
2. **API Keys** を取得:
   - 公開可能キー (pk_test_...)
   - 秘密キー (sk_test_...)
3. **Webhook** エンドポイント設定:
   - URL: `https://your-domain.com/api/subscription/webhook`
   - イベント選択: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`

### ステップ 2: Price ID作成

Stripe Dashboardで以下のPrice IDを作成:

```bash
# スターター (¥2,980/月)
stripe prices create \
  --product-data name="MovWise スターター" \
  --unit-amount 298000 \
  --currency jpy \
  --recurring interval=month

# プロフェッショナル (¥4,980/月)  
stripe prices create \
  --product-data name="MovWise プロフェッショナル" \
  --unit-amount 498000 \
  --currency jpy \
  --recurring interval=month

# エンタープライズ (¥9,980/月)
stripe prices create \
  --product-data name="MovWise エンタープライズ" \
  --unit-amount 998000 \
  --currency jpy \
  --recurring interval=month
```

### ステップ 3: 環境変数設定

`.env` ファイルを更新:

```env
# Stripe本番キー (実際の値に置き換え)
STRIPE_PUBLIC_KEY=pk_live_your_actual_public_key
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Stripe Price ID (実際のIDに置き換え)
STRIPE_PRICE_STARTER=price_1234567890_starter_monthly
STRIPE_PRICE_PRO=price_1234567890_pro_monthly
STRIPE_PRICE_ENTERPRISE=price_1234567890_enterprise_monthly

# API設定
VITE_API_BASE_URL=https://your-domain.com
VITE_STRIPE_PUBLIC_KEY=pk_live_your_actual_public_key
```

### ステップ 4: 本番環境デプロイ

1. **サーバー起動**:
```bash
npm run server  # ポート3002でAPI稼働
npm run dev     # フロントエンド開発サーバー
# または
npm run build   # 本番ビルド
```

2. **アクセス確認**:
- フロントエンド: http://localhost:3001/subscription
- API: http://localhost:3002/api/subscription/status/demo-user

## 🧪 テスト方法

### 1. 開発環境テスト
```bash
# サーバー起動
npm run server

# 別ターミナルでテスト
curl http://localhost:3002/health
curl http://localhost:3002/api/subscription/status/demo-user
```

### 2. Stripe テストモード
- テスト用クレジットカード: `4242 4242 4242 4242`
- 有効期限: 任意の未来日付
- CVC: 任意の3桁数字

### 3. Webhook テスト
```bash
# Stripe CLI使用
stripe listen --forward-to localhost:3002/api/subscription/webhook
```

## 🔒 セキュリティ考慮事項

### 1. 環境変数の保護
- `.env` ファイルはGitで追跡しない
- 本番環境では環境変数で設定
- 秘密キーはサーバーサイドのみ使用

### 2. Webhook署名検証
```javascript
// server/routes/subscription.js で実装済み
const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
```

### 3. CORS設定
```javascript
// server/index.js で設定済み
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

## 📊 機能仕様

### 1. サブスクリプション管理
- プラン選択とアップグレード/ダウングレード
- 決済処理と確認
- 解約とプラン変更
- 使用量制限チェック

### 2. ゲームアクセス制御
```javascript
// 実装例
const canAccessGame = subscriptionStore.canAccessGame('advancedGame')
if (!canAccessGame.allowed) {
  alert(canAccessGame.reason)
  // アップグレード推奨
}
```

### 3. 自動課金管理
- 月次自動課金
- 課金失敗時の処理
- 顧客ポータルアクセス

## 🎯 次のステップ

### 優先度高
1. **本番環境デプロイ**: Heroku/Vercel等への本番デプロイ
2. **SSL証明書**: HTTPS対応必須
3. **データベース統合**: PostgreSQL等でユーザーデータ永続化
4. **メール通知**: 課金成功/失敗時の通知システム

### 優先度中
1. **管理画面**: 講師用サブスクリプション管理機能
2. **分析機能**: 収益とユーザー分析ダッシュボード
3. **A/Bテスト**: 料金プランの最適化

### 優先度低
1. **多言語対応**: 英語/中国語プラン名
2. **他の決済手段**: PayPal等の追加
3. **クーポン機能**: 割引コード対応

## 🚀 起動コマンド

```bash
# 開発環境
npm run server  # バックエンド (ポート3002)
npm run dev     # フロントエンド (ポート3001)

# 本番環境
npm run build
npm start
```

## 📞 サポート

- Stripe公式ドキュメント: https://stripe.com/docs
- 技術サポート: MovWise開発チーム
- 緊急時連絡先: [設定してください]

---

**🎉 実装完了！MovWise Gameの収益化システムが稼働準備完了です！**

次は実際のStripeアカウント設定と本番デプロイを行い、リリースに向けて最終調整を進めましょう。