<template>
  <div class="game-access-guard">
    <!-- ゲームアクセス可能な場合はそのまま表示 -->
    <slot v-if="accessCheck.allowed" />
    
    <!-- アクセス制限がある場合はロック画面表示 -->
    <div v-else class="access-denied-overlay">
      <div class="lock-screen">
        <!-- 背景エフェクト -->
        <div class="lock-background">
          <div class="stars"></div>
          <div class="lock-icon">🔒</div>
        </div>
        
        <!-- ロック内容 -->
        <div class="lock-content">
          <h2 class="lock-title">{{ gameTitle }} はロック中です</h2>
          
          <div class="restriction-info">
            <div class="restriction-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <p class="restriction-message">{{ accessCheck.reason }}</p>
          </div>
          
          <!-- 現在のプラン情報 -->
          <div class="current-plan-info">
            <div class="plan-badge" :class="subscriptionStore.currentPlan">
              {{ subscriptionStore.planDetails.name }}プラン
            </div>
            <div class="plan-limits">
              <div class="limit-item">
                <span class="limit-label">生徒数:</span>
                <span class="limit-value">
                  {{ subscriptionStore.usage.studentCount }} / 
                  {{ subscriptionStore.planDetails.maxStudents === -1 ? '無制限' : subscriptionStore.planDetails.maxStudents }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- アクション選択 -->
          <div class="unlock-actions">
            <!-- 推奨プランへのアップグレード -->
            <div class="recommended-plan" v-if="recommendedPlan">
              <h3>推奨プラン</h3>
              <div class="plan-card recommended">
                <div class="plan-header">
                  <h4>{{ recommendedPlan.name }}</h4>
                  <div class="plan-price">
                    <span v-if="recommendedPlan.price === 0">無料</span>
                    <span v-else>¥{{ recommendedPlan.price.toLocaleString() }}/月</span>
                  </div>
                </div>
                <div class="plan-features">
                  <div v-for="feature in recommendedPlan.features.slice(0, 3)" :key="feature" class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>{{ feature }}</span>
                  </div>
                </div>
                <button 
                  @click="upgradeToRecommendedPlan"
                  class="upgrade-btn"
                  :disabled="subscriptionStore.isLoading"
                >
                  <i v-if="subscriptionStore.isLoading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-rocket"></i>
                  このプランにアップグレード
                </button>
              </div>
            </div>
            
            <!-- 全プラン表示ボタン -->
            <div class="action-buttons">
              <button @click="goToSubscriptionPage" class="btn btn-primary">
                <i class="fas fa-crown"></i>
                全プランを見る
              </button>
              <button @click="goBack" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i>
                戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { SUBSCRIPTION_PLANS } from '@/services/subscriptionService'

export default {
  name: 'GameAccessGuard',
  props: {
    gameId: {
      type: String,
      required: true
    },
    gameTitle: {
      type: String,
      default: 'このゲーム'
    }
  },
  setup(props) {
    const router = useRouter()
    const subscriptionStore = useSubscriptionStore()
    
    // アクセス制御チェック
    const accessCheck = computed(() => {
      try {
        const result = subscriptionStore.checkGameAccess(props.gameId)
        // 結果が正しい形式でない場合のフォールバック
        if (!result || typeof result.allowed === 'undefined') {
          logger.warn('GameAccessGuard: Invalid access check result for', props.gameId, result)
          return { 
            allowed: true, // 開発環境では許可
            reason: 'アクセスチェックエラー' 
          }
        }
        return result
      } catch (error) {
        logger.error('GameAccessGuard: Error checking game access:', error)
        return { 
          allowed: true, // エラー時は許可（開発環境）
          reason: 'アクセスチェックでエラーが発生しました' 
        }
      }
    })
    
    // 推奨プラン算出
    const recommendedPlan = computed(() => {
      if (accessCheck.value.allowed) return null
      
      // 制限タイプに応じて推奨プランを決定
      if (accessCheck.value.limit === 'games') {
        return SUBSCRIPTION_PLANS.starter // ゲーム制限 → スターター
      } else if (accessCheck.value.limit === 'students') {
        if (subscriptionStore.usage.studentCount > 30) {
          return SUBSCRIPTION_PLANS.pro // 30名超過 → プロ
        } else {
          return SUBSCRIPTION_PLANS.starter // 30名以下 → スターター
        }
      } else if (accessCheck.value.limit === 'teachers') {
        return SUBSCRIPTION_PLANS.pro // 教師制限 → プロ
      }
      
      return SUBSCRIPTION_PLANS.starter // デフォルト
    })
    
    // 推奨プランへのアップグレード
    const upgradeToRecommendedPlan = async () => {
      if (!recommendedPlan.value) return
      
      try {
        await subscriptionStore.subscribeToPlan(recommendedPlan.value.id)
      } catch (error) {
        alert(`アップグレードに失敗しました: ${error.message}`)
      }
    }
    
    // サブスクリプションページに移動
    const goToSubscriptionPage = () => {
      router.push('/subscription')
    }
    
    // 前のページに戻る
    const goBack = () => {
      router.back()
    }
    
    return {
      subscriptionStore,
      accessCheck,
      recommendedPlan,
      upgradeToRecommendedPlan,
      goToSubscriptionPage,
      goBack
    }
  }
}
</script>

<style scoped>
.game-access-guard {
  min-height: 100vh;
}

.access-denied-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lock-screen {
  max-width: 600px;
  width: 90%;
  position: relative;
}

.lock-background {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100px;
  background: radial-gradient(2px 2px at 40px 60px, #fff, transparent),
              radial-gradient(2px 2px at 20px 50px, #fff, transparent),
              radial-gradient(2px 2px at 30px 100px, #fff, transparent);
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.lock-icon {
  font-size: 4rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.lock-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.lock-title {
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.restriction-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.restriction-icon {
  color: #ffc107;
  font-size: 1.5rem;
}

.restriction-message {
  color: white;
  margin: 0;
  font-size: 1rem;
}

.current-plan-info {
  margin-bottom: 2rem;
  text-align: center;
}

.plan-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 1rem;
}

.plan-badge.free {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid #6c757d;
}

.plan-badge.starter {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.plan-limits {
  color: #d1d5db;
  font-size: 0.9rem;
}

.limit-item {
  margin-bottom: 0.5rem;
}

.limit-label {
  color: #9ca3af;
}

.limit-value {
  color: white;
  font-weight: bold;
}

.unlock-actions {
  space-y: 2rem;
}

.recommended-plan {
  margin-bottom: 2rem;
}

.recommended-plan h3 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.plan-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.plan-card.recommended {
  border-color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
}

.plan-header {
  text-align: center;
  margin-bottom: 1rem;
}

.plan-header h4 {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.plan-price {
  color: #ffc107;
  font-size: 1.5rem;
  font-weight: bold;
}

.plan-features {
  margin-bottom: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.feature-item i {
  color: #10b981;
}

.upgrade-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #ffc107, #ff8f00);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.upgrade-btn:hover {
  background: linear-gradient(45deg, #ff8f00, #f57c00);
  transform: translateY(-2px);
}

.upgrade-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.btn-primary {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #2563eb, #1e40af);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .lock-content {
    padding: 1.5rem;
  }
  
  .lock-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    min-width: auto;
  }
}
</style>