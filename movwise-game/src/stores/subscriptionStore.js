import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subscriptionService, SUBSCRIPTION_PLANS } from '@/services/subscriptionService'
import { useAuthStore } from './auth'
import logger from '@/utils/logger'

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const currentPlan = ref('free')
  const subscriptionStatus = ref('inactive') // inactive, active, past_due, canceled
  const subscriptionId = ref(null)
  const currentPeriodEnd = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const usage = ref({
    studentCount: 0,
    teacherCount: 1,
    gameUsage: 0
  })

  // Getters
  const planDetails = computed(() => {
    return SUBSCRIPTION_PLANS[currentPlan.value] || SUBSCRIPTION_PLANS.free
  })

  const isFreePlan = computed(() => {
    return currentPlan.value === 'free'
  })

  const isPaidPlan = computed(() => {
    return currentPlan.value !== 'free' && subscriptionStatus.value === 'active'
  })

  const isTrialExpired = computed(() => {
    if (!currentPeriodEnd.value) return false
    return new Date() > new Date(currentPeriodEnd.value)
  })

  const remainingDays = computed(() => {
    if (!currentPeriodEnd.value) return 0
    const now = new Date()
    const end = new Date(currentPeriodEnd.value)
    const diff = end - now
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const canAccessGame = computed(() => {
    return (gameId) => {
      // In development mode, allow all games for testing
      if (import.meta.env.DEV) {
        return true
      }
      
      const plan = planDetails.value
      if (plan.gameAccess === 'enterprise') return true
      if (plan.gameAccess === 'premium') return true
      if (plan.gameAccess === 'full') return true
      if (plan.gameAccess === 'basic') {
        return subscriptionService.isBasicGame(gameId)
      }
      return false
    }
  })

  const canAddStudent = computed(() => {
    // In development mode, allow unlimited students for testing
    if (import.meta.env.DEV) {
      return true
    }
    
    const plan = planDetails.value
    if (plan.maxStudents === -1) return true
    return usage.value.studentCount < plan.maxStudents
  })

  const canAddTeacher = computed(() => {
    // In development mode, allow unlimited teachers for testing
    if (import.meta.env.DEV) {
      return true
    }
    
    const plan = planDetails.value
    if (plan.maxTeachers === -1) return true
    return usage.value.teacherCount < plan.maxTeachers
  })

  // Actions
  const initialize = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    isLoading.value = true
    error.value = null

    try {
      await subscriptionService.initialize()
      await loadSubscriptionStatus()
      await loadUsageStats()
    } catch (err) {
      logger.error('Failed to initialize subscription:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const loadSubscriptionStatus = async () => {
    const authStore = useAuthStore()
    if (!authStore.currentUser?.id) return

    try {
      const status = await subscriptionService.getSubscriptionStatus(authStore.currentUser.id)
      
      currentPlan.value = status.planId || 'free'
      subscriptionStatus.value = status.status || 'inactive'
      subscriptionId.value = status.subscriptionId || null
      currentPeriodEnd.value = status.currentPeriodEnd || null

      logger.log('✅ Subscription status loaded:', status)
    } catch (err) {
      logger.error('Failed to load subscription status:', err)
      // フォールバック: フリープランとして扱う
      currentPlan.value = 'free'
      subscriptionStatus.value = 'inactive'
    }
  }

  const loadUsageStats = async () => {
    // Usage tracking will be implemented with billing API integration
    // 暫定的にダミーデータ
    usage.value = {
      studentCount: 5,
      teacherCount: 1,
      gameUsage: 25
    }
  }

  const subscribeToPlan = async (planId) => {
    const authStore = useAuthStore()
    if (!authStore.currentUser?.id) {
      throw new Error('認証が必要です')
    }

    if (planId === 'free') {
      throw new Error('フリープランへの切り替えは解約を使用してください')
    }

    isLoading.value = true
    error.value = null

    try {
      await subscriptionService.createCheckoutSession(
        planId,
        authStore.currentUser.id,
        authStore.currentSchoolId
      )
      // Stripe Checkoutにリダイレクトされるため、ここでは何もしない
    } catch (err) {
      logger.error('Failed to subscribe:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const changePlan = async (newPlanId) => {
    if (!subscriptionId.value) {
      throw new Error('アクティブなサブスクリプションがありません')
    }

    isLoading.value = true
    error.value = null

    try {
      await subscriptionService.changePlan(subscriptionId.value, newPlanId)
      await loadSubscriptionStatus() // 最新状態を再読み込み
    } catch (err) {
      logger.error('Failed to change plan:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const cancelSubscription = async () => {
    if (!subscriptionId.value) {
      throw new Error('アクティブなサブスクリプションがありません')
    }

    isLoading.value = true
    error.value = null

    try {
      await subscriptionService.cancelSubscription(subscriptionId.value)
      await loadSubscriptionStatus() // 最新状態を再読み込み
    } catch (err) {
      logger.error('Failed to cancel subscription:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const checkGameAccess = (gameId) => {
    // In development mode, allow all games for testing
    if (import.meta.env.DEV) {
      return { allowed: true }
    }
    
    if (isPaidPlan.value) return { allowed: true }
    
    const limits = subscriptionService.checkUsageLimits(
      currentPlan.value,
      { ...usage.value, requestedGame: gameId }
    )
    
    return limits
  }

  const checkFeatureAccess = (feature) => {
    // In development mode, allow all features for testing
    if (import.meta.env.DEV) {
      return true
    }
    
    const plan = planDetails.value
    
    const featureMap = {
      'teacher_dashboard': ['pro', 'enterprise'],
      'advanced_analytics': ['pro', 'enterprise'],
      'vr_access': ['pro', 'enterprise'], 
      'api_access': ['enterprise'],
      'custom_reports': ['pro', 'enterprise'],
      'phone_support': ['pro', 'enterprise'],
      'dedicated_support': ['enterprise'],
      'class_management': ['pro', 'enterprise'],
      'parent_portal': ['family', 'pro', 'enterprise'],
      'family_accounts': ['family', 'enterprise']
    }

    const requiredPlans = featureMap[feature]
    if (!requiredPlans) return true // 制限のない機能

    return requiredPlans.includes(currentPlan.value)
  }

  const updateUsage = (newUsage) => {
    usage.value = { ...usage.value, ...newUsage }
  }

  const clearError = () => {
    error.value = null
  }

  // ローカルストレージから復元（ページリロード対応）
  const savedSubscription = localStorage.getItem('subscription_data')
  if (savedSubscription) {
    try {
      const data = JSON.parse(savedSubscription)
      currentPlan.value = data.planId || 'free'
      subscriptionStatus.value = data.status || 'inactive'
      currentPeriodEnd.value = data.currentPeriodEnd || null
    } catch (err) {
      logger.warn('Failed to restore subscription data:', err)
    }
  }

  // 状態変更時にローカルストレージに保存
  const saveToStorage = () => {
    const data = {
      planId: currentPlan.value,
      status: subscriptionStatus.value,
      currentPeriodEnd: currentPeriodEnd.value
    }
    localStorage.setItem('subscription_data', JSON.stringify(data))
  }

  // watchers for storage - watch for changes and save to localStorage
  // Note: This will be set up when the store is used

  return {
    // State
    currentPlan,
    subscriptionStatus,
    subscriptionId,
    currentPeriodEnd,
    isLoading,
    error,
    usage,

    // Getters
    planDetails,
    isFreePlan,
    isPaidPlan,
    isTrialExpired,
    remainingDays,
    canAccessGame,
    canAddStudent,
    canAddTeacher,

    // Actions
    initialize,
    loadSubscriptionStatus,
    loadUsageStats,
    subscribeToPlan,
    changePlan,
    cancelSubscription,
    checkGameAccess,
    checkFeatureAccess,
    updateUsage,
    clearError
  }
})