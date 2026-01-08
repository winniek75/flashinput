<template>
  <div class="subscription-status">
    <!-- プラン表示バッジ -->
    <div 
      class="plan-badge" 
      :class="subscriptionStore.currentPlan"
      @click="showDetails = !showDetails"
    >
      <div class="plan-info">
        <span class="plan-name">{{ subscriptionStore.planDetails.name }}</span>
        <span v-if="!subscriptionStore.isFreePlan" class="plan-price">
          ¥{{ subscriptionStore.planDetails.price.toLocaleString() }}/月
        </span>
      </div>
      <i class="fas fa-chevron-down" :class="{ 'rotated': showDetails }"></i>
    </div>
    
    <!-- 使用制限警告 -->
    <div 
      v-if="hasWarnings" 
      class="warning-indicator"
      @click="showDetails = true"
      title="使用制限に近づいています"
    >
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    
    <!-- 詳細パネル -->
    <div v-if="showDetails" class="details-panel">
      <div class="panel-header">
        <h4>{{ subscriptionStore.planDetails.name }}プラン</h4>
        <button @click="showDetails = false" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- 使用状況表示 -->
      <div class="usage-stats">
        <div class="stat-item">
          <div class="stat-label">生徒数</div>
          <div class="stat-value" :class="getUsageClass('students')">
            {{ subscriptionStore.usage.studentCount }} / 
            {{ subscriptionStore.planDetails.maxStudents === -1 ? '無制限' : subscriptionStore.planDetails.maxStudents }}
          </div>
          <div v-if="subscriptionStore.planDetails.maxStudents !== -1" class="stat-bar">
            <div 
              class="stat-progress" 
              :class="getUsageClass('students')"
              :style="{ width: getUsagePercentage('students') + '%' }"
            ></div>
          </div>
        </div>
        
        <div v-if="subscriptionStore.planDetails.maxTeachers > 1" class="stat-item">
          <div class="stat-label">教師数</div>
          <div class="stat-value" :class="getUsageClass('teachers')">
            {{ subscriptionStore.usage.teacherCount }} / 
            {{ subscriptionStore.planDetails.maxTeachers === -1 ? '無制限' : subscriptionStore.planDetails.maxTeachers }}
          </div>
          <div v-if="subscriptionStore.planDetails.maxTeachers !== -1" class="stat-bar">
            <div 
              class="stat-progress" 
              :class="getUsageClass('teachers')"
              :style="{ width: getUsagePercentage('teachers') + '%' }"
            ></div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">アクセス可能ゲーム</div>
          <div class="stat-value">
            {{ getAccessibleGameCount() }} / {{ getTotalGameCount() }}
          </div>
        </div>
      </div>
      
      <!-- アクション -->
      <div class="panel-actions">
        <router-link to="/subscription" class="action-btn primary">
          <i class="fas fa-crown"></i>
          プラン管理
        </router-link>
        <button 
          v-if="canUpgrade"
          @click="quickUpgrade" 
          class="action-btn upgrade"
          :disabled="subscriptionStore.isLoading"
        >
          <i v-if="subscriptionStore.isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-arrow-up"></i>
          アップグレード
        </button>
      </div>
      
      <!-- 残り日数表示（有料プランの場合） -->
      <div v-if="!subscriptionStore.isFreePlan && subscriptionStore.remainingDays > 0" class="subscription-info">
        <div class="info-item">
          <i class="fas fa-calendar-alt"></i>
          <span>次回更新まで {{ subscriptionStore.remainingDays }} 日</span>
        </div>
      </div>
      
      <!-- 特典・機能リスト -->
      <div class="features-summary">
        <h5>このプランの特典</h5>
        <div class="features-list">
          <div 
            v-for="feature in subscriptionStore.planDetails.features.slice(0, 3)" 
            :key="feature"
            class="feature-item"
          >
            <i class="fas fa-check"></i>
            <span>{{ feature }}</span>
          </div>
          <div v-if="subscriptionStore.planDetails.features.length > 3" class="more-features">
            +{{ subscriptionStore.planDetails.features.length - 3 }}個の特典
          </div>
        </div>
      </div>
    </div>
    
    <!-- オーバーレイ -->
    <div v-if="showDetails" class="overlay" @click="showDetails = false"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useRouter } from 'vue-router'

export default {
  name: 'SubscriptionStatus',
  setup() {
    const router = useRouter()
    const subscriptionStore = useSubscriptionStore()
    const showDetails = ref(false)
    
    // 警告があるかチェック
    const hasWarnings = computed(() => {
      const plan = subscriptionStore.planDetails
      const usage = subscriptionStore.usage
      
      // 生徒数が80%を超えている場合
      if (plan.maxStudents !== -1 && usage.studentCount > plan.maxStudents * 0.8) {
        return true
      }
      
      // 教師数が上限に達している場合
      if (plan.maxTeachers !== -1 && usage.teacherCount >= plan.maxTeachers) {
        return true
      }
      
      return false
    })
    
    // アップグレード可能かチェック
    const canUpgrade = computed(() => {
      return subscriptionStore.currentPlan !== 'enterprise'
    })
    
    // 使用率のクラス決定
    const getUsageClass = (type) => {
      const percentage = getUsagePercentage(type)
      if (percentage >= 90) return 'critical'
      if (percentage >= 80) return 'warning'
      if (percentage >= 60) return 'caution'
      return 'normal'
    }
    
    // 使用率計算
    const getUsagePercentage = (type) => {
      const usage = subscriptionStore.usage
      const plan = subscriptionStore.planDetails
      
      if (type === 'students') {
        if (plan.maxStudents === -1) return 0
        return Math.min(100, (usage.studentCount / plan.maxStudents) * 100)
      } else if (type === 'teachers') {
        if (plan.maxTeachers === -1) return 0
        return Math.min(100, (usage.teacherCount / plan.maxTeachers) * 100)
      }
      return 0
    }
    
    // アクセス可能なゲーム数計算
    const getAccessibleGameCount = () => {
      const plan = subscriptionStore.planDetails
      if (plan.gameAccess === 'enterprise' || plan.gameAccess === 'premium' || plan.gameAccess === 'full') {
        return getTotalGameCount()
      } else if (plan.gameAccess === 'basic') {
        return 10 // 基本ゲーム数
      }
      return 0
    }
    
    // 総ゲーム数
    const getTotalGameCount = () => {
      return 48 // 現在の総ゲーム数
    }
    
    // クイックアップグレード
    const quickUpgrade = () => {
      let targetPlan = 'starter'
      
      if (subscriptionStore.currentPlan === 'starter') {
        targetPlan = 'pro'
      } else if (subscriptionStore.currentPlan === 'pro') {
        targetPlan = 'enterprise'
      }
      
      router.push(`/subscription?recommend=${targetPlan}`)
      showDetails.value = false
    }
    
    onMounted(async () => {
      await subscriptionStore.initialize()
    })
    
    return {
      subscriptionStore,
      showDetails,
      hasWarnings,
      canUpgrade,
      getUsageClass,
      getUsagePercentage,
      getAccessibleGameCount,
      getTotalGameCount,
      quickUpgrade
    }
  }
}
</script>

<style scoped>
.subscription-status {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plan-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: bold;
  border: 2px solid;
}

.plan-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.plan-badge.free {
  background: rgba(108, 117, 125, 0.1);
  border-color: #6c757d;
  color: #6c757d;
}

.plan-badge.starter {
  background: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
  color: #ffc107;
}

.plan-badge.pro {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.plan-badge.enterprise {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.plan-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.plan-name {
  font-size: 0.9rem;
}

.plan-price {
  font-size: 0.7rem;
  opacity: 0.8;
}

.plan-badge i {
  transition: transform 0.3s ease;
}

.plan-badge i.rotated {
  transform: rotate(180deg);
}

.warning-indicator {
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: pulse 2s infinite;
}

.warning-indicator i {
  color: #ffc107;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.details-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  color: #333;
  margin-top: 0.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 0.5rem;
}

.panel-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  font-size: 1.2rem;
  padding: 0.2rem;
}

.close-btn:hover {
  color: #333;
}

.usage-stats {
  margin-bottom: 1rem;
}

.stat-item {
  margin-bottom: 1rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.2rem;
}

.stat-value {
  font-weight: bold;
  font-size: 0.9rem;
}

.stat-value.normal { color: #28a745; }
.stat-value.caution { color: #ffc107; }
.stat-value.warning { color: #fd7e14; }
.stat-value.critical { color: #dc3545; }

.stat-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  margin-top: 0.3rem;
  overflow: hidden;
}

.stat-progress {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.stat-progress.normal { background: #28a745; }
.stat-progress.caution { background: #ffc107; }
.stat-progress.warning { background: #fd7e14; }
.stat-progress.critical { background: #dc3545; }

.panel-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.upgrade {
  background: #ffc107;
  color: #333;
}

.action-btn.upgrade:hover {
  background: #e0a800;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.subscription-info {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #3b82f6;
}

.features-summary h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: bold;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.feature-item i {
  color: #28a745;
  font-size: 0.7rem;
}

.more-features {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
  margin-top: 0.2rem;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .details-panel {
    width: 300px;
    right: -50px;
  }
  
  .plan-info {
    display: none;
  }
  
  .plan-badge {
    width: 40px;
    height: 40px;
    justify-content: center;
    border-radius: 50%;
    padding: 0;
  }
}
</style>