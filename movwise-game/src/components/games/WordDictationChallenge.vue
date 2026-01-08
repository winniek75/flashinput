<template>
  <div class="min-h-screen galaxy-background p-6 relative overflow-hidden">
    <!-- Animated star layers -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>
    
    <div class="max-w-4xl mx-auto relative z-10">
      <!-- Header with back button -->
      <button
        @click="handleBack"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
      >
        ← 戻る
      </button>

      <h1 class="text-4xl font-bold galaxy-text-primary mb-8 text-center cosmic-glow">
        📝 ワード・ディクテーション・チャレンジ
      </h1>

      <!-- Streak Display -->
      <div class="mb-6">
        <StreakDisplay @quick-play="restartGame" @reward-claimed="onRewardClaimed" />
      </div>

      <!-- Game Status Bar -->
      <div class="galaxy-card rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex justify-between items-center">
          <div class="flex gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-400">⭐ {{ finalScore }}</div>
              <div class="text-galaxy-moon-silver">スコア</div>
              <div v-if="streakBonus > 1" class="text-xs text-orange-400">
                🔥×{{ streakBonus.toFixed(1) }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-400">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</div>
              <div class="text-galaxy-moon-silver">問題</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-400">{{ correctAnswers }}</div>
              <div class="text-galaxy-moon-silver">正解</div>
            </div>
            <div v-if="streakInfo.current > 0" class="text-center">
              <div class="text-2xl font-bold text-orange-400">🔥 {{ streakInfo.current }}</div>
              <div class="text-galaxy-moon-silver">連続</div>
            </div>
          </div>
          <div class="text-right">
            <div class="relative">
              <button
                @click="showLevelDropdown = !showLevelDropdown"
                class="text-lg font-bold galaxy-text-primary hover:text-galaxy-nova-orange transition-colors cursor-pointer flex items-center gap-2"
              >
                レベル: {{ currentLevel }} 
                <span class="text-sm">▼</span>
              </button>
              <!-- Level Dropdown -->
              <div 
                v-if="showLevelDropdown" 
                class="absolute right-0 top-full mt-2 bg-galaxy-deep-space border border-galaxy-cosmic-purple rounded-lg shadow-xl z-50 min-w-[200px]"
              >
                <button
                  v-for="level in [1, 2, 3]"
                  :key="level"
                  @click="currentLevel = level; showLevelDropdown = false; restartGame()"
                  class="block w-full text-left px-4 py-2 hover:bg-galaxy-cosmic-purple/20 transition-colors"
                  :class="{ 'bg-galaxy-cosmic-purple/30': currentLevel === level }"
                >
                  <div class="font-bold">レベル {{ level }}</div>
                  <div class="text-sm text-galaxy-moon-silver">{{ levelNames[level] }}</div>
                </button>
              </div>
            </div>
            <div class="text-galaxy-moon-silver">{{ levelNames[currentLevel] }}</div>
            <div class="text-sm text-blue-400 mt-1">{{ gameMode === 'word' ? '単語モード' : '文章モード' }}</div>
          </div>
        </div>
      </div>

      <!-- Game Area -->
      <div class="galaxy-card rounded-3xl p-8 shadow-2xl mb-6">
        <!-- Instructions -->
        <div v-if="gameState === 'instructions'" class="text-center">
          <div class="text-2xl font-bold galaxy-text-primary mb-4">🎧 音声ディクテーション練習</div>
          <p class="text-galaxy-moon-silver mb-6 text-lg">
            音声だけを頼りに、聞こえた{{ gameMode === 'word' ? '単語' : '文章' }}を書き取ります。<br>
            視覚的なヒントは一切ありません。<br>
            リスニング力とスペリング力を同時に鍛えましょう！
          </p>
          
          <!-- Game Mode Selection -->
          <div class="mb-6">
            <div class="text-lg font-bold galaxy-text-primary mb-3">ゲームモード選択</div>
            <div class="flex gap-4 justify-center">
              <button
                @click="gameMode = 'word'"
                class="px-6 py-3 rounded-xl font-bold transition-all duration-200"
                :class="gameMode === 'word' 
                  ? 'galaxy-button galaxy-button-primary' 
                  : 'galaxy-button galaxy-button-secondary'"
              >
                🔤 単語モード
              </button>
              <button
                @click="gameMode = 'sentence'"
                class="px-6 py-3 rounded-xl font-bold transition-all duration-200"
                :class="gameMode === 'sentence' 
                  ? 'galaxy-button galaxy-button-primary' 
                  : 'galaxy-button galaxy-button-secondary'"
              >
                📝 文章モード
              </button>
            </div>
          </div>
          
          <!-- Level Selection -->
          <div class="mb-6">
            <div class="text-lg font-bold galaxy-text-primary mb-3">難易度選択</div>
            <div class="flex gap-4 justify-center flex-wrap">
              <button
                @click="currentLevel = 1"
                class="px-4 py-3 rounded-xl font-bold transition-all duration-200"
                :class="currentLevel === 1 
                  ? 'galaxy-button galaxy-button-accent' 
                  : 'galaxy-button galaxy-button-secondary'"
              >
                ⭐ レベル1<br>
                <span class="text-sm">{{ levelNames[1] }}</span>
              </button>
              <button
                @click="currentLevel = 2"
                class="px-4 py-3 rounded-xl font-bold transition-all duration-200"
                :class="currentLevel === 2 
                  ? 'galaxy-button galaxy-button-accent' 
                  : 'galaxy-button galaxy-button-secondary'"
              >
                ⭐⭐ レベル2<br>
                <span class="text-sm">{{ levelNames[2] }}</span>
              </button>
              <button
                @click="currentLevel = 3"
                class="px-4 py-3 rounded-xl font-bold transition-all duration-200"
                :class="currentLevel === 3 
                  ? 'galaxy-button galaxy-button-accent' 
                  : 'galaxy-button galaxy-button-secondary'"
              >
                ⭐⭐⭐ レベル3<br>
                <span class="text-sm">{{ levelNames[3] }}</span>
              </button>
            </div>
          </div>
          
          <button 
            @click="startGame"
            class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all duration-200"
          >
            スタート！
          </button>
        </div>

        <!-- Game Playing -->
        <div v-else-if="gameState === 'playing'" class="text-center">
          <!-- Audio Controls -->
          <div class="mb-8">
            <div class="text-xl font-bold galaxy-text-primary mb-4">
              🎧 音声を聞いて、{{ gameMode === 'word' ? '単語' : '文章' }}を入力してください
            </div>
            
            <!-- Audio playback button -->
            <button
              @click="playCurrentWord"
              :disabled="isPlaying"
              class="galaxy-button galaxy-button-accent px-6 py-3 rounded-xl font-bold text-lg mb-4 mx-2 hover:shadow-lg transition-all duration-200"
              :class="{ 'opacity-50 cursor-not-allowed': isPlaying }"
            >
              {{ isPlaying ? '🔊 再生中...' : '🔊 音声を再生' }}
            </button>

            <button
              v-if="currentWord.audioPlayed"
              @click="repeatAudio"
              class="galaxy-button galaxy-button-secondary px-6 py-3 rounded-xl font-bold text-lg mb-4 mx-2 hover:shadow-lg transition-all duration-200"
            >
              🔄 もう一度聞く
            </button>
          </div>

          <!-- Input Area -->
          <div class="mb-6">
            <div class="text-lg text-galaxy-moon-silver mb-2">あなたの答え:</div>
            <input
              ref="userInput"
              v-model="userAnswer"
              @input="handleInput"
              @keyup.enter="submitAnswer"
              type="text"
              :placeholder="gameMode === 'word' ? '聞こえた単語を入力...' : '聞こえた文章を入力...'"
              class="w-full max-w-md mx-auto px-4 py-3 text-xl text-center rounded-xl border-2 transition-all duration-200 tracking-normal"
              :class="currentWord.audioPlayed 
                ? 'border-galaxy-cosmic-purple focus:border-galaxy-nova-orange focus:outline-none bg-white/90 text-gray-900 font-bold placeholder-gray-400 focus:bg-white hover:bg-white' 
                : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'"
              :disabled="!currentWord.audioPlayed"
            />
            <!-- Space key guidance -->
            <div class="mt-2 text-sm text-slate-300 bg-blue-900/20 rounded-lg px-3 py-2 max-w-md mx-auto">
              💡 単語の間にスペースが必要な場合は、<span class="bg-gray-300 text-gray-800 px-2 py-1 rounded font-mono text-xs">スペース</span>キーを押してください
            </div>
          </div>

          <!-- Input validation feedback -->
          <div v-if="inputFeedback" class="mb-4">
            <div 
              class="text-sm font-bold px-4 py-2 rounded-lg inline-block"
              :class="inputFeedback.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'"
            >
              {{ inputFeedback.message }}
            </div>
          </div>

          <!-- Submit button -->
          <button
            @click="submitAnswer"
            :disabled="!userAnswer.trim() || !currentWord.audioPlayed"
            class="galaxy-button galaxy-button-primary px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200"
            :class="{ 'opacity-50 cursor-not-allowed': !userAnswer.trim() || !currentWord.audioPlayed }"
          >
            ✅ 答えを送信
          </button>

          <!-- Hint system -->
          <div v-if="showHint && currentWord.audioPlayed" class="mt-4">
            <button
              @click="getHint"
              class="galaxy-button galaxy-button-secondary px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-all duration-200"
            >
              💡 ヒントを見る
            </button>
            <div v-if="currentHint" class="mt-2 text-yellow-400 font-bold">
              {{ currentHint }}
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-else-if="gameState === 'result'" class="text-center">
          <div class="mb-6">
            <div class="text-3xl mb-4">
              {{ lastResult.correct ? '🎉 正解！' : '❌ 不正解' }}
            </div>
            <div class="text-xl font-bold galaxy-text-primary mb-2">
              正解: <span class="text-green-400">{{ lastResult.correctAnswer }}</span>
            </div>
            <div v-if="!lastResult.correct" class="text-lg text-red-400 mb-2">
              あなたの答え: {{ lastResult.userAnswer }}
            </div>
            
            <!-- Detailed feedback -->
            <div v-if="lastResult.feedback" class="mt-4 p-4 bg-galaxy-deep-space/30 rounded-xl">
              <div class="text-galaxy-moon-silver">{{ lastResult.feedback }}</div>
            </div>
          </div>

          <button
            @click="nextQuestion"
            class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all duration-200"
          >
            {{ currentQuestionIndex < totalQuestions - 1 ? '次の問題' : '結果を見る' }}
          </button>
          <div class="mt-2 text-sm text-galaxy-moon-silver">
            <kbd class="px-2 py-1 bg-gray-700 rounded">Enter</kbd> キーでも進めます
          </div>
        </div>

        <!-- Final Results -->
        <div v-else-if="gameState === 'finished'" class="text-center">
          <div class="text-3xl font-bold galaxy-text-primary mb-6">🏆 ゲーム終了！</div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-green-500/20 rounded-xl">
              <div class="text-2xl font-bold text-green-400">{{ correctAnswers }}</div>
              <div class="text-galaxy-moon-silver">正解数</div>
            </div>
            <div class="p-4 bg-blue-500/20 rounded-xl">
              <div class="text-2xl font-bold text-blue-400">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</div>
              <div class="text-galaxy-moon-silver">正答率</div>
            </div>
          </div>

          <!-- Performance feedback -->
          <div class="mb-6 p-4 bg-galaxy-deep-space/30 rounded-xl">
            <div class="text-lg font-bold galaxy-text-primary mb-2">
              {{ getPerformanceFeedback() }}
            </div>
            <div class="text-galaxy-moon-silver">
              {{ getPerformanceMessage() }}
            </div>
          </div>

          <div class="flex gap-4 justify-center flex-wrap">
            <button
              @click="restartGame"
              class="galaxy-button galaxy-button-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              🔄 もう一度
            </button>
            <button
              @click="toggleGameMode"
              class="galaxy-button galaxy-button-secondary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              🔀 {{ gameMode === 'word' ? '文章モードへ' : '単語モードへ' }}
            </button>
            <button
              @click="changeDifficulty"
              class="galaxy-button galaxy-button-accent px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              📊 難易度変更
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="gameState === 'playing' || gameState === 'result'" class="galaxy-card rounded-2xl p-4 shadow-xl">
        <div class="flex justify-between items-center mb-2">
          <span class="text-galaxy-moon-silver">進捗</span>
          <span class="text-galaxy-moon-silver">{{ currentQuestionIndex }}/{{ totalQuestions }}</span>
        </div>
        <div class="w-full bg-galaxy-deep-space/30 rounded-full h-3">
          <div 
            class="bg-gradient-to-r from-purple-400 to-pink-400 rounded-full h-3 transition-all duration-500 cosmic-glow"
            :style="{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameAudio } from '@/composables/useGameAudio'
import { useStreakIntegration } from '@/composables/useStreakIntegration'
import StreakDisplay from '@/components/streak/StreakDisplay.vue'

export default {
  name: 'WordDictationChallenge',
  components: {
    StreakDisplay
  },
  setup() {
    const router = useRouter()
    const { playSound, speakText, isPlaying } = useGameAudio()

    // ストリーク機能の統合
    const {
      streakInfo,
      gameProgress,
      startGame: startStreakGame,
      endGame: endStreakGame,
      updateScore,
      applyStreakBonus,
      getStreakBonus,
      showCelebration,
      celebrationData,
      dismissCelebration
    } = useStreakIntegration('word-dictation-challenge', {
      minimumPlayTime: 30, // 最低30秒
      minimumScore: 10,    // 最低スコア
      trackProgress: true
    })

    // ストリーク関連の計算プロパティ
    const streakBonus = computed(() => getStreakBonus())
    const finalScore = computed(() => applyStreakBonus(score.value))

    // Game state management
    const gameState = ref('instructions') // 'instructions', 'playing', 'result', 'finished'
    const currentLevel = ref(1)
    const currentQuestionIndex = ref(0)
    const totalQuestions = ref(20)
    const score = ref(0)
    const correctAnswers = ref(0)
    const userAnswer = ref('')
    const userInput = ref(null)
    const shuffledQuestions = ref([])
    
    // Current word data
    const currentWord = ref({
      word: '',
      audioPlayed: false,
      hints: [],
      difficulty: 1
    })
    
    // Feedback and results
    const lastResult = ref({
      correct: false,
      correctAnswer: '',
      userAnswer: '',
      feedback: ''
    })
    
    const inputFeedback = ref(null)
    const showHint = ref(false)
    const currentHint = ref('')
    const hintIndex = ref(0)
    const showLevelDropdown = ref(false)

    // Level configuration
    const levelNames = {
      1: '初級（3-4文字）',
      2: '中級（5-6文字）',
      3: '上級（7文字以上）'
    }

    // Game mode
    const gameMode = ref('word') // 'word' or 'sentence'
    
    // Word banks by difficulty
    const wordBanks = {
      1: [
        { word: 'cat', hints: ['動物です', '「キャット」', 'meowと鳴きます'] },
        { word: 'dog', hints: ['動物です', '「ドッグ」', 'わんわんと鳴きます'] },
        { word: 'run', hints: ['動作です', '「ラン」', '走ることです'] },
        { word: 'sun', hints: ['自然です', '「サン」', '太陽のことです'] },
        { word: 'hat', hints: ['服装です', '「ハット」', '頭にかぶります'] },
        { word: 'pen', hints: ['文房具です', '「ペン」', '書くものです'] },
        { word: 'cup', hints: ['容器です', '「カップ」', '飲み物を入れます'] },
        { word: 'box', hints: ['容器です', '「ボックス」', '物を入れます'] },
        { word: 'car', hints: ['乗り物です', '「カー」', '車のことです'] },
        { word: 'bed', hints: ['家具です', '「ベッド」', '寝るところです'] },
        { word: 'map', hints: ['道具です', '「マップ」', '地図のことです'] },
        { word: 'bag', hints: ['物です', '「バッグ」', 'かばんのことです'] },
        { word: 'bat', hints: ['動物/道具です', '「バット」', 'こうもり/野球の道具'] },
        { word: 'bus', hints: ['乗り物です', '「バス」', '大きな車です'] },
        { word: 'egg', hints: ['食べ物です', '「エッグ」', '卵のことです'] },
        { word: 'fan', hints: ['道具です', '「ファン」', '扇風機/うちわです'] },
        { word: 'fox', hints: ['動物です', '「フォックス」', 'きつねのことです'] },
        { word: 'jam', hints: ['食べ物です', '「ジャム」', 'パンに塗ります'] },
        { word: 'key', hints: ['道具です', '「キー」', '鍵のことです'] },
        { word: 'leg', hints: ['体の部分です', '「レッグ」', '足のことです'] },
        { word: 'net', hints: ['道具です', '「ネット」', '網のことです'] },
        { word: 'pig', hints: ['動物です', '「ピッグ」', 'ぶたのことです'] },
        { word: 'pot', hints: ['容器です', '「ポット」', '鍋のことです'] },
        { word: 'rat', hints: ['動物です', '「ラット」', 'ねずみのことです'] },
        { word: 'red', hints: ['色です', '「レッド」', '赤のことです'] },
        { word: 'sad', hints: ['感情です', '「サッド」', '悲しいことです'] },
        { word: 'sit', hints: ['動作です', '「シット」', '座ることです'] },
        { word: 'tea', hints: ['飲み物です', '「ティー」', 'お茶のことです'] },
        { word: 'top', hints: ['位置です', '「トップ」', '一番上のことです'] },
        { word: 'toy', hints: ['物です', '「トイ」', 'おもちゃのことです'] },
        { word: 'van', hints: ['乗り物です', '「バン」', '大きな車です'] },
        { word: 'web', hints: ['物です', '「ウェブ」', 'くもの巣のことです'] },
        { word: 'win', hints: ['動作です', '「ウィン」', '勝つことです'] },
        { word: 'yes', hints: ['返事です', '「イエス」', 'はいという意味です'] },
        { word: 'zoo', hints: ['場所です', '「ズー」', '動物園のことです'] },
        { word: 'ant', hints: ['昆虫です', '「アント」', 'ありのことです'] },
        { word: 'arm', hints: ['体の部分です', '「アーム」', '腕のことです'] },
        { word: 'big', hints: ['形容詞です', '「ビッグ」', '大きいという意味です'] },
        { word: 'boy', hints: ['人です', '「ボーイ」', '男の子のことです'] },
        { word: 'bye', hints: ['挨拶です', '「バイ」', 'さようならの意味です'] },
        { word: 'day', hints: ['時間です', '「デイ」', '日のことです'] },
        { word: 'eat', hints: ['動作です', '「イート」', '食べることです'] },
        { word: 'eye', hints: ['体の部分です', '「アイ」', '目のことです'] },
        { word: 'fly', hints: ['動作/昆虫です', '「フライ」', '飛ぶこと/ハエ'] },
        { word: 'fun', hints: ['感情です', '「ファン」', '楽しいことです'] },
        { word: 'get', hints: ['動作です', '「ゲット」', '手に入れることです'] },
        { word: 'god', hints: ['宗教です', '「ゴッド」', '神のことです'] },
        { word: 'hop', hints: ['動作です', '「ホップ」', '跳ねることです'] },
        { word: 'hot', hints: ['形容詞です', '「ホット」', '熱いという意味です'] },
        { word: 'ice', hints: ['物です', '「アイス」', '氷のことです'] },
        { word: 'job', hints: ['仕事です', '「ジョブ」', '職業のことです'] },
        { word: 'lot', hints: ['量です', '「ロット」', 'たくさんという意味です'] },
        { word: 'man', hints: ['人です', '「マン」', '男の人のことです'] },
        { word: 'new', hints: ['形容詞です', '「ニュー」', '新しいという意味です'] },
        { word: 'old', hints: ['形容詞です', '「オールド」', '古いという意味です'] },
        { word: 'one', hints: ['数字です', '「ワン」', '1のことです'] },
        { word: 'out', hints: ['位置です', '「アウト」', '外のことです'] },
        { word: 'own', hints: ['所有です', '「オウン」', '自分のという意味です'] },
        { word: 'put', hints: ['動作です', '「プット」', '置くことです'] },
        { word: 'see', hints: ['動作です', '「シー」', '見ることです'] },
        { word: 'two', hints: ['数字です', '「トゥー」', '2のことです'] },
        { word: 'use', hints: ['動作です', '「ユーズ」', '使うことです'] },
        { word: 'way', hints: ['道/方法です', '「ウェイ」', '道/やり方のこと'] },
        { word: 'who', hints: ['疑問詞です', '「フー」', '誰という意味です'] }
      ],
      2: [
        { word: 'house', hints: ['建物です', '「ハウス」', '人が住むところです'] },
        { word: 'table', hints: ['家具です', '「テーブル」', '食事をするところです'] },
        { word: 'phone', hints: ['機械です', '「フォン」', '電話のことです'] },
        { word: 'apple', hints: ['果物です', '「アップル」', '赤い果物です'] },
        { word: 'water', hints: ['飲み物です', '「ウォーター」', '透明な液体です'] },
        { word: 'happy', hints: ['感情です', '「ハッピー」', '嬉しい気持ちです'] },
        { word: 'music', hints: ['芸術です', '「ミュージック」', '音楽のことです'] },
        { word: 'study', hints: ['動作です', '「スタディ」', '勉強することです'] },
        { word: 'friend', hints: ['人です', '「フレンド」', '友達のことです'] },
        { word: 'school', hints: ['場所です', '「スクール」', '学校のことです'] },
        { word: 'animal', hints: ['生き物です', '「アニマル」', '動物のことです'] },
        { word: 'answer', hints: ['返事です', '「アンサー」', '答えのことです'] },
        { word: 'banana', hints: ['果物です', '「バナナ」', '黄色い果物です'] },
        { word: 'before', hints: ['時間です', '「ビフォー」', '前という意味です'] },
        { word: 'behind', hints: ['位置です', '「ビハインド」', '後ろという意味です'] },
        { word: 'better', hints: ['比較です', '「ベター」', 'より良いという意味です'] },
        { word: 'bottle', hints: ['容器です', '「ボトル」', 'びんのことです'] },
        { word: 'bridge', hints: ['建造物です', '「ブリッジ」', '橋のことです'] },
        { word: 'bright', hints: ['形容詞です', '「ブライト」', '明るいという意味です'] },
        { word: 'broken', hints: ['状態です', '「ブロークン」', '壊れたという意味です'] },
        { word: 'button', hints: ['物です', '「ボタン」', '服につけるものです'] },
        { word: 'camera', hints: ['機械です', '「カメラ」', '写真を撮るものです'] },
        { word: 'candle', hints: ['物です', '「キャンドル」', 'ろうそくのことです'] },
        { word: 'carpet', hints: ['家具です', '「カーペット」', 'じゅうたんのことです'] },
        { word: 'castle', hints: ['建物です', '「キャッスル」', '城のことです'] },
        { word: 'change', hints: ['動作です', '「チェンジ」', '変えることです'] },
        { word: 'cheese', hints: ['食べ物です', '「チーズ」', '乳製品です'] },
        { word: 'circle', hints: ['形です', '「サークル」', '円のことです'] },
        { word: 'clever', hints: ['形容詞です', '「クレバー」', '賢いという意味です'] },
        { word: 'coffee', hints: ['飲み物です', '「コーヒー」', '黒い飲み物です'] },
        { word: 'common', hints: ['形容詞です', '「コモン」', '普通という意味です'] },
        { word: 'corner', hints: ['位置です', '「コーナー」', '角のことです'] },
        { word: 'danger', hints: ['状態です', '「デンジャー」', '危険のことです'] },
        { word: 'doctor', hints: ['職業です', '「ドクター」', '医者のことです'] },
        { word: 'dollar', hints: ['お金です', '「ダラー」', 'アメリカのお金です'] },
        { word: 'dragon', hints: ['生き物です', '「ドラゴン」', '竜のことです'] },
        { word: 'during', hints: ['時間です', '「デューリング」', '〜の間という意味です'] },
        { word: 'energy', hints: ['概念です', '「エナジー」', '力/元気のことです'] },
        { word: 'escape', hints: ['動作です', '「エスケープ」', '逃げることです'] },
        { word: 'family', hints: ['人々です', '「ファミリー」', '家族のことです'] },
        { word: 'famous', hints: ['形容詞です', '「フェイマス」', '有名という意味です'] },
        { word: 'finger', hints: ['体の部分です', '「フィンガー」', '指のことです'] },
        { word: 'flower', hints: ['植物です', '「フラワー」', '花のことです'] },
        { word: 'forest', hints: ['自然です', '「フォレスト」', '森のことです'] },
        { word: 'future', hints: ['時間です', '「フューチャー」', '未来のことです'] },
        { word: 'garden', hints: ['場所です', '「ガーデン」', '庭のことです'] },
        { word: 'gentle', hints: ['形容詞です', '「ジェントル」', '優しいという意味です'] },
        { word: 'golden', hints: ['色です', '「ゴールデン」', '金色という意味です'] },
        { word: 'guitar', hints: ['楽器です', '「ギター」', '弦楽器です'] },
        { word: 'happen', hints: ['動作です', '「ハプン」', '起こることです'] },
        { word: 'health', hints: ['状態です', '「ヘルス」', '健康のことです'] },
        { word: 'heaven', hints: ['場所です', '「ヘブン」', '天国のことです'] },
        { word: 'honest', hints: ['性格です', '「オネスト」', '正直という意味です'] },
        { word: 'hungry', hints: ['状態です', '「ハングリー」', 'お腹が空いた状態です'] },
        { word: 'island', hints: ['地形です', '「アイランド」', '島のことです'] },
        { word: 'jacket', hints: ['服です', '「ジャケット」', '上着のことです'] },
        { word: 'jungle', hints: ['自然です', '「ジャングル」', '密林のことです'] },
        { word: 'kitten', hints: ['動物です', '「キトゥン」', '子猫のことです'] },
        { word: 'ladder', hints: ['道具です', '「ラダー」', 'はしごのことです'] },
        { word: 'letter', hints: ['通信です', '「レター」', '手紙のことです'] },
        { word: 'listen', hints: ['動作です', '「リッスン」', '聞くことです'] }
      ],
      3: [
        { word: 'computer', hints: ['機械です', '「コンピューター」', 'パソコンのことです'] },
        { word: 'beautiful', hints: ['形容詞です', '「ビューティフル」', '美しいという意味です'] },
        { word: 'different', hints: ['形容詞です', '「ディファレント」', '違うという意味です'] },
        { word: 'important', hints: ['形容詞です', '「インポータント」', '重要という意味です'] },
        { word: 'language', hints: ['概念です', '「ランゲージ」', '言語のことです'] },
        { word: 'remember', hints: ['動作です', '「リメンバー」', '覚えることです'] },
        { word: 'understand', hints: ['動作です', '「アンダースタンド」', '理解することです'] },
        { word: 'tomorrow', hints: ['時間です', '「トゥモロー」', '明日のことです'] },
        { word: 'yesterday', hints: ['時間です', '「イエスタデイ」', '昨日のことです'] },
        { word: 'probably', hints: ['副詞です', '「プロバブリー」', 'たぶんという意味です'] },
        { word: 'absolutely', hints: ['副詞です', '「アブソルートリー」', '絶対にという意味です'] },
        { word: 'adventure', hints: ['名詞です', '「アドベンチャー」', '冒険のことです'] },
        { word: 'agreement', hints: ['名詞です', '「アグリーメント」', '合意/契約のことです'] },
        { word: 'apartment', hints: ['建物です', '「アパートメント」', 'アパートのことです'] },
        { word: 'attention', hints: ['名詞です', '「アテンション」', '注意/注目のことです'] },
        { word: 'beginning', hints: ['時間です', '「ビギニング」', '始まりのことです'] },
        { word: 'breakfast', hints: ['食事です', '「ブレックファスト」', '朝食のことです'] },
        { word: 'butterfly', hints: ['昆虫です', '「バタフライ」', 'ちょうちょのことです'] },
        { word: 'calculate', hints: ['動作です', '「カルキュレート」', '計算することです'] },
        { word: 'celebrate', hints: ['動作です', '「セレブレート」', '祝うことです'] },
        { word: 'challenge', hints: ['名詞です', '「チャレンジ」', '挑戦のことです'] },
        { word: 'character', hints: ['名詞です', '「キャラクター」', '性格/文字のことです'] },
        { word: 'chocolate', hints: ['食べ物です', '「チョコレート」', '甘いお菓子です'] },
        { word: 'christmas', hints: ['行事です', '「クリスマス」', 'キリストの誕生日です'] },
        { word: 'community', hints: ['名詞です', '「コミュニティ」', '共同体のことです'] },
        { word: 'condition', hints: ['名詞です', '「コンディション」', '状態/条件のことです'] },
        { word: 'confident', hints: ['形容詞です', '「コンフィデント」', '自信があるという意味です'] },
        { word: 'continent', hints: ['地理です', '「コンティネント」', '大陸のことです'] },
        { word: 'dangerous', hints: ['形容詞です', '「デンジャラス」', '危険という意味です'] },
        { word: 'delicious', hints: ['形容詞です', '「デリシャス」', 'おいしいという意味です'] },
        { word: 'democracy', hints: ['政治です', '「デモクラシー」', '民主主義のことです'] },
        { word: 'determine', hints: ['動作です', '「ディターミン」', '決定することです'] },
        { word: 'dictionary', hints: ['本です', '「ディクショナリー」', '辞書のことです'] },
        { word: 'difficult', hints: ['形容詞です', '「ディフィカルト」', '難しいという意味です'] },
        { word: 'dinosaur', hints: ['動物です', '「ダイナソー」', '恐竜のことです'] },
        { word: 'disappear', hints: ['動作です', '「ディサピア」', '消えることです'] },
        { word: 'discovery', hints: ['名詞です', '「ディスカバリー」', '発見のことです'] },
        { word: 'education', hints: ['名詞です', '「エデュケーション」', '教育のことです'] },
        { word: 'elephant', hints: ['動物です', '「エレファント」', '象のことです'] },
        { word: 'emergency', hints: ['状況です', '「エマージェンシー」', '緊急事態のことです'] },
        { word: 'emotional', hints: ['形容詞です', '「エモーショナル」', '感情的という意味です'] },
        { word: 'encourage', hints: ['動作です', '「エンカレッジ」', '励ますことです'] },
        { word: 'especially', hints: ['副詞です', '「エスペシャリー」', '特にという意味です'] },
        { word: 'excellent', hints: ['形容詞です', '「エクセレント」', '優秀という意味です'] },
        { word: 'expensive', hints: ['形容詞です', '「エクスペンシブ」', '高価という意味です'] },
        { word: 'experience', hints: ['名詞です', '「エクスペリエンス」', '経験のことです'] },
        { word: 'fantastic', hints: ['形容詞です', '「ファンタスティック」', '素晴らしいという意味です'] },
        { word: 'favorite', hints: ['形容詞です', '「フェイバリット」', 'お気に入りという意味です'] },
        { word: 'festival', hints: ['行事です', '「フェスティバル」', '祭りのことです'] },
        { word: 'football', hints: ['スポーツです', '「フットボール」', 'サッカー/アメフトです'] },
        { word: 'fortunate', hints: ['形容詞です', '「フォーチュネート」', '幸運という意味です'] },
        { word: 'frequency', hints: ['名詞です', '「フリークエンシー」', '頻度のことです'] },
        { word: 'furniture', hints: ['名詞です', '「ファーニチャー」', '家具のことです'] },
        { word: 'generally', hints: ['副詞です', '「ジェネラリー」', '一般的にという意味です'] },
        { word: 'geography', hints: ['学問です', '「ジオグラフィー」', '地理学のことです'] },
        { word: 'government', hints: ['組織です', '「ガバメント」', '政府のことです'] },
        { word: 'gradually', hints: ['副詞です', '「グラジュアリー」', '徐々にという意味です'] },
        { word: 'guarantee', hints: ['名詞です', '「ギャランティー」', '保証のことです'] },
        { word: 'hamburger', hints: ['食べ物です', '「ハンバーガー」', 'パンに肉を挟んだものです'] },
        { word: 'happiness', hints: ['感情です', '「ハピネス」', '幸せのことです'] },
        { word: 'helicopter', hints: ['乗り物です', '「ヘリコプター」', '回転翼で飛ぶ機械です'] }
      ]
    }

    // Sentence banks by difficulty
    const sentenceBanks = {
      1: [
        { sentence: 'I have a cat.', hints: ['ペットについて', '「私は」で始まる', '猫を飼っています'] },
        { sentence: 'The dog runs.', hints: ['動物の動作', '犬が主語', '走る動作です'] },
        { sentence: 'I see the sun.', hints: ['自然を見る', '太陽が見える', '私は見ています'] },
        { sentence: 'I wear a hat.', hints: ['服装について', '私は身につける', '帽子を'] },
        { sentence: 'This is my pen.', hints: ['所有を表す', 'これは私の', 'ペンです'] },
        { sentence: 'I use the cup.', hints: ['物の使用', '私は使う', 'カップを'] },
        { sentence: 'Open the box.', hints: ['命令文です', '箱を', '開けてください'] },
        { sentence: 'I have a car.', hints: ['所有について', '私は持っている', '車を'] },
        { sentence: 'I go to bed.', hints: ['日常行動', '私は行く', 'ベッドへ'] },
        { sentence: 'I look at the map.', hints: ['観察行動', '私は見る', '地図を'] },
        { sentence: 'I have a bag.', hints: ['所有について', '私は持っている', 'かばんです'] },
        { sentence: 'The cat is big.', hints: ['描写文', '猫は', '大きいです'] },
        { sentence: 'I take the bus.', hints: ['交通手段', '私は乗る', 'バスに'] },
        { sentence: 'I eat an egg.', hints: ['食事について', '私は食べる', '卵です'] },
        { sentence: 'I like the fan.', hints: ['好みについて', '私は好きです', '扇風機が'] },
        { sentence: 'I see a fox.', hints: ['現在の観察', '私は見る', 'きつねを'] },
        { sentence: 'I like jam.', hints: ['好みについて', '私は好きです', 'ジャムが'] },
        { sentence: 'I find the key.', hints: ['発見について', '私は見つける', '鍵を'] },
        { sentence: 'My leg is hurt.', hints: ['状態について', '私の足は', '痛いです'] },
        { sentence: 'I have a net.', hints: ['所有について', '私は持っている', '網を'] },
        { sentence: 'I see a pig.', hints: ['動物を見る', '私は見る', 'ぶたです'] },
        { sentence: 'I see the pot.', hints: ['台所用品', '私は見る', '鍋を'] },
        { sentence: 'I see a rat.', hints: ['動物を見る', '私は見る', 'ねずみです'] },
        { sentence: 'The car is red.', hints: ['色について', '車は', '赤いです'] },
        { sentence: 'I feel sad.', hints: ['感情について', '私は感じる', '悲しいです'] },
        { sentence: 'I sit down.', hints: ['動作について', '私は座る', '下に'] },
        { sentence: 'I drink tea.', hints: ['飲み物について', '私は飲む', 'お茶です'] },
        { sentence: 'I go to the top.', hints: ['移動について', '私は行く', '上の方へ'] },
        { sentence: 'I have a toy.', hints: ['所有について', '私は持っている', 'おもちゃです'] },
        { sentence: 'I see the van.', hints: ['車を見る', '私は見る', 'バンを'] },
        { sentence: 'I see a web.', hints: ['観察について', '私は見る', 'くもの巣です'] },
        { sentence: 'I can win.', hints: ['能力について', '私はできる', '勝つことが'] },
        { sentence: 'I say yes.', hints: ['返事について', '私は言う', 'はいと'] },
        { sentence: 'I go to the zoo.', hints: ['お出かけ', '私は行く', '動物園へ'] },
        { sentence: 'I see an ant.', hints: ['昆虫を見る', '私は見る', 'ありです'] },
        { sentence: 'I move my arm.', hints: ['身体の動き', '私は動かす', '腕を'] },
        { sentence: 'It is big.', hints: ['大きさについて', 'それは', '大きいです'] },
        { sentence: 'I am a boy.', hints: ['自己紹介', '私は', '男の子です'] },
        { sentence: 'Say good bye.', hints: ['挨拶について', '言ってください', 'さようなら'] },
        { sentence: 'Every day.', hints: ['頻度について', '毎日', 'という意味です'] },
        { sentence: 'I eat rice.', hints: ['食事について', '私は食べる', 'ご飯です'] },
        { sentence: 'Open your eye.', hints: ['命令文です', '目を', '開けてください'] },
        { sentence: 'Birds can fly.', hints: ['能力について', '鳥は', '飛べます'] },
        { sentence: 'Have some fun.', hints: ['命令文です', '楽しんで', 'ください'] },
        { sentence: 'Get the ball.', hints: ['命令文です', 'ボールを', '取ってください'] },
        { sentence: 'Thank god.', hints: ['感謝の表現', '神に', '感謝します'] },
        { sentence: 'Hop on one foot.', hints: ['命令文です', '片足で', '跳んでください'] },
        { sentence: 'It is hot.', hints: ['温度について', 'それは', '熱いです'] },
        { sentence: 'I want ice.', hints: ['欲求について', '私は欲しい', '氷が'] },
        { sentence: 'Get a job.', hints: ['命令文です', '仕事を', '見つけてください'] },
        { sentence: 'I have a lot.', hints: ['量について', '私は持っている', 'たくさん'] },
        { sentence: 'I am a man.', hints: ['自己紹介', '私は', '男性です'] },
        { sentence: 'Buy a new car.', hints: ['命令文です', '新しい車を', '買ってください'] },
        { sentence: 'You are old.', hints: ['年齢について', 'あなたは', '年を取っています'] },
        { sentence: 'I have one.', hints: ['数について', '私は持っている', '1つ'] },
        { sentence: 'Go out now.', hints: ['命令文です', '今すぐ', '外へ出てください'] },
        { sentence: 'My own room.', hints: ['所有について', '私自身の', '部屋です'] },
        { sentence: 'Put it here.', hints: ['命令文です', 'それを', 'ここに置いてください'] },
        { sentence: 'I can see.', hints: ['能力について', '私は', '見ることができます'] },
        { sentence: 'We are two.', hints: ['数について', '私たちは', '2人です'] },
        { sentence: 'Use this pen.', hints: ['命令文です', 'このペンを', '使ってください'] }
      ],
      2: [
        { sentence: 'I live in a house.', hints: ['住居について', '私は住んでいる', '家に'] },
        { sentence: 'The table is wooden.', hints: ['材質について', 'テーブルは', '木製です'] },
        { sentence: 'Can I use your phone?', hints: ['許可を求める', '使ってもいいですか', 'あなたの電話を'] },
        { sentence: 'I ate an apple today.', hints: ['過去の食事', '私は食べた', '今日りんごを'] },
        { sentence: 'Please drink water.', hints: ['丁寧な命令', '飲んでください', '水を'] },
        { sentence: 'I am very happy.', hints: ['感情の表現', '私はとても', '幸せです'] },
        { sentence: 'I love music.', hints: ['好みについて', '私は愛している', '音楽を'] },
        { sentence: 'I study English.', hints: ['学習について', '私は勉強する', '英語を'] },
        { sentence: 'She is my friend.', hints: ['関係について', '彼女は私の', '友達です'] },
        { sentence: 'I go to school.', hints: ['日常活動', '私は行く', '学校へ'] },
        { sentence: 'I love animals.', hints: ['好みについて', '私は愛している', '動物を'] },
        { sentence: 'What is your answer?', hints: ['質問文です', 'あなたの答えは', '何ですか'] },
        { sentence: 'I want a banana.', hints: ['欲求について', '私は欲しい', 'バナナが'] },
        { sentence: 'Come here before noon.', hints: ['時間指定の命令', 'ここに来て', '正午前に'] },
        { sentence: 'Look behind you.', hints: ['命令文です', '後ろを', '見てください'] },
        { sentence: 'This is better.', hints: ['比較について', 'これは', 'より良いです'] },
        { sentence: 'Fill the bottle.', hints: ['命令文です', 'ボトルを', '満たしてください'] },
        { sentence: 'Cross the bridge.', hints: ['命令文です', '橋を', '渡ってください'] },
        { sentence: 'The sun is bright.', hints: ['明るさについて', '太陽は', '明るいです'] },
        { sentence: 'The toy is broken.', hints: ['状態について', 'おもちゃは', '壊れています'] },
        { sentence: 'Push the button.', hints: ['命令文です', 'ボタンを', '押してください'] },
        { sentence: 'Take a camera.', hints: ['命令文です', 'カメラを', '持ってください'] },
        { sentence: 'Light the candle.', hints: ['命令文です', 'ろうそくに', '火をつけてください'] },
        { sentence: 'Clean the carpet.', hints: ['命令文です', 'カーペットを', '掃除してください'] },
        { sentence: 'Visit the castle.', hints: ['命令文です', '城を', '訪問してください'] },
        { sentence: 'Please change it.', hints: ['丁寧な依頼', '変えてください', 'それを'] },
        { sentence: 'I like cheese.', hints: ['好みについて', '私は好きです', 'チーズが'] },
        { sentence: 'Draw a circle.', hints: ['命令文です', '円を', '描いてください'] },
        { sentence: 'You are clever.', hints: ['褒め言葉', 'あなたは', '賢いです'] },
        { sentence: 'I drink coffee.', hints: ['飲み物について', '私は飲む', 'コーヒーを'] },
        { sentence: 'It is common.', hints: ['頻度について', 'それは', '一般的です'] },
        { sentence: 'Turn the corner.', hints: ['命令文です', '角を', '曲がってください'] },
        { sentence: 'Avoid danger.', hints: ['警告文です', '危険を', '避けてください'] },
        { sentence: 'Call a doctor.', hints: ['命令文です', '医者を', '呼んでください'] },
        { sentence: 'I need a dollar.', hints: ['必要について', '私は必要です', '1ドル'] },
        { sentence: 'I saw a dragon.', hints: ['過去の出来事', '私は見た', '竜を'] },
        { sentence: 'Come during lunch.', hints: ['時間指定', '来てください', '昼食の間に'] },
        { sentence: 'I have energy.', hints: ['体調について', '私は持っている', 'エネルギーを'] },
        { sentence: 'We must escape.', hints: ['必要性について', '私たちは', '逃げなければならない'] },
        { sentence: 'I love my family.', hints: ['愛情について', '私は愛している', '私の家族を'] },
        { sentence: 'She is famous.', hints: ['有名度について', '彼女は', '有名です'] },
        { sentence: 'Use your finger.', hints: ['命令文です', 'あなたの指を', '使ってください'] },
        { sentence: 'Pick a flower.', hints: ['命令文です', '花を', '摘んでください'] },
        { sentence: 'Walk in the forest.', hints: ['命令文です', '森の中を', '歩いてください'] },
        { sentence: 'Think about future.', hints: ['命令文です', '未来について', '考えてください'] },
        { sentence: 'Water the garden.', hints: ['命令文です', '庭に', '水をやってください'] },
        { sentence: 'Be gentle please.', hints: ['丁寧な依頼', '優しくして', 'ください'] },
        { sentence: 'I found golden coins.', hints: ['発見について', '私は見つけた', '金貨を'] },
        { sentence: 'Play the guitar.', hints: ['命令文です', 'ギターを', '弾いてください'] },
        { sentence: 'What will happen?', hints: ['質問文です', '何が', '起こるでしょうか'] },
        { sentence: 'Check your health.', hints: ['命令文です', 'あなたの健康を', '確認してください'] },
        { sentence: 'I believe in heaven.', hints: ['信念について', '私は信じている', '天国を'] },
        { sentence: 'Please be honest.', hints: ['丁寧な依頼', '正直に', 'なってください'] },
        { sentence: 'I am hungry.', hints: ['状態について', '私は', 'お腹が空いています'] },
        { sentence: 'Visit the island.', hints: ['命令文です', '島を', '訪問してください'] },
        { sentence: 'Wear your jacket.', hints: ['命令文です', 'ジャケットを', '着てください'] },
        { sentence: 'Explore the jungle.', hints: ['命令文です', 'ジャングルを', '探検してください'] },
        { sentence: 'I found a kitten.', hints: ['発見について', '私は見つけた', '子猫を'] },
        { sentence: 'Climb the ladder.', hints: ['命令文です', 'はしごを', '登ってください'] },
        { sentence: 'Write a letter.', hints: ['命令文です', '手紙を', '書いてください'] },
        { sentence: 'Please listen carefully.', hints: ['丁寧な依頼', '注意深く', '聞いてください'] }
      ],
      3: [
        { sentence: 'I use a computer every day.', hints: ['日常習慣について', 'コンピューターを使う', '毎日'] },
        { sentence: 'The sunset was beautiful.', hints: ['過去の描写', '夕日は', '美しかった'] },
        { sentence: 'We all have different opinions.', hints: ['意見について', '私たちは皆持っている', '違う意見を'] },
        { sentence: 'This is very important.', hints: ['重要性について', 'これはとても', '重要です'] },
        { sentence: 'I am learning a new language.', hints: ['学習について', '私は学んでいる', '新しい言語を'] },
        { sentence: 'Please remember this rule.', hints: ['丁寧な依頼', '覚えてください', 'このルールを'] },
        { sentence: 'I understand your feelings.', hints: ['理解について', '私は理解する', 'あなたの気持ちを'] },
        { sentence: 'See you tomorrow morning.', hints: ['別れの挨拶', '会いましょう', '明日の朝'] },
        { sentence: 'I met him yesterday.', hints: ['過去の出来事', '私は彼に会った', '昨日'] },
        { sentence: 'You are probably right.', hints: ['推測について', 'あなたは', 'たぶん正しい'] },
        { sentence: 'I absolutely agree with you.', hints: ['完全な同意', '私は絶対に', 'あなたに同意します'] },
        { sentence: 'Let us go on an adventure.', hints: ['提案について', '行きましょう', '冒険に'] },
        { sentence: 'We reached an agreement.', hints: ['結果について', '私たちは達した', '合意に'] },
        { sentence: 'I live in an apartment.', hints: ['住居について', '私は住んでいる', 'アパートに'] },
        { sentence: 'Pay attention to details.', hints: ['命令文です', '注意を払って', '詳細に'] },
        { sentence: 'This is just the beginning.', hints: ['時期について', 'これはただの', '始まりです'] },
        { sentence: 'I eat breakfast at seven.', hints: ['日常習慣', '私は朝食を食べる', '7時に'] },
        { sentence: 'I saw a beautiful butterfly.', hints: ['過去の観察', '私は見た', '美しい蝶を'] },
        { sentence: 'Can you calculate this?', hints: ['能力を問う', 'あなたは計算できますか', 'これを'] },
        { sentence: 'Let us celebrate together.', hints: ['提案について', '一緒に祝いましょう', ''] },
        { sentence: 'Accept the challenge.', hints: ['命令文です', '挑戦を', '受け入れてください'] },
        { sentence: 'She has a strong character.', hints: ['性格について', '彼女は持っている', '強い性格を'] },
        { sentence: 'I love chocolate cake.', hints: ['好みについて', '私は愛している', 'チョコレートケーキを'] },
        { sentence: 'Merry Christmas everyone!', hints: ['挨拶について', 'メリークリスマス', 'みなさん'] },
        { sentence: 'We are a community.', hints: ['関係について', '私たちは', 'コミュニティです'] },
        { sentence: 'Check the condition first.', hints: ['命令文です', '状態を確認して', '最初に'] },
        { sentence: 'Be confident in yourself.', hints: ['励ましの言葉', '自信を持って', 'あなた自身に'] },
        { sentence: 'Asia is a large continent.', hints: ['地理について', 'アジアは', '大きな大陸です'] },
        { sentence: 'That looks dangerous.', hints: ['警告について', 'それは見える', '危険に'] },
        { sentence: 'The food was delicious.', hints: ['過去の感想', '食べ物は', 'おいしかった'] },
        { sentence: 'We live in a democracy.', hints: ['政治体制', '私たちは住んでいる', '民主主義の中に'] },
        { sentence: 'Let me determine the answer.', hints: ['申し出について', '私に決めさせて', '答えを'] },
        { sentence: 'Use a dictionary.', hints: ['命令文です', '辞書を', '使ってください'] },
        { sentence: 'This is too difficult.', hints: ['難易度について', 'これは', '難しすぎます'] },
        { sentence: 'Dinosaurs are extinct.', hints: ['事実について', '恐竜は', '絶滅しています'] },
        { sentence: 'The magician will disappear.', hints: ['未来の出来事', '魔術師は', '消えるでしょう'] },
        { sentence: 'It was an amazing discovery.', hints: ['過去の評価', 'それは素晴らしい', '発見でした'] },
        { sentence: 'Education is important.', hints: ['重要性について', '教育は', '重要です'] },
        { sentence: 'I saw an elephant.', hints: ['過去の観察', '私は見た', '象を'] },
        { sentence: 'Call in case of emergency.', hints: ['条件付き命令', '電話して', '緊急の場合'] },
        { sentence: 'She is very emotional.', hints: ['性格について', '彼女はとても', '感情的です'] },
        { sentence: 'Please encourage him.', hints: ['丁寧な依頼', '励ましてください', '彼を'] },
        { sentence: 'I especially like pizza.', hints: ['好みの強調', '私は特に好きです', 'ピザが'] },
        { sentence: 'Your work is excellent.', hints: ['評価について', 'あなたの仕事は', '優秀です'] },
        { sentence: 'That is too expensive.', hints: ['価格について', 'それは', '高すぎます'] },
        { sentence: 'Share your experience.', hints: ['命令文です', 'あなたの経験を', '共有してください'] },
        { sentence: 'That was fantastic!', hints: ['感嘆文です', 'それは', '素晴らしかった'] },
        { sentence: 'What is your favorite color?', hints: ['質問文です', 'あなたのお気に入りの色は', '何ですか'] },
        { sentence: 'Enjoy the festival.', hints: ['命令文です', '祭りを', '楽しんでください'] },
        { sentence: 'I play football.', hints: ['スポーツについて', '私はプレーする', 'サッカーを'] },
        { sentence: 'You are very fortunate.', hints: ['評価について', 'あなたはとても', '幸運です'] },
        { sentence: 'Check the frequency.', hints: ['命令文です', '頻度を', '確認してください'] },
        { sentence: 'We need new furniture.', hints: ['必要について', '私たちは必要です', '新しい家具が'] },
        { sentence: 'I generally wake up early.', hints: ['習慣について', '私は一般的に起きる', '早く'] },
        { sentence: 'I love geography class.', hints: ['好みについて', '私は愛している', '地理の授業を'] },
        { sentence: 'Contact the government.', hints: ['命令文です', '政府に', '連絡してください'] },
        { sentence: 'Improve gradually.', hints: ['命令文です', '改善してください', '徐々に'] },
        { sentence: 'I guarantee success.', hints: ['保証について', '私は保証する', '成功を'] },
        { sentence: 'I want a hamburger.', hints: ['欲求について', '私は欲しい', 'ハンバーガーが'] },
        { sentence: 'Find your happiness.', hints: ['命令文です', 'あなたの幸せを', '見つけてください'] },
        { sentence: 'I saw a helicopter.', hints: ['過去の観察', '私は見た', 'ヘリコプターを'] }
      ]
    }

    // Computed properties
    const questions = computed(() => {
      if (gameMode.value === 'word') {
        return wordBanks[currentLevel.value] || []
      } else {
        return sentenceBanks[currentLevel.value] || []
      }
    })

    // Shuffle array helper function
    const shuffleArray = (array) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }

    // Game methods
    const startGame = () => {
      // ストリークゲーム開始
      const streakGameInfo = startStreakGame({
        level: currentLevel.value,
        mode: gameMode.value,
        questionCount: totalQuestions.value
      })

      gameState.value = 'playing'
      currentQuestionIndex.value = 0
      score.value = 0
      correctAnswers.value = 0

      // Shuffle questions and take the required number
      const allQuestions = questions.value
      shuffledQuestions.value = shuffleArray(allQuestions).slice(0, totalQuestions.value)

      loadNextQuestion()

      logger.log('Game started with streak info:', streakGameInfo)
    }

    const loadNextQuestion = () => {
      if (currentQuestionIndex.value < shuffledQuestions.value.length) {
        const questionData = shuffledQuestions.value[currentQuestionIndex.value]
        currentWord.value = {
          word: gameMode.value === 'word' ? questionData.word : questionData.sentence,
          hints: questionData.hints,
          audioPlayed: false,
          difficulty: currentLevel.value
        }
        userAnswer.value = ''
        inputFeedback.value = null
        showHint.value = false
        currentHint.value = ''
        hintIndex.value = 0
        
        // Focus input after audio plays
        setTimeout(() => {
          if (userInput.value) {
            userInput.value.focus()
          }
        }, 100)
      }
    }

    const playCurrentWord = async () => {
      if (currentWord.value.word && !isPlaying.value) {
        try {
          await speakText(currentWord.value.word, { rate: 0.8, pitch: 1.0 })
          currentWord.value.audioPlayed = true
          showHint.value = true
          
          // Focus input after audio finishes
          setTimeout(() => {
            if (userInput.value) {
              userInput.value.focus()
            }
          }, 500)
        } catch (error) {
          logger.error('Audio playback failed:', error)
          currentWord.value.audioPlayed = true // Allow manual input even if audio fails
        }
      }
    }

    const repeatAudio = () => {
      currentWord.value.audioPlayed = false
      playCurrentWord()
    }

    const handleInput = () => {
      if (!userAnswer.value.trim()) {
        inputFeedback.value = null
        return
      }

      const input = userAnswer.value.toLowerCase().trim()
      const correct = currentWord.value.word.toLowerCase()
      
      // Real-time feedback
      if (input.length > correct.length) {
        inputFeedback.value = {
          type: 'warning',
          message: '文字数が多すぎます'
        }
      } else if (input === correct.substring(0, input.length)) {
        inputFeedback.value = {
          type: 'good',
          message: 'いい感じです！'
        }
      } else {
        inputFeedback.value = {
          type: 'warning',
          message: 'スペルを確認してください'
        }
      }
    }

    const getHint = () => {
      if (hintIndex.value < currentWord.value.hints.length) {
        currentHint.value = currentWord.value.hints[hintIndex.value]
        hintIndex.value++
      } else {
        currentHint.value = 'これ以上ヒントはありません'
      }
    }

    const submitAnswer = async () => {
      if (!userAnswer.value.trim() || !currentWord.value.audioPlayed) return

      const userInput = userAnswer.value.toLowerCase().trim()
      const correctAnswer = currentWord.value.word.toLowerCase()
      const isCorrect = userInput === correctAnswer

      // Calculate score
      if (isCorrect) {
        correctAnswers.value++
        const baseScore = currentLevel.value * 10
        const hintPenalty = hintIndex.value * 2
        const timeBonus = 5 // Could be time-based
        score.value += Math.max(baseScore - hintPenalty + timeBonus, 5)
        await playSound('correct')
      } else {
        await playSound('incorrect')
      }

      // Generate feedback
      let feedback = ''
      if (isCorrect) {
        feedback = '完璧です！正確なスペリングです。'
      } else {
        feedback = generateSpellingFeedback(userInput, correctAnswer)
      }

      lastResult.value = {
        correct: isCorrect,
        correctAnswer: currentWord.value.word,
        userAnswer: userAnswer.value,
        feedback: feedback
      }

      gameState.value = 'result'
    }

    const generateSpellingFeedback = (userInput, correctAnswer) => {
      if (userInput.length !== correctAnswer.length) {
        return `文字数が違います。正解は${correctAnswer.length}文字です。`
      }
      
      let differences = []
      for (let i = 0; i < correctAnswer.length; i++) {
        if (userInput[i] !== correctAnswer[i]) {
          differences.push(`${i + 1}番目の文字`)
        }
      }
      
      if (differences.length <= 2) {
        return `${differences.join('と')}を確認してください。`
      } else {
        return 'スペルをもう一度確認してみましょう。'
      }
    }

    const nextQuestion = () => {
      currentQuestionIndex.value++
      if (currentQuestionIndex.value >= shuffledQuestions.value.length) {
        // ゲーム終了処理
        const accuracy = (correctAnswers.value / totalQuestions.value) * 100
        const completed = true

        const gameResult = endStreakGame({
          score: finalScore.value,
          accuracy,
          completed,
          correctAnswers: correctAnswers.value,
          totalQuestions: totalQuestions.value,
          level: currentLevel.value,
          mode: gameMode.value
        })

        logger.log('Game completed with result:', gameResult)

        gameState.value = 'finished'
      } else {
        gameState.value = 'playing'
        loadNextQuestion()
      }
    }

    const getPerformanceFeedback = () => {
      const accuracy = (correctAnswers.value / totalQuestions.value) * 100
      if (accuracy >= 90) return '素晴らしい！'
      if (accuracy >= 80) return 'とても良い！'
      if (accuracy >= 70) return '良い結果です！'
      if (accuracy >= 60) return 'もう少し頑張りましょう'
      return '練習を続けましょう'
    }

    const getPerformanceMessage = () => {
      const accuracy = (correctAnswers.value / totalQuestions.value) * 100
      if (accuracy >= 90) return 'あなたのスペリング能力は優秀です！'
      if (accuracy >= 80) return 'スペリングスキルが向上しています！'
      if (accuracy >= 70) return '基本的なスペリングはできています。'
      if (accuracy >= 60) return '基礎練習を重ねると良いでしょう。'
      return '毎日少しずつ練習することが大切です。'
    }

    const restartGame = () => {
      gameState.value = 'instructions'
      currentQuestionIndex.value = 0
      score.value = 0
      correctAnswers.value = 0
    }

    const changeDifficulty = () => {
      // Go back to instructions to allow level selection
      gameState.value = 'instructions'
    }

    const toggleGameMode = () => {
      gameMode.value = gameMode.value === 'word' ? 'sentence' : 'word'
      totalQuestions.value = Math.min(20, questions.value.length)
      restartGame()
    }

    const handleBack = () => {
      // 進行中のゲームがあればストリーク記録
      if (gameState.value === 'playing' && currentQuestionIndex.value > 0) {
        const accuracy = correctAnswers.value > 0 ? (correctAnswers.value / currentQuestionIndex.value) * 100 : 0
        endStreakGame({
          score: finalScore.value,
          accuracy,
          completed: false,
          reason: 'user_exit'
        })
      }

      router.back()
    }

    // ストリーク報酬受け取り
    const onRewardClaimed = (reward) => {
      logger.log('Reward claimed in game:', reward)
      // 報酬に応じた演出やサウンドを追加可能
    }

    // Click outside handler for dropdown
    const handleClickOutside = (event) => {
      const dropdown = event.target.closest('.relative')
      if (!dropdown && showLevelDropdown.value) {
        showLevelDropdown.value = false
      }
    }

    // Handle Enter key for next question
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && gameState.value === 'result') {
        nextQuestion()
      }
    }

    // Initialize game
    onMounted(() => {
      totalQuestions.value = Math.min(20, questions.value.length)
      // Initialize with empty shuffled questions
      shuffledQuestions.value = []
      
      // Add click outside listener
      document.addEventListener('click', handleClickOutside)
      // Add keypress listener
      document.addEventListener('keypress', handleKeyPress)
    })
    
    onUnmounted(() => {
      // Remove click outside listener
      document.removeEventListener('click', handleClickOutside)
      // Remove keypress listener
      document.removeEventListener('keypress', handleKeyPress)
    })

    return {
      // State
      gameState,
      gameMode,
      currentLevel,
      currentQuestionIndex,
      totalQuestions,
      score,
      correctAnswers,
      userAnswer,
      userInput,
      currentWord,
      lastResult,
      inputFeedback,
      showHint,
      currentHint,
      levelNames,
      isPlaying,
      showLevelDropdown,

      // Streak related
      streakInfo,
      streakBonus,
      finalScore,
      showCelebration,
      celebrationData,
      gameProgress,

      // Methods
      startGame,
      playCurrentWord,
      repeatAudio,
      handleInput,
      getHint,
      submitAnswer,
      nextQuestion,
      getPerformanceFeedback,
      getPerformanceMessage,
      restartGame,
      changeDifficulty,
      toggleGameMode,
      handleBack,
      onRewardClaimed,
      dismissCelebration
    }
  }
}
</script>

<style scoped>
/* Galaxy theme styles */
.galaxy-background {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.stars-layer-1 {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                    radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 8s linear infinite;
}

.stars-layer-2 {
  background-image: radial-gradient(1px 1px at 30px 20px, rgba(255,255,255,0.4), transparent),
                    radial-gradient(1px 1px at 60px 80px, rgba(255,255,255,0.3), transparent);
  background-repeat: repeat;
  background-size: 300px 150px;
  animation: sparkle 12s linear infinite reverse;
}

.stars-layer-3 {
  background-image: radial-gradient(1px 1px at 10px 60px, rgba(255,255,255,0.2), transparent),
                    radial-gradient(1px 1px at 80px 10px, rgba(255,255,255,0.1), transparent);
  background-repeat: repeat;
  background-size: 400px 200px;
  animation: sparkle 16s linear infinite;
}

@keyframes sparkle {
  from { transform: translateX(0); }
  to { transform: translateX(-200px); }
}

/* Input field with space visualization */
input[type="text"] {
  letter-spacing: 0.05em;
  word-spacing: 0.5em;
}

/* Visual space indicator */
input[type="text"]:focus {
  background-image: 
    linear-gradient(90deg, transparent 0%, transparent 45%, rgba(59, 130, 246, 0.2) 48%, rgba(59, 130, 246, 0.2) 52%, transparent 55%, transparent 100%);
  background-size: 1em 100%;
  background-repeat: repeat-x;
  background-position: 0 0;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(30, 30, 60, 0.95) 0%, 
    rgba(40, 40, 80, 0.95) 50%, 
    rgba(20, 20, 50, 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.galaxy-button {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
}

.galaxy-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.6);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(55, 65, 81, 0.4);
}

.galaxy-button-accent {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.galaxy-text-primary {
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.5);
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.cosmic-glow {
  text-shadow: 0 0 20px rgba(147, 51, 234, 0.8);
}

.galaxy-deep-space {
  color: #1e293b;
}

.galaxy-cosmic-purple {
  color: #7c3aed;
}

.galaxy-nova-orange {
  color: #f59e0b;
}
</style>