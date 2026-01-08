<template>
  <div class="min-h-screen galaxy-background p-6">
    <!-- 背景エフェクト -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- 講師設定モーダル -->
    <div v-if="showTeacherSettings" class="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div class="galaxy-card p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 class="text-2xl font-bold galaxy-text-primary cosmic-glow mb-6">
          🎯 学習カリキュラム設定
        </h2>

        <!-- 生徒選択 -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-white mb-2">
            生徒を選択
          </label>
          <select v-model="selectedStudent" class="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-cyan-400 focus:outline-none">
            <option value="" class="bg-slate-700 text-white">新規生徒</option>
            <option v-for="student in students" :key="student.id" :value="student.id" class="bg-slate-700 text-white">
              {{ student.name }}
            </option>
          </select>
        </div>

        <!-- 音素グループ選択 -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-white mb-2">
            学習する音素グループを選択（ジョリーフォニックス準拠）
          </label>

          <!-- プリセットグループ -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <button
              v-for="preset in phonicsPresets"
              :key="preset.id"
              @click="selectPreset(preset)"
              class="bg-slate-700 border border-slate-600 hover:border-cyan-400 p-3 rounded-lg text-left transition-all text-white"
              :class="{
                'bg-cyan-600 border-cyan-400 text-white': isPresetSelected(preset),
                'hover:bg-slate-600': !isPresetSelected(preset)
              }"
            >
              <div class="font-bold text-white">{{ preset.name }}</div>
              <div class="text-sm text-slate-300">{{ preset.phonemes.join(', ') }}</div>
            </button>
          </div>

          <!-- カスタム音素選択 -->
          <div class="mb-4">
            <label class="block text-sm text-white mb-2">
              カスタム音素選択（複数選択可）
            </label>
            <div class="grid grid-cols-6 md:grid-cols-12 gap-2">
              <button
                v-for="phoneme in allPhonemes"
                :key="phoneme.symbol"
                @click="togglePhoneme(phoneme)"
                class="p-2 rounded-lg border-2 transition-all bg-slate-700"
                :class="selectedPhonemes.includes(phoneme.symbol)
                  ? 'border-cyan-400 bg-cyan-600 text-white'
                  : 'border-slate-600 text-white hover:border-cyan-400 hover:bg-slate-600'"
              >
                <div class="text-lg font-bold">{{ phoneme.symbol }}</div>
                <div class="text-xs text-slate-300">{{ phoneme.ipa }}</div>
              </button>
            </div>
          </div>

          <!-- 選択された音素 -->
          <div v-if="selectedPhonemes.length > 0" class="p-4 rounded-lg bg-slate-800 border border-slate-600">
            <div class="text-sm text-white mb-2">選択された音素:</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="phoneme in selectedPhonemes"
                :key="phoneme"
                class="px-3 py-1 rounded-full bg-cyan-600 text-white text-sm flex items-center"
              >
                {{ phoneme }}
                <button @click="removePhoneme(phoneme)" class="ml-2 text-red-300 hover:text-red-100">×</button>
              </span>
            </div>
          </div>
        </div>

        <!-- 学習段階設定 -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-white mb-2">
            学習段階の設定
          </label>
          <div class="space-y-3">
            <label class="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" v-model="stages.stage1" class="w-5 h-5 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500">
              <span>第1段階: ピュア・サウンド認識（音のみ）</span>
            </label>
            <label class="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" v-model="stages.stage2" class="w-5 h-5 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500">
              <span>第2段階: サウンド・ブレンディング（音の組み合わせ）</span>
            </label>
            <label class="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" v-model="stages.stage3" class="w-5 h-5 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500">
              <span>第3段階: レター・マッチング（音と文字の対応）</span>
            </label>
            <label class="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" v-model="stages.stage4" class="w-5 h-5 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500">
              <span>第4段階: ワード・ビルディング（単語構築）</span>
            </label>
          </div>
        </div>

        <!-- 難易度設定 -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-white mb-2">
            難易度調整
          </label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="level in difficultyLevels"
              :key="level.id"
              @click="selectedDifficulty = level.id"
              class="p-3 rounded-lg border-2 transition-all bg-slate-700 text-white"
              :class="selectedDifficulty === level.id
                ? 'border-purple-400 bg-purple-600'
                : 'border-slate-600 hover:border-purple-400 hover:bg-slate-600'"
            >
              <div class="text-2xl">{{ level.icon }}</div>
              <div class="font-bold">{{ level.name }}</div>
            </button>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex gap-4">
          <button
            @click="startCustomJourney"
            class="galaxy-button galaxy-button-primary px-6 py-3 font-bold"
            :disabled="selectedPhonemes.length === 0"
          >
            学習開始
          </button>
          <button
            @click="saveTemplate"
            class="galaxy-button galaxy-button-secondary px-6 py-3"
          >
            テンプレート保存
          </button>
          <button
            @click="showTeacherSettings = false"
            class="galaxy-button galaxy-button-secondary px-6 py-3"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>

    <!-- ゲーム本体 -->
    <div v-if="gameStarted" class="max-w-6xl mx-auto">
      <!-- ヘッダー -->
      <div class="galaxy-card p-6 mb-6">
        <div class="flex justify-between items-center">
          <button
            @click="handleBack"
            class="galaxy-button galaxy-button-secondary px-4 py-2"
          >
            ← 戻る
          </button>

          <div class="text-center">
            <h1 class="text-3xl font-bold galaxy-text-primary cosmic-glow">
              {{ currentStageName }}
            </h1>
            <div class="text-white">
              音素グループ: {{ selectedPhonemes.join(', ') }}
            </div>
          </div>

          <button
            @click="showTeacherSettings = true"
            class="galaxy-button galaxy-button-secondary px-4 py-2"
          >
            ⚙️ 設定
          </button>
        </div>

        <!-- プログレスバー -->
        <div class="mt-6">
          <div class="flex justify-between text-sm text-white mb-2">
            <span>進捗: {{ currentProgress }}%</span>
            <span>{{ currentStageIndex + 1 }}/{{ enabledStages.length }} 段階</span>
          </div>
          <div class="w-full bg-slate-700 rounded-full h-3">
            <div
              class="energy-gauge h-3 rounded-full transition-all duration-500"
              :style="{ width: `${currentProgress}%` }"
            />
          </div>
        </div>
      </div>

      <!-- 第1段階: ピュア・サウンド認識 -->
      <div v-if="currentStage === 'stage1'" class="galaxy-card p-8">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6 text-center">
          🔊 音を聞いて識別しよう
        </h2>

        <!-- 現在の音素 -->
        <div class="text-center mb-8">
          <div class="text-6xl font-bold galaxy-text-primary cosmic-glow mb-4">
            {{ currentPhoneme.display }}
          </div>
          <button
            @click="playSound(currentPhoneme.sound || currentPhoneme.display)"
            class="galaxy-button galaxy-button-primary px-6 py-3 text-xl"
          >
            🔊 音を聞く
          </button>
        </div>

        <!-- 選択肢 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="option in soundOptions"
            :key="option.id"
            class="galaxy-card p-4 transition-all cursor-pointer hover:scale-105"
            :class="{
              'ring-4 ring-green-400 bg-green-100': option.selected && option.correct,
              'ring-4 ring-red-400 bg-red-100': option.selected && !option.correct,
              'hover:ring-2 hover:ring-cyan-400': !option.selected
            }"
            @click="selectSound(option)"
          >
            <!-- 画像表示 (一時的に非表示) -->
            <!-- <div class="mb-4">
              <img
                :src="option.image"
                :alt="option.word"
                class="w-full h-32 object-cover rounded-lg shadow-md"
                :onerror="`this.src='https://via.placeholder.com/200x200/6366f1/ffffff?text=${encodeURIComponent(option.word)}'`"
              />
            </div> -->

            <!-- 音声再生ボタン -->
            <button
              @click.stop="playOptionSound(option)"
              class="w-full mb-3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
            >
              🔊 音を聞く
            </button>

            <!-- 結果表示 -->
            <div
              v-if="option.selected"
              class="text-center font-bold text-sm"
              :class="{
                'text-green-600': option.correct,
                'text-red-600': !option.correct
              }"
            >
              {{ option.correct ? '✅ 正解！' : '❌ 不正解' }}
            </div>

            <!-- 選択可能状態 -->
            <div
              v-else
              class="text-center text-slate-400 text-sm font-medium"
            >
              クリックして選択
            </div>
          </div>
        </div>
      </div>

      <!-- 第2段階: サウンド・ブレンディング -->
      <div v-if="currentStage === 'stage2'" class="galaxy-card p-8">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6 text-center">
          🎵 音を組み合わせよう
        </h2>

        <!-- ブレンディング・ミキサー -->
        <div class="flex justify-center items-center gap-4 mb-8">
          <div
            v-for="(phoneme, index) in blendingPhonemes"
            :key="index"
            class="flex items-center"
          >
            <div
              class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-cyan-400 to-purple-500 text-white shadow-lg"
              @click="playSound(phoneme)"
            >
              {{ phoneme }}
            </div>
            <div v-if="index < blendingPhonemes.length - 1" class="text-3xl mx-3">
              +
            </div>
          </div>
          <div class="text-3xl mx-3">=</div>
          <button
            @click="playBlendedSound"
            class="w-32 h-24 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 text-white font-bold text-2xl shadow-lg hover:scale-105 transition-all"
          >
            {{ blendedWord }}
          </button>
        </div>

        <!-- ブレンド練習 -->
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="blend in blendOptions"
            :key="blend.id"
            @click="selectBlend(blend)"
            class="galaxy-button p-4 hover:galaxy-button-primary transition-all"
          >
            {{ blend.phonemes.join('-') }} → {{ blend.result }}
          </button>
        </div>
      </div>

      <!-- 第3段階: レター・マッチング -->
      <div v-if="currentStage === 'stage3'" class="galaxy-card p-8">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6 text-center">
          📝 音と文字をマッチさせよう
        </h2>

        <!-- 音素カード -->
        <div class="grid grid-cols-2 gap-8 mb-8">
          <!-- 音素側 -->
          <div>
            <h3 class="text-lg font-bold text-white mb-4">音素</h3>
            <div class="space-y-3">
              <div
                v-for="sound in matchingSounds"
                :key="sound.id"
                @click="selectForMatching('sound', sound)"
                class="galaxy-card p-4 cursor-pointer hover:scale-105 transition-all"
                :class="{
                  'ring-4 ring-cyan-400': sound.selected,
                  'opacity-50': sound.matched
                }"
              >
                <button
                  @click.stop="playSound(sound.phoneme)"
                  class="galaxy-button galaxy-button-secondary px-3 py-1 mb-2"
                >
                  🔊 再生
                </button>
                <div class="text-sm text-white">{{ sound.word }}の最初の音</div>
              </div>
            </div>
          </div>

          <!-- 文字側 -->
          <div>
            <h3 class="text-lg font-bold text-white mb-4">文字</h3>
            <div class="space-y-3">
              <div
                v-for="letter in matchingLetters"
                :key="letter.id"
                @click="selectForMatching('letter', letter)"
                class="galaxy-card p-4 cursor-pointer hover:scale-105 transition-all text-center"
                :class="{
                  'ring-4 ring-purple-400': letter.selected,
                  'opacity-50': letter.matched
                }"
              >
                <div class="text-4xl font-bold galaxy-text-primary">
                  {{ letter.symbol }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- マッチング結果 -->
        <div v-if="matchingResults.length > 0" class="border-t border-slate-600 pt-4">
          <h3 class="text-lg font-bold text-white mb-3">マッチング結果</h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="result in matchingResults"
              :key="result.id"
              class="px-4 py-2 rounded-full"
              :class="result.correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
            >
              {{ result.sound }} = {{ result.letter }}
            </div>
          </div>
        </div>
      </div>

      <!-- 第4段階: ワード・ビルディング -->
      <div v-if="currentStage === 'stage4'" class="galaxy-card p-8">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6 text-center">
          🏗️ 単語を作ろう
        </h2>

        <!-- 目標単語 -->
        <div class="text-center mb-8">
          <div class="text-2xl text-white mb-2">この単語を作ってください:</div>
          <div class="flex justify-center items-center gap-2">
            <div class="text-4xl font-bold galaxy-text-primary">{{ targetWord.display }}</div>
            <button
              @click="playWord(targetWord)"
              class="galaxy-button galaxy-button-secondary px-3 py-1"
            >
              🔊
            </button>
          </div>
          <div class="text-sm text-slate-300 mt-2">{{ targetWord.hint }}</div>
        </div>

        <!-- ビルディングエリア -->
        <div class="mb-8">
          <div class="flex justify-center gap-2 mb-4">
            <div
              v-for="(slot, index) in wordSlots"
              :key="index"
              @drop="dropLetter($event, index)"
              @dragover.prevent
              @dragenter.prevent
              class="w-16 h-16 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center text-3xl font-bold text-white"
              :class="{
                'bg-cyan-600 border-cyan-400': slot.letter,
                'bg-red-600 border-red-400': slot.error
              }"
            >
              {{ slot.letter }}
            </div>
          </div>

          <!-- 文字パレット -->
          <div class="flex justify-center flex-wrap gap-3">
            <div
              v-for="letter in availableLetters"
              :key="letter.id"
              draggable="true"
              @dragstart="startDrag($event, letter)"
              class="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white cursor-move shadow-lg hover:scale-110 transition-all"
              :class="{ 'opacity-50': letter.used }"
            >
              {{ letter.symbol }}
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex justify-center gap-4">
          <button
            @click="checkWord"
            class="galaxy-button galaxy-button-primary px-6 py-3 font-bold"
          >
            確認
          </button>
          <button
            @click="resetWord"
            class="galaxy-button galaxy-button-secondary px-6 py-3"
          >
            リセット
          </button>
          <button
            @click="showHint"
            class="galaxy-button galaxy-button-secondary px-6 py-3"
          >
            ヒント
          </button>
        </div>
      </div>

      <!-- 成績表示 -->
      <div class="galaxy-card p-6 mt-6">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-3xl font-bold text-yellow-400">{{ score }}</div>
            <div class="text-white">スコア</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-green-400">{{ correctCount }}/{{ totalQuestions }}</div>
            <div class="text-white">正解数</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-purple-400">{{ accuracy }}%</div>
            <div class="text-white">正答率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 初期画面 -->
    <div v-else class="max-w-4xl mx-auto">
      <div class="galaxy-card p-8 text-center">
        <h1 class="text-4xl font-bold galaxy-text-primary cosmic-glow mb-4">
          🎯 カスタマイズ・フォニックス・ジャーニー
        </h1>
        <p class="text-xl text-slate-300 mb-8">
          講師が選択した音素で、段階的に学習を進めます
        </p>

        <div class="grid grid-cols-2 gap-6 mb-8">
          <button
            @click="startAsTeacher"
            class="galaxy-card p-8 hover:scale-105 transition-all"
          >
            <div class="text-4xl mb-4">👨‍🏫</div>
            <div class="text-xl font-bold galaxy-text-primary">講師として設定</div>
            <div class="text-sm text-slate-300 mt-2">
              生徒の学習カリキュラムをカスタマイズ
            </div>
          </button>

          <button
            @click="startAsStudent"
            class="galaxy-card p-8 hover:scale-105 transition-all"
          >
            <div class="text-4xl mb-4">👦</div>
            <div class="text-xl font-bold galaxy-text-primary">生徒として学習</div>
            <div class="text-sm text-slate-300 mt-2">
              設定されたカリキュラムで学習開始
            </div>
          </button>
        </div>

        <!-- 保存されたテンプレート -->
        <div v-if="savedTemplates.length > 0" class="border-t border-slate-600 pt-6">
          <h3 class="text-lg font-bold text-white mb-4">
            保存されたテンプレート
          </h3>
          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="template in savedTemplates"
              :key="template.id"
              @click="loadTemplate(template)"
              class="bg-slate-700 border border-slate-600 hover:border-cyan-400 p-3 rounded-lg text-left transition-all text-white hover:bg-slate-600"
            >
              <div class="font-bold text-white">{{ template.name }}</div>
              <div class="text-sm text-slate-300">{{ template.phonemes.join(', ') }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameSounds } from '@/composables/useGameSounds'
import { phonemeAudioService } from '@/services/phonemeAudioService'
import logger from '@/utils/logger'

const router = useRouter()
const { playSound: playGameSound, playBackgroundMusic, stopBackgroundMusic } = useGameSounds()

// ゲーム状態
const gameStarted = ref(false)
const showTeacherSettings = ref(false)
const currentStage = ref('stage1')
const currentStageIndex = ref(0)
const score = ref(0)
const correctCount = ref(0)
const totalQuestions = ref(0)

// 選択された設定
const selectedStudent = ref('')
const selectedPhonemes = ref([])
const selectedDifficulty = ref('normal')
const stages = ref({
  stage1: true,
  stage2: true,
  stage3: true,
  stage4: true
})

// ジョリーフォニックス音素データ
const jollyPhonicsGroups = {
  group1: ['s', 'a', 't', 'i', 'p', 'n'],
  group2: ['c', 'k', 'e', 'h', 'r', 'm', 'd'],
  group3: ['g', 'o', 'u', 'l', 'f', 'b'],
  group4: ['ai', 'j', 'oa', 'ie', 'ee', 'or'],
  group5: ['z', 'w', 'ng', 'v', 'oo', 'oo'],
  group6: ['y', 'x', 'ch', 'sh', 'th', 'th'],
  group7: ['qu', 'ou', 'oi', 'ue', 'er', 'ar']
}

// 全音素リスト（正確な短母音音声ファイルマッピング付き）
const allPhonemes = ref([
  // Group 1
  { symbol: 's', ipa: '/s/', group: 1, type: 'consonant', audioFile: 's' },
  { symbol: 'a', ipa: '/æ/', group: 1, type: 'vowel', audioFile: 'æ' }, // 短母音a
  { symbol: 't', ipa: '/t/', group: 1, type: 'consonant', audioFile: 't' },
  { symbol: 'i', ipa: '/ɪ/', group: 1, type: 'vowel', audioFile: 'ɪ' }, // 短母音i
  { symbol: 'p', ipa: '/p/', group: 1, type: 'consonant', audioFile: 'p' },
  { symbol: 'n', ipa: '/n/', group: 1, type: 'consonant', audioFile: 'n' },

  // Group 2
  { symbol: 'c', ipa: '/k/', group: 2, type: 'consonant', audioFile: 'k' },
  { symbol: 'k', ipa: '/k/', group: 2, type: 'consonant', audioFile: 'k' },
  { symbol: 'e', ipa: '/e/', group: 2, type: 'vowel', audioFile: 'ɛ' }, // 短母音e
  { symbol: 'h', ipa: '/h/', group: 2, type: 'consonant', audioFile: 'h' },
  { symbol: 'r', ipa: '/r/', group: 2, type: 'consonant', audioFile: 'r' },
  { symbol: 'm', ipa: '/m/', group: 2, type: 'consonant', audioFile: 'm' },
  { symbol: 'd', ipa: '/d/', group: 2, type: 'consonant', audioFile: 'd' },

  // Group 3
  { symbol: 'g', ipa: '/g/', group: 3, type: 'consonant', audioFile: 'g' },
  { symbol: 'o', ipa: '/ɒ/', group: 3, type: 'vowel', audioFile: 'ɒ' }, // 短母音o
  { symbol: 'u', ipa: '/ʌ/', group: 3, type: 'vowel', audioFile: 'ʌ' }, // 短母音u
  { symbol: 'l', ipa: '/l/', group: 3, type: 'consonant', audioFile: 'l' },
  { symbol: 'f', ipa: '/f/', group: 3, type: 'consonant', audioFile: 'f' },
  { symbol: 'b', ipa: '/b/', group: 3, type: 'consonant', audioFile: 'b' },

  // Group 4 (Digraphs)
  { symbol: 'ai', ipa: '/eɪ/', group: 4, type: 'vowel_digraph', audioFile: 'eɪ' },
  { symbol: 'j', ipa: '/dʒ/', group: 4, type: 'consonant', audioFile: 'j' },
  { symbol: 'oa', ipa: '/əʊ/', group: 4, type: 'vowel_digraph', audioFile: 'oʊ' },
  { symbol: 'ie', ipa: '/aɪ/', group: 4, type: 'vowel_digraph', audioFile: 'aɪ' },
  { symbol: 'ee', ipa: '/iː/', group: 4, type: 'vowel_digraph', audioFile: 'iː' },
  { symbol: 'or', ipa: '/ɔː/', group: 4, type: 'r_controlled', audioFile: 'or' },

  // Additional groups...
])

// プリセット設定
const phonicsPresets = ref([
  {
    id: 'beginners',
    name: '初級（Group 1）',
    phonemes: ['s', 'a', 't', 'i', 'p', 'n'],
    description: 'ジョリーフォニックス第1グループ'
  },
  {
    id: 'intermediate',
    name: '中級（Groups 1-3）',
    phonemes: [...jollyPhonicsGroups.group1, ...jollyPhonicsGroups.group2, ...jollyPhonicsGroups.group3],
    description: '基本音素すべて'
  },
  {
    id: 'digraphs',
    name: '二重音字特訓',
    phonemes: ['ai', 'oa', 'ie', 'ee', 'ou', 'oi'],
    description: '苦手な二重音字を重点学習'
  },
  {
    id: 'r_controlled',
    name: 'R制御母音',
    phonemes: ['ar', 'er', 'ir', 'or', 'ur'],
    description: 'R音の影響を受ける母音'
  }
])

// 難易度レベル
const difficultyLevels = ref([
  { id: 'easy', name: '簡単', icon: '🌱', speed: 'slow', hints: true },
  { id: 'normal', name: '標準', icon: '🌿', speed: 'normal', hints: false },
  { id: 'hard', name: '難しい', icon: '🌳', speed: 'fast', hints: false }
])

// 生徒データ（デモ用）
const students = ref([
  { id: '1', name: '田中太郎', level: 'beginner' },
  { id: '2', name: '鈴木花子', level: 'intermediate' }
])

// 保存されたテンプレート
const savedTemplates = ref([])

// Stage 1用のデータ
const currentPhoneme = ref({ display: 's', sound: 's' })
const soundOptions = ref([])

// Stage 2用のデータ
const blendingPhonemes = ref(['s', 'a', 't'])
const blendedWord = ref('sat')
const blendOptions = ref([])

// Stage 3用のデータ
const matchingSounds = ref([])
const matchingLetters = ref([])
const matchingResults = ref([])

// Stage 4用のデータ
const targetWord = ref({ display: 'cat', hint: '猫' })
const wordSlots = ref([])
const availableLetters = ref([])

// Computed
const enabledStages = computed(() => {
  return Object.keys(stages.value).filter(stage => stages.value[stage])
})

const currentStageName = computed(() => {
  const stageNames = {
    stage1: '🔊 ピュア・サウンド認識',
    stage2: '🎵 サウンド・ブレンディング',
    stage3: '📝 レター・マッチング',
    stage4: '🏗️ ワード・ビルディング'
  }
  return stageNames[currentStage.value] || ''
})

const currentProgress = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctCount.value / totalQuestions.value) * 100)
})

const accuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctCount.value / totalQuestions.value) * 100)
})

// Methods
const startAsTeacher = () => {
  showTeacherSettings.value = true
}

const startAsStudent = () => {
  // 生徒用のプリセット設定を読み込み
  loadStudentSettings()
  gameStarted.value = true
  initializeStage()
}

const selectPreset = (preset) => {
  selectedPhonemes.value = [...preset.phonemes]
}

const isPresetSelected = (preset) => {
  return JSON.stringify(preset.phonemes.sort()) === JSON.stringify(selectedPhonemes.value.sort())
}

const togglePhoneme = (phoneme) => {
  const index = selectedPhonemes.value.indexOf(phoneme.symbol)
  if (index > -1) {
    selectedPhonemes.value.splice(index, 1)
  } else {
    selectedPhonemes.value.push(phoneme.symbol)
  }
}

const removePhoneme = (phoneme) => {
  const index = selectedPhonemes.value.indexOf(phoneme)
  if (index > -1) {
    selectedPhonemes.value.splice(index, 1)
  }
}

const startCustomJourney = () => {
  if (selectedPhonemes.value.length === 0) {
    alert('少なくとも1つの音素を選択してください')
    return
  }

  showTeacherSettings.value = false
  gameStarted.value = true
  currentStage.value = enabledStages.value[0]
  initializeStage()

  logger.log('🎮 カスタムジャーニー開始:', {
    phonemes: selectedPhonemes.value,
    stages: enabledStages.value,
    difficulty: selectedDifficulty.value
  })
}

const saveTemplate = () => {
  const template = {
    id: Date.now().toString(),
    name: `テンプレート ${savedTemplates.value.length + 1}`,
    phonemes: [...selectedPhonemes.value],
    stages: { ...stages.value },
    difficulty: selectedDifficulty.value
  }
  savedTemplates.value.push(template)
  localStorage.setItem('phonicsTemplates', JSON.stringify(savedTemplates.value))
  alert('テンプレートを保存しました')
}

const loadTemplate = (template) => {
  selectedPhonemes.value = [...template.phonemes]
  stages.value = { ...template.stages }
  selectedDifficulty.value = template.difficulty
  showTeacherSettings.value = true
}

const loadStudentSettings = () => {
  // デモ用：保存された設定を読み込む
  const savedSettings = localStorage.getItem('studentPhonicsSettings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    selectedPhonemes.value = settings.phonemes || ['s', 'a', 't']
    stages.value = settings.stages || { stage1: true, stage2: true, stage3: true, stage4: true }
    selectedDifficulty.value = settings.difficulty || 'normal'
  } else {
    // デフォルト設定
    selectedPhonemes.value = ['s', 'a', 't', 'i', 'p', 'n']
  }
}

const initializeStage = () => {
  switch (currentStage.value) {
    case 'stage1':
      initializeStage1()
      break
    case 'stage2':
      initializeStage2()
      break
    case 'stage3':
      initializeStage3()
      break
    case 'stage4':
      initializeStage4()
      break
  }
}

const initializeStage1 = () => {
  // ランダムに音素を選択
  const randomPhoneme = selectedPhonemes.value[Math.floor(Math.random() * selectedPhonemes.value.length)]
  currentPhoneme.value = { display: randomPhoneme, sound: randomPhoneme }

  // 選択肢を生成
  soundOptions.value = generateSoundOptions(randomPhoneme)
}

const initializeStage2 = () => {
  // ブレンディング用の音素を選択
  const numPhonemes = Math.min(3, selectedPhonemes.value.length)
  blendingPhonemes.value = selectedPhonemes.value.slice(0, numPhonemes)
  blendedWord.value = blendingPhonemes.value.join('')

  // ブレンドオプションを生成
  blendOptions.value = generateBlendOptions()
}

const initializeStage3 = () => {
  // マッチング用の音と文字を生成
  const phonemesToMatch = selectedPhonemes.value.slice(0, 5)
  matchingSounds.value = phonemesToMatch.map((p, i) => ({
    id: i,
    phoneme: p,
    word: getExampleWord(p),
    selected: false,
    matched: false
  }))

  matchingLetters.value = [...phonemesToMatch].sort(() => Math.random() - 0.5).map((p, i) => ({
    id: i + 100,
    symbol: p,
    selected: false,
    matched: false
  }))

  matchingResults.value = []
}

const initializeStage4 = () => {
  // 単語構築用のデータを生成
  targetWord.value = generateTargetWord()
  wordSlots.value = Array(targetWord.value.display.length).fill().map(() => ({ letter: '', error: false }))
  availableLetters.value = generateAvailableLetters(targetWord.value.display)
}

const generateSoundOptions = (correctPhoneme) => {
  // 正解を含む選択肢を生成（1つだけ正解）
  const correctWord = getExampleWord(correctPhoneme)

  // 正解の音素を含まない単語を生成
  const wrongWords = []
  const allAvailablePhonemes = selectedPhonemes.value.filter(p => p !== correctPhoneme)

  // 正解の音素を含まない単語を3つ選ぶ
  while (wrongWords.length < 3 && allAvailablePhonemes.length > 0) {
    const randomPhoneme = allAvailablePhonemes[Math.floor(Math.random() * allAvailablePhonemes.length)]
    const word = getExampleWord(randomPhoneme)

    // 正解の音素が含まれていないことを確認
    if (!word.toLowerCase().includes(correctPhoneme.toLowerCase()) && !wrongWords.includes(word)) {
      wrongWords.push(word)
    }

    // 無限ループを防ぐ
    const index = allAvailablePhonemes.indexOf(randomPhoneme)
    if (index > -1) {
      allAvailablePhonemes.splice(index, 1)
    }
  }

  // フォールバック：十分な不正解が生成できない場合
  while (wrongWords.length < 3) {
    const fallbackWords = ['dog', 'cat', 'car', 'book', 'tree', 'house', 'ball', 'fish']
    const word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
    if (!word.includes(correctPhoneme.toLowerCase()) && !wrongWords.includes(word)) {
      wrongWords.push(word)
    }
  }

  const options = [
    {
      id: 1,
      word: correctWord,
      image: getWordImage(correctWord),
      emoji: '🎯',
      hint: '正解！',
      correct: true
    },
    {
      id: 2,
      word: wrongWords[0],
      image: getWordImage(wrongWords[0]),
      emoji: '🌟',
      hint: 'よく聞いて',
      correct: false
    },
    {
      id: 3,
      word: wrongWords[1],
      image: getWordImage(wrongWords[1]),
      emoji: '💫',
      hint: 'もう一度',
      correct: false
    },
    {
      id: 4,
      word: wrongWords[2],
      image: getWordImage(wrongWords[2]),
      emoji: '⭐',
      hint: '集中して',
      correct: false
    }
  ]

  return options.sort(() => Math.random() - 0.5)
}

const generateBlendOptions = () => {
  // ブレンディングの選択肢を生成
  return [
    { id: 1, phonemes: ['s', 'a'], result: 'sa' },
    { id: 2, phonemes: ['a', 't'], result: 'at' },
    { id: 3, phonemes: ['s', 'a', 't'], result: 'sat' },
    { id: 4, phonemes: ['i', 'n'], result: 'in' },
    { id: 5, phonemes: ['p', 'i', 'n'], result: 'pin' },
    { id: 6, phonemes: ['t', 'a', 'p'], result: 'tap' }
  ].filter(opt => opt.phonemes.every(p => selectedPhonemes.value.includes(p)))
}

const generateTargetWord = () => {
  // 選択された音素から作れる単語を生成
  const words = [
    { display: 'sat', hint: '座った' },
    { display: 'pin', hint: 'ピン' },
    { display: 'tap', hint: 'タップする' },
    { display: 'nap', hint: '昼寝' },
    { display: 'sit', hint: '座る' },
    { display: 'pan', hint: 'フライパン' }
  ]

  // 選択された音素で作れる単語をフィルタ
  const possibleWords = words.filter(word =>
    word.display.split('').every(letter => selectedPhonemes.value.includes(letter))
  )

  return possibleWords[Math.floor(Math.random() * possibleWords.length)] || words[0]
}

const generateAvailableLetters = (targetWord) => {
  const letters = targetWord.split('').map((letter, i) => ({
    id: i,
    symbol: letter,
    used: false
  }))

  // ダミー文字を追加
  const dummyLetters = selectedPhonemes.value
    .filter(p => !targetWord.includes(p))
    .slice(0, 3)
    .map((letter, i) => ({
      id: 100 + i,
      symbol: letter,
      used: false
    }))

  return [...letters, ...dummyLetters].sort(() => Math.random() - 0.5)
}

const getExampleWord = (phoneme) => {
  const examples = {
    's': 'sun', 'a': 'apple', 't': 'top', 'i': 'igloo', 'p': 'pen', 'n': 'net',
    'c': 'cat', 'k': 'kite', 'e': 'egg', 'h': 'hat', 'r': 'red', 'm': 'map', 'd': 'dog',
    'g': 'goat', 'o': 'octopus', 'u': 'umbrella', 'l': 'leg', 'f': 'fish', 'b': 'ball',
    'ai': 'rain', 'j': 'jam', 'oa': 'boat', 'ie': 'tie', 'ee': 'tree', 'or': 'fork'
  }
  return examples[phoneme] || phoneme
}

const getRandomPhoneme = (exclude) => {
  const others = selectedPhonemes.value.filter(p => p !== exclude)
  return others[Math.floor(Math.random() * others.length)]
}

// フリー素材画像のURL取得関数
const getWordImage = (word) => {
  // Unsplash APIを使用してフリー素材画像を取得
  const imageMap = {
    // Group 1 phonemes
    'sun': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop',
    'top': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
    'igloo': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'pen': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop',
    'net': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',

    // Group 2 phonemes
    'cat': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
    'kite': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'egg': 'https://images.unsplash.com/photo-1587486937820-4af70b998b1d?w=200&h=200&fit=crop',
    'hat': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop',
    'red': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'map': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'dog': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200&h=200&fit=crop',

    // Group 3 phonemes
    'goat': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'octopus': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=200&h=200&fit=crop',
    'umbrella': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'leg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'fish': 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=200&h=200&fit=crop',
    'ball': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',

    // Additional common words
    'car': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=200&fit=crop',
    'book': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    'tree': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
    'house': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&h=200&fit=crop',

    // Group 4 phonemes
    'rain': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&h=200&fit=crop',
    'jam': 'https://images.unsplash.com/photo-1599599810694-57a2ca60a000?w=200&h=200&fit=crop',
    'boat': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop',
    'tie': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    'fork': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop'
  }

  // デフォルト画像（単語が見つからない場合）
  return imageMap[word.toLowerCase()] || `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&auto=format&q=80&bg=f8f9fa&overlay=000000&overlay-opacity=10&text=${encodeURIComponent(word)}&text-size=24&text-color=333333`
}

const playSound = async (phoneme) => {
  playGameSound('tap')
  logger.log('🔊 Playing phoneme sound for:', phoneme)

  try {
    // 音素データから正確な音声ファイルキーを取得
    let audioFileKey = phoneme

    // 音素リストから音声ファイルキーを検索
    const phonemeData = allPhonemes.value.find(p => p.symbol === phoneme)
    if (phonemeData && phonemeData.audioFile) {
      audioFileKey = phonemeData.audioFile
    }

    // PhonemeAudioServiceを使用して正確な短母音を再生
    await phonemeAudioService.playPhoneme(audioFileKey, {
      volume: 0.8,
      rate: 0.9 // 少しゆっくり再生
    })

    logger.log('✅ Phoneme audio played successfully:', audioFileKey)
  } catch (error) {
    logger.warn('❌ Phoneme audio failed, falling back to TTS:', error)

    // フォールバック：Web Speech API使用（但し短母音指定）
    if ('speechSynthesis' in window && typeof phoneme === 'string') {
      const utterance = new SpeechSynthesisUtterance(phoneme)
      utterance.rate = 0.6 // より遅く
      utterance.pitch = 0.9 // より低く（短母音風）
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }
}

const playOptionSound = async (option) => {
  playGameSound('tap')
  logger.log('🔊 Playing option sound for word:', option.word)

  // 選択肢の単語はネイティブのアメリカ英語で発音
  if ('speechSynthesis' in window && option.word) {
    const utterance = new SpeechSynthesisUtterance(option.word)
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.lang = 'en-US'

    // より自然なアメリカ英語の発音設定
    utterance.volume = 0.9

    window.speechSynthesis.speak(utterance)
    logger.log('✅ Option word played with native English pronunciation:', option.word)
  } else {
    logger.warn('❌ Speech synthesis not available')
  }
}

const playBlendedSound = async () => {
  playGameSound('success')
  logger.log('🔊 Playing blended sound:', blendedWord.value)

  try {
    // ブレンディング音素を順番に再生
    for (let i = 0; i < blendingPhonemes.value.length; i++) {
      const phoneme = blendingPhonemes.value[i]
      const phonemeData = allPhonemes.value.find(p => p.symbol === phoneme)

      if (phonemeData && phonemeData.audioFile) {
        await phonemeAudioService.playPhoneme(phonemeData.audioFile, {
          volume: 0.8,
          rate: 1.1, // 速めに連続再生
          delay: i === 0 ? 0 : 100 // 音素間の短い間隔
        })
      }

      // 音素間の短い間隔
      if (i < blendingPhonemes.value.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 150))
      }
    }

    logger.log('✅ Blended phoneme audio played successfully')
  } catch (error) {
    logger.warn('❌ Blended phoneme audio failed, using TTS:', error)

    // フォールバック：TTS使用
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(blendedWord.value)
      utterance.rate = 0.7
      utterance.pitch = 1.1
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }
}

const playWord = async (word) => {
  playGameSound('tap')
  logger.log('🔊 Playing word:', word.display)

  try {
    // 単語の各音素を分析して再生
    const wordPhonemes = word.display.split('')
    for (let i = 0; i < wordPhonemes.length; i++) {
      const phoneme = wordPhonemes[i]
      const phonemeData = allPhonemes.value.find(p => p.symbol === phoneme)

      if (phonemeData && phonemeData.audioFile) {
        await phonemeAudioService.playPhoneme(phonemeData.audioFile, {
          volume: 0.8,
          rate: 1.0
        })

        // 音素間の短い間隔
        if (i < wordPhonemes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }

    logger.log('✅ Word phoneme audio played successfully')
  } catch (error) {
    logger.warn('❌ Word phoneme audio failed, using TTS:', error)

    // フォールバック：TTS使用
    if ('speechSynthesis' in window && word.display) {
      const utterance = new SpeechSynthesisUtterance(word.display)
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }
}

const selectSound = (option) => {
  option.selected = true
  totalQuestions.value++

  if (option.correct) {
    correctCount.value++
    score.value += 100
    playGameSound('success')

    // 次の問題へ
    setTimeout(() => {
      initializeStage1()
    }, 1500)
  } else {
    playGameSound('error')
  }
}

const selectBlend = (blend) => {
  blendingPhonemes.value = blend.phonemes
  blendedWord.value = blend.result
  playBlendedSound()
}

const selectForMatching = (type, item) => {
  if (item.matched) return

  if (type === 'sound') {
    // 既に選択されている音をクリア
    matchingSounds.value.forEach(s => s.selected = false)
    item.selected = true

    // 文字が選択されていればマッチング判定
    const selectedLetter = matchingLetters.value.find(l => l.selected)
    if (selectedLetter) {
      checkMatching(item, selectedLetter)
    }
  } else {
    // 既に選択されている文字をクリア
    matchingLetters.value.forEach(l => l.selected = false)
    item.selected = true

    // 音が選択されていればマッチング判定
    const selectedSound = matchingSounds.value.find(s => s.selected)
    if (selectedSound) {
      checkMatching(selectedSound, item)
    }
  }
}

const checkMatching = (sound, letter) => {
  totalQuestions.value++
  const correct = sound.phoneme === letter.symbol

  if (correct) {
    correctCount.value++
    score.value += 100
    sound.matched = true
    letter.matched = true
    playGameSound('success')
  } else {
    playGameSound('error')
  }

  matchingResults.value.push({
    id: Date.now(),
    sound: sound.phoneme,
    letter: letter.symbol,
    correct
  })

  // 選択をクリア
  sound.selected = false
  letter.selected = false

  // 全てマッチしたら次へ
  if (matchingSounds.value.every(s => s.matched)) {
    setTimeout(() => {
      nextStage()
    }, 2000)
  }
}

const startDrag = (event, letter) => {
  if (letter.used) return
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('letterId', letter.id.toString())
}

const dropLetter = (event, slotIndex) => {
  const letterId = parseInt(event.dataTransfer.getData('letterId'))
  const letter = availableLetters.value.find(l => l.id === letterId)

  if (letter && !letter.used) {
    wordSlots.value[slotIndex].letter = letter.symbol
    letter.used = true
    playGameSound('tap')
  }
}

const checkWord = () => {
  const builtWord = wordSlots.value.map(s => s.letter).join('')
  totalQuestions.value++

  if (builtWord === targetWord.value.display) {
    correctCount.value++
    score.value += 200
    playGameSound('success')

    // 次の単語へ
    setTimeout(() => {
      initializeStage4()
    }, 1500)
  } else {
    playGameSound('error')
    wordSlots.value.forEach(slot => {
      slot.error = true
      setTimeout(() => {
        slot.error = false
      }, 1000)
    })
  }
}

const resetWord = () => {
  wordSlots.value.forEach(slot => slot.letter = '')
  availableLetters.value.forEach(letter => letter.used = false)
}

const showHint = () => {
  // 最初の文字をヒントとして表示
  const firstLetter = targetWord.value.display[0]
  wordSlots.value[0].letter = firstLetter
  const letter = availableLetters.value.find(l => l.symbol === firstLetter && !l.used)
  if (letter) letter.used = true
  playGameSound('tap')
}

const nextStage = () => {
  const currentIndex = enabledStages.value.indexOf(currentStage.value)
  if (currentIndex < enabledStages.value.length - 1) {
    currentStageIndex.value++
    currentStage.value = enabledStages.value[currentIndex + 1]
    initializeStage()
  } else {
    // 全ステージ完了
    showResults()
  }
}

const showResults = () => {
  alert(`🎉 全ステージ完了！\nスコア: ${score.value}\n正答率: ${accuracy.value}%`)
  handleBack()
}

const handleBack = () => {
  router.push('/sound-adventure')
}

// Lifecycle
onMounted(() => {
  // 保存されたテンプレートを読み込み
  const saved = localStorage.getItem('phonicsTemplates')
  if (saved) {
    savedTemplates.value = JSON.parse(saved)
  }

  playBackgroundMusic('adventure')
})
</script>

<style scoped>
@import '@/assets/css/galaxy-theme.css';

/* アニメーション */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.cosmic-glow {
  animation: float 3s ease-in-out infinite;
}

/* ドラッグ&ドロップスタイル */
[draggable="true"] {
  cursor: move;
}

[draggable="true"]:hover {
  transform: scale(1.1);
}

.drop-zone {
  transition: all 0.3s;
}

.drop-zone.drag-over {
  background-color: rgba(6, 182, 212, 0.2);
  border-color: rgb(6, 182, 212);
}
</style>