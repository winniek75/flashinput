<template>
  <div class="collection-container">
    <!-- ヘッダー -->
    <div class="collection-header">
      <h2 class="collection-title">
        <span class="title-icon">📚</span>
        音素妖精コレクション
      </h2>
      <div class="collection-stats">
        <div class="stat-item">
          <span class="stat-icon">🌟</span>
          <span class="stat-value">{{ phonemeProgress.collected }}/{{ phonemeProgress.total }}</span>
          <span class="stat-label">収集済み</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-value">{{ phonemeProgress.percentage }}%</span>
          <span class="stat-label">完成度</span>
        </div>
      </div>
    </div>
    
    <!-- フィルタータブ -->
    <div class="filter-tabs">
      <button
        v-for="filter in filters"
        :key="filter.id"
        @click="activeFilter = filter.id"
        class="filter-tab"
        :class="{ 'tab-active': activeFilter === filter.id }"
      >
        <span class="tab-icon">{{ filter.icon }}</span>
        <span class="tab-label">{{ filter.label }}</span>
        <span class="tab-count">{{ filter.count }}</span>
      </button>
    </div>
    
    <!-- コレクショングリッド -->
    <div class="collection-grid">
      <div
        v-for="(phoneme, key) in filteredPhonemes"
        :key="key"
        class="phoneme-card"
        :class="{ 
          'card-unlocked': phoneme.unlocked,
          'card-new': isNewPhoneme(key)
        }"
        @click="selectPhoneme(key, phoneme)"
      >
        <!-- カード内容 -->
        <div class="card-content">
          <div v-if="phoneme.unlocked" class="phoneme-visual">
            <div 
              class="phoneme-sprite"
              :style="{ backgroundColor: phoneme.color }"
            >
              <span class="phoneme-symbol">/{{ key }}/</span>
            </div>
            <div class="phoneme-name">{{ phoneme.name }}</div>
          </div>
          
          <div v-else class="locked-state">
            <span class="lock-icon">🔒</span>
            <span class="phoneme-hint">???</span>
          </div>
          
          <!-- NEW バッジ -->
          <div v-if="isNewPhoneme(key)" class="new-badge">NEW!</div>
          
          <!-- タイプインジケーター -->
          <div class="type-indicator" :class="`type-${phoneme.type}`">
            {{ getTypeLabel(phoneme.type) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 詳細モーダル -->
    <transition name="modal">
      <div v-if="selectedPhoneme" class="detail-modal" @click.self="closeDetail">
        <div class="modal-content">
          <button @click="closeDetail" class="close-button">×</button>
          
          <div class="phoneme-detail">
            <div 
              class="detail-sprite"
              :style="{ backgroundColor: selectedPhoneme.data.color }"
            >
              <span class="detail-symbol">/{{ selectedPhoneme.key }}/</span>
            </div>
            
            <h3 class="detail-name">{{ selectedPhoneme.data.name }}</h3>
            <p class="detail-type">{{ getTypeLabel(selectedPhoneme.data.type) }}</p>
            
            <!-- 学習統計 -->
            <div class="learning-stats">
              <h4>学習記録</h4>
              <div class="stat-grid">
                <div class="stat-box">
                  <span class="stat-icon">🎯</span>
                  <span class="stat-value">{{ getPhonemeStat(selectedPhoneme.key, 'accuracy') }}%</span>
                  <span class="stat-label">正解率</span>
                </div>
                <div class="stat-box">
                  <span class="stat-icon">🏃</span>
                  <span class="stat-value">{{ getPhonemeStat(selectedPhoneme.key, 'attempts') }}</span>
                  <span class="stat-label">練習回数</span>
                </div>
                <div class="stat-box">
                  <span class="stat-icon">⚡</span>
                  <span class="stat-value">{{ getPhonemeStat(selectedPhoneme.key, 'streak') }}</span>
                  <span class="stat-label">連続正解</span>
                </div>
              </div>
            </div>
            
            <!-- 例単語 -->
            <div class="example-words">
              <h4>例単語</h4>
              <div class="word-list">
                <div 
                  v-for="word in getExampleWords(selectedPhoneme.key)" 
                  :key="word"
                  class="example-word"
                >
                  {{ word }}
                </div>
              </div>
            </div>
            
            <!-- 練習ボタン -->
            <button @click="practicePhoneme(selectedPhoneme.key)" class="practice-button">
              <span class="button-icon">🎮</span>
              この音素を練習する
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- コンプリート報酬 -->
    <transition name="reward">
      <div v-if="showCompleteReward" class="complete-reward">
        <div class="reward-content">
          <h2 class="reward-title">🎉 コレクションコンプリート！</h2>
          <p class="reward-text">すべての音素妖精を集めました！</p>
          <div class="reward-prize">
            <span class="prize-icon">🏆</span>
            <span class="prize-text">マスターバッジ獲得</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/characterStore'
import { useGameStore } from '@/stores/gameStore'

export default {
  name: 'PhonemeCollection',
  setup() {
    const router = useRouter()
    const characterStore = useCharacterStore()
    const gameStore = useGameStore()
    
    const activeFilter = ref('all')
    const selectedPhoneme = ref(null)
    const newPhonemes = ref(new Set())
    const showCompleteReward = ref(false)
    
    // フィルター設定
    const filters = computed(() => {
      const phonemes = characterStore.phonemeSprites
      const vowelCount = Object.values(phonemes).filter(p => p.type === 'vowel').length
      const diphthongCount = Object.values(phonemes).filter(p => p.type === 'diphthong').length
      const consonantCount = Object.values(phonemes).filter(p => p.type === 'consonant').length
      const unlockedCount = Object.values(phonemes).filter(p => p.unlocked).length
      
      return [
        { id: 'all', label: 'すべて', icon: '🌟', count: Object.keys(phonemes).length },
        { id: 'unlocked', label: '収集済み', icon: '✅', count: unlockedCount },
        { id: 'vowel', label: '母音', icon: '🔴', count: vowelCount },
        { id: 'diphthong', label: '二重母音', icon: '🟡', count: diphthongCount },
        { id: 'consonant', label: '子音', icon: '🔵', count: consonantCount }
      ]
    })
    
    // フィルターされた音素
    const filteredPhonemes = computed(() => {
      const phonemes = characterStore.phonemeSprites
      
      switch (activeFilter.value) {
        case 'unlocked':
          return Object.fromEntries(
            Object.entries(phonemes).filter(([_, p]) => p.unlocked)
          )
        case 'vowel':
        case 'diphthong':
        case 'consonant':
          return Object.fromEntries(
            Object.entries(phonemes).filter(([_, p]) => p.type === activeFilter.value)
          )
        default:
          return phonemes
      }
    })
    
    // 進捗状況
    const phonemeProgress = computed(() => characterStore.phonemeProgress)
    
    // 新しい音素かチェック
    const isNewPhoneme = (key) => {
      return newPhonemes.value.has(key)
    }
    
    // タイプラベル取得
    const getTypeLabel = (type) => {
      const labels = {
        vowel: '母音',
        diphthong: '二重母音',
        consonant: '子音'
      }
      return labels[type] || type
    }
    
    // 音素の統計取得（ダミーデータ）
    const getPhonemeStat = (phoneme, stat) => {
      // 実際の実装では、gameStoreから実際の統計を取得
      const dummyStats = {
        accuracy: Math.floor(Math.random() * 30) + 70,
        attempts: Math.floor(Math.random() * 50) + 10,
        streak: Math.floor(Math.random() * 10) + 1
      }
      return dummyStats[stat] || 0
    }
    
    // 例単語取得（ダミーデータ）
    const getExampleWords = (phoneme) => {
      // 実際の実装では、データベースから例単語を取得
      const examples = {
        'iː': ['see', 'tree', 'bee'],
        'ɪ': ['sit', 'big', 'fish'],
        'e': ['bed', 'red', 'pen'],
        'æ': ['cat', 'hat', 'map'],
        'p': ['pen', 'apple', 'top'],
        'b': ['ball', 'baby', 'tub'],
        't': ['top', 'water', 'cat'],
        'd': ['dog', 'ladder', 'bed']
      }
      return examples[phoneme] || ['example1', 'example2', 'example3']
    }
    
    // 音素選択
    const selectPhoneme = (key, phoneme) => {
      if (phoneme.unlocked) {
        selectedPhoneme.value = { key, data: phoneme }
        // NEWバッジを削除
        newPhonemes.value.delete(key)
      }
    }
    
    // 詳細を閉じる
    const closeDetail = () => {
      selectedPhoneme.value = null
    }
    
    // 音素練習
    const practicePhoneme = (phoneme) => {
      // 特定の音素を練習するゲームに遷移
      router.push({ 
        name: 'SinglePhonemeGame',
        params: { targetPhoneme: phoneme }
      })
    }
    
    // コレクション完成チェック
    watch(phonemeProgress, (newProgress) => {
      if (newProgress.percentage === 100 && !showCompleteReward.value) {
        showCompleteReward.value = true
        // 報酬を付与
        gameStore.updatePlayerData({
          soundGems: gameStore.playerSoundGems + 1000
        })
        
        // 5秒後に非表示
        setTimeout(() => {
          showCompleteReward.value = false
        }, 5000)
      }
    })
    
    // 新しく解放された音素をマーク（デモ用）
    const markNewPhonemes = () => {
      // 実際の実装では、前回のセッションと比較して新しい音素を特定
      const recentlyUnlocked = ['iː', 'p', 'æ']
      recentlyUnlocked.forEach(p => {
        if (characterStore.phonemeSprites[p]?.unlocked) {
          newPhonemes.value.add(p)
        }
      })
    }
    
    // 初期化
    markNewPhonemes()
    
    return {
      activeFilter,
      selectedPhoneme,
      showCompleteReward,
      filters,
      filteredPhonemes,
      phonemeProgress,
      isNewPhoneme,
      getTypeLabel,
      getPhonemeStat,
      getExampleWords,
      selectPhoneme,
      closeDetail,
      practicePhoneme
    }
  }
}
</script>

<style scoped>
.collection-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.collection-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.title-icon {
  font-size: 40px;
}

.collection-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 24px;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #fbbf24;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.tab-active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  color: white;
}

.tab-icon {
  font-size: 18px;
}

.tab-count {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.phoneme-card {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.phoneme-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-unlocked {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.card-new {
  animation: new-card-pulse 2s ease-in-out infinite;
}

@keyframes new-card-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5); }
  50% { box-shadow: 0 0 20px 10px rgba(251, 191, 36, 0.3); }
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.phoneme-visual {
  text-align: center;
}

.phoneme-sprite {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.phoneme-symbol {
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.phoneme-name {
  font-size: 14px;
  color: white;
  font-weight: bold;
}

.locked-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
}

.lock-icon {
  font-size: 32px;
}

.phoneme-hint {
  font-size: 18px;
  color: #64748b;
}

.new-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1f2937;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  animation: badge-bounce 1s ease-in-out infinite;
}

@keyframes badge-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.type-indicator {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
}

.type-vowel {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.type-diphthong {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.type-consonant {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.detail-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  position: relative;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.phoneme-detail {
  text-align: center;
  color: white;
}

.detail-sprite {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.detail-symbol {
  color: white;
  font-size: 36px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.detail-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.detail-type {
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 24px;
}

.learning-stats {
  margin-bottom: 24px;
}

.learning-stats h4 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #e2e8f0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.stat-box .stat-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 4px;
}

.stat-box .stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 4px;
}

.stat-box .stat-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
}

.example-words {
  margin-bottom: 24px;
}

.example-words h4 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #e2e8f0;
}

.word-list {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.example-word {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  color: #e2e8f0;
}

.practice-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.practice-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.button-icon {
  font-size: 24px;
}

.complete-reward {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
}

.reward-content {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  padding: 48px;
  border-radius: 24px;
  text-align: center;
  color: white;
  box-shadow: 0 20px 60px rgba(139, 92, 246, 0.5);
  animation: reward-appear 0.5s ease-out;
}

@keyframes reward-appear {
  from {
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.reward-title {
  font-size: 36px;
  margin-bottom: 16px;
}

.reward-text {
  font-size: 18px;
  margin-bottom: 24px;
  color: #e9d5ff;
}

.reward-prize {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 24px;
  font-weight: bold;
}

.prize-icon {
  font-size: 48px;
  animation: prize-spin 2s linear infinite;
}

@keyframes prize-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.8);
}

.reward-enter-active,
.reward-leave-active {
  transition: all 0.5s ease;
}

.reward-enter-from,
.reward-leave-to {
  opacity: 0;
}
</style>