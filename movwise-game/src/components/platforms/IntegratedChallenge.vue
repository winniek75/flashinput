<template>
  <div class="min-h-screen galaxy-background p-6 relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <div class="platform-header">
      <button @click="$router.push('/')" class="back-button">
        ← ホームに戻る
      </button>
      <div class="platform-title">
        <h1 class="title-text">🏆 総合スキル・チャレンジ</h1>
        <p class="subtitle-text">全スキルを駆使した最終チャレンジ</p>
      </div>
    </div>

    <!-- Content -->
    <div class="platform-content">
      <div class="coming-soon-card">
        <div class="coming-soon-icon">🚧</div>
        <h2>Coming Soon!</h2>
        <p>総合スキル・チャレンジは現在開発中です。</p>
        <div class="features-preview">
          <div class="feature-item">🎧 リスニング・チャレンジ</div>
          <div class="feature-item">🗣️ スピーキング・テスト</div>
          <div class="feature-item">📖 読解チャレンジ</div>
          <div class="feature-item">✍️ ライティング・チャレンジ</div>
          <div class="feature-item">🎓 マスター認定試験</div>
        </div>
        <p class="development-note">
          各プラットフォーム（フォニックス、文法、語彙、タイピング）の進捗に応じて、段階的にアンロックされる予定です。
        </p>
      </div>

      <!-- Current Skills Overview -->
      <div class="skills-overview">
        <h3>現在のスキル状況</h3>
        <div class="skill-grid">
          <div class="skill-card">
            <div class="skill-icon">🎵</div>
            <div class="skill-name">フォニックス</div>
            <div class="skill-level">Lv.{{ progressStore.sections.phonicsAdventure.level }}</div>
          </div>
          <div class="skill-card">
            <div class="skill-icon">🌌</div>
            <div class="skill-name">文法</div>
            <div class="skill-level">Lv.{{ progressStore.sections.grammarGalaxy.level }}</div>
          </div>
          <div class="skill-card">
            <div class="skill-icon">🌍</div>
            <div class="skill-name">語彙</div>
            <div class="skill-level">Lv.{{ progressStore.sections.vocabularyWorld.level }}</div>
          </div>
          <div class="skill-card">
            <div class="skill-icon">⌨️</div>
            <div class="skill-name">タイピング</div>
            <div class="skill-level">Lv.{{ progressStore.sections.typingArena.level }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useProgressStore } from '@/stores/progress'

export default {
  name: 'IntegratedChallenge',
  setup() {
    const progressStore = useProgressStore()

    return {
      progressStore
    }
  }
}
</script>

<style scoped>
.galaxy-background {
  background: linear-gradient(135deg, #1e1e3a 0%, #7c2d12 50%, #0f0f23 100%);
  color: white;
}

.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
    radial-gradient(circle at 40% 20%, white 1px, transparent 1px),
    radial-gradient(circle at 90% 80%, white 1px, transparent 1px);
  background-size: 100px 100px, 80px 80px, 120px 120px;
  opacity: 0.6;
  animation: sparkle 8s ease-in-out infinite;
}

.stars-layer-2 { animation-delay: -2s; opacity: 0.4; }
.stars-layer-3 { animation-delay: -4s; opacity: 0.2; }

@keyframes sparkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.2; }
}

.platform-header {
  position: relative;
  z-index: 10;
  margin-bottom: 3rem;
}

.back-button {
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.platform-title {
  text-align: center;
}

.title-text {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ef4444, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
}

.platform-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
}

.coming-soon-card {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(20px);
  margin-bottom: 3rem;
}

.coming-soon-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.coming-soon-card h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ef4444;
}

.coming-soon-card p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.features-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.feature-item {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.development-note {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.skills-overview {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(20px);
}

.skills-overview h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #ef4444;
  text-align: center;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.skill-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.8rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-2px);
  border-color: rgba(239, 68, 68, 0.3);
}

.skill-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.skill-name {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

.skill-level {
  font-size: 1.5rem;
  font-weight: bold;
  color: #60a5fa;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

@media (max-width: 768px) {
  .title-text {
    font-size: 2rem;
  }

  .coming-soon-card {
    padding: 2rem;
  }

  .features-preview {
    grid-template-columns: 1fr;
  }

  .skill-grid {
    grid-template-columns: 1fr;
  }
}
</style>