<template>
  <div class="unified-level-display">
    <!-- メインレベル表示 -->
    <div class="main-level-card">
      <div class="level-header">
        <div class="level-number">
          <span class="level-text">Lv.</span>
          <span class="level-value">{{ playerData?.unifiedLevel || 1 }}</span>
        </div>
        <div class="eiken-info">
          <div class="eiken-level">{{ playerData?.eikenLevel || '英検5級準備' }}</div>
          <div class="eiken-grade">{{ playerData?.eikenGrade || '小学1-2年' }}</div>
        </div>
      </div>
      
      <!-- 経験値バー -->
      <div class="exp-bar-container">
        <div class="exp-bar">
          <div 
            class="exp-fill" 
            :style="{ width: progressToNextLevel + '%' }"
          ></div>
        </div>
        <div class="exp-text">
          {{ Math.round(progressToNextLevel) }}% to Level {{ (playerData?.unifiedLevel || 1) + 1 }}
        </div>
      </div>
    </div>

    <!-- スキル別レベル表示 -->
    <div class="skill-levels">
      <div class="skill-item" v-for="(level, skill) in safeSkillLevels" :key="skill">
        <div class="skill-icon">
          {{ getSkillIcon(skill) }}
        </div>
        <div class="skill-info">
          <div class="skill-name">{{ getSkillName(skill) }}</div>
          <div class="skill-level">Lv.{{ level }}</div>
          <div class="skill-progress">
            <div 
              class="skill-progress-bar"
              :style="{ width: level + '%' }"
              :class="getSkillClass(skill)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 推奨ゲーム -->
    <div class="recommended-games" v-if="recommendedGames.length > 0">
      <h3>🎯 レベルアップのおすすめ</h3>
      <div class="game-recommendations">
        <div 
          v-for="game in recommendedGames" 
          :key="game"
          class="game-recommendation"
          @click="$emit('play-game', game)"
        >
          <div class="game-icon">🎮</div>
          <div class="game-name">{{ game }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()
const playerData = computed(() => gameStore.playerData)

// 安全なスキルレベル取得
const safeSkillLevels = computed(() => {
  const skillLevels = playerData.value?.skillLevels
  if (!skillLevels) {
    return {
      phonics: 1,
      vocabulary: 1,
      grammar: 1,
      communication: 1
    }
  }
  return skillLevels
})

// 次のレベルまでの進捗計算
const progressToNextLevel = computed(() => {
  const currentLevel = playerData.value?.unifiedLevel || 1
  const skills = safeSkillLevels.value
  
  // 現在のスキル合計
  const currentSkillSum = Object.values(skills).reduce((sum, level) => sum + level, 0)
  
  // 次のレベルに必要なスキル合計（重み付き）
  const nextLevelRequired = (currentLevel + 1) * 4 // 4つのスキル × レベル
  
  return Math.min(100, (currentSkillSum / nextLevelRequired) * 100)
})

// 推奨ゲーム
const recommendedGames = computed(() => {
  const skills = safeSkillLevels.value
  const lowestSkill = Object.entries(skills).reduce((a, b) => 
    skills[a[0]] < skills[b[0]] ? a : b
  )
  
  const gameMap = {
    phonics: ['Pure Sound Lab', 'Phonics Training Hub'],
    vocabulary: ['Word Rush', 'Cosmic Word Factory'],
    grammar: ['Grammar Color Code', 'Pattern Hunter'],
    communication: ['CV Pronunciation Trainer', 'Rhythm Phonics Dance']
  }
  
  return gameMap[lowestSkill[0]] || []
})

// スキルアイコン
const getSkillIcon = (skill) => {
  const icons = {
    phonics: '🔤',
    vocabulary: '📚',
    grammar: '⚙️',
    communication: '💬'
  }
  return icons[skill] || '🎯'
}

// スキル名
const getSkillName = (skill) => {
  const names = {
    phonics: 'フォニックス',
    vocabulary: '語彙力',
    grammar: '文法力',
    communication: '会話力'
  }
  return names[skill] || skill
}

// スキルクラス
const getSkillClass = (skill) => {
  return `skill-${skill}`
}

// イベント定義
defineEmits(['play-game'])
</script>

<style scoped>
.unified-level-display {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.main-level-card {
  background: rgba(255,255,255,0.15);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.level-number {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.level-text {
  font-size: 18px;
  opacity: 0.8;
}

.level-value {
  font-size: 48px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.eiken-info {
  text-align: right;
}

.eiken-level {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.eiken-grade {
  font-size: 14px;
  opacity: 0.8;
}

.exp-bar-container {
  margin-top: 15px;
}

.exp-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.5s ease;
}

.exp-text {
  text-align: center;
  font-size: 12px;
  opacity: 0.9;
}

.skill-levels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.skill-item {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 14px;
  margin-bottom: 4px;
  opacity: 0.9;
}

.skill-level {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
}

.skill-progress {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
}

.skill-progress-bar {
  height: 100%;
  transition: width 0.5s ease;
}

.skill-phonics { background: #ff6b6b; }
.skill-vocabulary { background: #4ecdc4; }
.skill-grammar { background: #45b7d1; }
.skill-communication { background: #f9ca24; }

.unlocked-content, .recommended-games, .level-history {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.unlocked-content h3, .recommended-games h3, .level-history h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.content-tag {
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.game-recommendations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.game-recommendation {
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-recommendation:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
}

.game-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.game-name {
  font-size: 12px;
  font-weight: bold;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
}

.history-rewards {
  font-weight: bold;
}

@media (max-width: 768px) {
  .unified-level-display {
    padding: 15px;
  }
  
  .level-header {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .skill-levels {
    grid-template-columns: 1fr;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>