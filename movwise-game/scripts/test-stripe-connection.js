#!/usr/bin/env node

/**
 * Stripe接続テストスクリプト
 * 本番環境移行前の確認用
 */

import dotenv from 'dotenv';
import Stripe from 'stripe';

// 環境変数読み込み
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

console.log('🧪 Stripe接続テストを開始します...\n');

// 環境変数チェック
const requiredEnvVars = {
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'VITE_STRIPE_PUBLIC_KEY': process.env.VITE_STRIPE_PUBLIC_KEY,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
  'STRIPE_PRICE_STARTER': process.env.STRIPE_PRICE_STARTER,
  'STRIPE_PRICE_PRO': process.env.STRIPE_PRICE_PRO,
  'STRIPE_PRICE_ENTERPRISE': process.env.STRIPE_PRICE_ENTERPRISE
};

console.log('📋 環境変数チェック:');
let hasError = false;
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  const status = value && !value.includes('your_actual') && !value.includes('REPLACE_WITH') ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value ? (value.length > 10 ? `${value.substring(0, 10)}...` : value) : 'Missing'}`);
  if (status === '❌') hasError = true;
});

if (hasError) {
  console.log('\n❌ 環境変数が正しく設定されていません。');
  console.log('実際のStripeキーを設定してください。');
  process.exit(1);
}

// Stripe初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  try {
    console.log('\n🔑 Stripe API キーテスト:');

    // アカウント情報取得
    const account = await stripe.accounts.retrieve();
    console.log(`  ✅ アカウント接続成功: ${account.display_name || account.id}`);
    console.log(`  📧 Email: ${account.email || 'Not set'}`);
    console.log(`  🌍 Country: ${account.country}`);
    console.log(`  💰 Charges enabled: ${account.charges_enabled}`);
    console.log(`  📄 Details submitted: ${account.details_submitted}`);

    console.log('\n📦 Price ID検証:');
    const priceIds = [
      { name: 'Starter', id: process.env.STRIPE_PRICE_STARTER },
      { name: 'Pro', id: process.env.STRIPE_PRICE_PRO },
      { name: 'Enterprise', id: process.env.STRIPE_PRICE_ENTERPRISE }
    ];

    for (const price of priceIds) {
      try {
        const priceData = await stripe.prices.retrieve(price.id);
        const amount = (priceData.unit_amount / 100).toLocaleString();
        console.log(`  ✅ ${price.name}: ¥${amount}/${priceData.recurring?.interval || 'once'} (${priceData.id})`);
      } catch (error) {
        console.log(`  ❌ ${price.name}: Price ID not found (${price.id})`);
        hasError = true;
      }
    }

    console.log('\n🧪 テストチェックアウト作成:');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_STARTER,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      metadata: {
        test: 'true',
        userId: 'test-user',
        planId: 'starter'
      }
    });
    console.log(`  ✅ テストセッション作成成功: ${session.id}`);
    console.log(`  🔗 URL: ${session.url}`);

    console.log('\n🎣 Webhookエンドポイント確認:');
    const webhooks = await stripe.webhookEndpoints.list();
    if (webhooks.data.length > 0) {
      webhooks.data.forEach(webhook => {
        console.log(`  ✅ Webhook: ${webhook.url}`);
        console.log(`    📋 Events: ${webhook.enabled_events.join(', ')}`);
        console.log(`    🔒 Status: ${webhook.status}`);
      });
    } else {
      console.log('  ⚠️  Webhookエンドポイントが設定されていません');
      console.log('     Stripeダッシュボードで設定してください');
    }

    console.log('\n🎉 すべてのテストが成功しました！');
    console.log('本番環境での決済処理準備完了です。\n');

  } catch (error) {
    console.error('\n❌ Stripeテストエラー:', error.message);

    if (error.code === 'api_key_invalid') {
      console.log('💡 APIキーが無効です。正しいキーが設定されているか確認してください。');
    } else if (error.code === 'resource_missing') {
      console.log('💡 指定されたリソースが見つかりません。Price IDが正しいか確認してください。');
    }

    hasError = true;
  }
}

// 実行
testStripeConnection().finally(() => {
  if (hasError) {
    console.log('❌ エラーが発生しました。設定を確認してください。');
    process.exit(1);
  } else {
    console.log('✅ テスト完了');
    process.exit(0);
  }
});