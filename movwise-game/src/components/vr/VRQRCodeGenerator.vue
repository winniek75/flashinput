<template>
  <div class="vr-qr-code-generator min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- VR空間背景エフェクト -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- 3D空間グリッド -->
      <div class="absolute inset-0">
        <div
          v-for="i in 10"
          :key="`h-${i}`"
          class="absolute border-t border-cyan-400 opacity-20"
          :style="{ 
            top: `${i * 10}%`, 
            width: '100%',
            transform: `perspective(1000px) rotateX(${i * 5}deg)`
          }"
        ></div>
        <div
          v-for="i in 10"
          :key="`v-${i}`"
          class="absolute border-l border-cyan-400 opacity-20"
          :style="{ 
            left: `${i * 10}%`, 
            height: '100%',
            transform: `perspective(1000px) rotateY(${i * 5}deg)`
          }"
        ></div>
      </div>
      
      <!-- 浮遊するVRアイコン -->
      <div
        v-for="vrIcon in floatingVRIcons"
        :key="vrIcon.id"
        class="absolute text-cyan-400 animate-pulse"
        :style="{
          left: `${vrIcon.x}%`,
          top: `${vrIcon.y}%`,
          fontSize: `${vrIcon.size}px`,
          opacity: vrIcon.opacity,
          animationDelay: `${vrIcon.delay}s`,
          transform: `rotate(${vrIcon.rotation}deg)`
        }"
      >
        {{ vrIcon.icon }}
      </div>
    </div>

    <div class="relative z-10 max-w-5xl mx-auto p-6">
      <!-- ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-purple-700 mb-2 flex items-center gap-3">
              🥽 VR Academy Portal Generator
            </h1>
            <p class="text-purple-600">Galaxy Trading から VR Academy への接続QRコード生成</p>
          </div>
          
          <div class="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-cyan-800">{{ vrReadinessScore }}/100</div>
              <div class="text-sm text-cyan-600">VR準備度</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左側: QRコード生成エリア -->
        <div class="space-y-6">
          <!-- プレイヤー情報設定 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              👤 プレイヤーVRプロファイル設定
            </h2>
            
            <div class="space-y-4">
              <!-- 基本情報 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600 block mb-2">プレイヤー名</label>
                  <input
                    v-model="vrProfile.playerName"
                    type="text"
                    placeholder="VR空間でのニックネーム"
                    class="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="text-sm text-gray-600 block mb-2">学習レベル</label>
                  <select v-model="vrProfile.learningLevel" class="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500">
                    <option value="beginner">初級 (Beginner)</option>
                    <option value="intermediate">中級 (Intermediate)</option>
                    <option value="advanced">上級 (Advanced)</option>
                    <option value="expert">専門家 (Expert)</option>
                  </select>
                </div>
              </div>
              
              <!-- 学習専門分野 -->
              <div>
                <label class="text-sm text-gray-600 block mb-2">専門分野選択</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label
                    v-for="specialty in availableSpecialties"
                    :key="specialty.id"
                    class="flex items-center gap-2 p-3 border border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-purple-400"
                    :class="vrProfile.specialties.includes(specialty.id) ? 'border-purple-500 bg-purple-50' : ''"
                  >
                    <input
                      type="checkbox"
                      :value="specialty.id"
                      v-model="vrProfile.specialties"
                      class="text-purple-500 rounded"
                    />
                    <span class="text-xl">{{ specialty.icon }}</span>
                    <span class="text-sm">{{ specialty.name }}</span>
                  </label>
                </div>
              </div>
              
              <!-- VR設定 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600 block mb-2">VRヘッドセット</label>
                  <select v-model="vrProfile.headsetType" class="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500">
                    <option value="quest2">Meta Quest 2</option>
                    <option value="quest3">Meta Quest 3</option>
                    <option value="questpro">Meta Quest Pro</option>
                    <option value="pico4">Pico 4</option>
                    <option value="vive">HTC Vive</option>
                    <option value="index">Valve Index</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div>
                  <label class="text-sm text-gray-600 block mb-2">体験希望時間</label>
                  <select v-model="vrProfile.sessionDuration" class="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500">
                    <option value="15">15分 (クイック体験)</option>
                    <option value="30">30分 (標準セッション)</option>
                    <option value="60">60分 (深度体験)</option>
                    <option value="90">90分 (完全没入)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Galaxy Trading 実績データ -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📊 Galaxy Trading 実績データ
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                <div class="text-2xl mb-2">🍎</div>
                <div class="text-lg font-bold text-red-700">{{ tradingStats.phonicsProgress }}%</div>
                <div class="text-sm text-red-600">音韻学習</div>
              </div>
              <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <div class="text-2xl mb-2">🤖</div>
                <div class="text-lg font-bold text-blue-700">{{ tradingStats.blendingProgress }}%</div>
                <div class="text-sm text-blue-600">技術学習</div>
              </div>
              <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                <div class="text-2xl mb-2">🌙</div>
                <div class="text-lg font-bold text-purple-700">{{ tradingStats.grammarProgress }}%</div>
                <div class="text-sm text-purple-600">文法学習</div>
              </div>
            </div>
            
            <!-- 投資実績 -->
            <div class="bg-gray-50 rounded-2xl p-4">
              <h3 class="font-bold text-gray-800 mb-3">💰 投資実績サマリー</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="text-center">
                  <div class="text-lg font-bold text-green-600">{{ tradingStats.totalInvestments }}</div>
                  <div class="text-xs text-gray-500">総投資回数</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-blue-600">{{ tradingStats.portfolioValue.toLocaleString() }}</div>
                  <div class="text-xs text-gray-500">ポートフォリオ価値</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-purple-600">{{ tradingStats.totalReturns.toFixed(1) }}%</div>
                  <div class="text-xs text-gray-500">総合収益率</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-orange-600">{{ tradingStats.riskScore }}</div>
                  <div class="text-xs text-gray-500">リスク理解度</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側: QRコード表示エリア -->
        <div class="space-y-6">
          <!-- QRコード生成 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📱 VR Academy 接続QRコード
            </h2>
            
            <!-- QRコード表示エリア -->
            <div class="text-center mb-6">
              <div 
                v-if="generatedQRCode"
                class="inline-block p-6 bg-white rounded-2xl shadow-lg border-4 border-dashed border-purple-300"
              >
                <div class="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                  <!-- QRコードプレースホルダー -->
                  <div class="text-6xl text-gray-400">📱</div>
                </div>
                <div class="text-sm text-gray-600 mb-2">VR Academy Portal</div>
                <div class="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                  {{ generatedQRCode.url }}
                </div>
              </div>
              
              <div v-else class="p-12 border-2 border-dashed border-gray-300 rounded-2xl">
                <div class="text-6xl text-gray-400 mb-4">🔗</div>
                <div class="text-gray-600">QRコードを生成してください</div>
              </div>
            </div>
            
            <!-- QRコード生成ボタン -->
            <div class="space-y-3">
              <button
                @click="generateQRCode"
                :disabled="!canGenerateQR"
                class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ generatedQRCode ? '🔄 QRコードを再生成' : '🚀 VR Portal QRコード生成' }}
              </button>
              
              <button
                v-if="generatedQRCode"
                @click="downloadQRCode"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📥 QRコードをダウンロード
              </button>
              
              <button
                v-if="generatedQRCode"
                @click="shareQRCode"
                class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                🔗 QRコードを共有
              </button>
            </div>
            
            <!-- QRコード情報 -->
            <div v-if="generatedQRCode" class="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
              <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                ℹ️ QRコード情報
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">生成時刻:</span>
                  <span class="font-mono">{{ formatDateTime(generatedQRCode.timestamp) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">有効期限:</span>
                  <span class="font-mono text-red-600">{{ formatDateTime(generatedQRCode.expiresAt) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">セッションID:</span>
                  <span class="font-mono text-xs">{{ generatedQRCode.sessionId }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- VR体験ガイド -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🎮 VR体験ガイド
            </h2>
            
            <div class="space-y-4">
              <!-- ステップガイド -->
              <div class="space-y-3">
                <div
                  v-for="(step, index) in vrGuideSteps"
                  :key="index"
                  class="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                >
                  <div class="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">{{ step.title }}</h3>
                    <p class="text-sm text-gray-600">{{ step.description }}</p>
                  </div>
                  <div class="text-2xl">{{ step.icon }}</div>
                </div>
              </div>
              
              <!-- 注意事項 -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <h3 class="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  ⚠️ VR体験時の注意事項
                </h3>
                <ul class="text-sm text-yellow-700 space-y-1">
                  <li>• VRヘッドセットを清潔な状態で使用してください</li>
                  <li>• 十分な周囲スペースを確保してください</li>
                  <li>• 体調に異変を感じたら即座に中止してください</li>
                  <li>• QRコードの有効期限（24時間）にご注意ください</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- VR Academy 機能プレビュー -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🌟 VR Academy で体験できること
            </h2>
            
            <div class="space-y-3">
              <div
                v-for="feature in vrAcademyFeatures"
                :key="feature.id"
                class="flex items-center gap-4 p-4 bg-gradient-to-r rounded-xl cursor-pointer hover:scale-105 transition-all duration-200"
                :style="{ background: feature.gradient }"
              >
                <div class="text-2xl">{{ feature.icon }}</div>
                <div class="flex-1 text-white">
                  <h3 class="font-bold">{{ feature.title }}</h3>
                  <p class="text-sm opacity-90">{{ feature.description }}</p>
                </div>
                <div class="text-white/70 text-sm">{{ feature.duration }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'

export default {
  name: 'VRQRCodeGenerator',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const floatingVRIcons = ref([])
    const generatedQRCode = ref(null)
    
    // VRプロファイル設定
    const vrProfile = ref({
      playerName: '',
      learningLevel: 'intermediate',
      specialties: [],
      headsetType: 'quest2',
      sessionDuration: '30'
    })
    
    // 利用可能な専門分野
    const availableSpecialties = ref([
      { id: 'phonics', name: '音韻学習', icon: '🍎' },
      { id: 'blending', name: '音韻技術', icon: '🤖' },
      { id: 'grammar', name: '文法構造', icon: '🌙' },
      { id: 'vocabulary', name: '語彙拡張', icon: '📚' },
      { id: 'conversation', name: '会話練習', icon: '💬' },
      { id: 'presentation', name: 'プレゼン', icon: '🎤' }
    ])
    
    // VRガイドステップ
    const vrGuideSteps = ref([
      {
        title: 'QRコードをスキャン',
        description: 'VRヘッドセット内のブラウザでQRコードを読み取ります',
        icon: '📱'
      },
      {
        title: 'VR Academy接続',
        description: 'Spatial.io VR空間に自動的に接続されます',
        icon: '🔗'
      },
      {
        title: 'アバター設定',
        description: 'あなただけのVRアバターをカスタマイズします',
        icon: '👤'
      },
      {
        title: '学習体験開始',
        description: 'Galaxy Trading で学んだスキルをVRで実践します',
        icon: '🚀'
      }
    ])
    
    // VR Academy 機能
    const vrAcademyFeatures = ref([
      {
        id: 'spatial-learning',
        title: '3D空間学習環境',
        description: '没入型の3D空間で英語学習を体験',
        icon: '🌌',
        duration: '15分',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 'avatar-interaction',
        title: 'AIアバター会話',
        description: 'ネイティブAIキャラクターとの自然な会話練習',
        icon: '🤖',
        duration: '20分',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        id: 'investment-simulation',
        title: 'VR投資シミュレーション',
        description: 'Galaxy Trading スキルを3D投資環境で活用',
        icon: '💼',
        duration: '25分',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        id: 'collaborative-learning',
        title: '協調学習セッション',
        description: '他の学習者との共同プロジェクト体験',
        icon: '👥',
        duration: '30分',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
    ])
    
    // === 計算プロパティ ===
    const learningProgress = computed(() => galaxyStore.learningProgress)
    
    const tradingStats = computed(() => {
      const progress = learningProgress.value
      const investments = galaxyStore.playerInvestments.ownedPlanets
      
      return {
        phonicsProgress: Math.round(progress.cvcWord?.progress || 0),
        blendingProgress: Math.round(progress.blendingBuilder?.progress || 0),
        grammarProgress: Math.round(progress.grammar?.progress || 0),
        totalInvestments: investments.length,
        portfolioValue: investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0),
        totalReturns: investments.length > 0 ? 
          investments.reduce((sum, inv) => sum + ((inv.totalReturns || 0) / (inv.cost || 1) * 100), 0) / investments.length : 0,
        riskScore: Math.round((progress.cvcWord?.progress || 0) + (progress.blendingBuilder?.progress || 0) + (progress.grammar?.progress || 0)) / 3
      }
    })
    
    const vrReadinessScore = computed(() => {
      const stats = tradingStats.value
      const baseScore = (stats.phonicsProgress + stats.blendingProgress + stats.grammarProgress) / 3
      const investmentBonus = Math.min(stats.totalInvestments * 5, 20)
      const returnBonus = Math.min(Math.abs(stats.totalReturns), 10)
      
      return Math.min(Math.round(baseScore + investmentBonus + returnBonus), 100)
    })
    
    const canGenerateQR = computed(() => {
      return vrProfile.value.playerName.length >= 3 && 
             vrProfile.value.specialties.length > 0 &&
             vrReadinessScore.value >= 30
    })
    
    // === メソッド ===
    
    /**
     * 浮遊VRアイコンの生成
     */
    const generateFloatingVRIcons = () => {
      const icons = ['🥽', '🌐', '🔮', '💫', '⭐', '🌟', '✨', '💎', '🎯', '🚀']
      floatingVRIcons.value = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 16,
        opacity: Math.random() * 0.6 + 0.2,
        delay: Math.random() * 5,
        rotation: Math.random() * 360,
        icon: icons[Math.floor(Math.random() * icons.length)]
      }))
    }
    
    /**
     * QRコード生成
     */
    const generateQRCode = () => {
      if (!canGenerateQR.value) {
        alert('QRコード生成の条件が満たされていません。\n\n必要条件:\n- プレイヤー名（3文字以上）\n- 専門分野選択（1つ以上）\n- VR準備度スコア（30以上）')
        return
      }
      
      // VRセッション情報の生成
      const sessionId = generateSessionId()
      const timestamp = new Date()
      const expiresAt = new Date(timestamp.getTime() + 24 * 60 * 60 * 1000) // 24時間後
      
      // Galaxy Trading データの暗号化
      const encryptedData = encryptTradingData({
        profile: vrProfile.value,
        stats: tradingStats.value,
        progress: learningProgress.value
      })
      
      // Spatial.io VR URL生成
      const spatialUrl = generateSpatialURL(sessionId, encryptedData)
      
      generatedQRCode.value = {
        sessionId,
        url: spatialUrl,
        timestamp: timestamp.toISOString(),
        expiresAt: expiresAt.toISOString(),
        profile: { ...vrProfile.value },
        encryptedData
      }
      
      // Galaxy Trading システムに記録
      gameStore.recordGalaxyTradingLearning(
        'vr-integration',
        'qr-code-generated',
        25
      )
      
      logger.log('🥽 VR QRコード生成完了:', generatedQRCode.value)
    }
    
    /**
     * セッションID生成
     */
    const generateSessionId = () => {
      const timestamp = Date.now().toString(36)
      const randomStr = Math.random().toString(36).substring(2, 8)
      return `GT-VR-${timestamp}-${randomStr}`.toUpperCase()
    }
    
    /**
     * Trading データの暗号化（シミュレーション）
     */
    const encryptTradingData = (data) => {
      // 実際の実装では適切な暗号化を使用
      const jsonStr = JSON.stringify(data)
      return btoa(jsonStr) // Base64エンコード（デモ用）
    }
    
    /**
     * Spatial.io URL生成
     */
    const generateSpatialURL = (sessionId, encryptedData) => {
      // 実際のSpatial.ioスペースURL（デモ用）
      const spatialSpaceId = 'galaxy-trading-academy-vr'
      const baseUrl = `https://spatial.io/s/${spatialSpaceId}`
      
      // パラメータ付与
      const params = new URLSearchParams({
        session: sessionId,
        source: 'galaxy-trading',
        data: encryptedData.substring(0, 100), // URL長制限対応
        version: '1.0'
      })
      
      return `${baseUrl}?${params.toString()}`
    }
    
    /**
     * QRコードダウンロード
     */
    const downloadQRCode = () => {
      if (!generatedQRCode.value) return
      
      // QRコード画像生成（実際の実装ではQRライブラリを使用）
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 300
      canvas.height = 300
      
      // 簡易QRコード風の描画
      ctx.fillStyle = '#000000'
      for (let i = 0; i < 30; i++) {
        for (let j = 0; j < 30; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * 10, j * 10, 10, 10)
          }
        }
      }
      
      // ダウンロード
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `galaxy-trading-vr-qr-${generatedQRCode.value.sessionId}.png`
        link.click()
        URL.revokeObjectURL(url)
      })
      
      alert('📥 QRコードをダウンロードしました！')
    }
    
    /**
     * QRコード共有
     */
    const shareQRCode = async () => {
      if (!generatedQRCode.value) return
      
      const shareData = {
        title: 'Galaxy Trading VR Academy Portal',
        text: `${vrProfile.value.playerName} さんのVR Academy セッションに参加しよう！`,
        url: generatedQRCode.value.url
      }
      
      if (navigator.share) {
        try {
          await navigator.share(shareData)
          alert('🔗 QRコードを共有しました！')
        } catch (error) {
          copyToClipboard(generatedQRCode.value.url)
        }
      } else {
        copyToClipboard(generatedQRCode.value.url)
      }
    }
    
    /**
     * クリップボードにコピー
     */
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        alert('📋 VR Academy URLをクリップボードにコピーしました！')
      } catch (error) {
        logger.error('クリップボードコピーエラー:', error)
        alert('URLのコピーに失敗しました。手動でコピーしてください。')
      }
    }
    
    /**
     * 日時フォーマット
     */
    const formatDateTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    /**
     * 戻るボタン
     */
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🥽 VR QR Code Generator 初期化')
      generateFloatingVRIcons()
      
      // プレイヤー情報の自動設定
      const player = gameStore.player
      if (player && player.name) {
        vrProfile.value.playerName = player.name
      }
      
      // 学習レベルの自動判定
      const avgProgress = (tradingStats.value.phonicsProgress + tradingStats.value.blendingProgress + tradingStats.value.grammarProgress) / 3
      if (avgProgress >= 80) {
        vrProfile.value.learningLevel = 'expert'
      } else if (avgProgress >= 60) {
        vrProfile.value.learningLevel = 'advanced'
      } else if (avgProgress >= 30) {
        vrProfile.value.learningLevel = 'intermediate'
      } else {
        vrProfile.value.learningLevel = 'beginner'
      }
      
      // 専門分野の自動推薦
      if (tradingStats.value.phonicsProgress >= 50) {
        vrProfile.value.specialties.push('phonics')
      }
      if (tradingStats.value.blendingProgress >= 50) {
        vrProfile.value.specialties.push('blending')
      }
      if (tradingStats.value.grammarProgress >= 50) {
        vrProfile.value.specialties.push('grammar')
      }
    })
    
    return {
      // State
      floatingVRIcons,
      generatedQRCode,
      vrProfile,
      availableSpecialties,
      vrGuideSteps,
      vrAcademyFeatures,
      
      // Computed
      tradingStats,
      vrReadinessScore,
      canGenerateQR,
      
      // Methods
      generateQRCode,
      downloadQRCode,
      shareQRCode,
      formatDateTime,
      handleBack
    }
  }
}
</script>

<style scoped>
.vr-qr-code-generator {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 3D空間グリッドアニメーション */
.border-cyan-400 {
  animation: gridPulse 4s ease-in-out infinite;
}

@keyframes gridPulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.4; }
}

/* 浮遊VRアイコンアニメーション */
.text-cyan-400 {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(90deg); }
  50% { transform: translateY(0px) rotate(180deg); }
  75% { transform: translateY(10px) rotate(270deg); }
}

/* QRコード生成アニメーション */
.border-dashed {
  animation: dashBorder 2s linear infinite;
}

@keyframes dashBorder {
  0% { border-color: rgba(147, 51, 234, 0.3); }
  50% { border-color: rgba(147, 51, 234, 0.8); }
  100% { border-color: rgba(147, 51, 234, 0.3); }
}

/* VR機能カードのホバーエフェクト */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* フォーカス効果 */
.focus\:border-purple-500:focus {
  border-color: rgb(147, 51, 234);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

/* チェックボックススタイル */
input[type="checkbox"]:checked {
  background-color: rgb(147, 51, 234);
  border-color: rgb(147, 51, 234);
}

/* ステップガイドアニメーション */
.space-y-3 > div {
  animation: slideInLeft 0.6s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* VR機能カードアニメーション */
.space-y-3 > div:hover {
  animation: vrCardGlow 1s ease-in-out infinite;
}

@keyframes vrCardGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.1); }
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .grid-cols-1.md\:grid-cols-3 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .grid-cols-2.md\:grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-cols-2.md\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* VR空間の奥行き効果 */
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
</style>