<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/')" 
              class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all border border-slate-600/50"
            >
              <span class="text-xl">🏠</span>
              <span class="text-sm text-slate-300">ホーム</span>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="galaxy-stats-card">
              <span class="text-2xl cosmic-glow">🥽</span>
              <div class="text-left">
                <div class="text-sm text-galaxy-moon-silver">VRレベル</div>
                <div class="text-xl font-bold galaxy-text-primary">{{ vrLevel }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-yellow-400 cosmic-title mb-4">
            🥽 VR Academy - Virtual Reality Learning Space
          </h1>
          <p class="text-xl mb-2 text-slate-400">
            Spatial.io 統合型 3D 没入学習環境
          </p>
          <p class="text-base text-slate-400 max-w-3xl mx-auto">
            仮想現実空間で実践的な英語コミュニケーションを体験し、空間認識と言語習得を同時に向上させよう
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 px-6 pb-20">
      <div class="max-w-6xl mx-auto">

        <!-- VR Readiness Check -->
        <section class="mb-12">
          <div class="galaxy-card p-8">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold galaxy-text-primary cosmic-title mb-4">
                🔍 VR環境準備状況
              </h2>
              <p class="text-galaxy-moon-silver">
                最適なVR学習体験のための環境チェック
              </p>
            </div>

            <div class="readiness-grid">
              <div class="readiness-item" :class="{ 'ready': vrReadiness.deviceCompatible }">
                <div class="readiness-icon">📱</div>
                <div class="readiness-content">
                  <h3>デバイス対応</h3>
                  <p v-if="vrReadiness.deviceCompatible" class="status-text success">
                    ✅ VR対応デバイスが検出されました
                  </p>
                  <p v-else class="status-text warning">
                    ⚠️ VRデバイスを接続してください
                  </p>
                </div>
              </div>

              <div class="readiness-item" :class="{ 'ready': vrReadiness.spatialIOReady }">
                <div class="readiness-icon">🌐</div>
                <div class="readiness-content">
                  <h3>Spatial.io 接続</h3>
                  <p v-if="vrReadiness.spatialIOReady" class="status-text success">
                    ✅ Spatial.io に接続済み
                  </p>
                  <p v-else class="status-text warning">
                    ⚠️ Spatial.io への接続を確認中...
                  </p>
                </div>
              </div>

              <div class="readiness-item" :class="{ 'ready': vrReadiness.permissionsGranted }">
                <div class="readiness-icon">🔒</div>
                <div class="readiness-content">
                  <h3>権限設定</h3>
                  <p v-if="vrReadiness.permissionsGranted" class="status-text success">
                    ✅ 必要な権限が許可されています
                  </p>
                  <p v-else class="status-text warning">
                    ⚠️ カメラ・マイク権限を許可してください
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8 text-center">
              <button 
                @click="checkVRReadiness" 
                class="galaxy-button galaxy-button-primary mr-4"
                :disabled="isCheckingReadiness"
              >
                <span v-if="isCheckingReadiness">🔄 チェック中...</span>
                <span v-else>🔍 再チェック</span>
              </button>
              
              <button 
                @click="showSetupGuide = true" 
                class="galaxy-button galaxy-button-secondary"
              >
                📖 セットアップガイド
              </button>
            </div>
          </div>
        </section>

        <!-- VR Learning Environments -->
        <section class="mb-12">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold galaxy-text-primary cosmic-title mb-4">
              🌌 VR学習環境
            </h2>
            <p class="text-galaxy-moon-silver">
              目的に応じた没入型学習空間を選択してください
            </p>
          </div>

          <div class="vr-environments-grid">
            <!-- Conversation Lounge -->
            <div class="vr-environment-card" @click="enterVREnvironment('conversation')">
              <div class="environment-preview">
                <div class="environment-icon">💬</div>
                <div class="environment-bg conversation-bg"></div>
              </div>
              <div class="environment-info">
                <h3>Conversation Lounge</h3>
                <p>リラックスした環境での日常会話練習</p>
                <div class="environment-features">
                  <span class="feature-tag">🎯 日常会話</span>
                  <span class="feature-tag">👥 マルチプレイヤー</span>
                  <span class="feature-tag">🎵 BGM</span>
                </div>
                <div class="environment-stats">
                  <span>参加者: {{ environmentStats.conversation.activeUsers }}</span>
                  <span>レベル: 初級〜中級</span>
                </div>
              </div>
            </div>

            <!-- Business Simulation -->
            <div class="vr-environment-card" @click="enterVREnvironment('business')">
              <div class="environment-preview">
                <div class="environment-icon">💼</div>
                <div class="environment-bg business-bg"></div>
              </div>
              <div class="environment-info">
                <h3>Business Simulation</h3>
                <p>ビジネスシーンでの実践的コミュニケーション</p>
                <div class="environment-features">
                  <span class="feature-tag">💼 ビジネス英語</span>
                  <span class="feature-tag">📊 プレゼン練習</span>
                  <span class="feature-tag">🤝 交渉シミュレーション</span>
                </div>
                <div class="environment-stats">
                  <span>参加者: {{ environmentStats.business.activeUsers }}</span>
                  <span>レベル: 中級〜上級</span>
                </div>
              </div>
            </div>

            <!-- Cultural Exchange -->
            <div class="vr-environment-card" @click="enterVREnvironment('cultural')">
              <div class="environment-preview">
                <div class="environment-icon">🗾</div>
                <div class="environment-bg cultural-bg"></div>
              </div>
              <div class="environment-info">
                <h3>Cultural Exchange</h3>
                <p>世界各国の文化を体験しながら学習</p>
                <div class="environment-features">
                  <span class="feature-tag">🌍 文化体験</span>
                  <span class="feature-tag">🎭 ロールプレイ</span>
                  <span class="feature-tag">🎨 アート鑑賞</span>
                </div>
                <div class="environment-stats">
                  <span>参加者: {{ environmentStats.cultural.activeUsers }}</span>
                  <span>レベル: 全レベル</span>
                </div>
              </div>
            </div>

            <!-- Grammar Galaxy VR -->
            <div class="vr-environment-card" @click="enterVREnvironment('grammar')">
              <div class="environment-preview">
                <div class="environment-icon">⭐</div>
                <div class="environment-bg grammar-bg"></div>
              </div>
              <div class="environment-info">
                <h3>Grammar Galaxy VR</h3>
                <p>3D空間での文法構造視覚化学習</p>
                <div class="environment-features">
                  <span class="feature-tag">📚 文法学習</span>
                  <span class="feature-tag">🔮 3D可視化</span>
                  <span class="feature-tag">🧩 インタラクティブ</span>
                </div>
                <div class="environment-stats">
                  <span>参加者: {{ environmentStats.grammar.activeUsers }}</span>
                  <span>レベル: 初級〜上級</span>
                </div>
              </div>
            </div>

            <!-- ECHO AI Practice System -->
            <div class="vr-environment-card special-environment" @click="navigateToECHOPractice">
              <div class="environment-preview">
                <div class="environment-icon">🤖</div>
                <div class="environment-bg echo-bg"></div>
                <div class="available-badge">Available Now!</div>
              </div>
              <div class="environment-info">
                <h3>ECHO AI Practice System</h3>
                <p>AI練習相手と安全に会話練習 - VRアカデミー準備システム</p>
                <div class="environment-features">
                  <span class="feature-tag">🎯 個別指導</span>
                  <span class="feature-tag">💬 会話練習</span>
                  <span class="feature-tag">🌟 失敗を恐れない環境</span>
                </div>
                <div class="environment-stats">
                  <span>AI指導: 24/7対応</span>
                  <span>レベル: 全レベル対応</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- QR Code Section -->
        <section class="mb-12" v-if="showQRCode">
          <div class="galaxy-card p-8 text-center">
            <h2 class="text-2xl font-bold galaxy-text-primary mb-4">
              📱 モバイルVRアクセス
            </h2>
            <p class="text-galaxy-moon-silver mb-6">
              スマートフォンでQRコードをスキャンしてVR学習空間に参加
            </p>
            
            <div class="qr-code-container">
              <div class="qr-code-placeholder" v-if="!qrCodeData">
                <div class="qr-loading">🔄 QRコード生成中...</div>
              </div>
              <img v-else :src="qrCodeData" alt="VR Access QR Code" class="qr-code" />
            </div>
            
            <p class="text-sm text-galaxy-moon-silver mt-4">
              QRコードは60秒間有効です
            </p>
            
            <button 
              @click="generateQRCode" 
              class="galaxy-button galaxy-button-secondary mt-4"
            >
              🔄 新しいQRコードを生成
            </button>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions-section">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold galaxy-text-primary cosmic-title mb-4">
              ⚡ クイックアクション
            </h2>
          </div>
          
          <div class="quick-actions-grid">
            <button 
              @click="quickJoinSession"
              class="action-card primary-action"
              :disabled="!allSystemsReady"
            >
              <div class="action-icon">🚀</div>
              <div class="action-content">
                <h3>即座にVR学習開始</h3>
                <p>利用可能な環境で今すぐVR学習を開始</p>
              </div>
            </button>
            
            <button 
              @click="showQRCode = !showQRCode"
              class="action-card secondary-action"
            >
              <div class="action-icon">📱</div>
              <div class="action-content">
                <h3>モバイルアクセス</h3>
                <p>QRコードでスマートフォンからアクセス</p>
              </div>
            </button>
            
            <button 
              @click="openVRSettings"
              class="action-card secondary-action"
            >
              <div class="action-icon">⚙️</div>
              <div class="action-content">
                <h3>VR設定</h3>
                <p>VR環境の個人設定とカスタマイズ</p>
              </div>
            </button>
            
            <button 
              @click="viewVRProgress"
              class="action-card secondary-action"
            >
              <div class="action-icon">📊</div>
              <div class="action-content">
                <h3>学習進捗</h3>
                <p>VR学習セッションの記録と分析</p>
              </div>
            </button>
          </div>
        </section>

      </div>
    </main>

    <!-- Setup Guide Modal -->
    <div v-if="showSetupGuide" class="modal-overlay" @click="showSetupGuide = false">
      <div class="modal-content setup-guide" @click.stop>
        <div class="modal-header">
          <h3>🥽 VRセットアップガイド</h3>
          <button @click="showSetupGuide = false" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="setup-steps">
            <div class="setup-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>VRデバイス準備</h4>
                <p>VRヘッドセット（Oculus, HTC Vive等）またはスマートフォン + VRゴーグルを準備</p>
              </div>
            </div>
            <div class="setup-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>ブラウザ設定</h4>
                <p>WebXR対応ブラウザ（Chrome, Firefox等）でカメラ・マイク権限を許可</p>
              </div>
            </div>
            <div class="setup-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Spatial.io接続</h4>
                <p>自動的にSpatial.ioプラットフォームに接続し、VR学習空間にアクセス</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showSetupGuide = false" class="btn-primary">理解しました</button>
        </div>
      </div>
    </div>

    <!-- Common Footer -->
    <CommonFooter 
      :active="'academy'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { vrIntegrationService } from '@/services/vrIntegration'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'VRAcademyHub',
  components: {
    CommonFooter
  },
  setup() {
    const router = useRouter()

    // Reactive state
    const vrLevel = ref(1)
    const isCheckingReadiness = ref(false)
    const showSetupGuide = ref(false)
    const showQRCode = ref(false)
    const qrCodeData = ref(null)

    // VR Readiness state
    const vrReadiness = ref({
      deviceCompatible: false,
      spatialIOReady: false,
      permissionsGranted: false
    })

    // Environment statistics
    const environmentStats = ref({
      conversation: { activeUsers: 12 },
      business: { activeUsers: 8 },
      cultural: { activeUsers: 15 },
      grammar: { activeUsers: 6 }
    })

    // Computed properties
    const allSystemsReady = computed(() => {
      return vrReadiness.value.deviceCompatible && 
             vrReadiness.value.spatialIOReady && 
             vrReadiness.value.permissionsGranted
    })

    // Methods
    const checkVRReadiness = async () => {
      isCheckingReadiness.value = true
      
      try {
        // Check device compatibility
        vrReadiness.value.deviceCompatible = await vrIntegrationService.checkDeviceCompatibility()
        
        // Check Spatial.io connection
        vrReadiness.value.spatialIOReady = await vrIntegrationService.checkSpatialIOConnection()
        
        // Check permissions
        vrReadiness.value.permissionsGranted = await vrIntegrationService.checkPermissions()
        
      } catch (error) {
        console.error('VR readiness check failed:', error)
      } finally {
        isCheckingReadiness.value = false
      }
    }

    const generateQRCode = async () => {
      try {
        qrCodeData.value = await vrIntegrationService.generateVRSessionQR('user123')
      } catch (error) {
        console.error('QR code generation failed:', error)
      }
    }

    const enterVREnvironment = async (environment) => {
      if (!allSystemsReady.value) {
        alert('VR環境の準備が完了していません。環境チェックを実行してください。')
        return
      }

      try {
        await vrIntegrationService.joinVREnvironment(environment, 'user123')
      } catch (error) {
        console.error('Failed to enter VR environment:', error)
        alert('VR環境への接続に失敗しました。しばらく後にもう一度お試しください。')
      }
    }

    const quickJoinSession = async () => {
      if (!allSystemsReady.value) {
        alert('VR環境の準備が完了していません。環境チェックを実行してください。')
        return
      }

      // Join the most suitable environment based on user level
      const environment = vrLevel.value <= 2 ? 'conversation' : 'business'
      await enterVREnvironment(environment)
    }

    const openVRSettings = () => {
      alert('🚧 VR設定機能は開発中です！\n\n将来的には以下を設定可能：\n• VRコントローラー設定\n• 快適性オプション\n• アバター設定\n• 音声設定')
    }

    const viewVRProgress = () => {
      alert('📊 VR学習進捗機能は開発中です！\n\n将来的には以下を確認可能：\n• VRセッション履歴\n• 学習時間統計\n• スキル向上グラフ\n• 達成バッジ')
    }

    const navigateToECHOPractice = () => {
      router.push('/vr-academy/echo-practice')
    }

    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure');
          break;
        case 'grammar':
          router.push('/grammar-galaxy-hub');
          break;
        case 'multi-layer':
          router.push('/multi-layer');
          break;
        case 'co-pilot':
          router.push('/co-pilot-dock');
          break;
        case 'vr-academy':
          // Already on this page
          break;
        default:
          console.warn('Unknown navigation section:', section);
      }
    };

    // Lifecycle
    onMounted(() => {
      checkVRReadiness()
      
      // Generate initial QR code
      generateQRCode()
      
      // Simulate environment stats updates
      setInterval(() => {
        environmentStats.value.conversation.activeUsers = Math.floor(Math.random() * 20) + 5
        environmentStats.value.business.activeUsers = Math.floor(Math.random() * 15) + 3
        environmentStats.value.cultural.activeUsers = Math.floor(Math.random() * 25) + 8
        environmentStats.value.grammar.activeUsers = Math.floor(Math.random() * 12) + 2
      }, 30000)
    })

    return {
      // State
      vrLevel,
      isCheckingReadiness,
      showSetupGuide,
      showQRCode,
      qrCodeData,
      vrReadiness,
      environmentStats,
      
      // Computed
      allSystemsReady,
      
      // Methods
      checkVRReadiness,
      generateQRCode,
      enterVREnvironment,
      quickJoinSession,
      openVRSettings,
      viewVRProgress,
      navigateToECHOPractice,
      handleFooterNavigation
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.galaxy-background {
  background: var(--space-void, linear-gradient(135deg, #0f172a 0%, #1e293b 100%));
  color: white;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

/* VR Readiness */
.readiness-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.readiness-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(239, 68, 68, 0.5);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.readiness-item.ready {
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.1);
}

.readiness-icon {
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.readiness-content h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #fbbf24;
}

.status-text {
  font-size: 0.9rem;
}

.status-text.success {
  color: #22c55e;
}

.status-text.warning {
  color: #f59e0b;
}

/* VR Environments */
.vr-environments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.vr-environment-card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
}

.vr-environment-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2);
}

.environment-preview {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.environment-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
}

.environment-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.6;
}

.conversation-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.business-bg {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.cultural-bg {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.grammar-bg {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.echo-bg {
  background: linear-gradient(135deg, #00BFFF 0%, #FFB6C1 50%, #00BFFF 100%);
}

.special-environment {
  position: relative;
  border-color: rgba(0, 191, 255, 0.6) !important;
}

.special-environment:hover {
  border-color: rgba(0, 191, 255, 0.8) !important;
  box-shadow: 0 15px 40px rgba(0, 191, 255, 0.3) !important;
}

.available-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.environment-info {
  padding: 20px;
}

.environment-info h3 {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 8px;
}

.environment-info p {
  color: #94a3b8;
  margin-bottom: 15px;
}

.environment-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.feature-tag {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.environment-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #64748b;
}

/* QR Code */
.qr-code-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-code-placeholder {
  width: 200px;
  height: 200px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px dashed rgba(99, 102, 241, 0.5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-loading {
  color: #94a3b8;
  font-size: 1.1rem;
}

.qr-code {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  border: 2px solid rgba(99, 102, 241, 0.5);
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  padding: 25px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

.action-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-card:disabled:hover {
  transform: none;
  box-shadow: none;
}

.primary-action {
  border-color: rgba(34, 197, 94, 0.6);
}

.primary-action:hover {
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
}

.secondary-action:hover {
  border-color: rgba(99, 102, 241, 0.6);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.action-content h3 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 8px;
}

.action-content p {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.4);
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid rgba(99, 102, 241, 0.3);
  text-align: center;
}

/* Setup Guide */
.setup-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setup-step {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.step-number {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 5px;
}

.step-content p {
  color: #94a3b8;
  line-height: 1.5;
}

/* Buttons */
.galaxy-button {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.galaxy-button-primary:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

.galaxy-button-secondary {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.galaxy-button-secondary:hover {
  background: rgba(99, 102, 241, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .readiness-grid {
    grid-template-columns: 1fr;
  }
  
  .vr-environments-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .environment-features {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .environment-stats {
    flex-direction: column;
    gap: 5px;
  }
}

/* Galaxy Stats Card */
.galaxy-stats-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(20px);
}

.cosmic-glow {
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
}

.galaxy-text-primary {
  color: #fbbf24;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.cosmic-title {
  background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.3));
}

.galaxy-card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.galaxy-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
}
</style>