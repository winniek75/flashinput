import logger from '@/utils/logger'

/**
 * Stripe Subscription Service
 * サブスクリプション管理システム
 */

// Stripe公開キー（環境変数から取得）
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'

// 本番環境チェック
const isProduction = import.meta.env.PROD
const isValidStripeKey = STRIPE_PUBLIC_KEY && !STRIPE_PUBLIC_KEY.includes('pk_test_your')

// Stripe.js動的ロード
let stripe = null
const loadStripe = async () => {
  if (!stripe) {
    const stripeLib = await import('@stripe/stripe-js')
    stripe = await stripeLib.loadStripe(STRIPE_PUBLIC_KEY)
  }
  return stripe
}

// サブスクリプションプラン定義
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'フリープラン',
    price: 0,
    priceId: null,
    features: [
      '基本ゲーム 10種類',
      '生徒 1名まで',
      '基本レポート',
      'コミュニティサポート'
    ],
    maxStudents: 1,
    maxTeachers: 1,
    gameAccess: 'basic'
  },
  starter: {
    id: 'starter',
    name: 'スターター',
    price: 980,
    priceId: 'price_starter_monthly', // Stripeで作成するPrice ID
    features: [
      '全ゲームアクセス',
      '生徒 30名まで',
      '詳細レポート',
      'メールサポート',
      '進捗分析機能'
    ],
    maxStudents: 30,
    maxTeachers: 1,
    gameAccess: 'full'
  },
  pro: {
    id: 'pro',
    name: 'プロフェッショナル',
    price: 1980,
    priceId: 'price_pro_monthly',
    features: [
      '教師 3名まで',
      '生徒 100名まで',
      '高度な分析ダッシュボード',
      'VR機能アクセス',
      '親ポータル機能',
      '電話サポート',
      'カスタムレポート'
    ],
    maxStudents: 100,
    maxTeachers: 3,
    gameAccess: 'premium'
  },
  family: {
    id: 'family',
    name: 'ファミリープラン',
    price: 680,
    priceId: 'price_family_monthly',
    features: [
      'お子様 5名まで',
      '親ポータル機能',
      '進捗レポート配信',
      '先生との連絡機能',
      'メール通知',
      'コミュニティサポート'
    ],
    maxStudents: 5,
    maxTeachers: 0,
    gameAccess: 'student_only'
  },
  enterprise: {
    id: 'enterprise',
    name: 'エンタープライズ',
    price: 4980,
    priceId: 'price_enterprise_monthly',
    features: [
      '無制限利用',
      'API連携',
      '専属サポート',
      'カスタマイズ対応',
      'オンサイト研修',
      'SLA保証'
    ],
    maxStudents: -1, // 無制限
    maxTeachers: -1,
    gameAccess: 'enterprise'
  }
}

/**
 * Subscription Service Class
 */
export class SubscriptionService {
  constructor() {
    this.stripe = null
    this.initialized = false
  }

  /**
   * サービス初期化
   */
  async initialize() {
    if (this.initialized) return

    // 本番環境でStripeキーが未設定の場合は警告
    if (isProduction && !isValidStripeKey) {
      logger.error('❌ Production環境でStripe公開キーが正しく設定されていません')
      throw new Error('Stripe configuration error in production')
    }

    try {
      this.stripe = await loadStripe()
      this.initialized = true
      const mode = isProduction && isValidStripeKey ? 'Production' : 'Development'
      logger.log(`✅ Stripe subscription service initialized (${mode} mode)`)
    } catch (error) {
      logger.error('❌ Failed to initialize Stripe:', error)
      throw error
    }
  }

  /**
   * Checkout セッション作成
   */
  async createCheckoutSession(planId, userId, schoolId = null) {
    await this.initialize()
    
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan || plan.id === 'free') {
      throw new Error('Invalid subscription plan')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId,
          schoolId,
          planId: plan.id,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // Stripe Checkout にリダイレクト
      const { error } = await this.stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }

    } catch (error) {
      logger.error('❌ Checkout session creation failed:', error)
      throw error
    }
  }

  /**
   * サブスクリプション状態取得
   */
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      return await response.json()
    } catch (error) {
      logger.error('❌ Failed to get subscription status:', error)
      return {
        planId: 'free',
        status: 'inactive',
        currentPeriodEnd: null
      }
    }
  }

  /**
   * サブスクリプション解約
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ subscriptionId })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      return await response.json()
    } catch (error) {
      logger.error('❌ Failed to cancel subscription:', error)
      throw error
    }
  }

  /**
   * プラン変更
   */
  async changePlan(subscriptionId, newPlanId) {
    const newPlan = SUBSCRIPTION_PLANS[newPlanId]
    if (!newPlan) {
      throw new Error('Invalid plan')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId: newPlan.priceId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to change plan')
      }

      return await response.json()
    } catch (error) {
      logger.error('❌ Failed to change plan:', error)
      throw error
    }
  }

  /**
   * 利用制限チェック
   */
  checkUsageLimits(currentPlan, usage) {
    // In development mode, allow all usage for testing
    if (import.meta.env.DEV) {
      return { allowed: true }
    }
    
    const plan = SUBSCRIPTION_PLANS[currentPlan]
    if (!plan) return { allowed: false, reason: 'Invalid plan' }

    // 生徒数制限チェック
    if (plan.maxStudents !== -1 && usage.studentCount > plan.maxStudents) {
      return { 
        allowed: false, 
        reason: `生徒数が上限（${plan.maxStudents}名）を超えています`,
        limit: 'students'
      }
    }

    // 教師数制限チェック  
    if (plan.maxTeachers !== -1 && usage.teacherCount > plan.maxTeachers) {
      return {
        allowed: false,
        reason: `教師数が上限（${plan.maxTeachers}名）を超えています`,
        limit: 'teachers'
      }
    }

    // ゲームアクセス制限チェック
    if (plan.gameAccess === 'basic' && usage.requestedGame && !subscriptionService.isBasicGame(usage.requestedGame)) {
      return {
        allowed: false,
        reason: 'このゲームはスタータープラン以上で利用可能です',
        limit: 'games'
      }
    }

    return { allowed: true }
  }

  /**
   * 基本ゲーム判定
   */
  isBasicGame(gameId) {
    const basicGames = [
      // サウンド基礎ゲーム（フリープランで利用可能）
      'pureSoundLab',
      'soundToSymbolMatch',
      'phonemePatternLab',
      'cvPronunciationTrainer',
      'floatingLetterHunt',
      'cvcWordFactory',
      'beVerbRush',
      'typingArena',
      'rhymingRush',
      'sightWordMaster'
    ]
    return basicGames.includes(gameId)
  }

  /**
   * 認証トークン取得（実装に応じて調整）
   */
  getAuthToken() {
    // localStorage または store から取得
    return localStorage.getItem('authToken') || ''
  }

  /**
   * プラン情報取得
   */
  getPlan(planId) {
    return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free
  }

  /**
   * 全プラン取得
   */
  getAllPlans() {
    return Object.values(SUBSCRIPTION_PLANS)
  }
}

// シングルトンインスタンス
export const subscriptionService = new SubscriptionService()

// デフォルトエクスポート
export default subscriptionService