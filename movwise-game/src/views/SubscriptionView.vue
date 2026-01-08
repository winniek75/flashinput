<template>
  <div class="subscription-view min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <!-- エラーハンドリング -->
    <div v-if="hasError" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-lg font-bold text-red-600 mb-2">読み込みエラー</h3>
        <p class="text-gray-700 mb-4">{{ errorMessage }}</p>
        <button @click="retryLoad" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          再試行
        </button>
      </div>
    </div>

    <!-- ローディング状態 -->
    <div v-if="isLoading" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div class="text-white text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>サブスクリプション情報を読み込み中...</p>
      </div>
    </div>

    <!-- 背景エフェクト -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <div class="relative z-10" v-show="!isLoading && !hasError">
      <!-- ヘッダー -->
      <header class="text-center py-12">
        <h1 class="text-5xl font-bold text-white mb-4">
          🌌 Sound Galaxy Academy
        </h1>
        <p class="text-xl text-gray-300 mb-2">
          選択されたプランで英語学習の宇宙を探索しよう
        </p>
        <div v-if="subscriptionStore && !subscriptionStore.isFreePlan" class="text-green-400 font-semibold">
          現在のプラン: {{ subscriptionStore.planDetails?.name }}
        </div>
      </header>

      <!-- 現在のプラン状況 -->
      <div v-if="subscriptionStore && !subscriptionStore.isFreePlan" class="max-w-4xl mx-auto px-6 mb-8">
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="text-3xl">{{ getStatusIcon(subscriptionStore?.subscriptionStatus) }}</div>
              <div>
                <h3 class="text-white font-semibold text-lg">
                  {{ subscriptionStore?.planDetails?.name }}プラン
                </h3>
                <p class="text-gray-300 text-sm">
                  {{ getStatusText(subscriptionStore?.subscriptionStatus) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-white">
                ¥{{ subscriptionStore?.planDetails?.price?.toLocaleString() }}/月
              </div>
              <div v-if="subscriptionStore?.remainingDays > 0" class="text-sm text-gray-300">
                あと{{ subscriptionStore?.remainingDays }}日
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 料金プラン一覧 -->
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="plan in availablePlans"
            :key="plan.id"
            class="plan-card"
            :class="{
              'current-plan': plan.id === subscriptionStore.currentPlan,
              'popular': plan.id === 'starter',
              'premium': plan.id === 'pro',
              'enterprise': plan.id === 'enterprise'
            }"
          >
            <!-- 人気プランバッジ -->
            <div v-if="plan.id === 'starter'" class="popular-badge">
              🔥 人気No.1
            </div>

            <!-- プラン名・価格 -->
            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span v-if="plan.price === 0" class="price-free">無料</span>
                <span v-else class="price-amount">
                  ¥{{ plan.price.toLocaleString() }}
                  <span class="price-period">/月</span>
                </span>
              </div>
            </div>

            <!-- 機能一覧 -->
            <div class="plan-features">
              <div
                v-for="feature in plan.features"
                :key="feature"
                class="feature-item"
              >
                <i class="fas fa-check feature-check"></i>
                <span>{{ feature }}</span>
              </div>
            </div>

            <!-- アクションボタン -->
            <div class="plan-actions">
              <button
                v-if="plan.id === subscriptionStore.currentPlan"
                class="btn btn-current"
                disabled
              >
                <i class="fas fa-check"></i>
                現在のプラン
              </button>
              <button
                v-else-if="plan.id === 'free'"
                @click="downgradeToPlan('free')"
                class="btn btn-downgrade"
                :disabled="subscriptionStore?.isLoading || isLoading"
              >
                <i class="fas fa-arrow-down"></i>
                フリープランに戻す
              </button>
              <button
                v-else
                @click="selectPlan(plan.id)"
                class="btn btn-upgrade"
                :disabled="subscriptionStore?.isLoading || isLoading"
                :class="{ 'loading': subscriptionStore?.isLoading || isLoading }"
              >
                <i v-if="subscriptionStore?.isLoading || isLoading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-rocket"></i>
                {{ getButtonText(plan.id) }}
              </button>
            </div>

            <!-- 現在のプランマーカー -->
            <div v-if="plan.id === subscriptionStore.currentPlan" class="current-marker">
              <i class="fas fa-star"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ セクション -->
      <div class="max-w-4xl mx-auto px-6 py-16">
        <h2 class="text-3xl font-bold text-white text-center mb-8">
          よくあるご質問
        </h2>
        <div class="space-y-4">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="faq-item"
          >
            <button
              @click="toggleFAQ(index)"
              class="faq-question"
            >
              <span>{{ faq.question }}</span>
              <i 
                class="fas fa-chevron-down transform transition-transform"
                :class="{ 'rotate-180': faq.open }"
              ></i>
            </button>
            <div
              v-show="faq.open"
              class="faq-answer"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- 利用制限通知 -->
      <div v-if="showLimitWarning" class="fixed bottom-4 right-4 max-w-sm">
        <div class="bg-yellow-500 text-yellow-900 p-4 rounded-lg shadow-lg">
          <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-triangle mt-1"></i>
            <div>
              <h4 class="font-semibold">利用制限に近づいています</h4>
              <p class="text-sm mt-1">{{ limitWarningMessage }}</p>
              <button
                @click="showLimitWarning = false"
                class="text-xs underline mt-2"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="subscriptionStore?.isLoading && !isLoading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 text-center">
        <div class="animate-spin text-4xl mb-4">🚀</div>
        <p class="text-gray-700 font-semibold">決済処理を準備中...</p>
        <p class="text-gray-500 text-sm mt-2">Stripeに移動します</p>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { SUBSCRIPTION_PLANS } from '@/services/subscriptionService'

export default {
  name: 'SubscriptionView',
  setup() {
    const router = useRouter()
    const subscriptionStore = useSubscriptionStore()
    
    // エラーハンドリング状態
    const hasError = ref(false)
    const errorMessage = ref('')
    const isLoading = ref(true)
    
    const showLimitWarning = ref(false)
    const limitWarningMessage = ref('')
    
    const availablePlans = computed(() => {
      return Object.values(SUBSCRIPTION_PLANS)
    })
    
    const faqs = ref([
      {
        question: 'プランの変更はいつでも可能ですか？',
        answer: 'はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、ダウングレードは次回更新時に適用されます。',
        open: false
      },
      {
        question: '無料トライアルはありますか？',
        answer: 'フリープランをご利用いただけます。基本的なゲームと機能をお試しいただいた後、必要に応じてアップグレードしてください。',
        open: false
      },
      {
        question: '解約方法を教えてください',
        answer: 'アカウント設定から「サブスクリプション管理」にアクセスし、「解約」ボタンをクリックしてください。現在の請求期間終了まではサービスをご利用いただけます。',
        open: false
      },
      {
        question: '生徒数を超えた場合はどうなりますか？',
        answer: '制限を超える前に通知をお送りします。制限に達した場合は、追加の生徒を登録できなくなりますので、プランのアップグレードをお願いします。',
        open: false
      }
    ])
    
    const getStatusIcon = (status) => {
      switch (status) {
        case 'active': return '✅'
        case 'past_due': return '⚠️'
        case 'canceled': return '❌'
        default: return '⏸️'
      }
    }
    
    const getStatusText = (status) => {
      switch (status) {
        case 'active': return '利用中'
        case 'past_due': return '支払い期限超過'
        case 'canceled': return 'キャンセル済み'
        default: return '非アクティブ'
      }
    }
    
    const getButtonText = (planId) => {
      if (planId === 'free') return 'フリープランに戻す'
      if (subscriptionStore.isFreePlan) return 'プランを開始'
      
      const currentPrice = SUBSCRIPTION_PLANS[subscriptionStore.currentPlan].price
      const newPrice = SUBSCRIPTION_PLANS[planId].price
      
      if (newPrice > currentPrice) return 'アップグレード'
      if (newPrice < currentPrice) return 'ダウングレード'
      return 'プラン変更'
    }
    
    const selectPlan = async (planId) => {
      if (!subscriptionStore) {
        logger.error('Subscription store not available')
        alert('サブスクリプション機能が利用できません')
        return
      }
      
      try {
        if (subscriptionStore.isFreePlan) {
          // 新規サブスクリプション
          await subscriptionStore.subscribeToPlan(planId)
        } else {
          // プラン変更
          await subscriptionStore.changePlan(planId)
        }
      } catch (error) {
        logger.error('Plan selection failed:', error)
        alert(`プランの選択に失敗しました: ${error.message}`)
      }
    }
    
    const downgradeToPlan = async (planId) => {
      if (planId === 'free') {
        const confirmed = confirm('本当にフリープランに戻しますか？現在の機能が制限される場合があります。')
        if (confirmed) {
          try {
            await subscriptionStore.cancelSubscription()
            alert('サブスクリプションをキャンセルしました。現在の期間終了後にフリープランに変更されます。')
          } catch (error) {
            alert(`キャンセルに失敗しました: ${error.message}`)
          }
        }
      }
    }
    
    const toggleFAQ = (index) => {
      faqs.value[index].open = !faqs.value[index].open
    }
    
    const checkUsageLimits = () => {
      if (!subscriptionStore) return
      
      const plan = subscriptionStore.planDetails
      const usage = subscriptionStore.usage
      
      if (!plan || !usage) return
      
      // 生徒数制限チェック
      if (plan.maxStudents !== -1 && usage.studentCount > plan.maxStudents * 0.8) {
        showLimitWarning.value = true
        limitWarningMessage.value = `生徒数が上限の80%に近づいています（${usage.studentCount}/${plan.maxStudents}）`
      }
    }
    
    // エラー再試行関数
    const retryLoad = async () => {
      hasError.value = false
      isLoading.value = true
      await initializeComponent()
    }

    // コンポーネント初期化
    const initializeComponent = async () => {
      try {
        logger.log('SubscriptionView: 初期化開始')
        isLoading.value = true
        
        // ストアとプランの確認
        logger.log('Available plans:', SUBSCRIPTION_PLANS)
        logger.log('Subscription store:', subscriptionStore)
        
        // ストアの初期化を試行（失敗しても継続）
        try {
          if (subscriptionStore && typeof subscriptionStore.initialize === 'function') {
            await subscriptionStore.initialize()
          }
        } catch (storeError) {
          logger.warn('Store initialization failed, but continuing:', storeError)
        }
        
        // 使用状況チェック（エラーがあっても継続）
        try {
          checkUsageLimits()
        } catch (usageError) {
          logger.warn('Usage check failed:', usageError)
        }
        
        logger.log('SubscriptionView: 初期化完了')
        hasError.value = false
      } catch (error) {
        logger.error('SubscriptionView initialization error:', error)
        // 基本的なプラン表示は可能にする
        hasError.value = false
        logger.log('Fallback: showing basic plan information')
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      initializeComponent()
    })
    
    return {
      // エラーハンドリング
      hasError,
      errorMessage,
      isLoading,
      retryLoad,
      
      // データ
      subscriptionStore,
      availablePlans,
      faqs,
      showLimitWarning,
      limitWarningMessage,
      getStatusIcon,
      getStatusText,
      getButtonText,
      selectPlan,
      downgradeToPlan,
      toggleFAQ
    }
  }
}
</script>

<style scoped>
.subscription-view {
  min-height: 100vh;
}

/* 背景アニメーション */
.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, transparent),
              radial-gradient(2px 2px at 20px 50px, #fff, transparent),
              radial-gradient(2px 2px at 30px 100px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* プランカード */
.plan-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.plan-card.current-plan {
  border-color: #10B981;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.plan-card.popular {
  border-color: #F59E0B;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

.plan-card.premium {
  border-color: #8B5CF6;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
}

.plan-card.enterprise {
  border-color: #EF4444;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
}

.popular-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: linear-gradient(45deg, #F59E0B, #F97316);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
}

.price-free {
  font-size: 2rem;
  font-weight: bold;
  color: #10B981;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
}

.price-period {
  font-size: 1rem;
  color: #9CA3AF;
}

.plan-features {
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  color: white;
}

.feature-check {
  color: #10B981;
  margin-right: 0.8rem;
  width: 16px;
}

.plan-actions {
  margin-top: auto;
}

.btn {
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-current {
  background: #10B981;
  color: white;
  cursor: default;
}

.btn-upgrade {
  background: linear-gradient(45deg, #3B82F6, #1D4ED8);
  color: white;
}

.btn-upgrade:hover {
  background: linear-gradient(45deg, #2563EB, #1E40AF);
  transform: translateY(-2px);
}

.btn-downgrade {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-downgrade:hover {
  background: rgba(255, 255, 255, 0.2);
}

.current-marker {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #10B981;
  font-size: 1.5rem;
}

/* FAQ */
.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s;
}

.faq-question:hover {
  background: rgba(255, 255, 255, 0.1);
}

.faq-answer {
  padding: 1rem;
  color: #D1D5DB;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .plan-card {
    padding: 1.5rem;
  }
  
  .price-amount {
    font-size: 2rem;
  }
}
</style>