<!-- Multi-Layer Learning Engine - Battle Zone Component -->
<template>
  <div class="battle-zone-container">
    <!-- Header -->
    <div class="battle-zone-header">
      <h1 class="zone-title">⚔️ Battle Zone</h1>
      <p class="zone-description">仲間と競い合いながら英語力を鍛えよう！</p>
      
      <!-- Battle Status -->
      <div class="battle-status">
        <div class="round-info">
          <span class="round-label">Round {{ currentRound }}/{{ totalRounds }}</span>
          <div class="round-timer">
            <div 
              class="timer-circle" 
              :style="{ 
                background: `conic-gradient(#ef4444 ${timerPercentage}%, rgba(255,255,255,0.2) ${timerPercentage}%)` 
              }"
            >
              <span class="timer-text">{{ timeRemaining }}s</span>
            </div>
          </div>
        </div>
        
        <div class="battle-mode-indicator">
          <span class="mode-badge" :class="battleMode">
            {{ battleMode === 'team' ? 'チーム戦' : '個人戦' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Players/Teams Area -->
    <div class="players-area" v-if="gameState === 'playing'">
      <!-- Individual Battle -->
      <div class="individual-battle" v-if="battleMode === 'individual'">
        <div class="player-cards">
          <div 
            v-for="(player, index) in players" 
            :key="player.id"
            class="player-card"
            :class="{ 
              'current-player': player.id === currentPlayerId,
              'winner': player.isWinner,
              'eliminated': player.isEliminated
            }"
          >
            <div class="player-avatar">
              <img :src="player.avatar" :alt="player.name" />
              <div class="player-status-indicator" :class="player.status"></div>
            </div>
            <div class="player-info">
              <h3 class="player-name">{{ player.name }}</h3>
              <div class="player-stats">
                <div class="stat">
                  <span class="stat-label">スコア</span>
                  <span class="stat-value">{{ player.score }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">正答率</span>
                  <span class="stat-value">{{ Math.round(player.accuracy * 100) }}%</span>
                </div>
                <div class="stat">
                  <span class="stat-label">連続</span>
                  <span class="stat-value">{{ player.streak }}</span>
                </div>
              </div>
            </div>
            <div class="player-powerups">
              <div 
                v-for="(powerup, pIndex) in player.powerups" 
                :key="pIndex"
                class="powerup-icon"
                :class="powerup.type"
                :title="powerup.name"
              >
                {{ powerup.icon }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Battle -->
      <div class="team-battle" v-if="battleMode === 'team'">
        <div class="teams-container">
          <div 
            v-for="(team, index) in teams" 
            :key="team.id"
            class="team-card"
            :class="{ 'winning-team': team.isWinning }"
          >
            <div class="team-header">
              <h3 class="team-name">{{ team.name }}</h3>
              <div class="team-score">{{ team.totalScore }}</div>
            </div>
            <div class="team-members">
              <div 
                v-for="member in team.members" 
                :key="member.id"
                class="team-member"
                :class="{ 'active': member.id === currentPlayerId }"
              >
                <div class="member-avatar">
                  <img :src="member.avatar" :alt="member.name" />
                </div>
                <div class="member-info">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-score">{{ member.score }}</span>
                </div>
              </div>
            </div>
            <div class="team-powerups">
              <div 
                v-for="(powerup, pIndex) in team.activePowerups" 
                :key="pIndex"
                class="team-powerup"
                :class="powerup.type"
              >
                {{ powerup.icon }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Area -->
    <div class="question-area" v-if="gameState === 'playing' && currentQuestion">
      <div class="question-container">
        <div class="question-header">
          <div class="question-info">
            <span class="question-number">Q{{ currentQuestionIndex + 1 }}</span>
            <span class="difficulty-indicator" :class="currentQuestion.difficulty">
              {{ currentQuestion.difficulty.toUpperCase() }}
            </span>
            <span class="points-value">+{{ currentQuestion.points }}pt</span>
          </div>
          
          <!-- Question Timer -->
          <div class="question-timer">
            <div 
              class="timer-bar" 
              :style="{ width: questionTimePercentage + '%' }"
              :class="{ 'danger': questionTimePercentage <= 20 }"
            ></div>
          </div>
        </div>

        <div class="question-content">
          <h2 class="question-text">{{ currentQuestion.question }}</h2>
          
          <!-- Battle-specific question types -->
          <div class="battle-question-interface">
            <!-- Speed Challenge -->
            <div class="speed-challenge" v-if="currentQuestion.type === 'speed'">
              <div class="speed-options">
                <button 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  class="speed-option"
                  :class="{ 
                    'selected': selectedAnswer === index,
                    'correct': showResult && index === currentQuestion.correctAnswer,
                    'incorrect': showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
                  }"
                  @click="selectAnswer(index)"
                  :disabled="showResult || !isMyTurn"
                >
                  <span class="option-key">{{ String.fromCharCode(65 + index) }}</span>
                  <span class="option-text">{{ option }}</span>
                </button>
              </div>
            </div>

            <!-- Collaborative Challenge -->
            <div class="collaborative-challenge" v-if="currentQuestion.type === 'collaborative'">
              <div class="team-input-area">
                <h4>チームで答えを作成してください</h4>
                <div class="collaborative-workspace">
                  <textarea 
                    v-model="collaborativeAnswer"
                    class="team-answer-input"
                    placeholder="チームの回答を入力..."
                    :disabled="!isMyTurn || showResult"
                  ></textarea>
                  
                  <div class="team-contributions">
                    <h5>チームメンバーの貢献</h5>
                    <div 
                      v-for="contribution in teamContributions" 
                      :key="contribution.playerId"
                      class="contribution-item"
                    >
                      <span class="contributor-name">{{ contribution.playerName }}</span>
                      <span class="contribution-text">{{ contribution.text }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Elimination Challenge -->
            <div class="elimination-challenge" v-if="currentQuestion.type === 'elimination'">
              <div class="elimination-warning">
                <h4>⚠️ 脱落チャレンジ</h4>
                <p>間違えると脱落の可能性があります！</p>
              </div>
              
              <div class="elimination-options">
                <button 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  class="elimination-option"
                  :class="{ 
                    'selected': selectedAnswer === index,
                    'correct': showResult && index === currentQuestion.correctAnswer,
                    'incorrect': showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
                  }"
                  @click="selectAnswer(index)"
                  :disabled="showResult || !isMyTurn"
                >
                  {{ option }}
                </button>
              </div>
            </div>
          </div>

          <!-- Turn Indicator -->
          <div class="turn-indicator" v-if="battleMode === 'individual'">
            <div class="turn-info" :class="{ 'my-turn': isMyTurn }">
              {{ isMyTurn ? 'あなたの番です！' : `${currentPlayerName}の番` }}
            </div>
          </div>
        </div>
      </div>

      <!-- Answer Feedback -->
      <div class="answer-feedback" v-if="showResult && lastAnswerFeedback">
        <div class="feedback-content" :class="lastAnswerFeedback.type">
          <div class="feedback-icon">{{ lastAnswerFeedback.icon }}</div>
          <div class="feedback-text">
            <h4>{{ lastAnswerFeedback.title }}</h4>
            <p>{{ lastAnswerFeedback.message }}</p>
          </div>
          <div class="feedback-points" v-if="lastAnswerFeedback.points">
            +{{ lastAnswerFeedback.points }} ポイント
          </div>
        </div>
      </div>
    </div>

    <!-- Power-ups Panel -->
    <div class="powerups-panel" v-if="gameState === 'playing'">
      <h4>パワーアップ</h4>
      <div class="available-powerups">
        <button 
          v-for="(powerup, index) in availablePowerups" 
          :key="index"
          class="powerup-button"
          :class="{ 'disabled': !powerup.canUse || powerup.cooldown > 0 }"
          @click="usePowerup(powerup)"
          :disabled="!powerup.canUse || powerup.cooldown > 0"
          :title="powerup.description"
        >
          <div class="powerup-icon">{{ powerup.icon }}</div>
          <div class="powerup-name">{{ powerup.name }}</div>
          <div class="powerup-cooldown" v-if="powerup.cooldown > 0">
            {{ powerup.cooldown }}s
          </div>
        </button>
      </div>
    </div>

    <!-- Battle Results -->
    <div class="battle-results" v-if="gameState === 'completed'">
      <h2 class="results-title">Battle Complete!</h2>
      
      <!-- Winner Announcement -->
      <div class="winner-announcement">
        <div class="winner-podium">
          <div 
            v-for="(winner, index) in finalRankings.slice(0, 3)" 
            :key="winner.id"
            class="podium-position"
            :class="`position-${index + 1}`"
          >
            <div class="podium-avatar">
              <img :src="winner.avatar" :alt="winner.name" />
              <div class="position-number">{{ index + 1 }}</div>
            </div>
            <div class="podium-info">
              <h4>{{ winner.name }}</h4>
              <p>{{ winner.finalScore }} pts</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Battle Statistics -->
      <div class="battle-statistics">
        <h3>戦闘統計</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>最高スコア</h4>
            <p>{{ battleStats.highestScore }}</p>
          </div>
          <div class="stat-card">
            <h4>平均正答率</h4>
            <p>{{ Math.round(battleStats.averageAccuracy * 100) }}%</p>
          </div>
          <div class="stat-card">
            <h4>総質問数</h4>
            <p>{{ battleStats.totalQuestions }}</p>
          </div>
          <div class="stat-card">
            <h4>使用パワーアップ</h4>
            <p>{{ battleStats.powerupsUsed }}</p>
          </div>
        </div>
      </div>

      <!-- Personal Performance -->
      <div class="personal-performance" v-if="personalStats">
        <h3>あなたのパフォーマンス</h3>
        <div class="performance-metrics">
          <div class="metric">
            <span class="metric-label">最終順位</span>
            <span class="metric-value">#{{ personalStats.finalRank }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">獲得ポイント</span>
            <span class="metric-value">{{ personalStats.totalPoints }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">正答率</span>
            <span class="metric-value">{{ Math.round(personalStats.accuracy * 100) }}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">最大連続</span>
            <span class="metric-value">{{ personalStats.maxStreak }}</span>
          </div>
        </div>

        <!-- Achievement Unlocks -->
        <div class="achievements" v-if="unlockedAchievements.length > 0">
          <h4>新しい実績を解除しました！</h4>
          <div class="achievement-list">
            <div 
              v-for="achievement in unlockedAchievements" 
              :key="achievement.id"
              class="achievement-item"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <h5>{{ achievement.name }}</h5>
                <p>{{ achievement.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Session Performance Analysis -->
      <div class="session-analysis" v-if="sessionPerformance">
        <h3>セッション分析</h3>
        <div class="analysis-chart">
          <div class="performance-radar">
            <!-- Simplified radar chart representation -->
            <div class="radar-metrics">
              <div class="radar-metric">
                <span class="radar-label">反応速度</span>
                <div class="radar-bar">
                  <div 
                    class="radar-fill" 
                    :style="{ width: sessionPerformance.speed * 100 + '%' }"
                  ></div>
                </div>
              </div>
              <div class="radar-metric">
                <span class="radar-label">正確性</span>
                <div class="radar-bar">
                  <div 
                    class="radar-fill" 
                    :style="{ width: sessionPerformance.accuracy * 100 + '%' }"
                  ></div>
                </div>
              </div>
              <div class="radar-metric">
                <span class="radar-label">安定性</span>
                <div class="radar-bar">
                  <div 
                    class="radar-fill" 
                    :style="{ width: sessionPerformance.consistency + '%' }"
                  ></div>
                </div>
              </div>
              <div class="radar-metric">
                <span class="radar-label">戦略性</span>
                <div class="radar-bar">
                  <div 
                    class="radar-fill" 
                    :style="{ width: sessionPerformance.improvement + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn-primary" @click="playAgain">再戦</button>
        <button class="btn-secondary" @click="returnToHub">ハブに戻る</button>
        <button class="btn-accent" @click="inviteFriends">友達を招待</button>
      </div>
    </div>

    <!-- Setup/Lobby Screen -->
    <div class="setup-screen" v-if="gameState === 'setup'">
      <h2>Battle Zone ロビー</h2>
      
      <div class="lobby-content">
        <div class="battle-setup">
          <h3>戦闘設定</h3>
          
          <div class="setup-options">
            <div class="option-group">
              <label>バトルモード:</label>
              <div class="mode-selection">
                <button 
                  class="mode-button"
                  :class="{ 'selected': battleMode === 'individual' }"
                  @click="battleMode = 'individual'"
                >
                  個人戦
                </button>
                <button 
                  class="mode-button"
                  :class="{ 'selected': battleMode === 'team' }"
                  @click="battleMode = 'team'"
                >
                  チーム戦
                </button>
              </div>
            </div>
            
            <div class="option-group">
              <label>文法テーマ:</label>
              <select v-model="selectedTopic">
                <option v-for="topic in availableTopics" :key="topic.id" :value="topic.id">
                  {{ topic.name }}
                </option>
              </select>
            </div>
            
            <div class="option-group">
              <label>ラウンド数:</label>
              <select v-model="totalRounds">
                <option value="3">3ラウンド (短時間)</option>
                <option value="5">5ラウンド (標準)</option>
                <option value="7">7ラウンド (長時間)</option>
              </select>
            </div>
            
            <div class="option-group">
              <label>難易度スケーリング:</label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="difficultyScaling" />
                <span>プレイヤーのレベルに合わせて調整</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Player Lobby -->
        <div class="player-lobby">
          <h3>参加プレイヤー ({{ currentPlayers.length }}/{{ maxPlayers }})</h3>
          <div class="lobby-players">
            <div 
              v-for="player in currentPlayers" 
              :key="player.id"
              class="lobby-player"
            >
              <div class="lobby-player-avatar">
                <img :src="player.avatar" :alt="player.name" />
                <div class="player-ready-indicator" :class="{ 'ready': player.isReady }">
                  {{ player.isReady ? '✓' : '...' }}
                </div>
              </div>
              <div class="lobby-player-info">
                <h4>{{ player.name }}</h4>
                <p>レベル {{ player.level }}</p>
                <p class="player-status">{{ player.isReady ? '準備完了' : '準備中' }}</p>
              </div>
            </div>
          </div>
          
          <div class="lobby-actions">
            <button 
              class="btn-ready"
              :class="{ 'ready': isPlayerReady }"
              @click="toggleReady"
            >
              {{ isPlayerReady ? '準備完了' : '準備する' }}
            </button>
            
            <button 
              class="btn-start"
              @click="startBattleSession"
              :disabled="!canStartBattle"
            >
              バトル開始！
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Spectator Mode -->
    <div class="spectator-screen" v-if="gameState === 'spectating'">
      <h2>観戦モード</h2>
      <div class="spectator-controls">
        <button class="btn-join" @click="joinBattle">参戦する</button>
        <button class="btn-leave" @click="leaveBattle">退室</button>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { multiLayerEngine } from '@/services/multiLayerEngine'
import { useGrammarMasteryStore } from '@/stores/grammarMasteryStore'
import { useGameAudio } from '@/composables/useGameAudio'

export default {
  name: 'BattleZoneGame',
  setup() {
    const grammarStore = useGrammarMasteryStore()
    const { playEffectSound, speakSentence } = useGameAudio()

    // Game State
    const gameState = ref('setup') // setup, playing, completed, spectating
    const currentSession = ref(null)
    const battleMode = ref('individual') // individual, team
    const currentRound = ref(1)
    const totalRounds = ref(5)
    const timeRemaining = ref(0)
    const currentQuestionIndex = ref(0)
    const currentQuestion = ref(null)
    const selectedAnswer = ref(null)
    const showResult = ref(false)
    const questionTimeRemaining = ref(15)
    const questionTimeLimit = ref(15)
    
    // Battle State
    const players = ref([])
    const teams = ref([])
    const currentPlayerId = ref('player1')
    const currentPlayerTurn = ref('player1')
    const collaborativeAnswer = ref('')
    const teamContributions = ref([])
    const lastAnswerFeedback = ref(null)
    
    // Setup State
    const selectedTopic = ref('be_verbs_basic')
    const difficultyScaling = ref(true)
    const currentPlayers = ref([])
    const maxPlayers = ref(4)
    const isPlayerReady = ref(false)
    
    // Performance Tracking
    const sessionPerformance = ref(null)
    const personalStats = ref(null)
    const battleStats = ref(null)
    const finalRankings = ref([])
    const unlockedAchievements = ref([])
    
    // Power-ups
    const availablePowerups = ref([])
    
    // Timers
    let gameTimer = null
    let questionTimer = null

    // Computed Properties
    const timerPercentage = computed(() => {
      if (!currentSession.value) return 0
      const totalTime = currentSession.value.configuration.roundDuration
      return ((totalTime - timeRemaining.value) / totalTime) * 100
    })
    
    const questionTimePercentage = computed(() => {
      return (questionTimeRemaining.value / questionTimeLimit.value) * 100
    })
    
    const isMyTurn = computed(() => {
      return currentPlayerTurn.value === currentPlayerId.value
    })
    
    const currentPlayerName = computed(() => {
      const player = players.value.find(p => p.id === currentPlayerTurn.value)
      return player ? player.name : ''
    })
    
    const canStartBattle = computed(() => {
      return currentPlayers.value.length >= 2 && 
             currentPlayers.value.every(p => p.isReady)
    })
    
    const availableTopics = computed(() => {
      return grammarStore.unlockedTopics
    })

    // Mock data
    const initializeMockData = () => {
      // Mock players
      players.value = [
        {
          id: 'player1',
          name: 'あなた',
          avatar: '/avatars/player1.png',
          score: 0,
          accuracy: 0,
          streak: 0,
          status: 'active',
          isWinner: false,
          isEliminated: false,
          powerups: []
        },
        {
          id: 'player2',
          name: 'ライバルA',
          avatar: '/avatars/player2.png',
          score: 0,
          accuracy: 0,
          streak: 0,
          status: 'active',
          isWinner: false,
          isEliminated: false,
          powerups: []
        }
      ]

      // Mock teams for team mode
      teams.value = [
        {
          id: 'team1',
          name: 'チーム レッド',
          totalScore: 0,
          isWinning: false,
          members: [players.value[0]],
          activePowerups: []
        },
        {
          id: 'team2',
          name: 'チーム ブルー',
          totalScore: 0,
          isWinning: false,
          members: [players.value[1]],
          activePowerups: []
        }
      ]

      // Mock lobby players
      currentPlayers.value = [
        {
          id: 'player1',
          name: 'あなた',
          avatar: '/avatars/player1.png',
          level: 3,
          isReady: false
        },
        {
          id: 'player2',
          name: 'ライバルA',
          avatar: '/avatars/player2.png',
          level: 2,
          isReady: false
        }
      ]

      // Mock powerups
      availablePowerups.value = [
        {
          id: 'time_freeze',
          name: 'タイムフリーズ',
          icon: '⏸️',
          description: '5秒間時間を停止',
          canUse: true,
          cooldown: 0,
          cost: 100
        },
        {
          id: 'double_points',
          name: 'ダブルポイント',
          icon: '💎',
          description: '次の問題で2倍ポイント',
          canUse: true,
          cooldown: 0,
          cost: 150
        },
        {
          id: 'hint',
          name: 'ヒント',
          icon: '💡',
          description: '間違った選択肢を1つ除外',
          canUse: true,
          cooldown: 0,
          cost: 75
        }
      ]
    }

    // Mock questions for development
    const mockQuestions = [
      {
        id: 1,
        type: 'speed',
        question: "I ___ a student.",
        options: ["am", "is", "are", "be"],
        correctAnswer: 0,
        difficulty: 'easy',
        points: 100,
        grammarTopic: "Be動詞"
      },
      {
        id: 2,
        type: 'elimination',
        question: "Choose the correct past tense:",
        options: ["goed", "went", "wented", "goes"],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 200,
        grammarTopic: "過去形"
      },
      {
        id: 3,
        type: 'collaborative',
        question: "Create a sentence using 'have been + verb-ing'",
        difficulty: 'hard',
        points: 300,
        grammarTopic: "現在完了進行形"
      }
    ]

    // Methods
    const startBattleSession = async () => {
      try {
        currentSession.value = multiLayerEngine.startBattleZoneSession(
          currentPlayerId.value,
          selectedTopic.value,
          battleMode.value
        )
        
        gameState.value = 'playing'
        timeRemaining.value = currentSession.value.configuration.roundDuration
        currentRound.value = 1
        
        await playEffectSound('gameStart')
        startGameTimer()
        loadNextQuestion()
        
      } catch (error) {
        logger.error('Failed to start Battle Zone session:', error)
      }
    }
    
    const startGameTimer = () => {
      gameTimer = setInterval(() => {
        timeRemaining.value--
        
        if (timeRemaining.value <= 10 && timeRemaining.value > 0) {
          playEffectSound('timeWarning')
        }
        
        if (timeRemaining.value <= 0) {
          nextRound()
        }
      }, 1000)
    }
    
    const startQuestionTimer = () => {
      questionTimeRemaining.value = questionTimeLimit.value
      
      questionTimer = setInterval(() => {
        questionTimeRemaining.value--
        
        if (questionTimeRemaining.value <= 0) {
          timeoutQuestion()
        }
      }, 1000)
    }
    
    const loadNextQuestion = () => {
      if (currentQuestionIndex.value >= mockQuestions.length) {
        currentQuestionIndex.value = 0
      }
      
      currentQuestion.value = { ...mockQuestions[currentQuestionIndex.value] }
      selectedAnswer.value = null
      showResult.value = false
      collaborativeAnswer.value = ''
      teamContributions.value = []
      
      startQuestionTimer()
      currentQuestionIndex.value++
    }
    
    const selectAnswer = async (index) => {
      if (showResult.value || !isMyTurn.value) return
      
      clearInterval(questionTimer)
      selectedAnswer.value = index
      showResult.value = true
      
      const isCorrect = index === currentQuestion.value.correctAnswer
      const responseTime = questionTimeLimit.value - questionTimeRemaining.value
      
      // Update player stats
      const currentPlayer = players.value.find(p => p.id === currentPlayerId.value)
      if (currentPlayer) {
        if (isCorrect) {
          currentPlayer.score += currentQuestion.value.points
          currentPlayer.streak++
          await playEffectSound('correct')
          
          lastAnswerFeedback.value = {
            type: 'success',
            icon: '✅',
            title: '正解！',
            message: `素晴らしい回答です！`,
            points: currentQuestion.value.points
          }
        } else {
          currentPlayer.streak = 0
          await playEffectSound('incorrect')
          
          lastAnswerFeedback.value = {
            type: 'error',
            icon: '❌',
            title: '不正解',
            message: `正解は「${currentQuestion.value.options[currentQuestion.value.correctAnswer]}」でした。`,
            points: 0
          }
        }
        
        // Update accuracy
        const totalAnswers = currentQuestionIndex.value
        const correctAnswers = Math.round(currentPlayer.score / 100) // Simplified calculation
        currentPlayer.accuracy = correctAnswers / totalAnswers
      }
      
      // Update real-time performance
      updateRealTimePerformance()
      
      // Auto advance after delay
      setTimeout(() => {
        nextTurn()
      }, 2500)
    }
    
    const timeoutQuestion = () => {
      if (showResult.value) return
      
      showResult.value = true
      selectedAnswer.value = -1
      
      lastAnswerFeedback.value = {
        type: 'timeout',
        icon: '⏰',
        title: '時間切れ',
        message: '時間内に回答できませんでした。',
        points: 0
      }
      
      playEffectSound('timeWarning')
      
      setTimeout(() => {
        nextTurn()
      }, 2000)
    }
    
    const nextTurn = () => {
      if (battleMode.value === 'individual') {
        // Rotate to next player
        const currentIndex = players.value.findIndex(p => p.id === currentPlayerTurn.value)
        const nextIndex = (currentIndex + 1) % players.value.length
        currentPlayerTurn.value = players.value[nextIndex].id
      }
      
      loadNextQuestion()
    }
    
    const nextRound = () => {
      currentRound.value++
      
      if (currentRound.value > totalRounds.value) {
        endBattle()
      } else {
        // Reset round timer
        timeRemaining.value = currentSession.value.configuration.roundDuration
        playEffectSound('levelUp')
      }
    }
    
    const updateRealTimePerformance = () => {
      if (!currentSession.value) return
      
      const currentPlayer = players.value.find(p => p.id === currentPlayerId.value)
      if (!currentPlayer) return
      
      const currentPerformance = {
        accuracy: currentPlayer.accuracy,
        speed: calculateSpeed(),
        consistency: calculateConsistency(),
        engagementLevel: calculateEngagement()
      }
      
      multiLayerEngine.performRealTimeAdaptation(
        currentSession.value.sessionId,
        currentPerformance
      )
    }
    
    const calculateSpeed = () => {
      // Mock calculation
      return Math.min(currentQuestionIndex.value * 2, 100)
    }
    
    const calculateConsistency = () => {
      // Mock calculation based on streak
      const currentPlayer = players.value.find(p => p.id === currentPlayerId.value)
      return currentPlayer ? Math.min(currentPlayer.streak * 10, 100) : 0
    }
    
    const calculateEngagement = () => {
      // Mock calculation
      return Math.random() * 0.3 + 0.7 // 70-100%
    }
    
    const usePowerup = async (powerup) => {
      if (!powerup.canUse || powerup.cooldown > 0) return
      
      // Apply powerup effect
      switch (powerup.id) {
        case 'time_freeze':
          clearInterval(questionTimer)
          setTimeout(() => {
            startQuestionTimer()
          }, 5000)
          break
          
        case 'double_points':
          if (currentQuestion.value) {
            currentQuestion.value.points *= 2
          }
          break
          
        case 'hint':
          if (currentQuestion.value && currentQuestion.value.options) {
            // Remove one incorrect option
            const incorrectIndices = currentQuestion.value.options
              .map((_, index) => index)
              .filter(index => index !== currentQuestion.value.correctAnswer)
            
            if (incorrectIndices.length > 0) {
              const randomIncorrect = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)]
              currentQuestion.value.options[randomIncorrect] = '❌ 除外済み'
            }
          }
          break
      }
      
      // Set cooldown
      powerup.cooldown = 30
      powerup.canUse = false
      
      // Start cooldown timer
      const cooldownTimer = setInterval(() => {
        powerup.cooldown--
        if (powerup.cooldown <= 0) {
          powerup.canUse = true
          clearInterval(cooldownTimer)
        }
      }, 1000)
      
      await playEffectSound('combo')
    }
    
    const endBattle = async () => {
      clearInterval(gameTimer)
      clearInterval(questionTimer)
      
      gameState.value = 'completed'
      
      // Calculate final rankings
      finalRankings.value = players.value
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
          ...player,
          finalScore: player.score,
          finalRank: index + 1
        }))
      
      // Set winner
      if (finalRankings.value.length > 0) {
        finalRankings.value[0].isWinner = true
      }
      
      // Generate battle stats
      battleStats.value = {
        highestScore: Math.max(...players.value.map(p => p.score)),
        averageAccuracy: players.value.reduce((sum, p) => sum + p.accuracy, 0) / players.value.length,
        totalQuestions: currentQuestionIndex.value * players.value.length,
        powerupsUsed: 5 // Mock value
      }
      
      // Personal stats
      const myPlayer = players.value.find(p => p.id === currentPlayerId.value)
      if (myPlayer) {
        personalStats.value = {
          finalRank: finalRankings.value.findIndex(p => p.id === currentPlayerId.value) + 1,
          totalPoints: myPlayer.score,
          accuracy: myPlayer.accuracy,
          maxStreak: myPlayer.streak
        }
      }
      
      // Session performance
      if (currentSession.value) {
        sessionPerformance.value = multiLayerEngine.endSession(currentSession.value.sessionId)
        
        // Record progress in grammar store
        grammarStore.recordProgress(
          selectedTopic.value,
          personalStats.value.accuracy >= 0.7,
          (currentRound.value * 3) // Estimated minutes
        )
      }
      
      // Mock achievements
      unlockedAchievements.value = [
        {
          id: 'first_battle',
          name: '初陣',
          icon: '⚔️',
          description: '初めてバトルを完了しました'
        }
      ]
      
      await playEffectSound(personalStats.value.finalRank === 1 ? 'perfectScore' : 'complete')
    }
    
    const toggleReady = () => {
      isPlayerReady.value = !isPlayerReady.value
      const player = currentPlayers.value.find(p => p.id === currentPlayerId.value)
      if (player) {
        player.isReady = isPlayerReady.value
      }
    }
    
    const playAgain = () => {
      resetBattle()
      gameState.value = 'setup'
    }
    
    const returnToHub = () => {
      resetBattle()
      // Navigate to grammar hub
      logger.log('Navigate to grammar hub')
    }
    
    const inviteFriends = () => {
      // Open friend invitation interface
      logger.log('Open friend invitation')
    }
    
    const joinBattle = () => {
      gameState.value = 'setup'
    }
    
    const leaveBattle = () => {
      resetBattle()
      returnToHub()
    }
    
    const resetBattle = () => {
      clearInterval(gameTimer)
      clearInterval(questionTimer)
      
      gameState.value = 'setup'
      currentSession.value = null
      currentRound.value = 1
      timeRemaining.value = 0
      currentQuestionIndex.value = 0
      currentQuestion.value = null
      selectedAnswer.value = null
      showResult.value = false
      collaborativeAnswer.value = ''
      teamContributions.value = []
      lastAnswerFeedback.value = null
      sessionPerformance.value = null
      personalStats.value = null
      battleStats.value = null
      finalRankings.value = []
      unlockedAchievements.value = []
      isPlayerReady.value = false
      
      // Reset player stats
      initializeMockData()
    }

    // Lifecycle
    onMounted(() => {
      logger.log('Battle Zone Game mounted')
      initializeMockData()
    })
    
    onUnmounted(() => {
      clearInterval(gameTimer)
      clearInterval(questionTimer)
    })

    return {
      // State
      gameState,
      currentSession,
      battleMode,
      currentRound,
      totalRounds,
      timeRemaining,
      currentQuestion,
      currentQuestionIndex,
      selectedAnswer,
      showResult,
      questionTimeRemaining,
      players,
      teams,
      currentPlayerId,
      currentPlayerTurn,
      collaborativeAnswer,
      teamContributions,
      lastAnswerFeedback,
      selectedTopic,
      difficultyScaling,
      currentPlayers,
      maxPlayers,
      isPlayerReady,
      sessionPerformance,
      personalStats,
      battleStats,
      finalRankings,
      unlockedAchievements,
      availablePowerups,
      
      // Computed
      timerPercentage,
      questionTimePercentage,
      isMyTurn,
      currentPlayerName,
      canStartBattle,
      availableTopics,
      
      // Methods
      startBattleSession,
      selectAnswer,
      usePowerup,
      toggleReady,
      playAgain,
      returnToHub,
      inviteFriends,
      joinBattle,
      leaveBattle
    }
  }
}
</script>

<style scoped>
.battle-zone-container {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.battle-zone-header {
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

.battle-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 20px;
}

.round-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.round-label {
  font-size: 1.2rem;
  font-weight: bold;
}

.round-timer {
  position: relative;
}

.timer-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(#ef4444 0%, rgba(255,255,255,0.2) 0%);
  transition: background 0.1s ease;
}

.timer-text {
  font-size: 1.2rem;
  font-weight: bold;
  background: #1f2937;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-badge {
  background: rgba(255,255,255,0.2);
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.mode-badge.individual { border: 2px solid #3b82f6; }
.mode-badge.team { border: 2px solid #10b981; }

.players-area {
  margin-bottom: 30px;
}

.player-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.player-card {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.player-card.current-player {
  border-color: #fbbf24;
  animation: glow 2s ease-in-out infinite alternate;
}

.player-card.winner {
  border-color: #10b981;
  background: rgba(16,185,129,0.2);
}

.player-card.eliminated {
  opacity: 0.5;
  filter: grayscale(1);
}

.player-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.player-status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid white;
}

.player-status-indicator.active { background: #10b981; }
.player-status-indicator.thinking { background: #f59e0b; }
.player-status-indicator.eliminated { background: #ef4444; }

.player-name {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: bold;
}

.player-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  opacity: 0.7;
}

.stat-value {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
}

.player-powerups {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.powerup-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.teams-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.team-card {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
}

.team-card.winning-team {
  border-color: #fbbf24;
  animation: glow 2s ease-in-out infinite alternate;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.team-name {
  font-size: 1.3rem;
  font-weight: bold;
}

.team-score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
}

.team-member.active {
  background: rgba(251,191,36,0.2);
  border: 1px solid #fbbf24;
}

.member-avatar {
  width: 40px;
  height: 40px;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-name {
  font-weight: bold;
}

.member-score {
  color: #fbbf24;
  font-weight: bold;
}

.question-area {
  max-width: 800px;
  margin: 0 auto 30px;
}

.question-container {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.question-number {
  background: #3b82f6;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-weight: bold;
}

.difficulty-indicator {
  padding: 5px 12px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.8rem;
}

.difficulty-indicator.easy { background: #10b981; }
.difficulty-indicator.medium { background: #f59e0b; }
.difficulty-indicator.hard { background: #ef4444; }

.points-value {
  background: #8b5cf6;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-weight: bold;
}

.question-timer {
  width: 200px;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.1s linear;
}

.timer-bar.danger {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.question-text {
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
}

.speed-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.speed-option {
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.speed-option:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

.speed-option.selected {
  border-color: #3b82f6;
  background: rgba(59,130,246,0.3);
}

.speed-option.correct {
  border-color: #10b981;
  background: rgba(16,185,129,0.3);
}

.speed-option.incorrect {
  border-color: #ef4444;
  background: rgba(239,68,68,0.3);
}

.option-key {
  background: rgba(255,255,255,0.3);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.turn-indicator {
  margin-top: 20px;
  text-align: center;
}

.turn-info {
  background: rgba(255,255,255,0.1);
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
}

.turn-info.my-turn {
  background: rgba(251,191,36,0.3);
  border: 2px solid #fbbf24;
  animation: pulse 2s infinite;
}

.answer-feedback {
  margin-top: 20px;
}

.feedback-content {
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.feedback-content.success {
  border-left: 4px solid #10b981;
}

.feedback-content.error {
  border-left: 4px solid #ef4444;
}

.feedback-content.timeout {
  border-left: 4px solid #f59e0b;
}

.feedback-icon {
  font-size: 2rem;
}

.feedback-text {
  flex: 1;
}

.feedback-text h4 {
  margin-bottom: 5px;
}

.feedback-points {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fbbf24;
}

.powerups-panel {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.available-powerups {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.powerup-button {
  background: rgba(139,92,246,0.3);
  border: 2px solid #8b5cf6;
  color: white;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  text-align: center;
}

.powerup-button:hover:not(.disabled) {
  background: rgba(139,92,246,0.5);
  transform: translateY(-2px);
}

.powerup-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.powerup-icon {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.powerup-name {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.powerup-cooldown {
  font-size: 0.8rem;
  color: #ef4444;
}

.battle-results {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.results-title {
  font-size: 2.5rem;
  margin-bottom: 30px;
}

.winner-podium {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 20px;
  margin-bottom: 40px;
}

.podium-position {
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  position: relative;
}

.podium-position.position-1 {
  order: 2;
  transform: scale(1.1);
  background: rgba(255,215,0,0.3);
  border: 2px solid gold;
}

.podium-position.position-2 {
  order: 1;
  background: rgba(192,192,192,0.3);
  border: 2px solid silver;
}

.podium-position.position-3 {
  order: 3;
  background: rgba(205,127,50,0.3);
  border: 2px solid #cd7f32;
}

.podium-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
}

.podium-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.position-number {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fbbf24;
  color: #1f2937;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.battle-statistics, .personal-performance, .session-analysis {
  background: rgba(255,255,255,0.1);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  text-align: left;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
}

.metric-label {
  font-weight: bold;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fbbf24;
}

.achievements {
  margin-top: 20px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(251,191,36,0.2);
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #fbbf24;
}

.achievement-icon {
  font-size: 2rem;
}

.radar-metrics {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.radar-metric {
  display: flex;
  align-items: center;
  gap: 15px;
}

.radar-label {
  min-width: 80px;
  font-weight: bold;
}

.radar-bar {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
}

.radar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  transition: width 0.5s ease;
}

.setup-screen {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.lobby-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.setup-options {
  margin-bottom: 20px;
}

.option-group {
  margin-bottom: 20px;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.mode-selection {
  display: flex;
  gap: 10px;
}

.mode-button {
  flex: 1;
  padding: 10px 20px;
  border: 2px solid rgba(255,255,255,0.3);
  background: transparent;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-button.selected {
  border-color: #3b82f6;
  background: rgba(59,130,246,0.3);
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.lobby-players {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.lobby-player {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
}

.lobby-player-avatar {
  position: relative;
  width: 50px;
  height: 50px;
}

.lobby-player-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.player-ready-indicator {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.player-ready-indicator.ready {
  background: #10b981;
}

.lobby-player-info h4 {
  margin-bottom: 5px;
}

.player-status {
  font-size: 0.9rem;
  opacity: 0.8;
}

.lobby-actions {
  display: flex;
  gap: 15px;
}

.btn-ready {
  flex: 1;
  padding: 12px 25px;
  border: 2px solid #3b82f6;
  background: transparent;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ready.ready {
  background: #10b981;
  border-color: #10b981;
}

.btn-start {
  flex: 1;
  padding: 12px 25px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary, .btn-secondary, .btn-accent {
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

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.spectator-screen {
  text-align: center;
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.spectator-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.btn-join, .btn-leave {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-join {
  background: #10b981;
  color: white;
}

.btn-leave {
  background: #ef4444;
  color: white;
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(251,191,36,0.5); }
  100% { box-shadow: 0 0 20px rgba(251,191,36,0.8), 0 0 30px rgba(251,191,36,0.4); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 768px) {
  .battle-status {
    flex-direction: column;
    gap: 20px;
  }
  
  .player-cards {
    grid-template-columns: 1fr;
  }
  
  .teams-container {
    grid-template-columns: 1fr;
  }
  
  .lobby-content {
    grid-template-columns: 1fr;
  }
  
  .winner-podium {
    flex-direction: column;
    align-items: center;
  }
  
  .podium-position {
    order: unset !important;
    transform: none !important;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>