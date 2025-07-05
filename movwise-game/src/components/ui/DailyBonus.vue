<template>
  <transition name="modal">
    <div v-if="isVisible" class="daily-bonus-overlay" @click.self="close">
      <div class="bonus-container">
        <!-- 花火エフェクト -->
        <div class="fireworks">
          <div v-for="i in 6" :key="i" class="firework" :class="`firework-${i}`"></div>
        </div>
        
        <!-- ボーナスコンテンツ -->
        <div class="bonus-content">
          <h2 class="bonus-title">
            <span class="title-icon">🎁</span>
            デイリーボーナス
          </h2>
          
          <div class="streak-info">
            <span class="streak-icon">🔥</span>
            <span class="streak-text">{{ loginStreak }}日連続ログイン！</span>
          </div>
          
          <!-- 今日の報酬 -->
          <div class="today-reward">
            <div class="reward-box">
              <div class="reward-icon">{{ todayReward.icon }}</div>
              <div class="reward-amount">+{{ todayReward.amount }}</div>
              <div class="reward-type">{{ todayReward.type }}</div>
            </div>
            
            <div v-if="bonusMultiplier > 1" class="multiplier-badge">
              <span>×{{ bonusMultiplier }} ボーナス！</span>
            </div>
          </div>
          
          <!-- 週間カレンダー -->
          <div class="weekly-calendar">
            <h3 class="calendar-title">今週の報酬</h3>
            <div class="calendar-grid">
              <div
                v-for="(day, index) in weeklyRewards"
                :key="index"
                class="calendar-day"
                :class="{
                  'day-claimed': day.claimed,
                  'day-today': day.isToday,
                  'day-future': day.isFuture
                }"
              >
                <div class="day-number">Day {{ index + 1 }}</div>
                <div class="day-icon">{{ day.icon }}</div>
                <div class="day-amount">{{ day.amount }}</div>
                <div v-if="day.claimed" class="claimed-mark">✓</div>
              </div>
            </div>
          </div>
          
          <!-- 特別ボーナス -->
          <div v-if="showSpecialBonus" class="special-bonus">
            <div class="special-icon">🌟</div>
            <div class="special-text">
              7日連続ログインで特別報酬ゲット！
              <div class="special-reward">
                <span class="reward-icon">🎯</span>
                <span>新しいキャラクターアンロック！</span>
              </div>
            </div>
          </div>
          
          <!-- ミニゲーム -->
          <div v-if="showMiniGame" class="mini-game">
            <h3 class="mini-game-title">ボーナスチャンス！</h3>
            <div class="treasure-boxes">
              <div
                v-for="i in 3"
                :key="i"
                class="treasure-box"
                :class="{ 'box-selected': selectedBox === i, 'box-opened': openedBox === i }"
                @click="selectTreasureBox(i)"
              >
                <span v-if="openedBox !== i">📦</span>
                <span v-else>{{ miniGameReward }}</span>
              </div>
            </div>
            <p v-if="!selectedBox" class="mini-game-hint">宝箱を1つ選んでね！</p>
          </div>
          
          <!-- 受け取りボタン -->
          <button
            @click="claimReward"
            class="claim-button"
            :disabled="claimed"
          >
            <span v-if="!claimed">報酬を受け取る</span>
            <span v-else>受け取り済み ✓</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useCharacterStore } from '@/stores/characterStore'

export default {
  name: 'DailyBonus',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'claim'],
  setup(_, { emit }) {
    const gameStore = useGameStore()
    const characterStore = useCharacterStore()
    
    const claimed = ref(false)
    const selectedBox = ref(null)
    const openedBox = ref(null)
    const miniGameReward = ref('')
    
    // ログインストリーク
    const loginStreak = computed(() => gameStore.playerStreak)
    
    // ボーナス倍率（連続ログインに応じて）
    const bonusMultiplier = computed(() => {
      const streak = loginStreak.value
      if (streak >= 7) return 3
      if (streak >= 3) return 2
      return 1
    })
    
    // 今日の報酬
    const todayReward = computed(() => {
      const baseRewards = [
        { icon: '💎', amount: 50, type: 'サウンドジェム' },
        { icon: '⚡', amount: 100, type: 'コズミックエネルギー' },
        { icon: '🎵', amount: 1, type: '音素妖精' },
        { icon: '🎯', amount: 200, type: '経験値' },
        { icon: '🌟', amount: 75, type: 'スターポイント' },
        { icon: '🚀', amount: 150, type: 'ロケット燃料' },
        { icon: '💫', amount: 100, type: '魔法の粉' }
      ]
      
      const dayIndex = (loginStreak.value - 1) % 7
      const reward = { ...baseRewards[dayIndex] }
      reward.amount = reward.amount * bonusMultiplier.value
      
      return reward
    })
    
    // 週間報酬カレンダー
    const weeklyRewards = computed(() => {
      const rewards = [
        { icon: '💎', amount: '50' },
        { icon: '⚡', amount: '100' },
        { icon: '🎵', amount: '×1' },
        { icon: '🎯', amount: '200' },
        { icon: '🌟', amount: '75' },
        { icon: '🚀', amount: '150' },
        { icon: '🎁', amount: '???' }
      ]
      
      const currentDay = (loginStreak.value - 1) % 7
      
      return rewards.map((reward, index) => ({
        ...reward,
        claimed: index < currentDay,
        isToday: index === currentDay,
        isFuture: index > currentDay
      }))
    })
    
    // 特別ボーナス表示
    const showSpecialBonus = computed(() => loginStreak.value % 7 === 0)
    
    // ミニゲーム表示
    const showMiniGame = computed(() => loginStreak.value >= 3 && !claimed.value)
    
    // 宝箱選択
    const selectTreasureBox = (boxNumber) => {
      if (selectedBox.value || claimed.value) return
      
      selectedBox.value = boxNumber
      openedBox.value = boxNumber
      
      // ランダムな追加報酬
      const extraRewards = ['💎×25', '⚡×50', '🎵×1', '🌟×30']
      miniGameReward.value = extraRewards[Math.floor(Math.random() * extraRewards.length)]
    }
    
    // 報酬受け取り
    const claimReward = () => {
      if (claimed.value) return
      
      claimed.value = true
      
      // 報酬を付与
      const reward = todayReward.value
      switch (reward.type) {
        case 'サウンドジェム':
          gameStore.updatePlayerData({ 
            soundGems: gameStore.playerSoundGems + reward.amount 
          })
          break
        case 'コズミックエネルギー':
          gameStore.updatePlayerData({ 
            cosmicEnergy: gameStore.playerExp + reward.amount 
          })
          break
        case '音素妖精':
          // ランダムな音素を解放
          const phonemes = Object.keys(characterStore.phonemeSprites)
          const lockedPhonemes = phonemes.filter(p => !characterStore.phonemeSprites[p].unlocked)
          if (lockedPhonemes.length > 0) {
            const randomPhoneme = lockedPhonemes[Math.floor(Math.random() * lockedPhonemes.length)]
            characterStore.collectPhonemeSprite(randomPhoneme)
          }
          break
      }
      
      // ミニゲームの追加報酬も付与
      if (miniGameReward.value) {
        const [type, amount] = miniGameReward.value.split('×')
        const numAmount = parseInt(amount)
        
        switch (type) {
          case '💎':
            gameStore.updatePlayerData({ 
              soundGems: gameStore.playerSoundGems + numAmount 
            })
            break
          case '⚡':
            gameStore.updatePlayerData({ 
              cosmicEnergy: gameStore.playerExp + numAmount 
            })
            break
          case '🌟':
            gameStore.updatePlayerData({ 
              explorationPoints: (gameStore.spaceshipStatus.explorationPoints || 0) + numAmount 
            })
            break
        }
      }
      
      emit('claim', {
        reward: todayReward.value,
        extraReward: miniGameReward.value,
        streak: loginStreak.value
      })
      
      // 2秒後に自動的に閉じる
      setTimeout(() => {
        close()
      }, 2000)
    }
    
    const close = () => {
      emit('close')
    }
    
    return {
      claimed,
      loginStreak,
      bonusMultiplier,
      todayReward,
      weeklyRewards,
      showSpecialBonus,
      showMiniGame,
      selectedBox,
      openedBox,
      miniGameReward,
      selectTreasureBox,
      claimReward,
      close
    }
  }
}
</script>

<style scoped>
.daily-bonus-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.bonus-container {
  position: relative;
  width: 90%;
  max-width: 500px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
  overflow: hidden;
}

.fireworks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.firework {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffd700;
  border-radius: 50%;
  animation: firework-burst 1.5s ease-out forwards;
}

.firework-1 { top: 20%; left: 20%; animation-delay: 0s; }
.firework-2 { top: 30%; left: 80%; animation-delay: 0.2s; }
.firework-3 { top: 70%; left: 30%; animation-delay: 0.4s; }
.firework-4 { top: 80%; left: 70%; animation-delay: 0.6s; }
.firework-5 { top: 50%; left: 50%; animation-delay: 0.8s; }
.firework-6 { top: 10%; left: 60%; animation-delay: 1s; }

@keyframes firework-burst {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(20);
    opacity: 0.8;
  }
  100% {
    transform: scale(40);
    opacity: 0;
  }
}

.bonus-content {
  position: relative;
  z-index: 1;
  color: white;
}

.bonus-title {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 40px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.streak-info {
  text-align: center;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  color: #fbbf24;
}

.streak-icon {
  font-size: 24px;
  animation: flame 1s ease-in-out infinite;
}

@keyframes flame {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.today-reward {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
}

.reward-box {
  display: inline-block;
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid #ffd700;
  border-radius: 16px;
  padding: 24px 48px;
  position: relative;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
}

.reward-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.reward-amount {
  font-size: 36px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 4px;
}

.reward-type {
  font-size: 16px;
  color: #94a3b8;
}

.multiplier-badge {
  position: absolute;
  top: -10px;
  right: 50%;
  transform: translateX(50%);
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translateX(50%) scale(1); }
  50% { transform: translateX(50%) scale(1.05); }
}

.weekly-calendar {
  margin-bottom: 24px;
}

.calendar-title {
  text-align: center;
  font-size: 18px;
  margin-bottom: 16px;
  color: #e2e8f0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.day-claimed {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
}

.day-today {
  background: rgba(255, 215, 0, 0.2);
  border-color: #ffd700;
  animation: today-pulse 2s ease-in-out infinite;
}

@keyframes today-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.day-future {
  opacity: 0.5;
}

.day-number {
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.day-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.day-amount {
  font-size: 12px;
  color: #e2e8f0;
}

.claimed-mark {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.special-bonus {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(219, 39, 119, 0.2));
  border: 1px solid rgba(147, 51, 234, 0.5);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.special-icon {
  font-size: 48px;
  margin-bottom: 8px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
}

.special-text {
  font-size: 16px;
  color: #e2e8f0;
}

.special-reward {
  margin-top: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #fbbf24;
}

.mini-game {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.mini-game-title {
  text-align: center;
  font-size: 16px;
  margin-bottom: 16px;
  color: #e2e8f0;
}

.treasure-boxes {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.treasure-box {
  font-size: 48px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.treasure-box:not(.box-opened):hover {
  transform: translateY(-5px) scale(1.1);
}

.box-selected {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.box-opened {
  animation: open-box 0.5s ease-out forwards;
}

@keyframes open-box {
  0% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}

.mini-game-hint {
  text-align: center;
  font-size: 14px;
  color: #94a3b8;
}

.claim-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 12px;
  color: #1f2937;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.claim-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4);
}

.claim-button:disabled {
  background: #22c55e;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bonus-container,
.modal-leave-to .bonus-container {
  transform: scale(0.8);
}
</style>