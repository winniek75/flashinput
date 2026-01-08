<template>
  <div class="quest-mini-display" @click="toggleExpanded">
    <!-- コンパクト表示 -->
    <div class="mini-content" v-if="!isExpanded">
      <div class="quest-summary">
        <span class="quest-icon">🎯</span>
        <div class="progress-info">
          <div class="progress-text">{{ questProgress.completed }}/{{ questProgress.total }}</div>
          <div class="progress-bar-tiny">
            <div
              class="progress-fill-tiny"
              :style="{ width: questProgress.percentage + '%' }"
            ></div>
          </div>
        </div>
        <span class="expand-arrow">▼</span>
      </div>
    </div>

    <!-- 展開表示 -->
    <div class="expanded-content" v-if="isExpanded">
      <div class="expanded-header">
        <h4>今日のクエスト</h4>
        <button class="close-btn" @click.stop="isExpanded = false">×</button>
      </div>

      <div class="quick-quest-list">
        <div
          v-for="quest in visibleQuests"
          :key="quest.id"
          class="quick-quest-item"
          :class="{ completed: quest.completed }"
        >
          <span class="quest-emoji">{{ quest.icon }}</span>
          <div class="quest-info">
            <div class="quest-title-mini">{{ formatQuestTitle(quest) }}</div>
            <div class="quest-progress-mini">
              <div class="progress-bar-mini">
                <div
                  class="progress-fill-mini"
                  :style="{ width: (quest.progress / quest.target * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-numbers-mini">
                {{ Math.min(quest.progress, quest.target) }}/{{ quest.target }}
              </span>
            </div>
          </div>
          <div class="quest-status-mini">
            <span v-if="quest.completed" class="completed-check">✓</span>
            <span v-else class="in-progress-dot"></span>
          </div>
        </div>
      </div>

      <div class="mini-actions" v-if="hasUnclaimedRewards">
        <button @click.stop="claimAllRewards" class="mini-claim-btn">
          🎁 報酬受取
        </button>
      </div>
    </div>

    <!-- ホバー時のツールチップ -->
    <div class="tooltip" v-if="!isExpanded">
      クリックでクエスト詳細を表示
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuestStore } from '@/stores/questStore'

const questStore = useQuestStore()

// Props
const props = defineProps({
  maxVisibleQuests: {
    type: Number,
    default: 3
  }
})

// UI状態
const isExpanded = ref(false)

// 計算プロパティ
const questProgress = computed(() => questStore.todayProgress)
const dailyQuests = computed(() => questStore.dailyQuests)

const visibleQuests = computed(() => {
  return dailyQuests.value.slice(0, props.maxVisibleQuests)
})

const hasUnclaimedRewards = computed(() => {
  return dailyQuests.value.some(q => q.completed && !q.rewardClaimed)
})

// メソッド
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const formatQuestTitle = (quest) => {
  return quest.title.replace('{count}', quest.target)
}

const claimAllRewards = () => {
  questStore.claimAllRewards()
}
</script>

<style scoped>
.quest-mini-display {
  position: relative;
  background: rgba(45, 55, 72, 0.95);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.quest-mini-display:hover {
  background: rgba(45, 55, 72, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* コンパクト表示 */
.mini-content {
  padding: 0.75rem 1rem;
}

.quest-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quest-icon {
  font-size: 1.2rem;
}

.progress-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-text {
  font-weight: bold;
  font-size: 0.9rem;
}

.progress-bar-tiny {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-tiny {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

.expand-arrow {
  font-size: 0.8rem;
  opacity: 0.7;
  transition: transform 0.3s ease;
}

.quest-mini-display:hover .expand-arrow {
  transform: translateY(2px);
}

/* 展開表示 */
.expanded-content {
  padding: 1rem;
  min-width: 280px;
}

.expanded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.expanded-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* クイッククエストリスト */
.quick-quest-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-quest-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.quick-quest-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.quick-quest-item.completed {
  background: rgba(72, 187, 120, 0.2);
}

.quest-emoji {
  font-size: 1.1rem;
}

.quest-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quest-title-mini {
  font-weight: 600;
  font-size: 0.85rem;
  line-height: 1.2;
}

.quest-progress-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar-mini {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

.progress-numbers-mini {
  font-size: 0.75rem;
  font-weight: bold;
  opacity: 0.8;
  min-width: 30px;
}

.quest-status-mini {
  display: flex;
  align-items: center;
}

.completed-check {
  color: #48bb78;
  font-weight: bold;
  font-size: 1.1rem;
}

.in-progress-dot {
  width: 8px;
  height: 8px;
  background: #ed8936;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ミニアクション */
.mini-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-claim-btn {
  width: 100%;
  background: linear-gradient(135deg, #f6ad55, #ed8936);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.mini-claim-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 173, 85, 0.3);
}

/* ツールチップ */
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  margin-bottom: 0.25rem;
}

.quest-mini-display:hover .tooltip {
  opacity: 1;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

/* レスポンシブ */
@media (max-width: 480px) {
  .expanded-content {
    min-width: 240px;
  }

  .quest-title-mini {
    font-size: 0.8rem;
  }

  .progress-numbers-mini {
    font-size: 0.7rem;
  }
}
</style>