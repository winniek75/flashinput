/**
 * Stripe Configuration
 * Uses environment variables for security
 */

import { loadStripe } from '@stripe/stripe-js'

// Validate Stripe configuration
const validateStripeConfig = () => {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

  if (!publicKey || publicKey.startsWith('pk_test_your')) {
    console.warn('⚠️ Stripe public key not configured')
    console.warn('Please set VITE_STRIPE_PUBLIC_KEY in your .env file')
    return null
  }

  return publicKey
}

// Price IDs configuration
export const STRIPE_PRICES = {
  starter: import.meta.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
  pro: import.meta.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
  enterprise: import.meta.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder'
}

// API endpoints
export const STRIPE_API = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
  endpoints: {
    createCheckoutSession: '/api/stripe/create-checkout-session',
    createPortalSession: '/api/stripe/create-portal-session',
    webhook: '/api/stripe/webhook'
  }
}

// Initialize Stripe
let stripePromise = null

export const getStripe = () => {
  if (!stripePromise) {
    const publicKey = validateStripeConfig()
    if (publicKey) {
      stripePromise = loadStripe(publicKey)
    }
  }
  return stripePromise
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'スターター',
    price: '¥980',
    period: '月',
    priceId: STRIPE_PRICES.starter,
    features: [
      '基礎ゲームへのアクセス',
      '学習進捗トラッキング',
      'メールサポート',
      '月間レポート'
    ],
    recommended: false
  },
  {
    id: 'pro',
    name: 'プロ',
    price: '¥1,980',
    period: '月',
    priceId: STRIPE_PRICES.pro,
    features: [
      '全ゲームへのアクセス',
      'AI学習アシスタント',
      'VRアカデミー準備',
      '優先サポート',
      '詳細分析レポート'
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'エンタープライズ',
    price: '¥4,980',
    period: '月',
    priceId: STRIPE_PRICES.enterprise,
    features: [
      'プロの全機能',
      '教師ダッシュボード',
      '複数アカウント管理',
      '専用サポート',
      'カスタマイズ可能'
    ],
    recommended: false
  }
]

export default getStripe