<template>
  <div class="sound-master-game">
    <!-- メニュー画面 -->
    <div v-if="currentScreen === 'menu'" class="menu-screen">
      <div class="menu-container">
        <div class="menu-header">
          <div class="header-controls">
            <button class="home-button" @click="goToHome" title="ホーム画面に戻る">
              🏠
            </button>
          </div>
          <h1 class="game-title">
            <span class="title-sound">サウンド・マスター</span>
            <span class="title-tower">🗼 タワー</span>
          </h1>
          <p class="game-subtitle">古代の音響タワーで音の秘密を解き明かそう！</p>
          <div class="cosmic-background">
            <div class="stars"></div>
            <div class="tower-silhouette">🏰</div>
          </div>
        </div>
        <!-- コース選択 -->
        <div class="course-selection">
          <label class="selection-label">コースを選択</label>
          <div class="course-options">
            <button
              v-for="course in courses"
              :key="course.id"
              class="course-button"
              :class="selectedCourse === course.id ? 'course-selected' : 'course-unselected'"
              @click="selectCourse(course.id)"
            >
              <div class="course-content">
                <span class="course-icon">{{ course.icon }}</span>
                <div class="course-text">
                  <div class="course-name">{{ course.name }}</div>
                  <div class="course-description">{{ course.description }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        <!-- グループ選択 -->
        <div class="group-selection">
          <label class="selection-label">グループを選択</label>
          <select v-model="selectedGroup" class="group-select">
            <option v-for="group in availableGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
          <p class="group-description">{{ selectedGroupDescription }}</p>
        </div>
        <!-- 音素カテゴリーフィルター -->
        <div class="category-filter-selection">
          <label class="selection-label">音素カテゴリー (オプション)</label>
          <select v-model="selectedCategory" class="category-select">
            <option value="">全ての音素</option>
            <option value="basic-vowels">基本母音</option>
            <option value="basic-consonants">基本子音</option>
            <option value="diphthongs">二重母音・複合音</option>
            <option value="digraphs">複合子音 (ch, sh, th等)</option>
            <option value="r-controlled">R制御母音 (ar, er, or等)</option>
          </select>
          <p class="category-description">{{ selectedCategoryDescription }}</p>
        </div>
        
        <!-- 問題数選択 -->
        <div class="question-count-selection">
          <label class="selection-label">問題数を選択</label>
          <div class="question-count-options">
            <button
              v-for="count in questionCountOptions"
              :key="count"
              class="question-count-button"
              :class="{ 'selected': selectedQuestionCount === count }"
              @click="selectedQuestionCount = count"
            >
              {{ count }}問
            </button>
          </div>
        </div>
        <!-- メニューボタン -->
        <div class="menu-buttons">
          <button class="start-button" @click="startGame">ゲーム開始</button>
          <button class="review-button" @click="goToReview">復習モード</button>
        </div>
      </div>
    </div>

    <!-- ゲーム画面 -->
    <div v-else-if="currentScreen === 'game'" class="game-screen" :class="{ shake: isShaking }">
      <div class="game-container">
        <div class="game-header">
          <div class="header-stats">
            <div class="stat-item">
              <span class="trophy-icon">🏆</span>
              <span class="stat-value">{{ score }}</span>
            </div>
            <div class="hearts-container">
              <span
                v-for="i in maxLives"
                :key="i"
                class="heart-icon"
                :class="i <= lives ? 'heart-filled' : 'heart-empty'"
              >
                ❤️
              </span>
            </div>
            <div class="combo-display" v-if="combo > 1">
              <span class="combo-text">{{ combo }}連続正解！</span>
            </div>
            <div class="stat-item">
              <span class="progress-icon">📝</span>
              <span class="stat-value">{{ currentWordIndex + 1 }}/{{ gameWordList?.length || selectedQuestionCount }}</span>
            </div>
          </div>
          <div class="header-controls">
            <span class="group-name">{{ currentGroup.name }}</span>
            <div class="control-buttons">
              <button class="control-button stop-button" @click="stopGame">
                <span class="stop-icon">⏹️</span>
              </button>
              <button class="control-button back-button" @click="goToMenu">
                <span class="back-icon">←</span>
              </button>
            </div>
          </div>
        </div>
        <div class="timer-container">
          <div class="timer-bar">
            <div
              class="timer-progress"
              :class="timerColorClass"
              :style="{ width: `${timerProgress}%` }"
            ></div>
          </div>
        </div>
        <div class="audio-section">
          <div class="character-display cosmic-display">
            <div class="tower-guardian">🧙‍♂️</div>
            <div class="sound-question" v-if="currentWord">音響タワーの守護者の声を聞き、正しい音素の符号を選択せよ！</div>
            <div class="sound-question" v-else>このグループには問題がありません。別のグループを選択してください。</div>
            <div class="cosmic-particles">✨ ⭐ 🌟</div>
          </div>
          <button
            v-if="currentWord"
            class="play-button"
            :class="{ 'play-enabled': !isPlaying, 'play-disabled': isPlaying }"
            @click.stop="playSound"
            :disabled="isPlaying"
          >
            <span class="play-icon">▶️</span>
            <span>音を再生</span>
          </button>
          <button v-else class="play-button play-disabled" disabled>
            <span class="play-icon">❌</span>
            <span>問題なし</span>
          </button>
        </div>
        <div class="choices-grid" v-if="currentWord && choices.length > 0">
          <button
            v-for="choice in choices"
            :key="choice"
            class="choice-button"
            :class="getChoiceClass(choice)"
            @click.stop="selectChoice(choice)"
            :disabled="isChoiceDisabled"
          >
            {{ choice }}
          </button>
        </div>
        <div v-else class="choices-grid">
          <div class="no-choices-message">
            <p>選択可能な問題がありません</p>
            <button class="back-button" @click="goToMenu">メニューに戻る</button>
          </div>
        </div>
        <div
          v-if="showFeedback"
          class="feedback-container"
          :class="isCorrect ? 'feedback-correct' : 'feedback-incorrect'"
        >
          <div class="feedback-message">{{ feedbackMessage }}</div>
          <div class="feedback-answer">{{ feedbackAnswer }}</div>
        </div>
      </div>
    </div>

    <!-- 結果画面 -->
    <div v-else-if="currentScreen === 'result'" class="result-screen">
      <div class="result-container">
        <div class="result-header">
          <h2 class="result-title">ゲーム終了！</h2>
          <div class="result-score">
            <span class="score-label">スコア</span>
            <span class="score-value">{{ score }}</span>
          </div>
        </div>
        <div class="result-stats">
          <div class="stat-row">
            <span class="stat-label">正解数</span>
            <span class="stat-value">{{ correctAnswers }} / {{ totalAttempts }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">正答率</span>
            <span class="stat-value">{{ totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0 }}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">最大連続正解</span>
            <span class="stat-value">{{ maxCombo }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">プレイ時間</span>
            <span class="stat-value">{{ Math.round((Date.now() - startTime) / 1000) }}秒</span>
          </div>
        </div>
        <div class="result-buttons">
          <button class="retry-button" @click="retryGame">もう一度挑戦</button>
          <button class="menu-button" @click="goToMenu">メニューに戻る</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useRouter } from 'vue-router'
import { initializeUnifiedGame, completeUnifiedGame } from '@/utils/gameIntegration'

export default defineComponent({
  name: 'SoundMasterGame',
  setup() {
    const gameStore = useGameStore()
    const router = useRouter()
    
    // 画面状態管理
    const currentScreen = ref('menu') // 'menu', 'game', 'review', 'result'
    const selectedCourse = ref('jolly-phonics')
    const selectedGroup = ref('group1')
    const selectedCategory = ref('')
    const selectedQuestionCount = ref(10)
    const questionCountOptions = [5, 10, 15, 20]
    
    // ゲーム状態
    const score = ref(0)
    const progress = ref(0)
    const currentWordIndex = ref(0)
    const userAnswer = ref('')
    const feedback = ref('')
    const startTime = ref(Date.now())
    const correctAnswers = ref(0)
    const totalAttempts = ref(0)
    const isAnimating = ref(false)
    const combo = ref(0)
    const maxCombo = ref(0) // 最大連続正解数を追加
    const timeLeft = ref(60) // タイマー用（秒）
    const isPlaying = ref(false)
    const showFeedback = ref(false)
    const isCorrect = ref(false)
    const feedbackMessage = ref('')
    
    const feedbackAnswer = ref('')
    const isChoiceDisabled = ref(false)

    // コース定義
    const courses = ref([
      {
        id: 'basic',
        name: '基本音素',
        icon: '🎵',
        description: '母音と子音の基本音'
      },
      {
        id: 'advanced',
        name: '応用音素',
        icon: '🎼',
        description: '二重母音と複合音素'
      },
      {
        id: 'jolly-phonics',
        name: 'ジョリーフォニックス',
        icon: '🌟',
        description: 'Group1-7の段階的学習'
      }
    ])

    // グループ定義 - Jolly Phonicsグループ対応
    const groups = {
      basic: [
        { id: 'basic-vowels', name: '基本母音 (a, e, i, o, u)', description: '短母音の基本音', category: 'basic-vowels' },
        { id: 'basic-consonants', name: '基本子音 (s, t, p, n, etc)', description: '単純子音の基本音', category: 'basic-consonants' }
      ],
      advanced: [
        { id: 'diphthongs', name: '二重母音 (ai, oa, ie, ee)', description: '2つの母音音素の組み合わせ', category: 'diphthongs' },
        { id: 'digraphs', name: '複合子音 (ch, sh, th, ng)', description: '2文字で1音の子音', category: 'digraphs' },
        { id: 'r-controlled', name: 'R制御母音 (er, ar, or)', description: 'rに影響された母音音', category: 'r-controlled' },
        { id: 'magic-e', name: 'マジックE (a-e, i-e, o-e, u-e)', description: 'サイレントEが母音を長音に変える', category: 'magic-e' }
      ],
      'jolly-phonics': [
        { id: 'group1', name: 'Group 1 (s, a, t, i, p, n)', description: 'ジョリーフォニックス第1グループ', category: 'jolly-group' },
        { id: 'group2', name: 'Group 2 (c, k, e, h, r, m, d)', description: 'ジョリーフォニックス第2グループ', category: 'jolly-group' },
        { id: 'group3', name: 'Group 3 (g, o, u, l, f, b)', description: 'ジョリーフォニックス第3グループ', category: 'jolly-group' },
        { id: 'group4', name: 'Group 4 (ai, j, oa, ie, ee, or)', description: 'ジョリーフォニックス第4グループ', category: 'jolly-group' },
        { id: 'group5', name: 'Group 5 (z, w, ng, v, oo)', description: 'ジョリーフォニックス第5グループ', category: 'jolly-group' },
        { id: 'group6', name: 'Group 6 (y, x, ch, sh, th)', description: 'ジョリーフォニックス第6グループ', category: 'jolly-group' },
        { id: 'group7', name: 'Group 7 (qu, ou, oi, ue, er, ar)', description: 'ジョリーフォニックス第7グループ', category: 'jolly-group' }
      ]
    }

    // 利用可能なグループ（選択されたコースに基づく）
    const availableGroups = computed(() => groups[selectedCourse.value] || [])
    const selectedGroupDescription = computed(() => {
      const group = availableGroups.value.find(g => g.id === selectedGroup.value)
      return group ? group.description : ''
    })
    
    // カテゴリー説明
    const selectedCategoryDescription = computed(() => {
      const descriptions = {
        '': 'グループ内の全ての音素',
        'basic-vowels': '短母音 (a, e, i, o, u) など基本的な母音音',
        'basic-consonants': '単純子音 (s, t, p, n, b, etc) など基本的な子音音',
        'diphthongs': '二重母音・複合音 (ai, oa, ee, oo, etc)',
        'digraphs': '複合子音 (ch, sh, th, ng, qu, etc)',
        'r-controlled': 'R制御母音 (ar, er, or, etc)',
        'magic-e': 'マジックE・サイレントE (a-e, i-e, o-e, u-e, e-e)'
      }
      return descriptions[selectedCategory.value] || ''
    })
    
    // 現在のグループ
    const currentGroup = computed(() => {
      const group = availableGroups.value.find(g => g.id === selectedGroup.value)
      return group || { name: '', description: '' }
    })

    // サウンドエフェクト（無効化 - 音声学習のため）
    const playSoundEffect = (type) => {
      logger.log('効果音は無効化されています:', type)
      // 効果音は再生しない（音声学習専用ゲームのため）
    }

    const playUISound = (type) => {
      logger.log('UI効果音は無効化されています:', type)
      // UI効果音も再生しない
    }

    // コース選択
    const selectCourse = (courseId) => {
      selectedCourse.value = courseId
      // コース変更時、最初のグループを選択
      const firstGroup = availableGroups.value[0]
      if (firstGroup) {
        selectedGroup.value = firstGroup.id
      }
    }

    // ゲーム開始
    const startGame = () => {
      initializeGameWordList() // 単語リストを初期化
      currentScreen.value = 'game'

      // 統合プログレッション初期化
      initializeUnifiedGame('sound-master')

      score.value = 0
      progress.value = 0
      currentWordIndex.value = 0
      correctAnswers.value = 0
      totalAttempts.value = 0
      startTime.value = Date.now()
      combo.value = 0
      maxCombo.value = 0 // 最大連続正解をリセット
      showFeedback.value = false
      isChoiceDisabled.value = false
      timeLeft.value = 60 // タイマーもリセット
    }

    // 復習モードへ
    const goToReview = () => {
      currentScreen.value = 'review'
    }

    // ゲーム停止
    const stopGame = () => {
      currentScreen.value = 'result'

      // 統合プログレッションシステムに結果記録
      const gameResult = completeUnifiedGame({
        gameType: 'sound-master',
        score: score.value,
        accuracy: correctAnswers.value > 0 ? Math.round((correctAnswers.value / totalAttempts.value) * 100) : 0,
        timeSpent: Math.round((Date.now() - startTime.value) / 1000),
        correctAnswers: correctAnswers.value,
        totalQuestions: totalAttempts.value || 1,
        correctStreak: combo.value,
        difficulty: selectedCourse.value === 'advanced-phonics' ? 'hard' : 'normal'
      }, { showContinuePrompt: true })

      logger.log('🎯 SoundMaster 統合プログレッション記録完了:', gameResult)
    }

    // ゲーム再挑戦
    const retryGame = () => {
      startGame()
    }

    // メニューに戻る
    const goToMenu = () => {
      currentScreen.value = 'menu'
      combo.value = 0
      score.value = 0
      progress.value = 0
    }

    // ホーム画面に戻る
    const goToHome = () => {
      router.push('/')
    }

    // 音響タワーの単語データベース（大幅拡充）
    const wordList = [
      // =================== JOLLY PHONICS GROUP 1: s, a, t, i, p, n ===================
      // 's' sound
      { word: 'sit', japanese: '座る', phoneme: 's-ɪ-t', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'sun', japanese: '太陽', phoneme: 's-ʌ-n', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'sad', japanese: '悲しい', phoneme: 's-æ-d', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'see', japanese: '見る', phoneme: 's-iː', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'a' sound (/æ/)
      { word: 'cat', japanese: '猫', phoneme: 'k-æ-t', group: 'group1', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'hat', japanese: '帽子', phoneme: 'h-æ-t', group: 'group1', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'bat', japanese: 'コウモリ', phoneme: 'b-æ-t', group: 'group1', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'rat', japanese: 'ネズミ', phoneme: 'r-æ-t', group: 'group1', difficulty: 'basic', category: 'basic-vowels' },
      
      // 't' sound
      { word: 'top', japanese: '頂上', phoneme: 't-ɒ-p', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'ten', japanese: '10', phoneme: 't-ɛ-n', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'tap', japanese: '叩く', phoneme: 't-æ-p', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'tin', japanese: '缶', phoneme: 't-ɪ-n', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'i' sound (/ɪ/)
      { word: 'it', japanese: 'それ', phoneme: 'ɪ-t', group: 'group1', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'in', japanese: '中に', phoneme: 'ɪ-n', group: 'group1', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'is', japanese: 'です', phoneme: 'ɪ-z', group: 'group1', difficulty: 'basic', category: 'basic-vowels' },
      
      // 'p' sound
      { word: 'pen', japanese: 'ペン', phoneme: 'p-ɛ-n', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'pin', japanese: 'ピン', phoneme: 'p-ɪ-n', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'pat', japanese: '軽く叩く', phoneme: 'p-æ-t', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'pit', japanese: '穴', phoneme: 'p-ɪ-t', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'n' sound
      { word: 'net', japanese: '網', phoneme: 'n-ɛ-t', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'nut', japanese: 'ナッツ', phoneme: 'n-ʌ-t', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'nap', japanese: '昼寝', phoneme: 'n-æ-p', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'not', japanese: 'ない', phoneme: 'n-ɒ-t', group: 'group1', difficulty: 'basic', category: 'basic-consonants' },

      // =================== JOLLY PHONICS GROUP 2: c, k, e, h, r, m, d ===================
      // 'c' sound (/k/)
      { word: 'cat', japanese: '猫', phoneme: 'k-æ-t', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'can', japanese: 'できる', phoneme: 'k-æ-n', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'cup', japanese: 'カップ', phoneme: 'k-ʌ-p', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'cut', japanese: '切る', phoneme: 'k-ʌ-t', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'k' sound
      { word: 'kid', japanese: '子供', phoneme: 'k-ɪ-d', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'key', japanese: '鍵', phoneme: 'k-iː', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'kit', japanese: 'キット', phoneme: 'k-ɪ-t', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'e' sound (/ɛ/)
      { word: 'egg', japanese: '卵', phoneme: 'ɛ-g', group: 'group2', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'end', japanese: '終わり', phoneme: 'ɛ-n-d', group: 'group2', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'hen', japanese: 'めんどり', phoneme: 'h-ɛ-n', group: 'group2', difficulty: 'basic', category: 'basic-vowels' },
      
      // 'h' sound
      { word: 'hat', japanese: '帽子', phoneme: 'h-æ-t', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'hit', japanese: '打つ', phoneme: 'h-ɪ-t', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'hop', japanese: '跳ぶ', phoneme: 'h-ɒ-p', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'ham', japanese: 'ハム', phoneme: 'h-æ-m', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'r' sound
      { word: 'red', japanese: '赤', phoneme: 'r-ɛ-d', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'run', japanese: '走る', phoneme: 'r-ʌ-n', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'rat', japanese: 'ネズミ', phoneme: 'r-æ-t', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'rip', japanese: '破る', phoneme: 'r-ɪ-p', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'm' sound
      { word: 'man', japanese: '男性', phoneme: 'm-æ-n', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'map', japanese: '地図', phoneme: 'm-æ-p', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'mud', japanese: '泥', phoneme: 'm-ʌ-d', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'met', japanese: '会った', phoneme: 'm-ɛ-t', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'd' sound
      { word: 'dog', japanese: '犬', phoneme: 'd-ɒ-g', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'dad', japanese: 'お父さん', phoneme: 'd-æ-d', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'dig', japanese: '掘る', phoneme: 'd-ɪ-g', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'dim', japanese: '薄暗い', phoneme: 'd-ɪ-m', group: 'group2', difficulty: 'basic', category: 'basic-consonants' },

      // =================== JOLLY PHONICS GROUP 3: g, o, u, l, f, b ===================
      // 'g' sound
      { word: 'get', japanese: '取る', phoneme: 'g-ɛ-t', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'gap', japanese: '隙間', phoneme: 'g-æ-p', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'gum', japanese: 'ガム', phoneme: 'g-ʌ-m', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'gut', japanese: '勇気', phoneme: 'g-ʌ-t', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'o' sound (/ɒ/)
      { word: 'on', japanese: '上に', phoneme: 'ɒ-n', group: 'group3', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'off', japanese: '離れて', phoneme: 'ɒ-f', group: 'group3', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'odd', japanese: '奇妙な', phoneme: 'ɒ-d', group: 'group3', difficulty: 'basic', category: 'basic-vowels' },
      
      // 'u' sound (/ʌ/)
      { word: 'up', japanese: '上に', phoneme: 'ʌ-p', group: 'group3', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'us', japanese: '私たち', phoneme: 'ʌ-s', group: 'group3', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'under', japanese: '下に', phoneme: 'ʌ-n-d-ər', group: 'group3', difficulty: 'basic', category: 'basic-vowels' },
      
      // 'l' sound
      { word: 'let', japanese: 'させる', phoneme: 'l-ɛ-t', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'lap', japanese: '膝', phoneme: 'l-æ-p', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'log', japanese: '丸太', phoneme: 'l-ɒ-g', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'lid', japanese: 'ふた', phoneme: 'l-ɪ-d', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'f' sound  
      { word: 'fat', japanese: '太った', phoneme: 'f-æ-t', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'fig', japanese: 'イチジク', phoneme: 'f-ɪ-g', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'fun', japanese: '楽しい', phoneme: 'f-ʌ-n', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'fog', japanese: '霧', phoneme: 'f-ɒ-g', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'b' sound
      { word: 'bag', japanese: 'かばん', phoneme: 'b-æ-g', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'big', japanese: '大きい', phoneme: 'b-ɪ-g', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'bug', japanese: '虫', phoneme: 'b-ʌ-g', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'box', japanese: '箱', phoneme: 'b-ɒ-k-s', group: 'group3', difficulty: 'basic', category: 'basic-consonants' },

      // =================== JOLLY PHONICS GROUP 4: ai, j, oa, ie, ee, or ===================
      // 'ai' diphthong
      { word: 'rain', japanese: '雨', phoneme: 'r-eɪ-n', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'pain', japanese: '痛み', phoneme: 'p-eɪ-n', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'main', japanese: '主な', phoneme: 'm-eɪ-n', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'tail', japanese: '尻尾', phoneme: 't-eɪ-l', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'j' sound
      { word: 'jam', japanese: 'ジャム', phoneme: 'dʒ-æ-m', group: 'group4', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'jet', japanese: 'ジェット機', phoneme: 'dʒ-ɛ-t', group: 'group4', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'jog', japanese: 'ジョギング', phoneme: 'dʒ-ɒ-g', group: 'group4', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'jug', japanese: '水差し', phoneme: 'dʒ-ʌ-g', group: 'group4', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'oa' digraph
      { word: 'boat', japanese: 'ボート', phoneme: 'b-oʊ-t', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'coat', japanese: 'コート', phoneme: 'k-oʊ-t', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'goat', japanese: 'ヤギ', phoneme: 'g-oʊ-t', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'soap', japanese: '石鹸', phoneme: 's-oʊ-p', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'ie' digraph
      { word: 'pie', japanese: 'パイ', phoneme: 'p-aɪ', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'tie', japanese: 'ネクタイ', phoneme: 't-aɪ', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'lie', japanese: '嘘', phoneme: 'l-aɪ', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'die', japanese: '死ぬ', phoneme: 'd-aɪ', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'ee' digraph
      { word: 'bee', japanese: 'ハチ', phoneme: 'b-iː', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'see', japanese: '見る', phoneme: 's-iː', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'tree', japanese: '木', phoneme: 't-r-iː', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'free', japanese: '自由な', phoneme: 'f-r-iː', group: 'group4', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'or' r-controlled
      { word: 'for', japanese: 'ために', phoneme: 'f-ɔr', group: 'group4', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'or', japanese: 'または', phoneme: 'ɔr', group: 'group4', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'fork', japanese: 'フォーク', phoneme: 'f-ɔr-k', group: 'group4', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'corn', japanese: 'とうもろこし', phoneme: 'k-ɔr-n', group: 'group4', difficulty: 'advanced', category: 'r-controlled' },

      // =================== JOLLY PHONICS GROUP 5: z, w, ng, v, oo ===================
      // 'z' sound
      { word: 'zip', japanese: 'ジップ', phoneme: 'z-ɪ-p', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'zoo', japanese: '動物園', phoneme: 'z-uː', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'zero', japanese: 'ゼロ', phoneme: 'z-ɪə-r-oʊ', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'w' sound
      { word: 'win', japanese: '勝つ', phoneme: 'w-ɪ-n', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'wet', japanese: '濡れた', phoneme: 'w-ɛ-t', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'web', japanese: 'クモの巣', phoneme: 'w-ɛ-b', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'wag', japanese: '尻尾を振る', phoneme: 'w-æ-g', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'ng' digraph
      { word: 'ring', japanese: '指輪', phoneme: 'r-ɪ-ŋ', group: 'group5', difficulty: 'advanced', category: 'digraphs' },
      { word: 'sing', japanese: '歌う', phoneme: 's-ɪ-ŋ', group: 'group5', difficulty: 'advanced', category: 'digraphs' },
      { word: 'king', japanese: '王', phoneme: 'k-ɪ-ŋ', group: 'group5', difficulty: 'advanced', category: 'digraphs' },
      { word: 'wing', japanese: '翼', phoneme: 'w-ɪ-ŋ', group: 'group5', difficulty: 'advanced', category: 'digraphs' },
      
      // 'v' sound
      { word: 'van', japanese: 'バン', phoneme: 'v-æ-n', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'vet', japanese: '獣医', phoneme: 'v-ɛ-t', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'vat', japanese: '大桶', phoneme: 'v-æ-t', group: 'group5', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'oo' short
      { word: 'book', japanese: '本', phoneme: 'b-ʊ-k', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'look', japanese: '見る', phoneme: 'l-ʊ-k', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'took', japanese: '取った', phoneme: 't-ʊ-k', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'cook', japanese: '料理する', phoneme: 'k-ʊ-k', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'oo' long  
      { word: 'moon', japanese: '月', phoneme: 'm-uː-n', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'soon', japanese: 'すぐに', phoneme: 's-uː-n', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'food', japanese: '食べ物', phoneme: 'f-uː-d', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'pool', japanese: 'プール', phoneme: 'p-uː-l', group: 'group5', difficulty: 'advanced', category: 'diphthongs' },

      // =================== JOLLY PHONICS GROUP 6: y, x, ch, sh, th ===================
      // 'y' sound
      { word: 'yes', japanese: 'はい', phoneme: 'y-ɛ-s', group: 'group6', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'yet', japanese: 'まだ', phoneme: 'y-ɛ-t', group: 'group6', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'yam', japanese: 'ヤマイモ', phoneme: 'y-æ-m', group: 'group6', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'x' sound
      { word: 'fox', japanese: 'キツネ', phoneme: 'f-ɒ-k-s', group: 'group6', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'box', japanese: '箱', phoneme: 'b-ɒ-k-s', group: 'group6', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'six', japanese: '6', phoneme: 's-ɪ-k-s', group: 'group6', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'mix', japanese: '混ぜる', phoneme: 'm-ɪ-k-s', group: 'group6', difficulty: 'basic', category: 'basic-consonants' },
      
      // 'ch' digraph
      { word: 'chip', japanese: 'チップ', phoneme: 'tʃ-ɪ-p', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'chat', japanese: 'おしゃべり', phoneme: 'tʃ-æ-t', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'chop', japanese: '切る', phoneme: 'tʃ-ɒ-p', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'chin', japanese: 'あご', phoneme: 'tʃ-ɪ-n', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      
      // 'sh' digraph
      { word: 'ship', japanese: '船', phoneme: 'ʃ-ɪ-p', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'shop', japanese: '店', phoneme: 'ʃ-ɒ-p', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'shut', japanese: '閉める', phoneme: 'ʃ-ʌ-t', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'shed', japanese: '小屋', phoneme: 'ʃ-ɛ-d', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      
      // 'th' voiceless
      { word: 'thin', japanese: '薄い', phoneme: 'θ-ɪ-n', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'thick', japanese: '厚い', phoneme: 'θ-ɪ-k', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'think', japanese: '考える', phoneme: 'θ-ɪ-ŋ-k', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      
      // 'th' voiced
      { word: 'this', japanese: 'これ', phoneme: 'ð-ɪ-s', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'that', japanese: 'あれ', phoneme: 'ð-æ-t', group: 'group6', difficulty: 'advanced', category: 'digraphs' },
      { word: 'then', japanese: 'それから', phoneme: 'ð-ɛ-n', group: 'group6', difficulty: 'advanced', category: 'digraphs' },

      // =================== JOLLY PHONICS GROUP 7: qu, ou, oi, ue, er, ar ===================
      // 'qu' digraph
      { word: 'queen', japanese: '女王', phoneme: 'k-w-iː-n', group: 'group7', difficulty: 'advanced', category: 'digraphs' },
      { word: 'quick', japanese: '速い', phoneme: 'k-w-ɪ-k', group: 'group7', difficulty: 'advanced', category: 'digraphs' },
      { word: 'quit', japanese: 'やめる', phoneme: 'k-w-ɪ-t', group: 'group7', difficulty: 'advanced', category: 'digraphs' },
      { word: 'quack', japanese: 'クワクワ', phoneme: 'k-w-æ-k', group: 'group7', difficulty: 'advanced', category: 'digraphs' },
      
      // 'ou' diphthong
      { word: 'out', japanese: '外に', phoneme: 'aʊ-t', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'house', japanese: '家', phoneme: 'h-aʊ-s', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'mouse', japanese: 'ネズミ', phoneme: 'm-aʊ-s', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'shout', japanese: '叫ぶ', phoneme: 'ʃ-aʊ-t', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'oi' diphthong
      { word: 'oil', japanese: '油', phoneme: 'ɔɪ-l', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'coin', japanese: 'コイン', phoneme: 'k-ɔɪ-n', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'boil', japanese: '沸騰する', phoneme: 'b-ɔɪ-l', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'join', japanese: '参加する', phoneme: 'dʒ-ɔɪ-n', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'ue' digraph
      { word: 'blue', japanese: '青', phoneme: 'b-l-uː', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'true', japanese: '本当の', phoneme: 't-r-uː', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'glue', japanese: 'のり', phoneme: 'g-l-uː', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      { word: 'clue', japanese: '手がかり', phoneme: 'k-l-uː', group: 'group7', difficulty: 'advanced', category: 'diphthongs' },
      
      // 'er' r-controlled
      { word: 'her', japanese: '彼女の', phoneme: 'h-ɝ', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'fern', japanese: 'シダ', phoneme: 'f-ɝ-n', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'term', japanese: '期間', phoneme: 't-ɝ-m', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'verb', japanese: '動詞', phoneme: 'v-ɝ-b', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },
      
      // 'ar' r-controlled
      { word: 'car', japanese: '車', phoneme: 'k-ɑr', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'far', japanese: '遠い', phoneme: 'f-ɑr', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'bar', japanese: 'バー', phoneme: 'b-ɑr', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },
      { word: 'star', japanese: '星', phoneme: 's-t-ɑr', group: 'group7', difficulty: 'advanced', category: 'r-controlled' },

      // =================== マジックE (サイレントE) ===================
      // a-e パターン (短音 /æ/ → 長音 /eɪ/) - 約100語
      { word: 'cake', japanese: 'ケーキ', phoneme: 'k-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'make', japanese: '作る', phoneme: 'm-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'take', japanese: '取る', phoneme: 't-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'lake', japanese: '湖', phoneme: 'l-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'name', japanese: '名前', phoneme: 'n-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'game', japanese: 'ゲーム', phoneme: 'g-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'same', japanese: '同じ', phoneme: 's-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'plane', japanese: '飛行機', phoneme: 'p-l-eɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'snake', japanese: 'ヘビ', phoneme: 's-n-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'grape', japanese: 'ブドウ', phoneme: 'g-r-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'plate', japanese: 'お皿', phoneme: 'p-l-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'gate', japanese: '門', phoneme: 'g-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'late', japanese: '遅い', phoneme: 'l-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'date', japanese: '日付', phoneme: 'd-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hate', japanese: '嫌う', phoneme: 'h-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mate', japanese: '仲間', phoneme: 'm-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rate', japanese: '率', phoneme: 'r-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'fate', japanese: '運命', phoneme: 'f-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'safe', japanese: '安全な', phoneme: 's-eɪ-f', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'save', japanese: '救う', phoneme: 's-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wave', japanese: '波', phoneme: 'w-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cave', japanese: '洞窟', phoneme: 'k-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'gave', japanese: '与えた', phoneme: 'g-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'brave', japanese: '勇敢な', phoneme: 'b-r-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'grave', japanese: '墓', phoneme: 'g-r-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shave', japanese: 'ひげを剃る', phoneme: 'ʃ-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'slave', japanese: '奴隷', phoneme: 's-l-eɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'frame', japanese: '枠', phoneme: 'f-r-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'flame', japanese: '炎', phoneme: 'f-l-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'blame', japanese: '責める', phoneme: 'b-l-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shame', japanese: '恥', phoneme: 'ʃ-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tame', japanese: '飼いならす', phoneme: 't-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'came', japanese: '来た', phoneme: 'k-eɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'bake', japanese: '焼く', phoneme: 'b-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wake', japanese: '起きる', phoneme: 'w-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shake', japanese: '振る', phoneme: 'ʃ-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'brake', japanese: 'ブレーキ', phoneme: 'b-r-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'flake', japanese: '薄片', phoneme: 'f-l-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stake', japanese: '杭', phoneme: 's-t-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'quake', japanese: '震える', phoneme: 'k-w-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'fake', japanese: '偽物', phoneme: 'f-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rake', japanese: '熊手', phoneme: 'r-eɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pale', japanese: '青白い', phoneme: 'p-eɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tale', japanese: '物語', phoneme: 't-eɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'sale', japanese: '販売', phoneme: 's-eɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'male', japanese: '男性', phoneme: 'm-eɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'whale', japanese: 'クジラ', phoneme: 'w-eɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'scale', japanese: 'うろこ', phoneme: 's-k-eɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stale', japanese: '古い', phoneme: 's-t-eɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'space', japanese: '空間', phoneme: 's-p-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'place', japanese: '場所', phoneme: 'p-l-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'race', japanese: '競争', phoneme: 'r-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'face', japanese: '顔', phoneme: 'f-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pace', japanese: 'ペース', phoneme: 'p-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'trace', japanese: '跡', phoneme: 't-r-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'grace', japanese: '優雅', phoneme: 'g-r-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'brace', japanese: '支え', phoneme: 'b-r-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'lace', japanese: 'レース', phoneme: 'l-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'case', japanese: 'ケース', phoneme: 'k-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'base', japanese: '基礎', phoneme: 'b-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'vase', japanese: '花瓶', phoneme: 'v-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'chase', japanese: '追いかける', phoneme: 'tʃ-eɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'phase', japanese: '段階', phoneme: 'f-eɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'age', japanese: '年齢', phoneme: 'eɪ-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'page', japanese: 'ページ', phoneme: 'p-eɪ-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cage', japanese: '檻', phoneme: 'k-eɪ-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rage', japanese: '激怒', phoneme: 'r-eɪ-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'sage', japanese: '賢者', phoneme: 's-eɪ-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wage', japanese: '賃金', phoneme: 'w-eɪ-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stage', japanese: '舞台', phoneme: 's-t-eɪ-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'crane', japanese: '鶴', phoneme: 'k-r-eɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mane', japanese: 'たてがみ', phoneme: 'm-eɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'lane', japanese: '車線', phoneme: 'l-eɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pane', japanese: '窓ガラス', phoneme: 'p-eɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cane', japanese: '杖', phoneme: 'k-eɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'vane', japanese: '風見鶏', phoneme: 'v-eɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'ape', japanese: '類人猿', phoneme: 'eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cape', japanese: '岬', phoneme: 'k-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tape', japanese: 'テープ', phoneme: 't-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shape', japanese: '形', phoneme: 'ʃ-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'drape', japanese: 'カーテン', phoneme: 'd-r-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'escape', japanese: '逃げる', phoneme: 'ɪ-s-k-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'gape', japanese: '口を開ける', phoneme: 'g-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'scrape', japanese: 'こする', phoneme: 's-k-r-eɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'fade', japanese: '色あせる', phoneme: 'f-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'made', japanese: '作った', phoneme: 'm-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'trade', japanese: '貿易', phoneme: 't-r-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shade', japanese: '影', phoneme: 'ʃ-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'blade', japanese: '刃', phoneme: 'b-l-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'grade', japanese: '学年', phoneme: 'g-r-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'spade', japanese: 'スペード', phoneme: 's-p-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wade', japanese: '歩いて渡る', phoneme: 'w-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'parade', japanese: 'パレード', phoneme: 'p-ə-r-eɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'state', japanese: '州', phoneme: 's-t-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'skate', japanese: 'スケート', phoneme: 's-k-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'create', japanese: '創造する', phoneme: 'k-r-iː-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'relate', japanese: '関係する', phoneme: 'r-ɪ-l-eɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      
      // i-e パターン (短音 /ɪ/ → 長音 /aɪ/) - 約100語
      { word: 'time', japanese: '時間', phoneme: 't-aɪ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'like', japanese: '好き', phoneme: 'l-aɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'bike', japanese: '自転車', phoneme: 'b-aɪ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'five', japanese: '5', phoneme: 'f-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'nine', japanese: '9', phoneme: 'n-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'smile', japanese: '笑顔', phoneme: 's-m-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'white', japanese: '白', phoneme: 'w-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'kite', japanese: '凧', phoneme: 'k-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'line', japanese: '線', phoneme: 'l-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mine', japanese: '私のもの', phoneme: 'm-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'ride', japanese: '乗る', phoneme: 'r-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hide', japanese: '隠れる', phoneme: 'h-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'life', japanese: '人生', phoneme: 'l-aɪ-f', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wife', japanese: '妻', phoneme: 'w-aɪ-f', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'knife', japanese: 'ナイフ', phoneme: 'n-aɪ-f', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dive', japanese: '飛び込む', phoneme: 'd-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hive', japanese: '蜂の巣', phoneme: 'h-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'drive', japanese: '運転する', phoneme: 'd-r-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'alive', japanese: '生きている', phoneme: 'ə-l-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'strive', japanese: '努力する', phoneme: 's-t-r-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'thrive', japanese: '繁栄する', phoneme: 'θ-r-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'arrive', japanese: '到着する', phoneme: 'ə-r-aɪ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'side', japanese: '側', phoneme: 's-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wide', japanese: '広い', phoneme: 'w-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tide', japanese: '潮', phoneme: 't-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pride', japanese: '誇り', phoneme: 'p-r-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'slide', japanese: '滑る', phoneme: 's-l-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'glide', japanese: '滑空する', phoneme: 'g-l-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'guide', japanese: 'ガイド', phoneme: 'g-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'bride', japanese: '花嫁', phoneme: 'b-r-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stride', japanese: '大股で歩く', phoneme: 's-t-r-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'inside', japanese: '内側', phoneme: 'ɪ-n-s-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'outside', japanese: '外側', phoneme: 'aʊ-t-s-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'beside', japanese: 'そばに', phoneme: 'b-ɪ-s-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'decide', japanese: '決める', phoneme: 'd-ɪ-s-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'divide', japanese: '分ける', phoneme: 'd-ɪ-v-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'provide', japanese: '提供する', phoneme: 'p-r-ə-v-aɪ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'size', japanese: 'サイズ', phoneme: 's-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'prize', japanese: '賞', phoneme: 'p-r-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wise', japanese: '賢い', phoneme: 'w-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rise', japanese: '上がる', phoneme: 'r-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'surprise', japanese: '驚き', phoneme: 's-ə-r-p-r-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'advise', japanese: '助言する', phoneme: 'ə-d-v-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'exercise', japanese: '運動', phoneme: 'ɛ-k-s-ə-r-s-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'realize', japanese: '実現する', phoneme: 'r-iː-ə-l-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'organize', japanese: '組織する', phoneme: 'ɔr-g-ə-n-aɪ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'bite', japanese: '噛む', phoneme: 'b-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'site', japanese: '場所', phoneme: 's-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'quite', japanese: 'かなり', phoneme: 'k-w-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'write', japanese: '書く', phoneme: 'r-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'spite', japanese: '悪意', phoneme: 's-p-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'invite', japanese: '招待する', phoneme: 'ɪ-n-v-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'polite', japanese: '礼儀正しい', phoneme: 'p-ə-l-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'unite', japanese: '結合する', phoneme: 'j-uː-n-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'excite', japanese: '興奮させる', phoneme: 'ɪ-k-s-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'ignite', japanese: '点火する', phoneme: 'ɪ-g-n-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'finite', japanese: '有限の', phoneme: 'f-aɪ-n-aɪ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tile', japanese: 'タイル', phoneme: 't-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mile', japanese: 'マイル', phoneme: 'm-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'file', japanese: 'ファイル', phoneme: 'f-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pile', japanese: '山', phoneme: 'p-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'while', japanese: 'しばらく', phoneme: 'w-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'style', japanese: 'スタイル', phoneme: 's-t-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'exile', japanese: '追放', phoneme: 'ɛ-g-z-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'compile', japanese: '編集する', phoneme: 'k-ə-m-p-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'reptile', japanese: '爬虫類', phoneme: 'r-ɛ-p-t-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hostile', japanese: '敵対的な', phoneme: 'h-ɒ-s-t-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'profile', japanese: 'プロフィール', phoneme: 'p-r-oʊ-f-aɪ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'fine', japanese: '素晴らしい', phoneme: 'f-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wine', japanese: 'ワイン', phoneme: 'w-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pine', japanese: '松', phoneme: 'p-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shine', japanese: '輝く', phoneme: 'ʃ-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'spine', japanese: '背骨', phoneme: 's-p-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shrine', japanese: '神社', phoneme: 'ʃ-r-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'combine', japanese: '結合する', phoneme: 'k-ə-m-b-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'define', japanese: '定義する', phoneme: 'd-ɪ-f-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'refine', japanese: '精製する', phoneme: 'r-ɪ-f-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'decline', japanese: '衰退する', phoneme: 'd-ɪ-k-l-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'incline', japanese: '傾く', phoneme: 'ɪ-n-k-l-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'confine', japanese: '閉じ込める', phoneme: 'k-ə-n-f-aɪ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pipe', japanese: 'パイプ', phoneme: 'p-aɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'ripe', japanese: '熟した', phoneme: 'r-aɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stripe', japanese: '縞', phoneme: 's-t-r-aɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wipe', japanese: '拭く', phoneme: 'w-aɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'type', japanese: 'タイプ', phoneme: 't-aɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hype', japanese: '誇大広告', phoneme: 'h-aɪ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'price', japanese: '価格', phoneme: 'p-r-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'nice', japanese: '素敵な', phoneme: 'n-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rice', japanese: '米', phoneme: 'r-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mice', japanese: 'ネズミ（複数）', phoneme: 'm-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dice', japanese: 'サイコロ', phoneme: 'd-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'twice', japanese: '2回', phoneme: 't-w-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'spice', japanese: 'スパイス', phoneme: 's-p-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'slice', japanese: 'スライス', phoneme: 's-l-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'device', japanese: '装置', phoneme: 'd-ɪ-v-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'advice', japanese: '助言', phoneme: 'ə-d-v-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'sacrifice', japanese: '犠牲', phoneme: 's-æ-k-r-ɪ-f-aɪ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      
      // o-e パターン (短音 /ɒ/ → 長音 /oʊ/) - 約100語
      { word: 'home', japanese: '家', phoneme: 'h-oʊ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hope', japanese: '希望', phoneme: 'h-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rope', japanese: 'ロープ', phoneme: 'r-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'nose', japanese: '鼻', phoneme: 'n-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rose', japanese: 'バラ', phoneme: 'r-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'bone', japanese: '骨', phoneme: 'b-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stone', japanese: '石', phoneme: 's-t-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'phone', japanese: '電話', phoneme: 'f-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hole', japanese: '穴', phoneme: 'h-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pole', japanese: '棒', phoneme: 'p-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'vote', japanese: '投票する', phoneme: 'v-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'note', japanese: 'メモ', phoneme: 'n-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cone', japanese: '円錐', phoneme: 'k-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'zone', japanese: 'ゾーン', phoneme: 'z-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tone', japanese: '音色', phoneme: 't-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'alone', japanese: '一人で', phoneme: 'ə-l-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'throne', japanese: '王座', phoneme: 'θ-r-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'clone', japanese: 'クローン', phoneme: 'k-l-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'drone', japanese: 'ドローン', phoneme: 'd-r-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'prone', japanese: 'うつ伏せの', phoneme: 'p-r-oʊ-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'code', japanese: 'コード', phoneme: 'k-oʊ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mode', japanese: 'モード', phoneme: 'm-oʊ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rode', japanese: '乗った', phoneme: 'r-oʊ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'node', japanese: '節', phoneme: 'n-oʊ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'explode', japanese: '爆発する', phoneme: 'ɪ-k-s-p-l-oʊ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'episode', japanese: 'エピソード', phoneme: 'ɛ-p-ɪ-s-oʊ-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dome', japanese: 'ドーム', phoneme: 'd-oʊ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'chrome', japanese: 'クローム', phoneme: 'k-r-oʊ-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'scope', japanese: '範囲', phoneme: 's-k-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'slope', japanese: '斜面', phoneme: 's-l-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cope', japanese: '対処する', phoneme: 'k-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mope', japanese: 'ふさぎ込む', phoneme: 'm-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pope', japanese: '法王', phoneme: 'p-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dope', japanese: '麻薬', phoneme: 'd-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'elope', japanese: '駆け落ちする', phoneme: 'ɪ-l-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'telescope', japanese: '望遠鏡', phoneme: 't-ɛ-l-ɪ-s-k-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'microscope', japanese: '顕微鏡', phoneme: 'm-aɪ-k-r-ə-s-k-oʊ-p', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stove', japanese: 'ストーブ', phoneme: 's-t-oʊ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'drove', japanese: '運転した', phoneme: 'd-r-oʊ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'grove', japanese: '木立', phoneme: 'g-r-oʊ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cove', japanese: '入り江', phoneme: 'k-oʊ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wove', japanese: '織った', phoneme: 'w-oʊ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'strove', japanese: '努力した', phoneme: 's-t-r-oʊ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'clove', japanese: 'クローブ', phoneme: 'k-l-oʊ-v', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'joke', japanese: '冗談', phoneme: 'dʒ-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'poke', japanese: '突く', phoneme: 'p-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'woke', japanese: '起きた', phoneme: 'w-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'spoke', japanese: '話した', phoneme: 's-p-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stroke', japanese: '撫でる', phoneme: 's-t-r-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'broke', japanese: '壊した', phoneme: 'b-r-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'smoke', japanese: '煙', phoneme: 's-m-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'choke', japanese: '窒息する', phoneme: 'tʃ-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'yoke', japanese: 'くびき', phoneme: 'j-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'evoke', japanese: '呼び起こす', phoneme: 'ɪ-v-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'invoke', japanese: '祈願する', phoneme: 'ɪ-n-v-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'provoke', japanese: '挑発する', phoneme: 'p-r-ə-v-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'revoke', japanese: '取り消す', phoneme: 'r-ɪ-v-oʊ-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'role', japanese: '役割', phoneme: 'r-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'sole', japanese: '唯一の', phoneme: 's-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mole', japanese: 'モグラ', phoneme: 'm-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'whole', japanese: '全体', phoneme: 'h-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'stole', japanese: '盗んだ', phoneme: 's-t-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'console', japanese: 'コンソール', phoneme: 'k-ə-n-s-oʊ-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dose', japanese: '投与量', phoneme: 'd-oʊ-s', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'close', japanese: '閉じる', phoneme: 'k-l-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'those', japanese: 'それら', phoneme: 'ð-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'chose', japanese: '選んだ', phoneme: 'tʃ-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'expose', japanese: '晒す', phoneme: 'ɪ-k-s-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'compose', japanese: '作曲する', phoneme: 'k-ə-m-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'propose', japanese: '提案する', phoneme: 'p-r-ə-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dispose', japanese: '処分する', phoneme: 'd-ɪ-s-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'suppose', japanese: '仮定する', phoneme: 's-ə-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'oppose', japanese: '反対する', phoneme: 'ə-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'impose', japanese: '課す', phoneme: 'ɪ-m-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'transpose', japanese: '移調する', phoneme: 't-r-æ-n-s-p-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'hose', japanese: 'ホース', phoneme: 'h-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'froze', japanese: '凍った', phoneme: 'f-r-oʊ-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'globe', japanese: '地球儀', phoneme: 'g-l-oʊ-b', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'robe', japanese: 'ローブ', phoneme: 'r-oʊ-b', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'probe', japanese: '探査する', phoneme: 'p-r-oʊ-b', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'lobe', japanese: '葉', phoneme: 'l-oʊ-b', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'quote', japanese: '引用する', phoneme: 'k-w-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wrote', japanese: '書いた', phoneme: 'r-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'promote', japanese: '促進する', phoneme: 'p-r-ə-m-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'remote', japanese: '遠隔の', phoneme: 'r-ɪ-m-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'devote', japanese: '捧げる', phoneme: 'd-ɪ-v-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'denote', japanese: '示す', phoneme: 'd-ɪ-n-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'antidote', japanese: '解毒剤', phoneme: 'æ-n-t-ɪ-d-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'anecdote', japanese: '逸話', phoneme: 'æ-n-ɪ-k-d-oʊ-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'store', japanese: '店', phoneme: 's-t-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'more', japanese: 'もっと', phoneme: 'm-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'before', japanese: '前に', phoneme: 'b-ɪ-f-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'explore', japanese: '探検する', phoneme: 'ɪ-k-s-p-l-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'restore', japanese: '復元する', phoneme: 'r-ɪ-s-t-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'ignore', japanese: '無視する', phoneme: 'ɪ-g-n-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'adore', japanese: '崇拝する', phoneme: 'ə-d-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'shore', japanese: '海岸', phoneme: 'ʃ-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'score', japanese: '得点', phoneme: 's-k-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'swore', japanese: '誓った', phoneme: 's-w-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'bore', japanese: '退屈させる', phoneme: 'b-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'wore', japanese: '着た', phoneme: 'w-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tore', japanese: '破った', phoneme: 't-ɔr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      
      // u-e パターン (短音 /ʌ/ → 長音 /juː/) - 約100語
      { word: 'cute', japanese: 'かわいい', phoneme: 'k-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cube', japanese: '立方体', phoneme: 'k-juː-b', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'huge', japanese: '巨大な', phoneme: 'h-juː-dʒ', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tube', japanese: 'チューブ', phoneme: 't-juː-b', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'use', japanese: '使う', phoneme: 'juː-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mute', japanese: '無音の', phoneme: 'm-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'fuse', japanese: 'ヒューズ', phoneme: 'f-juː-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tune', japanese: '曲', phoneme: 't-juː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rule', japanese: '規則', phoneme: 'r-uː-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'June', japanese: '6月', phoneme: 'dʒ-uː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'prune', japanese: 'プルーン', phoneme: 'p-r-uː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'flute', japanese: 'フルート', phoneme: 'f-l-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dune', japanese: '砂丘', phoneme: 'd-juː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rude', japanese: '失礼な', phoneme: 'r-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'crude', japanese: '粗野な', phoneme: 'k-r-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dude', japanese: '男', phoneme: 'd-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'nude', japanese: '裸の', phoneme: 'n-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'include', japanese: '含む', phoneme: 'ɪ-n-k-l-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'exclude', japanese: '除外する', phoneme: 'ɪ-k-s-k-l-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'conclude', japanese: '結論する', phoneme: 'k-ə-n-k-l-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'intrude', japanese: '侵入する', phoneme: 'ɪ-n-t-r-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'protrude', japanese: '突き出る', phoneme: 'p-r-ə-t-r-uː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'altitude', japanese: '高度', phoneme: 'æ-l-t-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'attitude', japanese: '態度', phoneme: 'æ-t-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'aptitude', japanese: '適性', phoneme: 'æ-p-t-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'latitude', japanese: '緯度', phoneme: 'l-æ-t-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'gratitude', japanese: '感謝', phoneme: 'g-r-æ-t-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'solitude', japanese: '孤独', phoneme: 's-ɒ-l-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'magnitude', japanese: '大きさ', phoneme: 'm-æ-g-n-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'multitude', japanese: '多数', phoneme: 'm-ʌ-l-t-ɪ-t-juː-d', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'duke', japanese: '公爵', phoneme: 'd-juː-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'luke', japanese: 'ルーク', phoneme: 'l-uː-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'puke', japanese: '吐く', phoneme: 'p-juː-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rebuke', japanese: '叱責する', phoneme: 'r-ɪ-b-juː-k', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'cure', japanese: '治す', phoneme: 'k-jʊr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pure', japanese: '純粋な', phoneme: 'p-jʊr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'sure', japanese: '確かな', phoneme: 'ʃ-ʊr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'lure', japanese: '誘惑', phoneme: 'l-ʊr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'secure', japanese: '安全な', phoneme: 's-ɪ-k-jʊr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'endure', japanese: '耐える', phoneme: 'ɪ-n-d-jʊr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mature', japanese: '成熟した', phoneme: 'm-ə-tʃ-ʊr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'nature', japanese: '自然', phoneme: 'n-eɪ-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'future', japanese: '未来', phoneme: 'f-juː-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'picture', japanese: '写真', phoneme: 'p-ɪ-k-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'culture', japanese: '文化', phoneme: 'k-ʌ-l-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'feature', japanese: '特徴', phoneme: 'f-iː-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'creature', japanese: '生き物', phoneme: 'k-r-iː-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mixture', japanese: '混合物', phoneme: 'm-ɪ-k-s-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'texture', japanese: '質感', phoneme: 't-ɛ-k-s-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'structure', japanese: '構造', phoneme: 's-t-r-ʌ-k-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'furniture', japanese: '家具', phoneme: 'f-ɝ-n-ɪ-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'adventure', japanese: '冒険', phoneme: 'ə-d-v-ɛ-n-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'capture', japanese: '捕獲する', phoneme: 'k-æ-p-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'rupture', japanese: '破裂', phoneme: 'r-ʌ-p-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'torture', japanese: '拷問', phoneme: 't-ɔr-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'lecture', japanese: '講義', phoneme: 'l-ɛ-k-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'conjecture', japanese: '推測', phoneme: 'k-ə-n-dʒ-ɛ-k-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'manufacture', japanese: '製造する', phoneme: 'm-æ-n-j-ə-f-æ-k-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'agriculture', japanese: '農業', phoneme: 'æ-g-r-ɪ-k-ʌ-l-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'temperature', japanese: '温度', phoneme: 't-ɛ-m-p-ə-r-ə-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'literature', japanese: '文学', phoneme: 'l-ɪ-t-ə-r-ə-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'signature', japanese: '署名', phoneme: 's-ɪ-g-n-ə-tʃ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'procedure', japanese: '手順', phoneme: 'p-r-ə-s-iː-dʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'measure', japanese: '測る', phoneme: 'm-ɛ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pleasure', japanese: '喜び', phoneme: 'p-l-ɛ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'treasure', japanese: '宝', phoneme: 't-r-ɛ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'leisure', japanese: '余暇', phoneme: 'l-ɛ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'exposure', japanese: '露出', phoneme: 'ɪ-k-s-p-oʊ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'closure', japanese: '閉鎖', phoneme: 'k-l-oʊ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'composure', japanese: '落ち着き', phoneme: 'k-ə-m-p-oʊ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'disclosure', japanese: '開示', phoneme: 'd-ɪ-s-k-l-oʊ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'enclosure', japanese: '囲い', phoneme: 'ɪ-n-k-l-oʊ-ʒ-ər', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'mule', japanese: 'ラバ', phoneme: 'm-juː-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'yule', japanese: 'クリスマス', phoneme: 'j-uː-l', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dispute', japanese: '紛争', phoneme: 'd-ɪ-s-p-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'compute', japanese: '計算する', phoneme: 'k-ə-m-p-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'repute', japanese: '評判', phoneme: 'r-ɪ-p-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'salute', japanese: '敬礼', phoneme: 's-ə-l-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'pollute', japanese: '汚染する', phoneme: 'p-ə-l-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dilute', japanese: '薄める', phoneme: 'd-aɪ-l-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'absolute', japanese: '絶対的な', phoneme: 'æ-b-s-ə-l-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'resolute', japanese: '断固とした', phoneme: 'r-ɛ-z-ə-l-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'dissolute', japanese: '放蕩な', phoneme: 'd-ɪ-s-ə-l-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'institute', japanese: '研究所', phoneme: 'ɪ-n-s-t-ɪ-t-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'constitute', japanese: '構成する', phoneme: 'k-ɒ-n-s-t-ɪ-t-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'substitute', japanese: '代替', phoneme: 's-ʌ-b-s-t-ɪ-t-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'prostitute', japanese: '売春婦', phoneme: 'p-r-ɒ-s-t-ɪ-t-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'destitute', japanese: '貧困な', phoneme: 'd-ɛ-s-t-ɪ-t-uː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'attribute', japanese: '属性', phoneme: 'æ-t-r-ɪ-b-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'contribute', japanese: '貢献する', phoneme: 'k-ə-n-t-r-ɪ-b-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'distribute', japanese: '配布する', phoneme: 'd-ɪ-s-t-r-ɪ-b-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'tribute', japanese: '賛辞', phoneme: 't-r-ɪ-b-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'execute', japanese: '実行する', phoneme: 'ɛ-k-s-ɪ-k-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'prosecute', japanese: '起訴する', phoneme: 'p-r-ɒ-s-ɪ-k-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'persecute', japanese: '迫害する', phoneme: 'p-ɝ-s-ɪ-k-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'acute', japanese: '鋭い', phoneme: 'ə-k-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'minute', japanese: '微小な', phoneme: 'm-aɪ-n-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'commute', japanese: '通勤する', phoneme: 'k-ə-m-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'transmute', japanese: '変化させる', phoneme: 't-r-æ-n-s-m-juː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      
      // e-e パターン (短音 /ɛ/ → 長音 /iː/) - 約20語
      { word: 'these', japanese: 'これら', phoneme: 'ð-iː-z', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'theme', japanese: 'テーマ', phoneme: 'θ-iː-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'here', japanese: 'ここ', phoneme: 'h-ɪr', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'complete', japanese: '完全な', phoneme: 'k-ə-m-p-l-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'extreme', japanese: '極端な', phoneme: 'ɪ-k-s-t-r-iː-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'compete', japanese: '競争する', phoneme: 'k-ə-m-p-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'delete', japanese: '削除する', phoneme: 'd-ɪ-l-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'concrete', japanese: 'コンクリート', phoneme: 'k-ɒ-n-k-r-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'athlete', japanese: 'アスリート', phoneme: 'æ-θ-l-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'obsolete', japanese: '時代遅れの', phoneme: 'ɒ-b-s-ə-l-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'discrete', japanese: '個別の', phoneme: 'd-ɪ-s-k-r-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'deplete', japanese: '枯渇させる', phoneme: 'd-ɪ-p-l-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'replete', japanese: '満ちた', phoneme: 'r-ɪ-p-l-iː-t', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'scene', japanese: '場面', phoneme: 's-iː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'gene', japanese: '遺伝子', phoneme: 'dʒ-iː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'serene', japanese: '穏やかな', phoneme: 's-ə-r-iː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'obscene', japanese: 'わいせつな', phoneme: 'ə-b-s-iː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'intervene', japanese: '介入する', phoneme: 'ɪ-n-t-ər-v-iː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'convene', japanese: '招集する', phoneme: 'k-ə-n-v-iː-n', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },
      { word: 'supreme', japanese: '最高の', phoneme: 's-ə-p-r-iː-m', group: 'magic-e', difficulty: 'advanced', category: 'magic-e' },

      // =================== 従来の基本音・応用音分類 ===================
      // 基本短母音グループ
      { word: 'bed', japanese: 'ベッド', phoneme: 'b-ɛ-d', group: 'basic-vowels', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'leg', japanese: '足', phoneme: 'l-ɛ-g', group: 'basic-vowels', difficulty: 'basic', category: 'basic-vowels' },
      { word: 'pet', japanese: 'ペット', phoneme: 'p-ɛ-t', group: 'basic-vowels', difficulty: 'basic', category: 'basic-vowels' },
      
      // 基本子音グループ
      { word: 'baby', japanese: '赤ちゃん', phoneme: 'b-eɪ-b-i', group: 'basic-consonants', difficulty: 'basic', category: 'basic-consonants' },
      { word: 'book', japanese: '本', phoneme: 'b-ʊ-k', group: 'consonants', difficulty: 'basic' },
      { word: 'ball', japanese: 'ボール', phoneme: 'b-ɔ-l', group: 'consonants', difficulty: 'basic' },
      { word: 'park', japanese: '公園', phoneme: 'p-ɑ-r-k', group: 'consonants', difficulty: 'basic' },
      { word: 'paper', japanese: '紙', phoneme: 'p-eɪ-p-ər', group: 'consonants', difficulty: 'basic' },
      { word: 'table', japanese: 'テーブル', phoneme: 't-eɪ-b-əl', group: 'consonants', difficulty: 'basic' },
      { word: 'time', japanese: '時間', phoneme: 't-aɪ-m', group: 'consonants', difficulty: 'basic' },
      { word: 'door', japanese: 'ドア', phoneme: 'd-ɔ-r', group: 'consonants', difficulty: 'basic' },
      { word: 'duck', japanese: 'アヒル', phoneme: 'd-ʌ-k', group: 'consonants', difficulty: 'basic' },
      { word: 'deep', japanese: '深い', phoneme: 'd-i-p', group: 'consonants', difficulty: 'basic' },
      
      // 長母音 /i:/
      { word: 'tree', japanese: '木', phoneme: 't-r-i', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'bee', japanese: 'ハチ', phoneme: 'b-i', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'see', japanese: '見る', phoneme: 's-i', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'tea', japanese: 'お茶', phoneme: 't-i', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'sea', japanese: '海', phoneme: 's-i', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'free', japanese: '自由', phoneme: 'f-r-i', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'three', japanese: '3', phoneme: 'θ-r-i', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'green', japanese: '緑', phoneme: 'g-r-i-n', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'sleep', japanese: '眠る', phoneme: 's-l-i-p', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'cheese', japanese: 'チーズ', phoneme: 't-ʃ-i-z', group: 'long-vowels', difficulty: 'advanced' },
      
      // 長母音 /ɑ:/
      { word: 'car', japanese: '車', phoneme: 'k-ɑ-r', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'star', japanese: '星', phoneme: 's-t-ɑ-r', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'far', japanese: '遠い', phoneme: 'f-ɑ-r', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'park', japanese: '公園', phoneme: 'p-ɑ-r-k', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'dark', japanese: '暗い', phoneme: 'd-ɑ-r-k', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'arm', japanese: '腕', phoneme: 'ɑ-r-m', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'farm', japanese: '農場', phoneme: 'f-ɑ-r-m', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'hard', japanese: '硬い', phoneme: 'h-ɑ-r-d', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'card', japanese: 'カード', phoneme: 'k-ɑ-r-d', group: 'long-vowels', difficulty: 'advanced' },
      { word: 'heart', japanese: '心', phoneme: 'h-ɑ-r-t', group: 'long-vowels', difficulty: 'advanced' },
      
      // 二重母音 /eɪ/
      { word: 'make', japanese: '作る', phoneme: 'm-eɪ-k', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'take', japanese: '取る', phoneme: 't-eɪ-k', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'cake', japanese: 'ケーキ', phoneme: 'k-eɪ-k', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'name', japanese: '名前', phoneme: 'n-eɪ-m', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'game', japanese: 'ゲーム', phoneme: 'g-eɪ-m', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'plane', japanese: '飛行機', phoneme: 'p-l-eɪ-n', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'snake', japanese: 'ヘビ', phoneme: 's-n-eɪ-k', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'grape', japanese: 'ブドウ', phoneme: 'g-r-eɪ-p', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'plate', japanese: 'お皿', phoneme: 'p-l-eɪ-t', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'train', japanese: '電車', phoneme: 't-r-eɪ-n', group: 'diphthongs', difficulty: 'advanced' },
      
      // 二重母音 /aɪ/
      { word: 'time', japanese: '時間', phoneme: 't-aɪ-m', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'like', japanese: '好き', phoneme: 'l-aɪ-k', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'bike', japanese: '自転車', phoneme: 'b-aɪ-k', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'five', japanese: '5', phoneme: 'f-aɪ-v', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'nine', japanese: '9', phoneme: 'n-aɪ-n', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'smile', japanese: '笑顔', phoneme: 's-m-aɪ-l', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'white', japanese: '白', phoneme: 'w-aɪ-t', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'night', japanese: '夜', phoneme: 'n-aɪ-t', group: 'diphthongs', difficulty: 'advanced' },
      
      // 二重母音 /ɔɪ/
      { word: 'boy', japanese: '男の子', phoneme: 'b-ɔɪ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'toy', japanese: 'おもちゃ', phoneme: 't-ɔɪ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'joy', japanese: '喜び', phoneme: 'dʒ-ɔɪ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'coin', japanese: 'コイン', phoneme: 'k-ɔɪ-n', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'voice', japanese: '声', phoneme: 'v-ɔɪ-s', group: 'diphthongs', difficulty: 'advanced' },
      
      // 二重母音 /aʊ/
      { word: 'how', japanese: 'どのように', phoneme: 'h-aʊ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'now', japanese: '今', phoneme: 'n-aʊ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'cow', japanese: '牛', phoneme: 'k-aʊ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'house', japanese: '家', phoneme: 'h-aʊ-s', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'mouse', japanese: 'ネズミ', phoneme: 'm-aʊ-s', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'cloud', japanese: '雲', phoneme: 'k-l-aʊ-d', group: 'diphthongs', difficulty: 'advanced' },
      
      // 二重母音 /oʊ/
      { word: 'go', japanese: '行く', phoneme: 'g-oʊ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'no', japanese: 'いいえ', phoneme: 'n-oʊ', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'home', japanese: '家', phoneme: 'h-oʊ-m', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'phone', japanese: '電話', phoneme: 'f-oʊ-n', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'boat', japanese: 'ボート', phoneme: 'b-oʊ-t', group: 'diphthongs', difficulty: 'advanced' },
      { word: 'road', japanese: '道', phoneme: 'r-oʊ-d', group: 'diphthongs', difficulty: 'advanced' },
      
      // ブレンド音 bl-
      { word: 'blue', japanese: '青', phoneme: 'b-l-u', group: 'blends', difficulty: 'advanced' },
      { word: 'black', japanese: '黒', phoneme: 'b-l-æ-k', group: 'blends', difficulty: 'advanced' },
      { word: 'blow', japanese: '吹く', phoneme: 'b-l-oʊ', group: 'blends', difficulty: 'advanced' },
      { word: 'block', japanese: 'ブロック', phoneme: 'b-l-ɒ-k', group: 'blends', difficulty: 'advanced' },
      { word: 'blood', japanese: '血', phoneme: 'b-l-ʌ-d', group: 'blends', difficulty: 'advanced' },
      
      // ブレンド音 cr-
      { word: 'cry', japanese: '泣く', phoneme: 'k-r-aɪ', group: 'blends', difficulty: 'advanced' },
      { word: 'crown', japanese: '王冠', phoneme: 'k-r-aʊ-n', group: 'blends', difficulty: 'advanced' },
      { word: 'cream', japanese: 'クリーム', phoneme: 'k-r-i-m', group: 'blends', difficulty: 'advanced' },
      { word: 'crazy', japanese: 'クレイジー', phoneme: 'k-r-eɪ-z-i', group: 'blends', difficulty: 'advanced' },
      { word: 'cross', japanese: '十字', phoneme: 'k-r-ɒ-s', group: 'blends', difficulty: 'advanced' }
    ]

    // 選択されたグループと音素カテゴリーでフィルタリング
    const filteredWordList = computed(() => {
      let filtered = wordList.filter(word => word.group === selectedGroup.value)
      
      // カテゴリーフィルターが選択されている場合、さらにフィルタリング
      if (selectedCategory.value) {
        filtered = filtered.filter(word => word.category === selectedCategory.value)
      }
      
      logger.log(`Filtered ${filtered.length} words for group: ${selectedGroup.value}, category: ${selectedCategory.value || 'all'}`)
      return filtered
    })
    
    // ゲーム用の単語リスト（問題数に応じてシャッフル・制限）
    const gameWordList = ref([])
    
    const initializeGameWordList = () => {
      // 単語データが存在するかチェック
      if (!filteredWordList.value || filteredWordList.value.length === 0) {
        logger.error('No words available for selected group:', selectedGroup.value)
        gameWordList.value = []
        return
      }
      
      // 単語をシャッフル
      const shuffled = [...filteredWordList.value].sort(() => Math.random() - 0.5)
      // 選択された問題数に制限
      const maxQuestions = Math.min(selectedQuestionCount.value, shuffled.length)
      gameWordList.value = shuffled.slice(0, maxQuestions)
      currentWordIndex.value = 0
      
      logger.log(`Initialized game with ${gameWordList.value.length} words for group: ${selectedGroup.value}`)
    }
    
    const currentWord = computed(() => {
      if (!gameWordList.value || gameWordList.value.length === 0) return null
      return gameWordList.value[currentWordIndex.value] || null
    })
    
    // 選択肢を生成（正解 + ランダムな3つの間違い）
    const choices = computed(() => {
      if (!currentWord.value) return []
      
      const correct = currentWord.value.word
      // 同じグループから選択肢を作成
      const sameGroupWords = filteredWordList.value.filter(w => w.word !== correct)
      const wrongChoices = []
      
      // ランダムに3つの間違いを選択
      while (wrongChoices.length < 3 && wrongChoices.length < sameGroupWords.length) {
        const randomWord = sameGroupWords[Math.floor(Math.random() * sameGroupWords.length)]
        if (!wrongChoices.includes(randomWord.word)) {
          wrongChoices.push(randomWord.word)
        }
      }
      
      // 正解と間違いをシャッフル
      const allChoices = [correct, ...wrongChoices]
      return allChoices.sort(() => Math.random() - 0.5)
    })
    
    // タイマー進捗
    const timerProgress = computed(() => (timeLeft.value / 60) * 100)
    const timerColorClass = computed(() => {
      if (timeLeft.value > 30) return 'timer-green'
      if (timeLeft.value > 15) return 'timer-yellow'
      return 'timer-red'
    })

    
    const playSound = async () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      
      try {
        
        const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8 // 少し遅めに
        utterance.volume = 1.0  // 単語の音声は最大音量で再生
        
        utterance.onend = () => {
          isPlaying.value = false
        }
        
        utterance.onerror = (event) => {
          logger.error('Speech synthesis error:', event.error)
          isPlaying.value = false
        }
        
        speechSynthesis.speak(utterance)
      } catch (error) {
        logger.error('Error playing sound:', error)
        // エラーが発生した場合も通常の再生を試みる
        const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        utterance.onend = () => {
          isPlaying.value = false
        }
        speechSynthesis.speak(utterance)
      }
      // playUISound('click') - 効果音を無効化
    }
    
    // 選択肢クリック
    const selectChoice = (choice) => {
      if (isChoiceDisabled.value) return
      
      isChoiceDisabled.value = true
      totalAttempts.value++
      
      const correct = choice === currentWord.value.word
      isCorrect.value = correct
      showFeedback.value = true
      
      if (correct) {
        feedbackMessage.value = '正解です！'
        feedbackAnswer.value = `"${currentWord.value.word}" = ${currentWord.value.japanese}`
        score.value += 10
        correctAnswers.value++
        combo.value++
        // 最大連続正解数を更新
        maxCombo.value = Math.max(maxCombo.value, combo.value)
        playSoundEffect('correct')
      } else {
        feedbackMessage.value = '不正解です'
        feedbackAnswer.value = `正解は "${currentWord.value.word}" = ${currentWord.value.japanese}`
        combo.value = 0
        playSoundEffect('incorrect')
      }
      
      // 2秒後に次の問題へ
      setTimeout(() => {
        nextWord()
      }, 2000)
    }
    
    // 選択肢のスタイルクラス
    const getChoiceClass = (choice) => {
      if (!showFeedback.value) return 'choice-default'
      
      if (choice === currentWord.value.word) {
        return 'choice-correct'
      } else {
        return 'choice-incorrect'
      }
    }

    const checkAnswer = () => {
      if (isAnimating.value) return
      isAnimating.value = true
      totalAttempts.value++

      const isCorrect = userAnswer.value.toLowerCase() === currentWord.value.word.toLowerCase()

      if (isCorrect) {
        feedback.value = '正解です！'
        score.value += 10
        correctAnswers.value++
        combo.value++
        playSoundEffect('correct')

        // マスターした単語を記録
        const masteredWords = gameStore.gameProgress.soundMaster.masteredWords || []
        if (!masteredWords.includes(currentWord.value.word)) {
          masteredWords.push(currentWord.value.word)
          playSoundEffect('achievement')
        }

        // ゲーム進捗の更新
        gameStore.updateGameProgress('soundMaster', {
          bestScore: Math.max(score.value, gameStore.gameProgress.soundMaster.bestScore),
          masteredWords,
          attempts: totalAttempts.value
        })

        // 統計データの更新
        const playTime = Date.now() - startTime.value
        gameStore.updateGameStats('soundMaster', {
          correctAnswers: correctAnswers.value,
          totalAttempts: totalAttempts.value,
          playTime
        })

        // ストリーク更新
        gameStore.updateStreak()
      } else {
        feedback.value = 'もう一度試してみましょう'
        playSoundEffect('incorrect')
      }

      setTimeout(() => {
        isAnimating.value = false
        userAnswer.value = ''
        feedback.value = ''
      }, 1000)
    }

    const nextWord = () => {
      playUISound('select')
      currentWordIndex.value++
      userAnswer.value = ''
      feedback.value = ''
      showFeedback.value = false
      isChoiceDisabled.value = false
      
      // 進捗を更新
      progress.value = gameWordList.value?.length ? (currentWordIndex.value / gameWordList.value.length) * 100 : 0
      
      // ゲーム終了判定（選択した問題数に達した場合）
      if (gameWordList.value?.length && currentWordIndex.value >= gameWordList.value.length) {
        stopGame()
      }
    }

    // コンポーネントのマウント時に初期化
    onMounted(async () => {
      startTime.value = Date.now()
      // 既存の進捗を読み込み
      const savedProgress = gameStore.getGameProgress('soundMaster')
      if (savedProgress) {
        score.value = savedProgress.bestScore
        progress.value = savedProgress.progress || 0
      }
      
    })

    // コンポーネントのアンマウント時に最終統計を更新とBGM停止
    onUnmounted(async () => {
      const playTime = Date.now() - startTime.value
      gameStore.updateGameStats('soundMaster', {
        correctAnswers: correctAnswers.value,
        totalAttempts: totalAttempts.value,
        playTime
      })
      
      // BGMを停止
      try {
        const { soundManager } = await import('@/utils/soundManager')
        await soundManager.stopMusic(500) // 0.5秒でフェードアウト
      } catch (error) {
        logger.log('Failed to stop music:', error)
      }
    })

    return {
      // 画面状態
      currentScreen,
      selectedCourse,
      selectedGroup,
      selectedCategory,
      selectedQuestionCount,
      questionCountOptions,
      courses,
      availableGroups,
      selectedGroupDescription,
      selectedCategoryDescription,
      currentGroup,
      
      // ゲーム状態
      score,
      progress,
      currentWord,
      userAnswer,
      feedback,
      isAnimating,
      combo,
      maxCombo,
      timeLeft,
      choices,
      isPlaying,
      showFeedback,
      isCorrect,
      feedbackMessage,
      feedbackAnswer,
      isChoiceDisabled,
      correctAnswers,
      totalAttempts,
      startTime,
      timerProgress,
      timerColorClass,
      
      // メソッド
      selectCourse,
      startGame,
      goToReview,
      stopGame,
      retryGame,
      goToMenu,
      goToHome,
      playSound,
      selectChoice,
      getChoiceClass,
      checkAnswer,
      nextWord
    }
  }
})
</script>

<style scoped>
.sound-master-game {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #2d1b69 100%);
  background-attachment: fixed;
  font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
  position: relative;
  overflow: hidden;
}

.sound-master-game::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="100" cy="100" r="2" fill="white" opacity="0.8"/><circle cx="300" cy="200" r="1" fill="white" opacity="0.6"/><circle cx="500" cy="50" r="1.5" fill="white" opacity="0.9"/><circle cx="700" cy="300" r="1" fill="white" opacity="0.7"/><circle cx="900" cy="150" r="2" fill="white" opacity="0.8"/><circle cx="200" cy="400" r="1" fill="white" opacity="0.5"/><circle cx="600" cy="450" r="1.5" fill="white" opacity="0.8"/><circle cx="800" cy="500" r="1" fill="white" opacity="0.6"/></svg>') repeat;
  animation: twinkle 10s infinite linear;
  z-index: 0;
}

/* メニュー画面のスタイル */
.menu-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.menu-container {
  width: 100%;
  max-width: 800px;
  background: rgba(15, 15, 35, 0.9);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.menu-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.menu-header .header-controls {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

.home-button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 24px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.home-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.game-title {
  font-size: 64px;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.title-sound {
  color: #FFD700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

.title-tower {
  color: #87CEEB;
  font-size: 48px;
  display: block;
  margin-top: 10px;
  text-shadow: 0 0 15px rgba(135, 206, 235, 0.8);
  animation: tower-glow 3s ease-in-out infinite;
}

.game-subtitle {
  font-size: 20px;
  color: #B0C4DE;
  margin: 10px 0 0;
  text-shadow: 0 0 10px rgba(176, 196, 222, 0.5);
}

.cosmic-background {
  position: relative;
  margin-top: 20px;
  height: 100px;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 20px 30px, #fff, transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 90px 40px, #fff, transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent);
  animation: sparkle 4s ease-in-out infinite;
}

.tower-silhouette {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  opacity: 0.6;
  animation: tower-pulse 2s ease-in-out infinite;
}

.course-selection {
  margin-bottom: 30px;
}

.selection-label {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.course-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.course-button {
  width: 100%;
  padding: 25px;
  border: none;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.course-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.course-selected {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.course-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.course-icon {
  font-size: 40px;
}

.course-text {
  text-align: left;
}

.course-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.course-description {
  font-size: 14px;
  opacity: 0.8;
}

.group-selection {
  margin-bottom: 30px;
}

.group-select {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  color: #333;
  background: white;
  cursor: pointer;
  margin-bottom: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.group-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.question-count-selection {
  margin-bottom: 30px;
}

.question-count-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.question-count-button {
  padding: 12px 24px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  /* 効果音を無効化 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}

.question-count-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.question-count-button.selected {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
  color: white;
  border-color: transparent;
}

.menu-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.start-button,
.review-button {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.start-button {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.review-button {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
  color: white;
}

.start-button:hover,
.review-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* ゲーム画面のスタイル */
.game-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.game-container {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}


.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.trophy-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.hearts-container {
  display: flex;
  gap: 5px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.heart-icon {
  font-size: 20px;
  opacity: 0.3;
}

.heart-filled {
  opacity: 1;
}

.combo-display {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.combo-text {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.group-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.stop-button {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
}

.stop-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.back-button {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.stop-icon,
.back-icon {
  font-size: 20px;
  color: white;
}

.timer-container {
  margin-bottom: 20px;
}

.timer-bar {
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
}

.timer-progress {
  height: 100%;
  transition: width 0.1s linear;
  border-radius: 5px;
}

.timer-green {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
}

.timer-yellow {
  background: linear-gradient(45deg, #FFE66D, #FFD93D);
}

.timer-red {
  background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
}

.audio-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.character-display {
  margin-bottom: 20px;
}

.sound-question {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.play-button {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
  /* 効果音を無効化 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.play-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.play-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.play-icon {
  font-size: 24px;
}

.choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.choice-button {
  padding: 25px;
  border: none;
  border-radius: 20px;
  background: white;
  font-size: 32px;
  /* 効果音を無効化 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.choice-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.choice-button:disabled {
  cursor: not-allowed;
}

.no-choices-message {
  grid-column: span 2;
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 2px dashed #ccc;
}

.no-choices-message p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.no-choices-message .back-button {
  padding: 12px 24px;
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.no-choices-message .back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.choice-normal {
  background: white;
}

.choice-correct {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
  color: white;
}

.choice-incorrect {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.choice-unselected {
  background: rgba(255, 255, 255, 0.5);
  opacity: 0.7;
}

.feedback-container {
  text-align: center;
  padding: 20px;
  border-radius: 20px;
  margin-top: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.feedback-correct {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
}

.feedback-incorrect {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
}

.feedback-message {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
}

.feedback-answer {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

/* 結果画面のスタイル */
.result-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.result-container {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}

.result-header {
  margin-bottom: 30px;
}

.result-title {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 20px;
}

.result-score {
  display: inline-block;
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  padding: 15px 40px;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.score-label {
  font-size: 18px;
  color: white;
  margin-right: 10px;
}

.score-value {
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.result-stats {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 18px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.result-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.retry-button,
.menu-button {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.retry-button {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.menu-button {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
  color: white;
}

.retry-button:hover,
.menu-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* アニメーション */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

.input-field {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 15px;
  font-size: 1.2rem;
  width: 100%;
  max-width: 300px;
  text-align: center;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #4ECDC4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
}

.feedback-message {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.feedback-message.correct {
  background: #2ecc71;
  color: white;
  animation: correctFeedback 0.5s ease;
}

@keyframes correctFeedback {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.play-button,
.check-button,
.next-button {
  position: relative;
  overflow: hidden;
}

.play-button::after,
.check-button::after,
.next-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.play-button:hover::after,
.check-button:hover::after,
.next-button:hover::after {
  width: 200%;
  height: 200%;
}

.play-button:active,
.check-button:active,
.next-button:active {
  transform: scale(0.95);
}

/* 宇宙要素のスタイル */
.cosmic-display {
  background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  position: relative;
}

.tower-guardian {
  font-size: 48px;
  margin-bottom: 15px;
  animation: guardian-float 3s ease-in-out infinite;
}

.cosmic-particles {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 20px;
  animation: particles-drift 4s ease-in-out infinite;
}

/* アニメーション */
@keyframes twinkle {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-10px, -10px) rotate(90deg); }
  50% { transform: translate(-20px, 10px) rotate(180deg); }
  75% { transform: translate(10px, -20px) rotate(270deg); }
}

@keyframes tower-glow {
  0%, 100% { text-shadow: 0 0 15px rgba(135, 206, 235, 0.8); }
  50% { text-shadow: 0 0 25px rgba(135, 206, 235, 1), 0 0 35px rgba(255, 215, 0, 0.5); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes tower-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
  50% { transform: translateX(-50%) scale(1.1); opacity: 0.8; }
}

@keyframes guardian-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes particles-drift {
  0%, 100% { transform: translateX(0px) rotate(0deg); }
  33% { transform: translateX(-5px) rotate(120deg); }
  66% { transform: translateX(5px) rotate(240deg); }
}
</style>