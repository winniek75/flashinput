import express from 'express'
import Stripe from 'stripe'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Webhook署名検証用
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// Stripe Price IDマッピング（実際のStripe Price IDに置き換える必要があります）
const PRICE_MAPPING = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_monthly',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
  family: process.env.STRIPE_PRICE_FAMILY || 'price_family_monthly',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly'
}

// 仮のユーザーデータベース（実際はDBを使用）
const users = new Map()
const subscriptions = new Map()

/**
 * Checkout Session作成
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { priceId, userId, schoolId, planId, successUrl, cancelUrl } = req.body

    // 入力値検証
    if (!priceId || !userId || !planId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // 実際のPrice IDを取得
    const stripePriceId = PRICE_MAPPING[planId] || priceId

    // Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/subscription/cancel`,
      customer_email: users.get(userId)?.email,
      metadata: {
        userId,
        schoolId: schoolId || '',
        planId
      },
      subscription_data: {
        metadata: {
          userId,
          schoolId: schoolId || '',
          planId
        }
      },
      allow_promotion_codes: true, // プロモーションコード許可
    })

    console.log(`✅ Checkout session created: ${session.id} for user ${userId}`)
    res.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('❌ Checkout session creation failed:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * サブスクリプション状態取得
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    // ユーザーのサブスクリプション情報を取得
    const userSubscription = subscriptions.get(userId)
    
    if (!userSubscription) {
      return res.json({
        planId: 'free',
        status: 'inactive',
        subscriptionId: null,
        currentPeriodEnd: null
      })
    }

    // Stripeからの最新情報を取得
    const subscription = await stripe.subscriptions.retrieve(userSubscription.subscriptionId)
    
    res.json({
      planId: userSubscription.planId,
      status: subscription.status,
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    })

  } catch (error) {
    console.error('❌ Failed to get subscription status:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * サブスクリプション解約
 */
router.post('/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.body

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    // 期間終了時に解約するように設定
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    console.log(`✅ Subscription ${subscriptionId} set to cancel at period end`)
    res.json({ 
      success: true, 
      cancelAtPeriodEnd: subscription.current_period_end 
    })

  } catch (error) {
    console.error('❌ Failed to cancel subscription:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * プラン変更
 */
router.post('/change-plan', async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body

    if (!subscriptionId || !newPriceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // 現在のサブスクリプションを取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const currentItem = subscription.items.data[0]

    // サブスクリプションアイテムを更新
    await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: currentItem.id,
        price: newPriceId,
      }],
      proration_behavior: 'always_invoice' // 日割り計算
    })

    console.log(`✅ Subscription ${subscriptionId} plan changed to ${newPriceId}`)
    res.json({ success: true })

  } catch (error) {
    console.error('❌ Failed to change plan:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * 顧客ポータルセッション作成（請求書管理等）
 */
router.post('/customer-portal', async (req, res) => {
  try {
    const { customerId } = req.body

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin}/subscription`
    })

    res.json({ url: session.url })

  } catch (error) {
    console.error('❌ Failed to create customer portal session:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * Stripe Webhook処理
 */
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // イベント処理
  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutCompleted(event.data.object)
      break
    
    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(event.data.object)
      break
      
    case 'invoice.payment_failed':
      handlePaymentFailed(event.data.object)
      break
      
    case 'customer.subscription.updated':
      handleSubscriptionUpdated(event.data.object)
      break
      
    case 'customer.subscription.deleted':
      handleSubscriptionDeleted(event.data.object)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  res.json({received: true})
})

/**
 * Webhook イベントハンドラー
 */
async function handleCheckoutCompleted(session) {
  console.log('🎉 Checkout completed:', session.id)
  
  const { userId, planId, schoolId } = session.metadata
  
  try {
    // サブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    
    // ユーザーのサブスクリプション情報を保存
    subscriptions.set(userId, {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      planId: planId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      schoolId: schoolId
    })
    
    console.log(`✅ Subscription activated for user ${userId}, plan: ${planId}`)
    
    // 必要に応じて、ユーザーへの通知やデータベース更新を行う
    
  } catch (error) {
    console.error('❌ Failed to handle checkout completion:', error)
  }
}

function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id)
  
  const subscriptionId = invoice.subscription
  const customerId = invoice.customer
  
  // 支払い成功時の処理（通知送信等）
}

function handlePaymentFailed(invoice) {
  console.log('💸 Payment failed:', invoice.id)
  
  const subscriptionId = invoice.subscription
  const customerId = invoice.customer
  
  // 支払い失敗時の処理（通知送信、機能制限等）
}

function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  
  const { userId } = subscription.metadata
  
  if (userId) {
    // サブスクリプション情報を更新
    const existingData = subscriptions.get(userId) || {}
    subscriptions.set(userId, {
      ...existingData,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    })
  }
}

function handleSubscriptionDeleted(subscription) {
  console.log('🗑️ Subscription deleted:', subscription.id)
  
  const { userId } = subscription.metadata
  
  if (userId) {
    // サブスクリプション情報を削除（フリープランに戻す）
    subscriptions.delete(userId)
    console.log(`User ${userId} reverted to free plan`)
  }
}

export default router