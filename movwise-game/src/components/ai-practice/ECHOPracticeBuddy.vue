<template>
  <div class="echo-practice-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">VRアカデミー英会話練習</h1>
            <p class="text-gray-600 mt-1">AI英会話講師「ECHO」と一緒に実践的な英語を練習しましょう</p>
          </div>
          <button
            v-if="isSessionActive"
            @click="endSession"
            class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            練習終了
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Panel - ECHO Avatar & Stats -->
      <div class="lg:col-span-1 space-y-6">
        <!-- ECHO Avatar -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <ECHOAvatarDisplay
            :emotion="echoCharacter.emotion"
            :encouragement-level="echoCharacter.encouragementLevel"
            :animation-state="echoCharacter.animationState"
            :eye-color="echoCharacter.eyeColor"
            :cheek-blush-opacity="echoCharacter.cheekBlushOpacity"
            :character="echoCharacter"
            :performance-mode="
              performanceStats.animationFrameRate < 20 ? 'low' :
              performanceStats.animationFrameRate < 45 ? 'balanced' : 'high'
            "
          />
          <div class="mt-4 text-center">
            <h3 class="text-xl font-semibold text-gray-800">ECHO</h3>
            <div class="mt-2 flex items-center justify-center space-x-2">
              <span class="text-sm text-gray-600">励ましレベル：</span>
              <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
                  :style="{ width: `${echoCharacter.encouragementLevel}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Session Stats -->
        <div v-if="sessionStats" class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">練習記録</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">時間：</span>
              <span class="font-medium">{{ sessionStats.duration }}分</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">会話：</span>
              <span class="font-medium">{{ sessionStats.turns }}回</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">スコア：</span>
              <div class="flex items-center">
                <span class="font-medium mr-2">{{ (sessionStats.score * 100).toFixed(0) }}点</span>
                <div class="flex">
                  <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.ceil(sessionStats.score * 5) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">便利機能</h3>
          <div class="space-y-2">
            <button
              @click="toggleHints"
              class="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              ヒントを {{ showHints ? '隠す' : '表示' }}
            </button>
            <button
              @click="isRecording ? stopVoiceRecording() : startVoiceRecording()"
              :class="[
                'w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center font-bold text-lg',
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                  : speechSupported 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
              :disabled="!isSessionActive || !speechSupported"
            >
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
              </svg>
              {{ isRecording ? '🔴 録音中...' : '🎤 音声で話す' }}
            </button>
            
            <!-- Repeat Last Response -->
            <button
              v-if="lastECHOMessage && isSessionActive"
              @click="speakText(lastECHOMessage.message, false)"
              class="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              ECHOをもう一度聞く
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="lg:col-span-2 space-y-6">
        <!-- How to Use Tutorial -->
        <div v-if="!isSessionActive" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">📚 使い方（3ステップで簡単！）</h2>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-white rounded-xl">
              <div class="text-4xl mb-2">1️⃣</div>
              <h3 class="font-bold text-gray-800 mb-2">シナリオを選ぶ</h3>
              <p class="text-sm text-gray-600">レストラン、ホテル、ショッピングから好きな場面を選択</p>
            </div>
            <div class="text-center p-4 bg-white rounded-xl">
              <div class="text-4xl mb-2">2️⃣</div>
              <h3 class="font-bold text-gray-800 mb-2">音声で英語を話す</h3>
              <p class="text-sm text-gray-600">🎤音声入力ボタンを押して実際に英語で話しかける（おすすめ！）</p>
            </div>
            <div class="text-center p-4 bg-white rounded-xl">
              <div class="text-4xl mb-2">3️⃣</div>
              <h3 class="font-bold text-gray-800 mb-2">ECHOと音声で会話する</h3>
              <p class="text-sm text-gray-600">ECHOが音声で返事をしてくれるので、リアルな英会話練習ができる</p>
            </div>
          </div>
          <div class="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p class="text-sm text-gray-700">
              <strong>💡 コツ：</strong>間違いを恐れず、まずは🎤音声入力ボタンを押して「Hello!」と話しかけてみましょう！ECHOが音声で返事をしてくれます。
            </p>
          </div>
        </div>

        <!-- Scenario Selection (when no active session) -->
        <div v-if="!isSessionActive" class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">練習シナリオを選択</h2>
          
          <!-- Recommended Scenarios -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              おすすめシナリオ
            </h3>
            <div class="grid gap-4">
              <div
                v-for="scenario in getRecommendedScenarios()"
                :key="scenario.id"
                @click="startSession(scenario.id)"
                class="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">{{ scenario.title }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ scenario.description }}</p>
                    <div class="flex items-center mt-2 space-x-4">
                      <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {{ scenario.type }}
                      </span>
                      <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {{ scenario.difficulty }}
                      </span>
                      <span class="text-xs text-gray-500">
                        ~{{ scenario.estimatedDuration }} min
                      </span>
                    </div>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- All Scenarios by Difficulty -->
          <div v-for="difficulty in ['beginner', 'intermediate', 'advanced']" :key="difficulty" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">
              <span v-if="difficulty === 'beginner'">初級レベル 🌱</span>
              <span v-else-if="difficulty === 'intermediate'">中級レベル 🌿</span>
              <span v-else>上級レベル 🌳</span>
            </h3>
            <div class="grid gap-3">
              <div
                v-for="scenario in getScenariosByDifficulty(difficulty as any)"
                :key="scenario.id"
                @click="startSession(scenario.id)"
                class="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-800">{{ scenario.title }}</span>
                  <span class="text-sm text-gray-500">{{ scenario.type }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Conversation -->
        <div v-else class="bg-white rounded-2xl shadow-lg p-6">
          <div class="mb-4">
            <h2 class="text-xl font-bold text-gray-800">{{ currentScenario?.title }}</h2>
            <p class="text-gray-600">{{ currentScenario?.description }}</p>
          </div>

          <!-- Conversation History -->
          <div 
            ref="conversationScrollContainer"
            class="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg"
          >
            <div v-for="turn in conversationHistory" :key="turn.id" class="mb-4">
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl',
                  turn.speaker === 'user' 
                    ? 'ml-auto bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200'
                ]"
              >
                <p>{{ turn.message }}</p>
                <div v-if="turn.feedback && turn.speaker === 'user'" class="mt-2 text-xs">
                  <span :class="[
                    'px-2 py-1 rounded-full',
                    turn.feedback.level === 'excellent' ? 'bg-green-100 text-green-700' :
                    turn.feedback.level === 'good' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  ]">
                    <span v-if="turn.feedback.level === 'excellent'">素晴らしい！✨</span>
                    <span v-else-if="turn.feedback.level === 'good'">良いですね！👍</span>
                    <span v-else>練習しましょう！💪</span>
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Typing indicator -->
            <div v-if="isLoading" class="flex items-center space-x-2 text-gray-500">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-sm">ECHOが考え中...</span>
            </div>
          </div>

          <!-- Hints Section -->
          <div v-if="showHints && lastECHOMessage?.hints" class="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-semibold text-blue-800 mb-2">💡 役立つヒント：</h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li v-for="(hint, index) in lastECHOMessage.hints" :key="index" class="flex items-start">
                <span class="mr-2">💡</span>
                <span class="flex-1">{{ hint }}</span>
                <button 
                  @click="speakText(hint, false)"
                  class="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300"
                  title="ヒントを音声で聞く"
                >
                  🔊
                </button>
              </li>
            </ul>
          </div>
          
          <!-- Error Corrections Section -->
          <div v-if="lastECHOMessage?.corrections && lastECHOMessage.corrections.length > 0" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 class="text-sm font-semibold text-yellow-800 mb-2">✏️ 文法・発音のアドバイス：</h4>
            <ul class="text-sm text-yellow-700 space-y-2">
              <li v-for="(correction, index) in lastECHOMessage.corrections" :key="index" class="flex items-start">
                <span class="mr-2">✏️</span>
                <div class="flex-1">
                  <span>{{ correction }}</span>
                  <button 
                    @click="speakText(correction, true)"
                    class="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
                    title="修正アドバイスを音声で聞く"
                  >
                    🔊 聞く
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <!-- Voice Input Primary -->
          <div class="mb-4">
            <button
              @click="isRecording ? stopVoiceRecording() : startVoiceRecording()"
              :class="[
                'w-full px-6 py-4 rounded-xl transition-colors flex items-center justify-center font-bold text-xl',
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                  : speechSupported 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg transform hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
              :disabled="!speechSupported || isLoading || isSpeaking"
            >
              <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
              </svg>
              {{ 
                isRecording 
                  ? '🔴 録音中... タップで停止' 
                  : isSpeaking 
                    ? '🔊 ECHOが話し中...' 
                    : '🎤 音声で英語を話す（メインの使い方）' 
              }}
            </button>
            <p v-if="!speechSupported" class="text-red-500 text-sm mt-2 text-center">
              ⚠️ この端末では音声認識がサポートされていません
            </p>
          </div>

          <!-- Text Input Alternative -->
          <div class="border-t pt-4">
            <p class="text-sm text-gray-600 mb-2 text-center">または、テキストで入力：</p>
            <div class="flex space-x-2">
              <input
                v-model="userInput"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="英語で返事を入力してください（例：Hello! Thank you!）"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isLoading"
              />
              <button
                @click="sendMessage"
                :disabled="!userInput.trim() || isLoading"
                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                送信
              </button>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error || lastError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-red-700">{{ error || lastError?.message }}</span>
          </div>
        </div>
        
        <!-- Performance Info (Debug) -->
        <div v-if="performanceStats.animationFrameRate < 30" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span class="text-yellow-700">パフォーマンスが低下しています。アニメーションを制限中... ({{ Math.round(performanceStats.animationFrameRate) }}fps)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useECHOPractice } from '@/composables/useECHOPractice'
import ECHOAvatarDisplay from './ECHOAvatarDisplay.vue'

const {
  userInput,
  isRecording,
  showHints,
  conversationScrollContainer,
  isListening,
  speechSupported,
  isSpeaking,
  performanceStats,
  lastError,
  currentSession,
  echoCharacter,
  isLoading,
  error,
  isSessionActive,
  currentScenario,
  conversationHistory,
  lastECHOMessage,
  sessionStats,
  startSession,
  sendMessage,
  toggleHints,
  endSession,
  startVoiceRecording,
  stopVoiceRecording,
  speakText,
  initialize,
  getRecommendedScenarios,
  getScenariosByDifficulty
} = useECHOPractice()

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>