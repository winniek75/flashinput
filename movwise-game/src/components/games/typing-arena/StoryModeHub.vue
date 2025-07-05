<template>
  <div class="story-mode-hub">
    <h1 class="text-4xl font-bold galaxy-text-primary mb-8 text-center cosmic-glow">
      🌌 銀河英語救出作戦
    </h1>

    <!-- Chapter Selection -->
    <div class="chapters-container mb-8">
      <div class="chapter-map">
        <div 
          v-for="(chapter, index) in chapters" 
          :key="chapter.id"
          class="chapter-node"
          :class="{
            'unlocked': chapter.unlocked,
            'completed': chapter.completed,
            'current': arenaStore.storyMode.currentChapter === index + 1
          }"
          @click="selectChapter(index + 1)"
        >
          <div class="chapter-icon">{{ getChapterIcon(index + 1) }}</div>
          <div class="chapter-info">
            <h3 class="text-lg font-bold">Chapter {{ index + 1 }}</h3>
            <p class="text-sm">{{ chapter.name }}</p>
          </div>
          <div v-if="!chapter.unlocked" class="lock-overlay">
            <span class="text-2xl">🔒</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Chapter Details -->
    <div v-if="selectedChapter" class="galaxy-card rounded-3xl p-8 shadow-2xl mb-6">
      <div class="chapter-header mb-6">
        <h2 class="text-3xl font-bold text-white mb-2">
          Chapter {{ selectedChapterIndex }}: {{ selectedChapter.name }}
        </h2>
        <p class="text-lg text-slate-200">{{ selectedChapter.description }}</p>
      </div>

      <!-- Stage Grid -->
      <div class="stage-grid mb-6">
        <div 
          v-for="stage in selectedChapterStages" 
          :key="stage.id"
          @click="selectStage(stage)"
          class="stage-card"
          :class="{
            'completed': stage.completed,
            'unlocked': stage.unlocked,
            'boss': stage.type === 'boss'
          }"
        >
          <div class="stage-number">{{ stage.number }}</div>
          <div class="stage-name">{{ stage.name }}</div>
          <div class="stage-stars">
            <span v-for="i in 3" :key="i" 
                  :class="{'earned': stage.stars >= i}">⭐</span>
          </div>
          <div v-if="!stage.unlocked" class="stage-lock">🔒</div>
        </div>
      </div>

      <!-- Boss Info -->
      <div v-if="selectedChapterBoss" class="boss-preview">
        <h3 class="text-2xl font-bold text-red-400 mb-4">👹 ボスバトル</h3>
        <div class="boss-card p-6 rounded-2xl">
          <div class="boss-icon text-6xl mb-4">{{ selectedChapterBoss.icon }}</div>
          <h4 class="text-xl font-bold text-white mb-2">{{ selectedChapterBoss.name }}</h4>
          <p class="text-slate-200 mb-4">{{ selectedChapterBoss.description }}</p>
          <div class="boss-requirements">
            <p class="text-sm text-yellow-400">挑戦条件:</p>
            <ul class="text-sm text-slate-300">
              <li>• ステージ80%以上クリア</li>
              <li>• WPM {{ selectedChapterBoss.requiredWPM }}以上</li>
              <li>• 正確率 {{ selectedChapterBoss.requiredAccuracy }}%以上</li>
            </ul>
          </div>
          <div v-if="selectedChapterBoss.defeated" class="mt-4">
            <p class="text-green-400 font-bold">✅ 撃破済み</p>
            <p class="text-sm text-slate-300">最速記録: {{ formatTime(selectedChapterBoss.bestTime) }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mt-8 flex gap-4 justify-center">
        <button
          v-if="selectedStage"
          @click="startStage"
          :disabled="!selectedStage.unlocked"
          class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedStage.unlocked }"
        >
          {{ selectedStage.type === 'boss' ? 'ボスに挑戦！' : 'ステージ開始！' }}
        </button>
        <button
          @click="$emit('back')"
          class="galaxy-button galaxy-button-secondary px-6 py-4 rounded-2xl font-bold text-xl"
        >
          モード選択に戻る
        </button>
      </div>
    </div>

    <!-- Character & Pet Status -->
    <div class="status-row grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Character Quick View -->
      <div class="galaxy-card rounded-2xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">🌟 キャラクター状態</h3>
        <div class="character-quick-stats">
          <div class="stat-row">
            <span class="stat-name">レベル:</span>
            <span class="stat-value">{{ arenaStore.character.level }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">称号:</span>
            <span class="stat-value text-yellow-400">{{ arenaStore.character.title }}</span>
          </div>
          <div class="exp-bar-mini">
            <div class="exp-fill-mini" 
                 :style="{width: getExpPercentage() + '%'}"></div>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            EXP: {{ arenaStore.character.experience }}/{{ arenaStore.character.nextLevelExp }}
          </p>
        </div>
      </div>

      <!-- Pet Quick View -->
      <div class="galaxy-card rounded-2xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">🐦 ペット状態</h3>
        <div class="pet-quick-stats">
          <div class="pet-avatar-small">
            <img :src="getPetImage()" :alt="currentPet.name" class="w-16 h-16">
          </div>
          <div class="pet-info">
            <p class="font-bold text-white">{{ currentPet.name }}</p>
            <p class="text-sm text-slate-300">Lv.{{ currentPet.level }}</p>
            <div class="affection-bar-mini">
              <div class="affection-fill-mini" 
                   :style="{width: getAffectionPercentage() + '%'}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTypingArenaStore } from '@/stores/typingArenaStore'

const emit = defineEmits(['start-stage', 'back'])

const arenaStore = useTypingArenaStore()

const selectedChapterIndex = ref(arenaStore.storyMode.currentChapter)
const selectedStage = ref(null)

const chapters = computed(() => {
  return Object.values(arenaStore.storyMode.chapters)
})

const selectedChapter = computed(() => {
  return arenaStore.storyMode.chapters[selectedChapterIndex.value]
})

const selectedChapterStages = computed(() => {
  if (!selectedChapter.value) return []
  
  const stages = []
  const chapterStages = selectedChapter.value.stages
  
  // Regular stages
  for (let i = 1; i <= chapterStages; i++) {
    const stageId = `chapter${selectedChapterIndex.value}_stage${i}`
    const isCompleted = arenaStore.storyMode.completedStages.some(s => s.id === stageId)
    const isUnlocked = i === 1 || arenaStore.storyMode.completedStages.some(
      s => s.id === `chapter${selectedChapterIndex.value}_stage${i - 1}`
    )
    
    stages.push({
      id: stageId,
      number: i,
      name: `ステージ ${i}`,
      type: 'normal',
      completed: isCompleted,
      unlocked: isUnlocked,
      stars: isCompleted ? 3 : 0, // Simplified for now
      difficulty: getDifficultyForChapter(selectedChapterIndex.value)
    })
  }
  
  // Boss stage
  const completedInChapter = stages.filter(s => s.completed).length
  const bossUnlocked = completedInChapter >= Math.floor(chapterStages * 0.8)
  
  stages.push({
    id: `chapter${selectedChapterIndex.value}_boss`,
    number: 'BOSS',
    name: 'ボスバトル',
    type: 'boss',
    completed: arenaStore.storyMode.bosses[selectedChapter.value.bossId]?.defeated || false,
    unlocked: bossUnlocked,
    stars: 0,
    bossData: getBossData(selectedChapter.value.bossId)
  })
  
  return stages
})

const selectedChapterBoss = computed(() => {
  if (!selectedChapter.value) return null
  
  const bossId = selectedChapter.value.bossId
  const bossData = getBossData(bossId)
  const bossStats = arenaStore.storyMode.bosses[bossId]
  
  return {
    ...bossData,
    ...bossStats
  }
})

const currentPet = computed(() => {
  return arenaStore.pets.petData[arenaStore.pets.current]
})

function getChapterIcon(chapter) {
  const icons = ['🌍', '🌙', '🪐', '🌌', '👑']
  return icons[chapter - 1] || '🌟'
}

function selectChapter(chapter) {
  if (arenaStore.storyMode.chapters[chapter]?.unlocked) {
    selectedChapterIndex.value = chapter
    selectedStage.value = null
  }
}

function selectStage(stage) {
  if (stage.unlocked) {
    selectedStage.value = stage
  }
}

function startStage() {
  if (selectedStage.value && selectedStage.value.unlocked) {
    emit('start-stage', selectedStage.value)
  }
}

function getDifficultyForChapter(chapter) {
  const difficulties = {
    1: 'eiken5',
    2: 'eiken4',
    3: 'eiken3',
    4: 'eikenPre2',
    5: 'eiken2'
  }
  return difficulties[chapter] || 'eiken5'
}

function getBossData(bossId) {
  const bosses = {
    wordEater: {
      id: 'wordEater',
      name: 'ワードイーター',
      icon: '👾',
      description: '言葉を食べる恐ろしいモンスター',
      requiredWPM: 30,
      requiredAccuracy: 85,
      hp: 1000,
      difficulty: 'eiken5',
      rewardTitle: 'ワードハンター',
      rewardPet: 'grammarCat',
      achievement: 'firstBossDefeat'
    },
    grammarDragon: {
      id: 'grammarDragon',
      name: 'グラマー・ドラゴン',
      icon: '🐉',
      description: '文法を支配する古代のドラゴン',
      requiredWPM: 40,
      requiredAccuracy: 88,
      hp: 1500,
      difficulty: 'eiken4',
      rewardTitle: 'グラマーマスター',
      rewardPet: 'speedDog',
      achievement: 'grammarMaster'
    },
    sentenceKing: {
      id: 'sentenceKing',
      name: 'センテンス・キング',
      icon: '🤴',
      description: '文章の王国を統べる支配者',
      requiredWPM: 50,
      requiredAccuracy: 90,
      hp: 2000,
      difficulty: 'eiken3',
      rewardTitle: 'センテンスコマンダー',
      achievement: 'sentenceMaster'
    },
    tenseMaster: {
      id: 'tenseMaster',
      name: 'テンス・マスター',
      icon: '⏰',
      description: '時制を操る時の番人',
      requiredWPM: 60,
      requiredAccuracy: 92,
      hp: 2500,
      difficulty: 'eikenPre2',
      rewardTitle: 'タイムキーパー',
      achievement: 'tenseMaster'
    },
    languageEmperor: {
      id: 'languageEmperor',
      name: 'ランゲージ・エンペラー',
      icon: '👑',
      description: '言語の銀河を支配する最強の皇帝',
      requiredWPM: 70,
      requiredAccuracy: 95,
      hp: 3000,
      difficulty: 'eiken2',
      rewardTitle: 'ランゲージレジェンド',
      rewardPet: 'cosmicGuardian',
      achievement: 'ultimateChampion'
    }
  }
  
  return bosses[bossId] || {}
}

function formatTime(seconds) {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function getExpPercentage() {
  const exp = arenaStore.character.experience
  const nextExp = arenaStore.character.nextLevelExp
  return Math.round((exp / nextExp) * 100)
}

function getAffectionPercentage() {
  const affection = currentPet.value.affection
  const maxAffection = currentPet.value.maxAffection
  return Math.round((affection / maxAffection) * 100)
}

function getPetImage() {
  // Placeholder - would return actual pet image path
  return '/images/pets/alphabet-bird.png'
}
</script>

<style scoped>
.story-mode-hub {
  @apply w-full;
}

/* Chapter Map */
.chapters-container {
  @apply max-w-4xl mx-auto;
}

.chapter-map {
  @apply flex flex-wrap justify-center gap-4;
}

.chapter-node {
  @apply relative w-40 h-40 rounded-full cursor-pointer transition-all duration-300;
  background: linear-gradient(135deg, rgba(60, 60, 100, 0.6), rgba(70, 70, 120, 0.6));
  border: 3px solid rgba(147, 51, 234, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chapter-node.unlocked {
  @apply hover:scale-110;
  border-color: rgba(147, 51, 234, 0.8);
}

.chapter-node.completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.6), rgba(16, 185, 129, 0.6));
  border-color: rgba(34, 197, 94, 0.8);
}

.chapter-node.current {
  @apply animate-pulse;
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.6);
}

.chapter-icon {
  @apply text-4xl mb-2;
}

.chapter-info {
  @apply text-center;
}

.lock-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black/50 rounded-full;
}

/* Stage Grid */
.stage-grid {
  @apply grid grid-cols-4 md:grid-cols-6 gap-4;
}

.stage-card {
  @apply relative p-4 rounded-xl cursor-pointer transition-all duration-200;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.8), rgba(30, 30, 60, 0.8));
  border: 2px solid rgba(147, 51, 234, 0.3);
}

.stage-card.unlocked {
  @apply hover:scale-105 hover:shadow-lg;
}

.stage-card.completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(16, 185, 129, 0.4));
  border-color: rgba(34, 197, 94, 0.6);
}

.stage-card.boss {
  @apply col-span-2;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.4));
  border-color: rgba(239, 68, 68, 0.6);
}

.stage-number {
  @apply text-2xl font-bold text-center text-white mb-1;
}

.stage-name {
  @apply text-xs text-center text-slate-300;
}

.stage-stars {
  @apply text-center mt-2;
}

.stage-stars span {
  @apply text-xs opacity-30;
}

.stage-stars span.earned {
  @apply opacity-100;
}

.stage-lock {
  @apply absolute inset-0 flex items-center justify-center text-2xl bg-black/60 rounded-xl;
}

/* Boss Preview */
.boss-preview {
  @apply mt-8;
}

.boss-card {
  background: linear-gradient(135deg, rgba(80, 40, 40, 0.6), rgba(60, 30, 30, 0.6));
  border: 2px solid rgba(239, 68, 68, 0.4);
  text-align: center;
}

.boss-icon {
  filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.5));
}

.boss-requirements {
  @apply mt-4 p-4 rounded-lg bg-black/30;
}

/* Status Row */
.character-quick-stats,
.pet-quick-stats {
  @apply space-y-2;
}

.stat-row {
  @apply flex justify-between items-center;
}

.stat-name {
  @apply text-sm text-slate-400;
}

.stat-value {
  @apply font-bold text-white;
}

.exp-bar-mini,
.affection-bar-mini {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2;
}

.exp-fill-mini {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300;
}

.affection-fill-mini {
  @apply h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300;
}

.pet-quick-stats {
  @apply flex items-center gap-4;
}

.pet-avatar-small {
  @apply w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center;
}

/* Action Buttons */
.action-buttons {
  @apply flex flex-wrap gap-4 justify-center;
}
</style>