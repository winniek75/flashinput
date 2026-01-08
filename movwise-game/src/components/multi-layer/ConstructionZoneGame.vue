<!-- Multi-Layer Learning Engine - Construction Zone Component -->
<template>
  <div class="construction-zone-container">
    <!-- Header -->
    <div class="construction-zone-header">
      <h1 class="zone-title">🏗️ Construction Zone</h1>
      <p class="zone-description">じっくり学習で確実な理解を構築しよう！</p>
      
      <!-- Building Progress -->
      <div class="building-progress">
        <div class="building-visualization">
          <div 
            v-for="(floor, index) in buildingFloors" 
            :key="index"
            class="building-floor"
            :class="{ 
              'completed': floor.completed, 
              'current': floor.current,
              'locked': floor.locked 
            }"
          >
            <div class="floor-content">
              <span class="floor-number">{{ index + 1 }}</span>
              <span class="floor-topic">{{ floor.topic }}</span>
              <div class="floor-progress" v-if="floor.current">
                <div 
                  class="floor-progress-fill" 
                  :style="{ width: floor.progress + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="building-info">
          <h3>現在の建設段階</h3>
          <p>{{ currentFloor?.topic || '準備中' }}</p>
          <div class="time-info">
            <span>経過時間: {{ formatTime(elapsedTime) }}</span>
            <span>残り時間: {{ formatTime(timeRemaining) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Area -->
    <div class="game-area" v-if="gameState === 'playing'">
      <!-- Current Learning Module -->
      <div class="learning-module" v-if="currentModule">
        <div class="module-header">
          <h2 class="module-title">{{ currentModule.title }}</h2>
          <div class="complexity-indicator">
            <span class="complexity-label">複雑度:</span>
            <div class="complexity-stars">
              <span 
                v-for="i in 5" 
                :key="i"
                class="star"
                :class="{ 'filled': i <= currentModule.complexity }"
              >⭐</span>
            </div>
          </div>
        </div>

        <!-- Learning Content -->
        <div class="learning-content">
          <!-- Explanation Phase -->
          <div class="explanation-phase" v-if="currentPhase === 'explanation'">
            <div class="explanation-content">
              <h3>{{ currentModule.explanation.title }}</h3>
              <div class="explanation-text" v-html="currentModule.explanation.content"></div>
              
              <!-- Interactive Examples -->
              <div class="interactive-examples" v-if="currentModule.examples">
                <h4>例文で確認</h4>
                <div 
                  v-for="(example, index) in currentModule.examples" 
                  :key="index"
                  class="example-card"
                  @click="playExampleAudio(example)"
                >
                  <div class="example-sentence">{{ example.sentence }}</div>
                  <div class="example-translation">{{ example.translation }}</div>
                  <div class="example-highlight">{{ example.highlight }}</div>
                </div>
              </div>
              
              <!-- Scaffolding Support -->
              <div class="scaffolding-support" v-if="scaffoldingLevel > 0">
                <h4>学習サポート</h4>
                <div class="support-tips">
                  <div 
                    v-for="(tip, index) in scaffoldingTips" 
                    :key="index"
                    class="support-tip"
                  >
                    {{ tip }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="phase-actions">
              <button class="btn-primary" @click="moveToConstructionPhase">
                理解できました - 構築に進む
              </button>
              <button class="btn-secondary" @click="requestHelp">
                追加説明が必要
              </button>
            </div>
          </div>

          <!-- Construction Phase -->
          <div class="construction-phase" v-if="currentPhase === 'construction'">
            <div class="construction-task">
              <h3>{{ currentTask.title }}</h3>
              <p class="task-instruction">{{ currentTask.instruction }}</p>
              
              <!-- Task Interface -->
              <div class="task-interface">
                <!-- Sentence Building -->
                <div class="sentence-builder" v-if="currentTask.type === 'sentence_building'">
                  <div class="word-bank">
                    <h4>利用可能な語句</h4>
                    <div class="word-options">
                      <div 
                        v-for="(word, index) in availableWords" 
                        :key="index"
                        class="word-option"
                        :class="{ 'used': word.used, 'correct-position': word.correctPosition }"
                        @click="selectWord(word, index)"
                        :draggable="!word.used"
                        @dragstart="onDragStart($event, word, index)"
                      >
                        {{ word.text }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="sentence-construction">
                    <h4>文を構築してください</h4>
                    <div class="construction-slots">
                      <div 
                        v-for="(slot, index) in constructionSlots" 
                        :key="index"
                        class="construction-slot"
                        :class="{ 
                          'filled': slot.word,
                          'correct': slot.isCorrect,
                          'incorrect': slot.isIncorrect,
                          'highlighted': slot.highlighted
                        }"
                        @click="removeWord(index)"
                        @drop="onDrop($event, index)"
                        @dragover.prevent
                      >
                        {{ slot.word?.text || `位置 ${index + 1}` }}
                      </div>
                    </div>
                    
                    <div class="construction-feedback" v-if="constructionFeedback">
                      <div class="feedback-message" :class="constructionFeedback.type">
                        {{ constructionFeedback.message }}
                      </div>
                      <div class="feedback-explanation" v-if="constructionFeedback.explanation">
                        {{ constructionFeedback.explanation }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Grammar Pattern Matching -->
                <div class="pattern-matching" v-if="currentTask.type === 'pattern_matching'">
                  <div class="pattern-question">
                    <h4>正しい文法パターンを選択してください</h4>
                    <div class="base-sentence">{{ currentTask.baseSentence }}</div>
                  </div>
                  
                  <div class="pattern-options">
                    <div 
                      v-for="(pattern, index) in currentTask.patterns" 
                      :key="index"
                      class="pattern-option"
                      :class="{ 
                        'selected': selectedPattern === index,
                        'correct': showPatternResult && pattern.isCorrect,
                        'incorrect': showPatternResult && selectedPattern === index && !pattern.isCorrect
                      }"
                      @click="selectPattern(index)"
                    >
                      <div class="pattern-text">{{ pattern.text }}</div>
                      <div class="pattern-rule">{{ pattern.rule }}</div>
                    </div>
                  </div>
                </div>

                <!-- Error Correction -->
                <div class="error-correction" v-if="currentTask.type === 'error_correction'">
                  <div class="error-sentence">
                    <h4>間違いを見つけて修正してください</h4>
                    <div class="sentence-with-errors">
                      <span 
                        v-for="(word, index) in errorSentenceWords" 
                        :key="index"
                        class="error-word"
                        :class="{ 
                          'error': word.hasError,
                          'selected': selectedErrorWord === index,
                          'corrected': word.corrected
                        }"
                        @click="selectErrorWord(index)"
                      >
                        {{ word.text }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="correction-interface" v-if="selectedErrorWord !== -1">
                    <h4>修正案を入力してください</h4>
                    <input 
                      v-model="correctionInput"
                      class="correction-input"
                      placeholder="正しい語句を入力..."
                      @keyup.enter="submitCorrection"
                    />
                    <button class="btn-primary" @click="submitCorrection">修正する</button>
                  </div>
                </div>
              </div>
              
              <div class="task-actions">
                <button 
                  class="btn-primary" 
                  @click="checkConstruction"
                  :disabled="!canCheckConstruction"
                >
                  解答をチェック
                </button>
                <button class="btn-help" @click="requestHint">
                  ヒントが欲しい
                </button>
                <button class="btn-secondary" @click="resetConstruction">
                  リセット
                </button>
              </div>
            </div>
          </div>

          <!-- Review Phase -->
          <div class="review-phase" v-if="currentPhase === 'review'">
            <div class="review-content">
              <h3>学習内容の振り返り</h3>
              
              <div class="mastery-assessment">
                <h4>習得度評価</h4>
                <div class="mastery-indicators">
                  <div class="mastery-item">
                    <span class="mastery-label">理解度</span>
                    <div class="mastery-bar">
                      <div 
                        class="mastery-fill" 
                        :style="{ width: currentMastery.understanding + '%' }"
                      ></div>
                    </div>
                    <span class="mastery-percentage">{{ currentMastery.understanding }}%</span>
                  </div>
                  <div class="mastery-item">
                    <span class="mastery-label">応用力</span>
                    <div class="mastery-bar">
                      <div 
                        class="mastery-fill" 
                        :style="{ width: currentMastery.application + '%' }"
                      ></div>
                    </div>
                    <span class="mastery-percentage">{{ currentMastery.application }}%</span>
                  </div>
                  <div class="mastery-item">
                    <span class="mastery-label">記憶定着</span>
                    <div class="mastery-bar">
                      <div 
                        class="mastery-fill" 
                        :style="{ width: currentMastery.retention + '%' }"
                      ></div>
                    </div>
                    <span class="mastery-percentage">{{ currentMastery.retention }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="learning-summary">
                <h4>今回学習した内容</h4>
                <ul class="summary-points">
                  <li v-for="(point, index) in learningPoints" :key="index">
                    {{ point }}
                  </li>
                </ul>
              </div>
              
              <div class="next-steps" v-if="nextStepRecommendations">
                <h4>次のステップ</h4>
                <div class="recommendations">
                  <div 
                    v-for="(rec, index) in nextStepRecommendations" 
                    :key="index"
                    class="recommendation-card"
                  >
                    <div class="rec-title">{{ rec.title }}</div>
                    <div class="rec-description">{{ rec.description }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="phase-actions">
              <button class="btn-primary" @click="completeModule">
                次のモジュールに進む
              </button>
              <button class="btn-secondary" @click="practiceMore">
                もう少し練習する
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Collaborative Features -->
      <div class="collaborative-panel" v-if="collaborativeMode">
        <h3>協力学習</h3>
        <div class="participants">
          <div 
            v-for="participant in participants" 
            :key="participant.id"
            class="participant"
          >
            <div class="participant-avatar">{{ participant.name[0] }}</div>
            <div class="participant-info">
              <div class="participant-name">{{ participant.name }}</div>
              <div class="participant-status">{{ participant.status }}</div>
            </div>
          </div>
        </div>
        
        <div class="shared-workspace">
          <div class="workspace-content">
            <!-- Shared construction area would go here -->
            <p>共有作業エリア - 他の学習者と一緒に問題を解決できます</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div class="results-screen" v-if="gameState === 'completed'">
      <h2 class="results-title">Construction Zone 完了！</h2>
      
      <div class="building-completed">
        <div class="completed-building">
          <h3>完成した知識の建物</h3>
          <div class="building-stats">
            <div class="stat">
              <span class="stat-label">完成フロア数</span>
              <span class="stat-value">{{ completedFloors }}/{{ totalFloors }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">総学習時間</span>
              <span class="stat-value">{{ formatTime(totalStudyTime) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">習得度</span>
              <span class="stat-value">{{ Math.round(overallMastery) }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Session Performance Analysis -->
      <div class="session-analysis" v-if="sessionPerformance">
        <h3>セッション分析</h3>
        <div class="analysis-metrics">
          <div class="metric-card">
            <h4>理解の深さ</h4>
            <div class="metric-gauge">
              <div 
                class="gauge-fill" 
                :style="{ width: sessionPerformance.consistency + '%' }"
              ></div>
            </div>
            <p>{{ Math.round(sessionPerformance.consistency) }}%</p>
          </div>
          <div class="metric-card">
            <h4>学習効率</h4>
            <div class="metric-gauge">
              <div 
                class="gauge-fill" 
                :style="{ width: sessionPerformance.improvement + '%' }"
              ></div>
            </div>
            <p>{{ Math.round(sessionPerformance.improvement) }}%</p>
          </div>
          <div class="metric-card">
            <h4>集中度</h4>
            <div class="metric-gauge">
              <div 
                class="gauge-fill" 
                :style="{ width: sessionPerformance.engagementLevel * 100 + '%' }"
              ></div>
            </div>
            <p>{{ Math.round(sessionPerformance.engagementLevel * 100) }}%</p>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn-primary" @click="continueBuilding">建設を続ける</button>
        <button class="btn-secondary" @click="returnToHub">ハブに戻る</button>
        <button class="btn-accent" @click="tryBattleZone">Battle Zone に挑戦</button>
      </div>
    </div>

    <!-- Setup Screen -->
    <div class="setup-screen" v-if="gameState === 'setup'">
      <h2>Construction Zone セッション設定</h2>
      
      <div class="setup-options">
        <div class="option-group">
          <label>英検レベル:</label>
          <select v-model="selectedEikenLevel">
            <option value="grade5">英検5級 - 基本的な単語・文法</option>
            <option value="grade4">英検4級 - 日常会話レベル</option>
            <option value="grade3">英検3級 - 中学修了レベル</option>
          </select>
        </div>
        
        <div class="option-group">
          <label>学習モジュール:</label>
          <select v-model="selectedModuleType">
            <option value="random">ランダム選択</option>
            <option value="sequential">順序学習</option>
            <option value="mixed">混合レベル</option>
          </select>
        </div>
        
        <div class="option-group">
          <label>学習モード:</label>
          <div class="mode-options">
            <label class="mode-option">
              <input type="radio" v-model="learningMode" value="individual" />
              <span>個人学習</span>
            </label>
            <label class="mode-option">
              <input type="radio" v-model="learningMode" value="collaborative" />
              <span>協力学習</span>
            </label>
          </div>
        </div>
        
        <div class="option-group">
          <label>サポートレベル:</label>
          <select v-model="scaffoldingLevel">
            <option value="0">最小サポート</option>
            <option value="1">基本サポート</option>
            <option value="2">標準サポート</option>
            <option value="3">最大サポート</option>
          </select>
        </div>
      </div>
      
      <button class="btn-start" @click="startConstructionSession">
        Construction Zone 開始！
      </button>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { multiLayerEngine } from '@/services/multiLayerEngine'
import { useGrammarMasteryStore } from '@/stores/grammarMasteryStore'
import { useGameAudio } from '@/composables/useGameAudio'
import { getModulesByLevel, getRandomModule, getMixedLevelModules } from '@/data/multi-layer/constructionZoneModules'

export default {
  name: 'ConstructionZoneGame',
  setup() {
    const grammarStore = useGrammarMasteryStore()
    const { playEffectSound, speakSentence } = useGameAudio()

    // Game State
    const gameState = ref('setup') // setup, playing, completed
    const currentSession = ref(null)
    const currentPhase = ref('explanation') // explanation, construction, review
    const elapsedTime = ref(0)
    const timeRemaining = ref(0)
    
    // Building/Learning State
    const buildingFloors = ref([])
    const currentFloorIndex = ref(0)
    const currentModule = ref(null)
    const currentTask = ref(null)
    const learningPoints = ref([])
    
    // Session Configuration
    const selectedProject = ref('basic_grammar_building')
    const selectedEikenLevel = ref('grade5')
    const selectedModuleType = ref('random')
    const learningMode = ref('individual')
    const collaborativeMode = ref(false)
    const scaffoldingLevel = ref(2)
    
    // Task State
    const availableWords = ref([])
    const constructionSlots = ref([])
    const constructionFeedback = ref(null)
    const selectedPattern = ref(-1)
    const showPatternResult = ref(false)
    const selectedErrorWord = ref(-1)
    const correctionInput = ref('')
    const errorSentenceWords = ref([])
    
    // Performance Tracking
    const currentMastery = ref({
      understanding: 0,
      application: 0,
      retention: 0
    })
    const sessionPerformance = ref(null)
    const nextStepRecommendations = ref([])
    
    // Collaborative Features
    const participants = ref([])
    
    // Timers
    let sessionTimer = null

    // Computed Properties
    const currentFloor = computed(() => {
      return buildingFloors.value[currentFloorIndex.value]
    })
    
    const completedFloors = computed(() => {
      return buildingFloors.value.filter(floor => floor.completed).length
    })
    
    const totalFloors = computed(() => {
      return buildingFloors.value.length
    })
    
    const totalStudyTime = computed(() => {
      return currentSession.value ? Date.now() - currentSession.value.startTime.getTime() : 0
    })
    
    const overallMastery = computed(() => {
      const values = Object.values(currentMastery.value)
      return values.reduce((sum, val) => sum + val, 0) / values.length
    })
    
    const canCheckConstruction = computed(() => {
      if (currentTask.value?.type === 'sentence_building') {
        return constructionSlots.value.every(slot => slot.word)
      }
      if (currentTask.value?.type === 'pattern_matching') {
        return selectedPattern.value !== -1
      }
      if (currentTask.value?.type === 'error_correction') {
        return errorSentenceWords.value.some(word => word.corrected)
      }
      return false
    })
    
    const scaffoldingTips = computed(() => {
      if (scaffoldingLevel.value === 0) return []
      
      const tips = [
        '文法ルールを思い出してみましょう',
        '例文と比較して考えてみてください',
        'パターンを意識してみましょう'
      ]
      
      if (scaffoldingLevel.value >= 2) {
        tips.push('困ったときは遠慮なくヒントを使ってください')
      }
      
      if (scaffoldingLevel.value >= 3) {
        tips.push('段階的に進めていけば必ず理解できます')
      }
      
      return tips
    })

    // Mock data
    const availableProjects = ref([
      {
        id: 'basic_grammar_building',
        name: '基本文法建物',
        estimatedTime: 30,
        floors: [
          { topic: 'Be動詞の基礎', complexity: 1 },
          { topic: '一般動詞の活用', complexity: 2 },
          { topic: '疑問文の作り方', complexity: 2 },
          { topic: '否定文の構造', complexity: 3 },
          { topic: '複合文型', complexity: 4 }
        ]
      },
      {
        id: 'tense_mastery_tower',
        name: '時制マスタータワー',
        estimatedTime: 45,
        floors: [
          { topic: '現在形の理解', complexity: 1 },
          { topic: '過去形の変化', complexity: 2 },
          { topic: '未来形の表現', complexity: 3 },
          { topic: '完了形の概念', complexity: 4 },
          { topic: '進行形の使い分け', complexity: 3 }
        ]
      }
    ])

    // Methods
    const startConstructionSession = async () => {
      try {
        collaborativeMode.value = learningMode.value === 'collaborative'
        
        currentSession.value = multiLayerEngine.startConstructionZoneSession(
          'user123', // In real app, get from auth
          selectedProject.value,
          collaborativeMode.value
        )
        
        // Initialize building structure
        const project = availableProjects.value.find(p => p.id === selectedProject.value)
        buildingFloors.value = project.floors.map((floor, index) => ({
          ...floor,
          completed: false,
          current: index === 0,
          locked: index > 0,
          progress: 0
        }))
        
        gameState.value = 'playing'
        timeRemaining.value = currentSession.value.configuration.maxBuildingTime
        
        await playEffectSound('gameStart')
        startSessionTimer()
        loadCurrentModule()
        
      } catch (error) {
        logger.error('Failed to start Construction Zone session:', error)
      }
    }
    
    const startSessionTimer = () => {
      sessionTimer = setInterval(() => {
        elapsedTime.value++
        timeRemaining.value--
        
        if (timeRemaining.value <= 0) {
          endSession()
        }
      }, 1000)
    }
    
    const loadCurrentModule = () => {
      const floor = currentFloor.value
      if (!floor) return
      
      // Mock module data
      currentModule.value = {
        title: floor.topic,
        complexity: floor.complexity,
        explanation: {
          title: `${floor.topic}の学習`,
          content: `<p>ここでは${floor.topic}について学習します。</p><p>段階的に理解を深めていきましょう。</p>`
        },
        examples: [
          {
            sentence: "I am a student.",
            translation: "私は学生です。",
            highlight: "Be動詞 'am' の使用"
          },
          {
            sentence: "She is very kind.",
            translation: "彼女はとても親切です。",
            highlight: "Be動詞 'is' の使用"
          }
        ]
      }
      
      currentPhase.value = 'explanation'
    }
    
    const moveToConstructionPhase = () => {
      currentPhase.value = 'construction'
      loadConstructionTask()
    }
    
    const loadConstructionTask = () => {
      // Mock task based on current module
      const taskTypes = ['sentence_building', 'pattern_matching', 'error_correction']
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
      
      if (taskType === 'sentence_building') {
        currentTask.value = {
          type: 'sentence_building',
          title: '文を組み立てよう',
          instruction: '与えられた語句を使って正しい文を作ってください'
        }
        
        availableWords.value = [
          { text: 'I', used: false, correctPosition: false },
          { text: 'am', used: false, correctPosition: false },
          { text: 'a', used: false, correctPosition: false },
          { text: 'student', used: false, correctPosition: false }
        ]
        
        constructionSlots.value = Array(4).fill(null).map(() => ({ word: null, isCorrect: false, isIncorrect: false }))
      }
      
      constructionFeedback.value = null
    }
    
    const selectWord = (word, index) => {
      if (word.used) return
      
      const emptySlotIndex = constructionSlots.value.findIndex(slot => !slot.word)
      if (emptySlotIndex !== -1) {
        constructionSlots.value[emptySlotIndex].word = word
        word.used = true
      }
    }
    
    const removeWord = (slotIndex) => {
      const slot = constructionSlots.value[slotIndex]
      if (slot.word) {
        slot.word.used = false
        slot.word = null
        slot.isCorrect = false
        slot.isIncorrect = false
      }
    }
    
    const onDragStart = (event, word, index) => {
      event.dataTransfer.setData('word', JSON.stringify({ word, index }))
    }
    
    const onDrop = (event, slotIndex) => {
      const data = JSON.parse(event.dataTransfer.getData('word'))
      const slot = constructionSlots.value[slotIndex]
      
      if (slot.word) {
        slot.word.used = false
      }
      
      slot.word = data.word
      data.word.used = true
    }
    
    const checkConstruction = async () => {
      if (currentTask.value.type === 'sentence_building') {
        // Check sentence construction
        const sentence = constructionSlots.value.map(slot => slot.word?.text).join(' ')
        const correctSentence = "I am a student"
        
        if (sentence === correctSentence) {
          constructionFeedback.value = {
            type: 'success',
            message: '正解です！完璧な文が作れました。',
            explanation: 'Be動詞の使い方が正しく理解できています。'
          }
          await playEffectSound('correct')
          
          // Mark correct positions
          constructionSlots.value.forEach(slot => {
            slot.isCorrect = true
          })
          
          setTimeout(() => {
            moveToReviewPhase()
          }, 2000)
        } else {
          constructionFeedback.value = {
            type: 'error',
            message: '惜しい！もう一度考えてみましょう。',
            explanation: 'Be動詞と主語の関係を確認してください。'
          }
          await playEffectSound('incorrect')
        }
      }
    }
    
    const moveToReviewPhase = () => {
      currentPhase.value = 'review'
      
      // Calculate mastery for this module
      currentMastery.value = {
        understanding: Math.min(90 + Math.random() * 10, 100),
        application: Math.min(85 + Math.random() * 15, 100),
        retention: Math.min(80 + Math.random() * 20, 100)
      }
      
      learningPoints.value = [
        `${currentModule.value.title}の基本構造を理解しました`,
        '実際の文作成に応用できるようになりました',
        '類似の文法パターンも認識できます'
      ]
      
      nextStepRecommendations.value = [
        {
          title: '次のフロアへ進む',
          description: '更に高度な文法項目に挑戦しましょう'
        },
        {
          title: 'Rush Zone で練習',
          description: '学習した内容を高速練習で定着させましょう'
        }
      ]
    }
    
    const completeModule = async () => {
      // Mark current floor as completed
      const floor = currentFloor.value
      if (floor) {
        floor.completed = true
        floor.current = false
        floor.progress = 100
      }
      
      // Move to next floor
      currentFloorIndex.value++
      const nextFloor = buildingFloors.value[currentFloorIndex.value]
      
      if (nextFloor) {
        nextFloor.locked = false
        nextFloor.current = true
        loadCurrentModule()
        await playEffectSound('levelUp')
      } else {
        // All floors completed
        endSession()
      }
    }
    
    const practiceMore = () => {
      // Reset current task for more practice
      loadConstructionTask()
      currentPhase.value = 'construction'
    }
    
    const requestHelp = async () => {
      // Provide additional scaffolding
      if (currentModule.value && currentModule.value.explanation) {
        currentModule.value.explanation.content += '<p><strong>追加ヒント:</strong> 英語の語順は「主語 + 動詞 + 目的語」が基本です。</p>'
      }
      
      await playEffectSound('button')
    }
    
    const requestHint = async () => {
      if (currentTask.value?.type === 'sentence_building') {
        constructionFeedback.value = {
          type: 'hint',
          message: 'ヒント: 英語は「主語」から始まります。',
          explanation: '「I」から始めてみましょう。'
        }
      }
      
      await playEffectSound('button')
    }
    
    const resetConstruction = () => {
      // Reset all task state
      availableWords.value.forEach(word => {
        word.used = false
        word.correctPosition = false
      })
      
      constructionSlots.value.forEach(slot => {
        slot.word = null
        slot.isCorrect = false
        slot.isIncorrect = false
      })
      
      constructionFeedback.value = null
      selectedPattern.value = -1
      showPatternResult.value = false
      selectedErrorWord.value = -1
      correctionInput.value = ''
    }
    
    const playExampleAudio = async (example) => {
      await speakSentence(example.sentence)
    }
    
    const endSession = async () => {
      clearInterval(sessionTimer)
      gameState.value = 'completed'
      
      if (currentSession.value) {
        sessionPerformance.value = multiLayerEngine.endSession(currentSession.value.sessionId)
        
        // Record progress in grammar store
        const avgMastery = overallMastery.value
        grammarStore.recordProgress(
          selectedProject.value,
          avgMastery >= 70,
          totalStudyTime.value / 60000
        )
      }
      
      await playEffectSound('complete')
    }
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    
    const continueBuilding = () => {
      // Reset and continue with next project or current project
      resetSession()
      gameState.value = 'setup'
    }
    
    const returnToHub = () => {
      resetSession()
      // Navigate to grammar hub
      logger.log('Navigate to grammar hub')
    }
    
    const tryBattleZone = () => {
      resetSession()
      // Navigate to battle zone
      logger.log('Navigate to battle zone')
    }
    
    const resetSession = () => {
      clearInterval(sessionTimer)
      gameState.value = 'setup'
      currentSession.value = null
      currentPhase.value = 'explanation'
      elapsedTime.value = 0
      timeRemaining.value = 0
      buildingFloors.value = []
      currentFloorIndex.value = 0
      currentModule.value = null
      currentTask.value = null
      sessionPerformance.value = null
    }

    // Lifecycle
    onMounted(() => {
      logger.log('Construction Zone Game mounted')
    })
    
    onUnmounted(() => {
      clearInterval(sessionTimer)
    })

    return {
      // State
      gameState,
      currentSession,
      currentPhase,
      elapsedTime,
      timeRemaining,
      buildingFloors,
      currentModule,
      currentTask,
      selectedProject,
      learningMode,
      collaborativeMode,
      scaffoldingLevel,
      availableWords,
      constructionSlots,
      constructionFeedback,
      selectedPattern,
      showPatternResult,
      selectedErrorWord,
      correctionInput,
      errorSentenceWords,
      currentMastery,
      sessionPerformance,
      nextStepRecommendations,
      learningPoints,
      participants,
      availableProjects,
      
      // Computed
      currentFloor,
      completedFloors,
      totalFloors,
      totalStudyTime,
      overallMastery,
      canCheckConstruction,
      scaffoldingTips,
      
      // Methods
      startConstructionSession,
      moveToConstructionPhase,
      selectWord,
      removeWord,
      onDragStart,
      onDrop,
      checkConstruction,
      completeModule,
      practiceMore,
      requestHelp,
      requestHint,
      resetConstruction,
      playExampleAudio,
      formatTime,
      continueBuilding,
      returnToHub,
      tryBattleZone
    }
  }
}
</script>

<style scoped>
.construction-zone-container {
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  min-height: 100vh;
  color: white;
}

.construction-zone-header {
  text-align: center;
  margin-bottom: 30px;
}

.zone-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.zone-description {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.building-progress {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  margin-bottom: 20px;
}

.building-visualization {
  display: flex;
  flex-direction: column-reverse;
  gap: 5px;
}

.building-floor {
  width: 200px;
  height: 50px;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  transition: all 0.3s ease;
}

.building-floor.completed {
  background: rgba(16,185,129,0.3);
  border-color: #10b981;
}

.building-floor.current {
  background: rgba(59,130,246,0.3);
  border-color: #3b82f6;
  animation: glow 2s ease-in-out infinite alternate;
}

.building-floor.locked {
  opacity: 0.5;
  filter: grayscale(1);
}

.floor-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.floor-number {
  background: rgba(255,255,255,0.2);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.floor-topic {
  flex: 1;
  text-align: center;
  font-size: 0.9rem;
}

.floor-progress {
  width: 50px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
}

.floor-progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.building-info {
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 15px;
  font-size: 0.9rem;
}

.game-area {
  max-width: 1000px;
  margin: 0 auto;
}

.learning-module {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 30px;
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.module-title {
  font-size: 1.8rem;
  font-weight: bold;
}

.complexity-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.complexity-stars {
  display: flex;
  gap: 2px;
}

.star {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.star.filled {
  opacity: 1;
}

.learning-content {
  margin-bottom: 20px;
}

.explanation-content h3 {
  margin-bottom: 15px;
  color: #fbbf24;
}

.explanation-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 25px;
}

.interactive-examples {
  margin-bottom: 25px;
}

.example-card {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.example-card:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

.example-sentence {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.example-translation {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.example-highlight {
  font-size: 0.9rem;
  color: #fbbf24;
  font-style: italic;
}

.scaffolding-support {
  background: rgba(59,130,246,0.2);
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #3b82f6;
}

.support-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.support-tip {
  background: rgba(255,255,255,0.1);
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.phase-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.construction-task {
  background: rgba(255,255,255,0.05);
  padding: 25px;
  border-radius: 12px;
}

.task-instruction {
  font-size: 1.1rem;
  margin-bottom: 20px;
  text-align: center;
  opacity: 0.9;
}

.task-interface {
  margin-bottom: 25px;
}

.sentence-builder {
  display: grid;
  gap: 30px;
}

.word-bank h4, .sentence-construction h4 {
  margin-bottom: 15px;
  color: #fbbf24;
}

.word-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  min-height: 60px;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
}

.word-option {
  background: #3b82f6;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.word-option:hover {
  background: #60a5fa;
  transform: translateY(-2px);
}

.word-option.used {
  opacity: 0.3;
  cursor: not-allowed;
}

.word-option.correct-position {
  background: #10b981;
}

.construction-slots {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  min-height: 60px;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  margin-bottom: 20px;
}

.construction-slot {
  background: rgba(255,255,255,0.2);
  border: 2px dashed rgba(255,255,255,0.5);
  padding: 8px 15px;
  border-radius: 8px;
  min-width: 80px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.construction-slot.filled {
  background: #6366f1;
  border-style: solid;
  border-color: #8b5cf6;
}

.construction-slot.correct {
  background: #10b981;
  border-color: #34d399;
}

.construction-slot.incorrect {
  background: #ef4444;
  border-color: #f87171;
}

.construction-feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
}

.feedback-message {
  font-weight: bold;
  margin-bottom: 5px;
}

.feedback-message.success {
  color: #10b981;
}

.feedback-message.error {
  color: #ef4444;
}

.feedback-message.hint {
  color: #f59e0b;
}

.feedback-explanation {
  font-size: 0.9rem;
  opacity: 0.8;
}

.task-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.review-content {
  background: rgba(255,255,255,0.05);
  padding: 25px;
  border-radius: 12px;
}

.mastery-assessment {
  margin-bottom: 25px;
}

.mastery-indicators {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mastery-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mastery-label {
  min-width: 80px;
  font-weight: bold;
}

.mastery-bar {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
}

.mastery-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  transition: width 0.5s ease;
}

.mastery-percentage {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
}

.learning-summary {
  margin-bottom: 25px;
}

.summary-points {
  margin: 15px 0 0 20px;
}

.summary-points li {
  margin-bottom: 8px;
}

.recommendations {
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

.recommendation-card {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #fbbf24;
}

.rec-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #fbbf24;
}

.rec-description {
  font-size: 0.9rem;
  opacity: 0.8;
}

.results-screen {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.results-title {
  font-size: 2.5rem;
  margin-bottom: 30px;
}

.building-completed {
  background: rgba(255,255,255,0.1);
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.building-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.session-analysis {
  background: rgba(255,255,255,0.1);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.analysis-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.metric-card {
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.metric-gauge {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.gauge-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.5s ease;
}

.btn-primary, .btn-secondary, .btn-accent, .btn-help, .btn-start {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-accent {
  background: #f59e0b;
  color: white;
}

.btn-help {
  background: #8b5cf6;
  color: white;
}

.btn-start {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
  font-size: 1.2rem;
  padding: 15px 30px;
}

.btn-primary:hover, .btn-accent:hover, .btn-help:hover, .btn-start:hover {
  transform: translateY(-2px);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.setup-screen {
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.setup-options {
  margin-bottom: 30px;
}

.option-group {
  margin-bottom: 20px;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.option-group select {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.9);
  color: #333;
  font-size: 1rem;
}

.mode-options {
  display: flex;
  gap: 20px;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(59,130,246,0.5); }
  100% { box-shadow: 0 0 20px rgba(59,130,246,0.8), 0 0 30px rgba(59,130,246,0.4); }
}

@media (max-width: 768px) {
  .building-progress {
    flex-direction: column;
    align-items: center;
  }
  
  .building-visualization {
    order: 2;
  }
  
  .building-info {
    order: 1;
    width: 100%;
    text-align: center;
  }
  
  .word-options, .construction-slots {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>