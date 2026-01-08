<template>
  <div class="story-recap">
    <!-- Header -->
    <div class="recap-header">
      <h2 class="recap-title">
        <i class="fas fa-book-open"></i>
        あらすじ振り返り
      </h2>
      <div class="progress-indicator">
        <span class="progress-text">ストーリー進行度: {{ overallProgress }}%</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${overallProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="recap-content">
      <!-- Story Summary Tab -->
      <div v-if="activeTab === 'summary'" class="summary-section">
        <div class="chapter-list">
          <div 
            v-for="chapter in completedChapters" 
            :key="chapter.id"
            class="chapter-card"
          >
            <div class="chapter-header">
              <div class="chapter-icon">
                <i :class="chapter.icon"></i>
              </div>
              <div class="chapter-info">
                <h3 class="chapter-title">{{ chapter.title }}</h3>
                <p class="chapter-location">{{ chapter.location }}</p>
              </div>
              <div class="completion-badge">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            
            <div class="chapter-summary">
              <p>{{ chapter.summary }}</p>
            </div>
            
            <div class="key-events">
              <h4>重要な出来事</h4>
              <ul>
                <li v-for="event in chapter.keyEvents" :key="event">
                  {{ event }}
                </li>
              </ul>
            </div>
            
            <div class="chapter-choices" v-if="chapter.playerChoices.length > 0">
              <h4>あなたの選択</h4>
              <div class="choice-list">
                <div 
                  v-for="choice in chapter.playerChoices" 
                  :key="choice.id"
                  class="choice-item"
                >
                  <div class="choice-text">{{ choice.text }}</div>
                  <div class="choice-impact" :class="choice.impact">
                    {{ choice.consequence }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Chapter Preview -->
        <div v-if="currentChapter" class="current-chapter">
          <h3>現在進行中</h3>
          <div class="chapter-preview">
            <div class="preview-header">
              <i :class="currentChapter.icon"></i>
              <span>{{ currentChapter.title }}</span>
            </div>
            <p>{{ currentChapter.description }}</p>
            <div class="next-objective">
              <strong>次の目標:</strong> {{ currentChapter.nextObjective }}
            </div>
          </div>
        </div>
      </div>

      <!-- Character Relations Tab -->
      <div v-if="activeTab === 'characters'" class="characters-section">
        <div class="relationship-map">
          <div class="central-character">
            <div class="character-portrait player">
              <img src="/images/characters/captain_nova_normal.png" alt="Captain Nova" />
              <span class="character-name">{{ playerName }}</span>
            </div>
          </div>
          
          <div class="surrounding-characters">
            <div 
              v-for="character in characterRelations" 
              :key="character.id"
              class="character-connection"
              :style="getCharacterPosition(character.id)"
            >
              <div class="connection-line" :class="character.relationshipType"></div>
              <div class="character-portrait" :class="character.relationshipType">
                <img :src="character.portrait" :alt="character.name" />
                <div class="relationship-info">
                  <span class="character-name">{{ character.name }}</span>
                  <div class="relationship-level">
                    <div 
                      v-for="n in 5" 
                      :key="n"
                      class="heart" 
                      :class="{ filled: n <= character.relationshipLevel }"
                    >
                      ♥
                    </div>
                  </div>
                  <span class="relationship-status">{{ character.relationshipStatus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Character Details -->
        <div class="character-details">
          <div 
            v-for="character in characterRelations" 
            :key="character.id"
            class="character-detail-card"
          >
            <div class="character-header">
              <img :src="character.portrait" :alt="character.name" />
              <div class="character-info">
                <h3>{{ character.name }}</h3>
                <p class="character-role">{{ character.role }}</p>
                <p class="character-description">{{ character.description }}</p>
              </div>
            </div>
            
            <div class="relationship-history">
              <h4>関係性の変化</h4>
              <div class="history-timeline">
                <div 
                  v-for="event in character.relationshipHistory" 
                  :key="event.id"
                  class="timeline-event"
                >
                  <div class="event-icon" :class="event.type">
                    <i :class="getEventIcon(event.type)"></i>
                  </div>
                  <div class="event-content">
                    <span class="event-title">{{ event.title }}</span>
                    <span class="event-description">{{ event.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements Tab -->
      <div v-if="activeTab === 'achievements'" class="achievements-section">
        <div class="achievement-categories">
          <div class="category-grid">
            <div v-for="category in achievementCategories" :key="category.id" class="category-card">
              <div class="category-header">
                <i :class="category.icon"></i>
                <h3>{{ category.name }}</h3>
              </div>
              <div class="category-progress">
                <span>{{ category.completed }}/{{ category.total }}</span>
                <div class="mini-progress-bar">
                  <div 
                    class="mini-progress-fill" 
                    :style="{ width: `${(category.completed / category.total) * 100}%` }"
                  ></div>
                </div>
              </div>
              <div class="achievement-items">
                <div 
                  v-for="achievement in category.achievements" 
                  :key="achievement.id"
                  class="achievement-item"
                  :class="{ completed: achievement.completed, hidden: achievement.hidden && !achievement.completed }"
                >
                  <div class="achievement-icon">
                    <i :class="achievement.icon"></i>
                  </div>
                  <div class="achievement-info">
                    <span class="achievement-title">
                      {{ achievement.hidden && !achievement.completed ? '???' : achievement.title }}
                    </span>
                    <span class="achievement-description">
                      {{ achievement.hidden && !achievement.completed ? '隠し実績' : achievement.description }}
                    </span>
                  </div>
                  <div v-if="achievement.completed" class="completion-date">
                    {{ formatDate(achievement.completedAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Tab -->
      <div v-if="activeTab === 'timeline'" class="timeline-section">
        <div class="story-timeline">
          <div 
            v-for="(timelineEvent, index) in storyTimeline" 
            :key="timelineEvent.id"
            class="timeline-item"
            :class="{ completed: timelineEvent.completed, current: index === currentTimelineIndex }"
          >
            <div class="timeline-marker">
              <div class="marker-icon" :class="timelineEvent.type">
                <i :class="timelineEvent.icon"></i>
              </div>
              <div class="timeline-connector" v-if="index < storyTimeline.length - 1"></div>
            </div>
            
            <div class="timeline-content">
              <div class="timeline-header">
                <h3>{{ timelineEvent.title }}</h3>
                <span class="timeline-date">{{ timelineEvent.date }}</span>
              </div>
              
              <p class="timeline-description">{{ timelineEvent.description }}</p>
              
              <div v-if="timelineEvent.participants" class="timeline-participants">
                <span>参加キャラクター: </span>
                <span 
                  v-for="participant in timelineEvent.participants" 
                  :key="participant"
                  class="participant-name"
                >
                  {{ getCharacterName(participant) }}
                </span>
              </div>
              
              <div v-if="timelineEvent.outcomes" class="timeline-outcomes">
                <h4>結果・影響</h4>
                <ul>
                  <li v-for="outcome in timelineEvent.outcomes" :key="outcome">
                    {{ outcome }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { gameStoryBridge } from '@/story/integration/GameStoryBridge'
import { dynamicDialogueGenerator } from '@/story/dialogue/DynamicDialogueGenerator'

// Reactive data
const activeTab = ref('summary')
const playerName = ref('Captain Nova')

// Tab configuration  
const tabs = ref([
  {
    id: 'summary',
    label: 'ストーリー',
    icon: 'fas fa-book'
  },
  {
    id: 'characters',
    label: 'キャラクター',
    icon: 'fas fa-users'
  },
  {
    id: 'achievements',
    label: '実績',
    icon: 'fas fa-trophy'
  },
  {
    id: 'timeline',
    label: 'タイムライン',
    icon: 'fas fa-clock'
  }
])

// Story data
const completedChapters = ref([
  {
    id: 'prologue',
    title: 'プロローグ: 宇宙への旅立ち',
    location: '地球',
    icon: 'fas fa-rocket',
    summary: '地球からLanguage Galaxy Adventureの世界へと旅立った。Universal TranslatorとAURAとの出会いが冒険の始まりとなった。',
    keyEvents: [
      'Universal Translatorの伝説を知る',
      'AURAとの初対面',
      '宇宙船での初ミッション説明',
      'プレイヤー名の決定'
    ],
    playerChoices: [
      {
        id: 'name_choice',
        text: '自分の名前を決めた',
        consequence: 'キャラクターたちが親しみやすく接してくれる',
        impact: 'positive'
      },
      {
        id: 'mission_attitude',
        text: '使命感を持って取り組むことを誓った',
        consequence: 'キャラクターたちからの信頼度が上昇',
        impact: 'positive'
      }
    ]
  },
  {
    id: 'chapter1',
    title: '第1章: Sound Planet の冒険',
    location: 'Sound Planet',
    icon: 'fas fa-music',
    summary: 'Professor Phonixとの出会いを通じて音の世界を学んだ。Sound Crystalの力で住民たちの音を取り戻す冒険を経験。',
    keyEvents: [
      'Professor Phonixとの初対面',
      '音の結晶の発見',
      '住民の音を失った事件の解決',
      'Sound Guardianとの出会い'
    ],
    playerChoices: [
      {
        id: 'phonix_help',
        text: 'Professor Phonixの研究を積極的に手伝った',
        consequence: 'Professor Phonixとの友好度が大幅上昇',
        impact: 'positive'
      },
      {
        id: 'crystal_approach',
        text: '慎重にSound Crystalに近づいた',
        consequence: '安全に結晶の力を理解できた',
        impact: 'neutral'
      }
    ]
  }
])

const currentChapter = ref({
  id: 'chapter2',
  title: '第2章: Word Planet での出会い',
  location: 'Word Planet',
  icon: 'fas fa-spell-check',
  description: 'Lexiaとともに言葉の世界を探検中。壊れた単語の橋を修復し、失われた物語を取り戻すミッションが進行中。',
  nextObjective: '図書館の奥にある古い物語を復元する'
})

// Character relations
const characterRelations = ref([
  {
    id: 'aura',
    name: 'AURA',
    role: 'AI Assistant',
    description: '宇宙船のAIアシスタント。学習をサポートし、プレイヤーの成長を見守る。',
    portrait: '/images/characters/aura_normal.png',
    relationshipLevel: 4,
    relationshipType: 'trusted_ally',
    relationshipStatus: '信頼できるパートナー',
    relationshipHistory: [
      {
        id: 'first_meeting',
        type: 'meeting',
        title: '初回起動',
        description: 'AURAとの初めての出会い。システムの説明を受ける'
      },
      {
        id: 'first_success',
        type: 'positive',
        title: '初回ゲーム成功',
        description: '最初のゲームをクリアし、AURAから祝福を受ける'
      },
      {
        id: 'daily_routine',
        type: 'bonding',
        title: '日常のやり取り',
        description: '毎日の学習を通じて信頼関係を築く'
      }
    ]
  },
  {
    id: 'professor_phonix',
    name: 'Professor Phonix',
    role: 'Sound Master',
    description: '音の賢者。発音と音韻学の専門家として、優しく指導してくれる。',
    portrait: '/images/characters/professor_phonix_normal.png',
    relationshipLevel: 3,
    relationshipType: 'mentor',
    relationshipStatus: '尊敬する師匠',
    relationshipHistory: [
      {
        id: 'sound_planet_arrival',
        type: 'meeting',
        title: 'Sound Planet到着',
        description: 'Professor Phonixとの運命的な出会い'
      },
      {
        id: 'first_lesson',
        type: 'learning',
        title: '最初の音の授業',
        description: '音の基礎について学び、新しい世界を発見'
      }
    ]
  },
  {
    id: 'lexia',
    name: 'Lexia',
    role: 'Word Fairy',
    description: '言葉の妖精。元気で好奇心旺盛な性格で、語彙学習を楽しくサポート。',
    portrait: '/images/characters/lexia_normal.png',
    relationshipLevel: 5,
    relationshipType: 'close_friend',
    relationshipStatus: '親友',
    relationshipHistory: [
      {
        id: 'word_planet_meeting',
        type: 'meeting',
        title: 'Word Planetでの出会い',
        description: 'Lexiaとの楽しい初対面'
      },
      {
        id: 'bridge_repair',
        type: 'cooperation',
        title: '単語の橋修復',
        description: '協力して壊れた橋を修復し、絆を深める'
      }
    ]
  }
])

// Achievements
const achievementCategories = ref([
  {
    id: 'story',
    name: 'ストーリー進行',
    icon: 'fas fa-book-open',
    completed: 8,
    total: 15,
    achievements: [
      {
        id: 'prologue_complete',
        title: '宇宙への第一歩',
        description: 'プロローグを完了',
        icon: 'fas fa-rocket',
        completed: true,
        completedAt: new Date('2024-01-15'),
        hidden: false
      },
      {
        id: 'sound_planet_complete',
        title: '音の世界の探検家',
        description: 'Sound Planetのメインストーリーを完了',
        icon: 'fas fa-music',
        completed: true,
        completedAt: new Date('2024-01-20'),
        hidden: false
      },
      {
        id: 'all_characters_met',
        title: '仲間との出会い',
        description: '全ての主要キャラクターと出会う',
        icon: 'fas fa-users',
        completed: false,
        hidden: false
      },
      {
        id: 'secret_story',
        title: '隠された真実',
        description: '???',
        icon: 'fas fa-eye',
        completed: false,
        hidden: true
      }
    ]
  },
  {
    id: 'learning',
    name: '学習成果',
    icon: 'fas fa-graduation-cap',
    completed: 12,
    total: 20,
    achievements: [
      {
        id: 'first_perfect',
        title: 'パーフェクト達成',
        description: '初めて100%の正解率を達成',
        icon: 'fas fa-star',
        completed: true,
        completedAt: new Date('2024-01-16'),
        hidden: false
      },
      {
        id: 'streak_week',
        title: '継続の力',
        description: '7日連続でゲームをプレイ',
        icon: 'fas fa-fire',
        completed: true,
        completedAt: new Date('2024-01-22'),
        hidden: false
      },
      {
        id: 'master_pronunciation',
        title: '発音マスター',
        description: '発音ゲームで1000点を達成',
        icon: 'fas fa-microphone',
        completed: false,
        hidden: false
      }
    ]
  },
  {
    id: 'social',
    name: 'キャラクター関係',
    icon: 'fas fa-heart',
    completed: 5,
    total: 10,
    achievements: [
      {
        id: 'aura_trust',
        title: 'AURAの信頼',
        description: 'AURAとの友好度が最大に',
        icon: 'fas fa-robot',
        completed: true,
        completedAt: new Date('2024-01-25'),
        hidden: false
      },
      {
        id: 'lexia_bestfriend',
        title: 'Lexiaの親友',
        description: 'Lexiaと親友になる',
        icon: 'fas fa-magic',
        completed: true,
        completedAt: new Date('2024-01-28'),
        hidden: false
      }
    ]
  }
])

// Timeline
const storyTimeline = ref([
  {
    id: 'departure',
    title: '地球出発',
    date: '2024年1月15日',
    description: '地球からLanguage Galaxy Adventureの世界へ旅立つ',
    type: 'milestone',
    icon: 'fas fa-rocket',
    completed: true,
    participants: ['captain_nova', 'aura'],
    outcomes: [
      'Universal Translatorの使命を理解',
      'AURAとのパートナーシップ開始',
      '宇宙での冒険生活開始'
    ]
  },
  {
    id: 'sound_planet_arrival',
    title: 'Sound Planet到着',
    date: '2024年1月18日',
    description: 'Professor Phonixとの出会いと音の世界の発見',
    type: 'chapter',
    icon: 'fas fa-music',
    completed: true,
    participants: ['captain_nova', 'professor_phonix', 'aura'],
    outcomes: [
      '発音スキルの基礎を習得',
      'Professor Phonixとの師弟関係構築',
      'Sound Crystalの力を理解'
    ]
  },
  {
    id: 'word_planet_arrival',
    title: 'Word Planet到着',
    date: '2024年1月25日',
    description: 'Lexiaとの出会いと言葉の冒険開始',
    type: 'chapter',
    icon: 'fas fa-spell-check',
    completed: true,
    participants: ['captain_nova', 'lexia', 'aura'],
    outcomes: [
      '語彙力の大幅な向上',
      'Lexiaとの友情育成',
      '単語の橋修復プロジェクト参加'
    ]
  },
  {
    id: 'grammar_planet_approach',
    title: 'Grammar Planet接近中',
    date: '進行中',
    description: 'Grammar Guardianとの出会いに向けて準備中',
    type: 'upcoming',
    icon: 'fas fa-cogs',
    completed: false,
    participants: ['captain_nova', 'grammar_guardian'],
    outcomes: []
  }
])

// Computed properties
const overallProgress = computed(() => {
  const totalChapters = completedChapters.value.length + (currentChapter.value ? 1 : 0) + 3 // Estimated remaining chapters
  const completed = completedChapters.value.length + (currentChapter.value ? 0.5 : 0) // Current chapter is 50% complete
  return Math.round((completed / totalChapters) * 100)
})

const currentTimelineIndex = computed(() => {
  return storyTimeline.value.findIndex(item => !item.completed)
})

// Methods
const getCharacterPosition = (characterId: string) => {
  const positions = {
    'aura': { top: '20%', right: '25%' },
    'professor_phonix': { top: '60%', left: '15%' },
    'lexia': { top: '25%', left: '20%' },
    'grammar_guardian': { bottom: '30%', left: '30%' },
    'speed_racer': { bottom: '20%', right: '20%' },
    'unity': { top: '50%', right: '10%' }
  }
  
  return positions[characterId as keyof typeof positions] || { top: '50%', left: '50%' }
}

const getEventIcon = (eventType: string) => {
  const icons = {
    'meeting': 'fas fa-handshake',
    'positive': 'fas fa-heart',
    'bonding': 'fas fa-link',
    'learning': 'fas fa-graduation-cap',
    'cooperation': 'fas fa-hands-helping'
  }
  
  return icons[eventType as keyof typeof icons] || 'fas fa-circle'
}

const getCharacterName = (characterId: string) => {
  const names = {
    'captain_nova': 'Captain Nova',
    'aura': 'AURA',
    'professor_phonix': 'Professor Phonix',
    'lexia': 'Lexia',
    'grammar_guardian': 'Grammar Guardian',
    'speed_racer': 'Speed Racer',
    'unity': 'Unity'
  }
  
  return names[characterId as keyof typeof names] || characterId
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Load player data
  playerName.value = dynamicDialogueGenerator.getPlayerName()
  
  // Load story progress from game bridge
  // This would typically sync with actual game data
  logger.log('Story recap initialized')
})
</script>

<style scoped>
.story-recap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Noto Sans JP', sans-serif;
}

.recap-header {
  text-align: center;
  margin-bottom: 2rem;
}

.recap-title {
  font-size: 2.5rem;
  color: #1a365d;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.progress-indicator {
  max-width: 400px;
  margin: 0 auto;
}

.progress-text {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 600;
}

.progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3182ce, #63b3ed);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button:hover {
  color: #3182ce;
  background: #f7fafc;
}

.tab-button.active {
  color: #3182ce;
  border-bottom: 3px solid #3182ce;
  background: #f7fafc;
}

.recap-content {
  min-height: 600px;
}

/* Summary Section */
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chapter-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chapter-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.chapter-info {
  flex: 1;
}

.chapter-title {
  font-size: 1.5rem;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.chapter-location {
  color: #718096;
  font-style: italic;
}

.completion-badge {
  color: #38a169;
  font-size: 1.5rem;
}

.chapter-summary {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: #4a5568;
}

.key-events h4,
.chapter-choices h4 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.key-events ul {
  list-style: none;
  padding: 0;
}

.key-events li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.key-events li::before {
  content: '★';
  position: absolute;
  left: 0;
  color: #f6d55c;
}

.choice-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.choice-item {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3182ce;
}

.choice-text {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.choice-impact {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.choice-impact.positive {
  background: #c6f6d5;
  color: #22543d;
}

.choice-impact.neutral {
  background: #e2e8f0;
  color: #2d3748;
}

.current-chapter {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
}

.current-chapter h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.chapter-preview {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.next-objective {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

/* Characters Section */
.relationship-map {
  position: relative;
  height: 400px;
  margin-bottom: 3rem;
  background: radial-gradient(circle, #f7fafc, #e2e8f0);
  border-radius: 12px;
  overflow: hidden;
}

.central-character {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.character-portrait {
  text-align: center;
  position: relative;
}

.character-portrait img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #3182ce;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.character-portrait.player img {
  width: 100px;
  height: 100px;
  border-color: #f6d55c;
}

.character-name {
  display: block;
  margin-top: 0.5rem;
  font-weight: 600;
  color: #2d3748;
}

.surrounding-characters {
  position: relative;
  width: 100%;
  height: 100%;
}

.character-connection {
  position: absolute;
}

.connection-line {
  position: absolute;
  width: 2px;
  height: 100px;
  background: #cbd5e0;
  top: 50%;
  left: 50%;
  transform-origin: top;
  z-index: 1;
}

.connection-line.trusted_ally {
  background: #48bb78;
}

.connection-line.mentor {
  background: #ed8936;
}

.connection-line.close_friend {
  background: #e53e3e;
}

.relationship-info {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
  min-width: 200px;
}

.relationship-level {
  display: flex;
  gap: 0.25rem;
  margin: 0.5rem 0;
}

.heart {
  color: #e2e8f0;
  transition: color 0.3s ease;
}

.heart.filled {
  color: #e53e3e;
}

.relationship-status {
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
}

.character-details {
  display: grid;
  gap: 2rem;
}

.character-detail-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.character-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.character-header img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
}

.character-info h3 {
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.character-role {
  color: #3182ce;
  font-weight: 600;
  margin-bottom: 1rem;
}

.character-description {
  color: #4a5568;
  line-height: 1.6;
}

.relationship-history h4 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-event {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.event-icon.meeting {
  background: #3182ce;
}

.event-icon.positive {
  background: #38a169;
}

.event-icon.bonding {
  background: #e53e3e;
}

.event-icon.learning {
  background: #ed8936;
}

.event-icon.cooperation {
  background: #805ad5;
}

.event-content {
  flex: 1;
}

.event-title {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.event-description {
  color: #718096;
  font-size: 0.9rem;
}

/* Achievements Section */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-header i {
  font-size: 1.5rem;
  color: #3182ce;
}

.category-header h3 {
  color: #1a365d;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.mini-progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #3182ce;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.achievement-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.achievement-item.completed {
  background: #f0fff4;
  border-color: #38a169;
}

.achievement-item.hidden {
  opacity: 0.5;
}

.achievement-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #718096;
}

.achievement-item.completed .achievement-icon {
  background: #38a169;
  color: white;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.achievement-description {
  color: #718096;
  font-size: 0.9rem;
}

.completion-date {
  font-size: 0.8rem;
  color: #38a169;
  font-weight: 600;
}

/* Timeline Section */
.story-timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

.timeline-item {
  display: flex;
  gap: 2rem;
  position: relative;
}

.timeline-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  position: relative;
  z-index: 2;
}

.marker-icon.milestone {
  background: #e53e3e;
}

.marker-icon.chapter {
  background: #3182ce;
}

.marker-icon.upcoming {
  background: #cbd5e0;
  color: #718096;
}

.timeline-connector {
  width: 4px;
  height: 100px;
  background: #e2e8f0;
  margin-top: 1rem;
}

.timeline-item.completed .timeline-connector {
  background: #38a169;
}

.timeline-content {
  flex: 1;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-item.current .timeline-content {
  border: 2px solid #3182ce;
  box-shadow: 0 4px 8px rgba(49, 130, 206, 0.2);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.timeline-header h3 {
  color: #1a365d;
}

.timeline-date {
  color: #718096;
  font-size: 0.9rem;
}

.timeline-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.timeline-participants {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.participant-name {
  color: #3182ce;
  font-weight: 600;
  margin-right: 0.5rem;
}

.timeline-outcomes h4 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.timeline-outcomes ul {
  list-style: none;
  padding: 0;
}

.timeline-outcomes li {
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

.timeline-outcomes li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #3182ce;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .story-recap {
    padding: 1rem;
  }
  
  .recap-title {
    font-size: 2rem;
  }
  
  .tab-navigation {
    flex-wrap: wrap;
  }
  
  .chapter-header {
    flex-direction: column;
    text-align: center;
  }
  
  .character-header {
    flex-direction: column;
    text-align: center;
  }
  
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .timeline-marker {
    flex-direction: row;
    justify-content: center;
  }
  
  .timeline-connector {
    display: none;
  }
}
</style>