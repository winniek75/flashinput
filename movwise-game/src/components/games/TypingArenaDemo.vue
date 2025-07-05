<template>
  <div class="demo-container min-h-screen galaxy-background">
    <div class="max-w-6xl mx-auto p-6">
      <!-- Demo Header -->
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold galaxy-text-primary mb-4 cosmic-glow">
          🌟 英検タイピング・アリーナ 強化版デモ
        </h1>
        <p class="text-xl text-slate-200 mb-6">
          ストーリーモード搭載の次世代タイピング学習システム
        </p>
        <div class="demo-badges flex gap-4 justify-center flex-wrap">
          <span class="badge">🎮 ストーリーモード</span>
          <span class="badge">🌟 キャラクター育成</span>
          <span class="badge">🐦 ペットシステム</span>
          <span class="badge">⚔️ ボスバトル</span>
          <span class="badge">🏆 実績システム</span>
        </div>
      </div>

      <!-- Demo Navigation -->
      <div class="demo-nav mb-8">
        <div class="nav-container">
          <button
            v-for="section in demoSections"
            :key="section.id"
            @click="currentSection = section.id"
            class="nav-button"
            :class="{'nav-active': currentSection === section.id}"
          >
            <span class="nav-icon">{{ section.icon }}</span>
            <span class="nav-text">{{ section.name }}</span>
          </button>
        </div>
      </div>

      <!-- Demo Content -->
      <div class="demo-content">
        <!-- Overview Section -->
        <div v-if="currentSection === 'overview'" class="demo-section">
          <h2 class="section-title">📋 システム概要</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Story Mode Features -->
            <div class="feature-card">
              <h3 class="card-title">🌌 ストーリーモード</h3>
              <div class="feature-list">
                <div class="feature-item">
                  <span class="feature-icon">🌍</span>
                  <div class="feature-info">
                    <h4>Chapter 1: 地球の危機</h4>
                    <p>言葉食いモンスターとの戦い</p>
                  </div>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🌙</span>
                  <div class="feature-info">
                    <h4>Chapter 2: 月面基地の謎</h4>
                    <p>文法エラーの修復ミッション</p>
                  </div>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🪐</span>
                  <div class="feature-info">
                    <h4>Chapter 3: 火星植民地計画</h4>
                    <p>通信システム構築プロジェクト</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Character System Features -->
            <div class="feature-card">
              <h3 class="card-title">👤 キャラクター育成</h3>
              <div class="feature-list">
                <div class="feature-item">
                  <span class="feature-icon">⚡</span>
                  <div class="feature-info">
                    <h4>6つのステータス</h4>
                    <p>スピード、精度、持久力、語彙力など</p>
                  </div>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🛡️</span>
                  <div class="feature-info">
                    <h4>スキルシステム</h4>
                    <p>アクティブ・パッシブスキル習得</p>
                  </div>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🏆</span>
                  <div class="feature-info">
                    <h4>称号システム</h4>
                    <p>達成度に応じた称号獲得</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Demo Stats -->
          <div class="demo-stats mt-8">
            <h3 class="stats-title">📊 システム統計</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">5</div>
                <div class="stat-label">ストーリー章</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50+</div>
                <div class="stat-label">ステージ数</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">15+</div>
                <div class="stat-label">スキル種類</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">10+</div>
                <div class="stat-label">ペット種類</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Demo Section -->
        <div v-if="currentSection === 'demo'" class="demo-section">
          <h2 class="section-title">🎮 ライブデモ</h2>
          
          <div class="demo-launcher">
            <div class="launcher-card">
              <h3 class="launcher-title">デモを開始</h3>
              <p class="launcher-description">
                実際のゲームプレイを体験してください。デモモードでは制限された機能を試すことができます。
              </p>
              
              <div class="demo-options">
                <button 
                  @click="launchDemo('story')" 
                  class="demo-button story-button"
                >
                  <span class="button-icon">🌌</span>
                  <span class="button-text">ストーリーモード体験</span>
                </button>
                
                <button 
                  @click="launchDemo('practice')" 
                  class="demo-button practice-button"
                >
                  <span class="button-icon">⚡</span>
                  <span class="button-text">練習モード体験</span>
                </button>
              </div>
              
              <!-- Mock Game Preview -->
              <div class="game-preview">
                <div class="preview-screen">
                  <div class="preview-ui">
                    <div class="ui-element character-panel">
                      <div class="panel-title">キャラクター</div>
                      <div class="level-display">Lv.15</div>
                    </div>
                    <div class="ui-element typing-area">
                      <div class="text-display">This is a sample sentence.</div>
                      <div class="keyboard-hint">キーボードガイド表示</div>
                    </div>
                    <div class="ui-element pet-helper">
                      <div class="pet-icon">🐦</div>
                      <div class="pet-name">アルファベット・バード</div>
                    </div>
                  </div>
                </div>
                <p class="preview-caption">ゲーム画面プレビュー</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Technical Section -->
        <div v-if="currentSection === 'technical'" class="demo-section">
          <h2 class="section-title">⚙️ 技術仕様</h2>
          
          <div class="tech-grid">
            <!-- Architecture -->
            <div class="tech-card">
              <h3 class="tech-title">🏗️ アーキテクチャ</h3>
              <div class="tech-content">
                <div class="tech-item">
                  <span class="tech-label">フレームワーク:</span>
                  <span class="tech-value">Vue.js 3 + Composition API</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">状態管理:</span>
                  <span class="tech-value">Pinia</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">スタイリング:</span>
                  <span class="tech-value">Tailwind CSS</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">データ永続化:</span>
                  <span class="tech-value">LocalStorage + JSON</span>
                </div>
              </div>
            </div>

            <!-- Performance -->
            <div class="tech-card">
              <h3 class="tech-title">⚡ パフォーマンス</h3>
              <div class="tech-content">
                <div class="perf-metric">
                  <div class="metric-name">初期ロード時間</div>
                  <div class="metric-bar">
                    <div class="metric-fill" style="width: 85%"></div>
                  </div>
                  <div class="metric-value">< 2秒</div>
                </div>
                <div class="perf-metric">
                  <div class="metric-name">タイピング応答性</div>
                  <div class="metric-bar">
                    <div class="metric-fill" style="width: 95%"></div>
                  </div>
                  <div class="metric-value">< 50ms</div>
                </div>
                <div class="perf-metric">
                  <div class="metric-name">メモリ使用量</div>
                  <div class="metric-bar">
                    <div class="metric-fill" style="width: 70%"></div>
                  </div>
                  <div class="metric-value">< 100MB</div>
                </div>
              </div>
            </div>

            <!-- Components -->
            <div class="tech-card">
              <h3 class="tech-title">🧩 コンポーネント構成</h3>
              <div class="component-tree">
                <div class="tree-node">
                  <span class="node-icon">📁</span>
                  <span class="node-name">TypingArenaEnhanced.vue</span>
                </div>
                <div class="tree-children">
                  <div class="tree-node">
                    <span class="node-icon">📄</span>
                    <span class="node-name">StoryModeHub.vue</span>
                  </div>
                  <div class="tree-node">
                    <span class="node-icon">📄</span>
                    <span class="node-name">CharacterStatusPanel.vue</span>
                  </div>
                  <div class="tree-node">
                    <span class="node-icon">📄</span>
                    <span class="node-name">BossBattleUI.vue</span>
                  </div>
                  <div class="tree-node">
                    <span class="node-icon">📄</span>
                    <span class="node-name">PetHelper.vue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Code Examples Section -->
        <div v-if="currentSection === 'code'" class="demo-section">
          <h2 class="section-title">💻 コード例</h2>
          
          <div class="code-examples">
            <!-- Store Usage -->
            <div class="code-block">
              <h3 class="code-title">ストア使用例</h3>
              <pre class="code-content"><code>{{ storeExample }}</code></pre>
            </div>

            <!-- Component Usage -->
            <div class="code-block">
              <h3 class="code-title">コンポーネント使用例</h3>
              <pre class="code-content"><code>{{ componentExample }}</code></pre>
            </div>

            <!-- Custom Configuration -->
            <div class="code-block">
              <h3 class="code-title">カスタム設定例</h3>
              <pre class="code-content"><code>{{ configExample }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Demo Footer -->
      <div class="demo-footer mt-12 text-center">
        <div class="footer-content">
          <h3 class="footer-title">🚀 導入をお考えですか？</h3>
          <p class="footer-description">
            英検タイピング・アリーナ強化版で、効果的で楽しい英語学習を実現しましょう。
          </p>
          <div class="footer-actions">
            <button class="action-button primary">
              📥 ダウンロード
            </button>
            <button class="action-button secondary">
              📋 ドキュメント
            </button>
            <button class="action-button secondary">
              💬 お問い合わせ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actual Game Modal -->
    <div v-if="showGameModal" class="game-modal-overlay" @click="closeGameModal">
      <div class="game-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ demoMode === 'story' ? 'ストーリーモード' : '練習モード' }}デモ
          </h3>
          <button @click="closeGameModal" class="close-button">×</button>
        </div>
        <div class="modal-content">
          <!-- Here would be the actual TypingArenaEnhanced component -->
          <div class="demo-placeholder">
            <div class="placeholder-icon">🎮</div>
            <h4 class="placeholder-title">デモ準備中...</h4>
            <p class="placeholder-text">
              実際のゲームコンポーネントがここに表示されます。
              本実装では TypingArenaEnhanced コンポーネントを読み込みます。
            </p>
            <button @click="startDemoGame" class="start-demo-button">
              デモ開始
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Demo state
const currentSection = ref('overview')
const showGameModal = ref(false)
const demoMode = ref('')

// Demo sections
const demoSections = [
  { id: 'overview', name: '概要', icon: '📋' },
  { id: 'demo', name: 'ライブデモ', icon: '🎮' },
  { id: 'technical', name: '技術仕様', icon: '⚙️' },
  { id: 'code', name: 'コード例', icon: '💻' }
]

// Code examples
const storeExample = `import { useTypingArenaStore } from '@/stores/typingArenaStore'

const arenaStore = useTypingArenaStore()

// キャラクターレベルアップ
arenaStore.gainExperience(150)

// ペットの親密度向上
arenaStore.feedPet('alphabetBird', 'premium')

// 進捗保存
arenaStore.saveProgress()`

const componentExample = `<template>
  <TypingArenaEnhanced 
    @game-completed="handleGameCompleted"
    @character-levelup="handleLevelUp"
  />
</template>

<script setup>
import TypingArenaEnhanced from '@/components/games/TypingArenaEnhanced.vue'

function handleGameCompleted(results) {
  console.log('Game completed:', results)
}

function handleLevelUp(newLevel) {
  console.log('Level up!', newLevel)
}
</script>`

const configExample = `// カスタムストーリーコンテンツ
const customStory = {
  chapters: {
    6: {
      id: 'spaceStation',
      name: '宇宙ステーション防衛',
      description: 'エイリアンの襲撃から宇宙ステーションを守れ',
      stages: 15,
      bossId: 'alienCommander'
    }
  }
}

// カスタムペット
const customPets = {
  robotCat: {
    name: 'ロボキャット',
    type: 'テクニカル',
    abilities: {
      autoCorrect: {
        name: '自動修正',
        description: 'タイプミスを自動で修正'
      }
    }
  }
}`

// Methods
function launchDemo(mode) {
  demoMode.value = mode
  showGameModal.value = true
}

function closeGameModal() {
  showGameModal.value = false
  demoMode.value = ''
}

function startDemoGame() {
  // In actual implementation, this would initialize the game
  alert(`${demoMode.value}モードのデモを開始します！`)
}
</script>

<style scoped>
/* Galaxy background */
.galaxy-background {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
}

/* Demo badges */
.demo-badges {
  @apply flex gap-3 justify-center flex-wrap;
}

.badge {
  @apply px-4 py-2 rounded-full text-sm font-semibold;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.8), rgba(168, 85, 247, 0.8));
  color: white;
  border: 1px solid rgba(147, 51, 234, 0.6);
}

/* Navigation */
.nav-container {
  @apply flex gap-2 justify-center flex-wrap p-2 rounded-2xl;
  background: linear-gradient(135deg, rgba(30, 30, 60, 0.8), rgba(40, 40, 80, 0.8));
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.nav-button {
  @apply flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.nav-button.nav-active {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
}

.nav-button:hover:not(.nav-active) {
  background: rgba(147, 51, 234, 0.2);
  color: white;
}

.nav-icon {
  @apply text-lg;
}

.nav-text {
  @apply font-semibold;
}

/* Demo sections */
.demo-section {
  @apply w-full;
}

.section-title {
  @apply text-3xl font-bold text-white mb-8 text-center;
  text-shadow: 0 0 20px rgba(147, 51, 234, 0.8);
}

/* Feature cards */
.feature-card {
  @apply p-6 rounded-2xl;
  background: linear-gradient(135deg, rgba(60, 60, 120, 0.6), rgba(40, 40, 80, 0.6));
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.card-title {
  @apply text-xl font-bold text-white mb-4;
}

.feature-list {
  @apply space-y-4;
}

.feature-item {
  @apply flex items-start gap-3;
}

.feature-icon {
  @apply text-2xl mt-1;
}

.feature-info h4 {
  @apply font-bold text-white mb-1;
}

.feature-info p {
  @apply text-sm text-slate-300;
}

/* Demo stats */
.demo-stats {
  @apply p-6 rounded-2xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.8), rgba(60, 60, 120, 0.8));
  border: 2px solid rgba(34, 197, 94, 0.4);
}

.stats-title {
  @apply text-2xl font-bold text-green-400 mb-6 text-center;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-6;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply text-3xl font-bold text-green-400 mb-2;
}

.stat-label {
  @apply text-sm text-slate-300;
}

/* Demo launcher */
.launcher-card {
  @apply p-8 rounded-3xl text-center;
  background: linear-gradient(135deg, rgba(60, 60, 120, 0.8), rgba(40, 40, 80, 0.8));
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.launcher-title {
  @apply text-2xl font-bold text-white mb-4;
}

.launcher-description {
  @apply text-slate-200 mb-8;
}

.demo-options {
  @apply flex gap-4 justify-center mb-8 flex-wrap;
}

.demo-button {
  @apply flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200;
  border: none;
  cursor: pointer;
}

.story-button {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
}

.practice-button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.demo-button:hover {
  @apply transform scale-105;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Game preview */
.game-preview {
  @apply mt-8;
}

.preview-screen {
  @apply p-4 rounded-xl mb-4;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e);
  border: 2px solid rgba(147, 51, 234, 0.6);
  aspect-ratio: 16/10;
}

.preview-ui {
  @apply grid grid-cols-3 gap-4 h-full;
}

.ui-element {
  @apply p-3 rounded-lg;
  background: rgba(60, 60, 120, 0.4);
  border: 1px solid rgba(147, 51, 234, 0.4);
}

.panel-title {
  @apply text-xs text-slate-400 mb-1;
}

.level-display {
  @apply text-lg font-bold text-yellow-400;
}

.text-display {
  @apply text-sm text-white mb-2;
}

.keyboard-hint {
  @apply text-xs text-slate-400;
}

.pet-icon {
  @apply text-xl mb-1;
}

.pet-name {
  @apply text-xs text-blue-400;
}

.preview-caption {
  @apply text-sm text-slate-400 text-center;
}

/* Technical cards */
.tech-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.tech-card {
  @apply p-6 rounded-2xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.8), rgba(60, 60, 120, 0.8));
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.tech-title {
  @apply text-xl font-bold text-white mb-4;
}

.tech-content {
  @apply space-y-3;
}

.tech-item {
  @apply flex flex-col gap-1;
}

.tech-label {
  @apply text-sm text-slate-400;
}

.tech-value {
  @apply text-white font-semibold;
}

/* Performance metrics */
.perf-metric {
  @apply mb-4;
}

.metric-name {
  @apply text-sm text-slate-300 mb-2;
}

.metric-bar {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-1;
}

.metric-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500;
}

.metric-value {
  @apply text-xs text-green-400 font-mono;
}

/* Component tree */
.component-tree {
  @apply space-y-2;
}

.tree-node {
  @apply flex items-center gap-2 text-sm;
}

.tree-children {
  @apply ml-6 space-y-1;
}

.node-icon {
  @apply text-blue-400;
}

.node-name {
  @apply text-white font-mono;
}

/* Code blocks */
.code-examples {
  @apply space-y-6;
}

.code-block {
  @apply rounded-2xl overflow-hidden;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.9), rgba(30, 30, 50, 0.9));
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.code-title {
  @apply text-lg font-bold text-white p-4 pb-2;
}

.code-content {
  @apply p-4 pt-0 text-sm text-slate-200 font-mono overflow-x-auto;
  background: rgba(0, 0, 0, 0.3);
}

/* Footer */
.demo-footer {
  @apply p-8 rounded-3xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.8), rgba(60, 60, 120, 0.8));
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.footer-title {
  @apply text-2xl font-bold text-white mb-4;
}

.footer-description {
  @apply text-slate-200 mb-6;
}

.footer-actions {
  @apply flex gap-4 justify-center flex-wrap;
}

.action-button {
  @apply px-6 py-3 rounded-2xl font-bold transition-all duration-200;
  border: none;
  cursor: pointer;
}

.action-button.primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
}

.action-button.secondary {
  background: linear-gradient(135deg, rgba(100, 100, 140, 0.8), rgba(80, 80, 120, 0.8));
  color: white;
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.action-button:hover {
  @apply transform scale-105;
}

/* Game modal */
.game-modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.game-modal {
  @apply w-full h-full max-w-6xl max-h-5xl m-4 rounded-3xl overflow-hidden;
  background: linear-gradient(135deg, rgba(30, 30, 60, 0.95), rgba(40, 40, 80, 0.95));
  border: 2px solid rgba(147, 51, 234, 0.6);
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-slate-600;
}

.modal-title {
  @apply text-2xl font-bold text-white;
}

.close-button {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  cursor: pointer;
}

.modal-content {
  @apply flex-1 p-6;
}

.demo-placeholder {
  @apply text-center py-20;
}

.placeholder-icon {
  @apply text-8xl mb-6;
}

.placeholder-title {
  @apply text-3xl font-bold text-white mb-4;
}

.placeholder-text {
  @apply text-lg text-slate-200 mb-8 max-w-md mx-auto;
}

.start-demo-button {
  @apply px-8 py-4 rounded-2xl font-bold text-xl;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  cursor: pointer;
}

/* Shared styles */
.galaxy-text-primary {
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.5);
}

.cosmic-glow {
  text-shadow: 0 0 20px rgba(147, 51, 234, 0.8);
}

/* Responsive design */
@media (max-width: 768px) {
  .demo-nav .nav-container {
    @apply flex-col gap-1;
  }
  
  .demo-options {
    @apply flex-col;
  }
  
  .footer-actions {
    @apply flex-col;
  }
  
  .game-modal {
    @apply m-2;
  }
}
</style>