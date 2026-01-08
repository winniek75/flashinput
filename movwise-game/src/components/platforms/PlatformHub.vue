<template>
  <div class="platform-hub">
    <!-- ヒーローセクション -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">MovWISE Galaxy Academy</h1>
        <p class="hero-subtitle">5つの統合プラットフォームで英語を完全マスター</p>
        <div class="progress-overview">
          <div class="overall-progress-circle">
            <svg viewBox="0 0 100 100" class="progress-svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"/>
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="url(#progressGradient)" stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference - (overallProgress / 100) * circumference"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-percentage">
                <span v-if="isLoading">...</span>
                <span v-else>{{ overallProgress }}%</span>
              </span>
              <span class="progress-label">完了</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 統合プラットフォーム一覧 -->
    <div class="platforms-grid">
      <!-- 1. フォニックス・アドベンチャー -->
      <div
        class="platform-card phonics-platform"
        :class="{ 'locked': !platforms.phonics.unlocked }"
        @click="enterPlatform('phonics')"
      >
        <div class="platform-header">
          <div class="platform-icon">🎵</div>
          <div class="platform-info">
            <h3 class="platform-title">フォニックス・アドベンチャー</h3>
            <p class="platform-description">音の世界を冒険して基礎力を身につけよう</p>
          </div>
          <div class="platform-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle
                  cx="20" cy="20" r="18" fill="none"
                  stroke="#3b82f6" stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="113"
                  :stroke-dashoffset="113 - (platforms.phonics.progress / 100) * 113"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span class="progress-number">{{ platforms.phonics.progress }}%</span>
            </div>
          </div>
        </div>

        <div class="platform-features">
          <div class="feature-list">
            <div class="feature-item" v-for="feature in platforms.phonics.features" :key="feature.id">
              <span :class="feature.completed ? 'text-green-500' : 'text-gray-400'">
                {{ feature.completed ? '✅' : '⭕' }}
              </span>
              <span :class="feature.completed ? 'text-gray-900' : 'text-gray-500'">
                {{ feature.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span>{{ platforms.phonics.stars }}/30</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🕒</span>
            <span>{{ platforms.phonics.timeSpent }}分</span>
          </div>
        </div>
      </div>

      <!-- 2. グラマー・ギャラクシー -->
      <div
        class="platform-card grammar-platform"
        :class="{ 'locked': !platforms.grammar.unlocked }"
        @click="enterPlatform('grammar')"
      >
        <div class="platform-header">
          <div class="platform-icon">🌌</div>
          <div class="platform-info">
            <h3 class="platform-title">グラマー・ギャラクシー</h3>
            <p class="platform-description">銀河を旅して文法構造をマスター</p>
          </div>
          <div class="platform-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle
                  cx="20" cy="20" r="18" fill="none"
                  stroke="#8b5cf6" stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="113"
                  :stroke-dashoffset="113 - (platforms.grammar.progress / 100) * 113"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span class="progress-number">{{ platforms.grammar.progress }}%</span>
            </div>
          </div>
        </div>

        <div class="platform-features">
          <div class="feature-list">
            <div class="feature-item" v-for="feature in platforms.grammar.features" :key="feature.id">
              <span :class="feature.completed ? 'text-green-500' : 'text-gray-400'">
                {{ feature.completed ? '✅' : '⭕' }}
              </span>
              <span :class="feature.completed ? 'text-gray-900' : 'text-gray-500'">
                {{ feature.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span>{{ platforms.grammar.stars }}/30</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🕒</span>
            <span>{{ platforms.grammar.timeSpent }}分</span>
          </div>
        </div>
      </div>

      <!-- 3. ボキャブラリー・ワールド -->
      <div
        class="platform-card vocabulary-platform"
        :class="{ 'locked': !platforms.vocabulary.unlocked }"
        @click="enterPlatform('vocabulary')"
      >
        <div class="platform-header">
          <div class="platform-icon">🌍</div>
          <div class="platform-info">
            <h3 class="platform-title">ボキャブラリー・ワールド</h3>
            <p class="platform-description">言葉の世界を探検して語彙力アップ</p>
          </div>
          <div class="platform-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle
                  cx="20" cy="20" r="18" fill="none"
                  stroke="#10b981" stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="113"
                  :stroke-dashoffset="113 - (platforms.vocabulary.progress / 100) * 113"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span class="progress-number">{{ platforms.vocabulary.progress }}%</span>
            </div>
          </div>
        </div>

        <div class="platform-features">
          <div class="feature-list">
            <div class="feature-item"
                 v-for="feature in platforms.vocabulary.features"
                 :key="feature.id"
                 :class="{ 'feature-clickable': feature.gameId }"
                 @click="feature.gameId ? playDirectGame(feature) : null">
              <span :class="feature.completed ? 'text-green-500' : 'text-gray-400'">
                {{ feature.completed ? '✅' : '⭕' }}
              </span>
              <span :class="feature.completed ? 'text-gray-900' : 'text-gray-500'">
                {{ feature.name }}
              </span>
              <span v-if="feature.gameId" class="text-blue-500 ml-auto">▶️</span>
            </div>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span>{{ platforms.vocabulary.stars }}/30</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🕒</span>
            <span>{{ platforms.vocabulary.timeSpent }}分</span>
          </div>
        </div>
      </div>

      <!-- 4. タイピング・アリーナ -->
      <div
        class="platform-card typing-platform"
        :class="{ 'locked': !platforms.typing.unlocked }"
        @click="enterPlatform('typing')"
      >
        <div class="platform-header">
          <div class="platform-icon">⌨️</div>
          <div class="platform-info">
            <h3 class="platform-title">タイピング・アリーナ</h3>
            <p class="platform-description">スピードと正確性を競うバトルフィールド</p>
          </div>
          <div class="platform-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle
                  cx="20" cy="20" r="18" fill="none"
                  stroke="#f59e0b" stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="113"
                  :stroke-dashoffset="113 - (platforms.typing.progress / 100) * 113"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span class="progress-number">{{ platforms.typing.progress }}%</span>
            </div>
          </div>
        </div>

        <div class="platform-features">
          <div class="feature-list">
            <div class="feature-item" v-for="feature in platforms.typing.features" :key="feature.id">
              <span :class="feature.completed ? 'text-green-500' : 'text-gray-400'">
                {{ feature.completed ? '✅' : '⭕' }}
              </span>
              <span :class="feature.completed ? 'text-gray-900' : 'text-gray-500'">
                {{ feature.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span>{{ platforms.typing.stars }}/30</span>
          </div>
          <div class="stat">
            <span class="stat-icon">⚡</span>
            <span>{{ platforms.typing.wpm }} WPM</span>
          </div>
        </div>
      </div>

      <!-- 5. 総合スキル・チャレンジ -->
      <div
        class="platform-card integrated-platform"
        :class="{ 'locked': !platforms.integrated.unlocked }"
        @click="enterPlatform('integrated')"
      >
        <div class="platform-header">
          <div class="platform-icon">🏆</div>
          <div class="platform-info">
            <h3 class="platform-title">総合スキル・チャレンジ</h3>
            <p class="platform-description">全スキルを駆使した最終チャレンジ</p>
          </div>
          <div class="platform-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle
                  cx="20" cy="20" r="18" fill="none"
                  stroke="#ef4444" stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="113"
                  :stroke-dashoffset="113 - (platforms.integrated.progress / 100) * 113"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span class="progress-number">{{ platforms.integrated.progress }}%</span>
            </div>
          </div>
        </div>

        <div class="platform-features">
          <div class="feature-list">
            <div class="feature-item" v-for="feature in platforms.integrated.features" :key="feature.id">
              <span :class="feature.completed ? 'text-green-500' : 'text-gray-400'">
                {{ feature.completed ? '✅' : '⭕' }}
              </span>
              <span :class="feature.completed ? 'text-gray-900' : 'text-gray-500'">
                {{ feature.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span>{{ platforms.integrated.stars }}/30</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🏆</span>
            <span>レベル {{ platforms.integrated.level }}</span>
          </div>
        </div>
      </div>

      <!-- 6. VR Academy -->
      <div
        class="platform-card vr-platform"
        :class="{ 'locked': !platforms.vr.unlocked }"
        @click="enterPlatform('vr')"
      >
        <div class="platform-header">
          <div class="platform-icon">🥽</div>
          <div class="platform-info">
            <h3 class="platform-title">VR Academy</h3>
            <p class="platform-description">仮想現実で実践的な英会話体験</p>
          </div>
          <div class="platform-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle
                  cx="20" cy="20" r="18" fill="none"
                  stroke="#06d6a0" stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="113"
                  :stroke-dashoffset="113 - (platforms.vr.progress / 100) * 113"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span class="progress-number">{{ platforms.vr.progress }}%</span>
            </div>
          </div>
        </div>

        <div class="platform-features">
          <div class="feature-list">
            <div class="feature-item" v-for="feature in platforms.vr.features" :key="feature.id">
              <span :class="feature.completed ? 'text-green-500' : 'text-gray-400'">
                {{ feature.completed ? '✅' : '⭕' }}
              </span>
              <span :class="feature.completed ? 'text-gray-900' : 'text-gray-500'">
                {{ feature.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span>{{ platforms.vr.stars }}/30</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🕒</span>
            <span>{{ platforms.vr.timeSpent }}分</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/progress'
import { useAuthStore } from '@/stores/auth'
import logger from '@/utils/logger'

export default {
  name: 'PlatformHub',
  setup() {
    const router = useRouter();
    const progressStore = useProgressStore();
    const authStore = useAuthStore();

    const circumference = 2 * Math.PI * 45;
    const isLoading = ref(true);

    // プレビューモード（未認証ユーザー用）
    const isPreviewMode = computed(() => {
      return !authStore.currentUser?.uid || !authStore.isAuthenticated;
    });

    // プラットフォームデータ（Firebase progressStore から取得）
    const platforms = computed(() => {
      if (isPreviewMode.value) {
        // プレビューモード：ゲストユーザー用のサンプルデータ
        return {
          phonics: {
            unlocked: true,
            progress: 0,
            stars: 0,
            timeSpent: 0,
            features: [
              { id: 1, name: 'サウンドマスター', completed: false },
              { id: 2, name: 'フォニックスパズル', completed: false },
              { id: 3, name: 'リズム学習', completed: false },
              { id: 4, name: 'ブレンディング', completed: false },
              { id: 5, name: 'ボスチャレンジ', completed: false }
            ]
          },
          grammar: {
            unlocked: true,
            progress: 0,
            stars: 0,
            timeSpent: 0,
            features: [
              { id: 1, name: 'Be動詞ラッシュ', completed: false },
              { id: 2, name: '文法パズル', completed: false },
              { id: 3, name: '時制マシン', completed: false },
              { id: 4, name: '文構造ビルダー', completed: false },
              { id: 5, name: '総合文法テスト', completed: false }
            ]
          },
          vocabulary: {
            unlocked: true,
            progress: 0,
            stars: 0,
            timeSpent: 0,
            features: [
              { id: 1, name: 'ワードラッシュ', completed: false },
              { id: 2, name: '語彙コレクション', completed: false },
              { id: 3, name: 'コンテキスト学習', completed: false },
              { id: 4, name: 'ディクテーション', completed: false },
              { id: 5, name: '語彙マスタリー', completed: false }
            ]
          },
          typing: {
            unlocked: true,
            progress: 0,
            stars: 0,
            timeSpent: 0,
            wpm: 0,
            features: [
              { id: 1, name: '基本タイピング', completed: false },
              { id: 2, name: 'スピードチャレンジ', completed: false },
              { id: 3, name: '英単語タイピング', completed: false },
              { id: 4, name: 'バトルモード', completed: false },
              { id: 5, name: 'マスターリーグ', completed: false }
            ]
          },
          integrated: {
            unlocked: false,
            progress: 0,
            stars: 0,
            timeSpent: 0,
            level: 1,
            features: [
              { id: 1, name: 'リスニング・チャレンジ', completed: false },
              { id: 2, name: 'スピーキング・テスト', completed: false },
              { id: 3, name: '読解問題', completed: false },
              { id: 4, name: '総合実技', completed: false },
              { id: 5, name: 'マスター認定', completed: false }
            ]
          },
          vr: {
            unlocked: false,
            progress: 0,
            stars: 0,
            timeSpent: 0,
            features: [
              { id: 1, name: 'VRシナリオ体験', completed: false },
              { id: 2, name: '3D英会話', completed: false },
              { id: 3, name: '仮想世界探索', completed: false },
              { id: 4, name: 'AIキャラクター対話', completed: false },
              { id: 5, name: 'VR総合テスト', completed: false }
            ]
          }
        }
      }

      // 認証済みユーザー：実データを使用
      return {
        phonics: {
          unlocked: true,
          progress: calculateSectionProgress('phonicsAdventure'),
          stars: calculateStars('phonics'),
          timeSpent: Math.floor(progressStore.totalStudyTime / 5),
          features: generateFeatures('phonics')
        },
      grammar: {
        unlocked: true,
        progress: calculateSectionProgress('grammarGalaxy'),
        stars: calculateStars('grammar'),
        timeSpent: Math.floor(progressStore.totalStudyTime / 5),
        features: generateFeatures('grammar')
      },
      vocabulary: {
        unlocked: true,
        progress: calculateSectionProgress('vocabularyWorld'),
        stars: calculateStars('vocabulary'),
        timeSpent: Math.floor(progressStore.totalStudyTime / 5),
        features: generateFeatures('vocabulary')
      },
      typing: {
        unlocked: true,
        progress: calculateSectionProgress('typingArena'),
        stars: calculateStars('typing'),
        timeSpent: Math.floor(progressStore.totalStudyTime / 5),
        wpm: Math.min(30 + progressStore.skills.pronunciation?.level * 5 || 30, 80),
        features: generateFeatures('typing')
      },
      integrated: {
        unlocked: progressStore.overallLevel >= 5,
        progress: Math.max(0, (progressStore.overallLevel - 5) * 10),
        stars: Math.floor(progressStore.overallLevel / 2),
        timeSpent: Math.floor(progressStore.totalStudyTime / 10),
        level: progressStore.overallLevel,
        features: generateFeatures('integrated')
      },
      vr: {
        unlocked: progressStore.overallLevel >= 3,
        progress: calculateSectionProgress('vrAcademy'),
        stars: calculateStars('vr'),
        timeSpent: Math.floor(progressStore.totalStudyTime / 8),
        features: generateFeatures('vr')
      }
    }
    });

    // セクションの進捗を計算
    const calculateSectionProgress = (sectionNameOrObject) => {
      let section
      if (typeof sectionNameOrObject === 'string') {
        section = progressStore.sections[sectionNameOrObject]
      } else {
        section = sectionNameOrObject
      }

      if (!section || !section.level) return 0

      const levelProgress = (section.level - 1) * 20 // 各レベル20%
      const expProgress = section.maxExp > 0 ? (section.exp / section.maxExp) * 20 : 0 // 現在レベル内の進捗
      return Math.min(100, Math.round(levelProgress + expProgress))
    };

    // スキル別の星を計算
    const calculateStars = (skillName) => {
      const skill = progressStore.skills[skillName]
      if (!skill) return 0
      return Math.min(30, skill.level * 3 + Math.floor(skill.exp / 50))
    };

    // 各プラットフォームの機能リストを生成
    const generateFeatures = (platformType) => {
      const features = {
        phonics: [
          { id: 1, name: 'サウンドマスター', completed: progressStore.skills.phonics?.level >= 2 },
          { id: 2, name: 'フォニックスパズル', completed: progressStore.skills.phonics?.level >= 3 },
          { id: 3, name: 'リズム学習', completed: progressStore.skills.rhythm?.level >= 2 },
          { id: 4, name: 'ブレンディング', completed: progressStore.skills.blending?.level >= 2 },
          { id: 5, name: 'ボスチャレンジ', completed: progressStore.skills.phonics?.level >= 5 }
        ],
        grammar: [
          { id: 1, name: 'Be動詞ラッシュ', completed: progressStore.skills.grammar?.level >= 2 },
          { id: 2, name: '文法パズル', completed: progressStore.skills.grammar?.level >= 3 },
          { id: 3, name: '時制マシン', completed: progressStore.skills.grammar?.level >= 4 },
          { id: 4, name: '文構造ビルダー', completed: progressStore.skills.grammar?.level >= 5 },
          { id: 5, name: '総合文法テスト', completed: progressStore.skills.grammar?.level >= 6 }
        ],
        vocabulary: [
          { id: 1, name: 'ワードラッシュ', completed: progressStore.skills.vocabulary?.level >= 2, gameId: 'word-rush' },
          { id: 2, name: '語彙コレクション', completed: progressStore.skills.vocabulary?.level >= 3 },
          { id: 3, name: 'コンテキスト学習', completed: progressStore.skills.vocabulary?.level >= 4 },
          { id: 4, name: 'ディクテーション', completed: progressStore.skills.listening?.level >= 3 },
          { id: 5, name: '語彙マスタリー', completed: progressStore.skills.vocabulary?.level >= 5 }
        ],
        typing: [
          { id: 1, name: '基本タイピング', completed: progressStore.sections.typingArena?.level >= 2 },
          { id: 2, name: 'スピードチャレンジ', completed: progressStore.sections.typingArena?.level >= 3 },
          { id: 3, name: '英単語タイピング', completed: progressStore.sections.typingArena?.level >= 4 },
          { id: 4, name: 'バトルモード', completed: progressStore.sections.typingArena?.level >= 5 },
          { id: 5, name: 'マスターリーグ', completed: progressStore.sections.typingArena?.level >= 6 }
        ],
        integrated: [
          { id: 1, name: 'リスニング・チャレンジ', completed: progressStore.overallLevel >= 5 },
          { id: 2, name: 'スピーキング・テスト', completed: progressStore.overallLevel >= 8 },
          { id: 3, name: '読解問題', completed: progressStore.overallLevel >= 10 },
          { id: 4, name: '総合実技', completed: progressStore.overallLevel >= 12 },
          { id: 5, name: 'マスター認定', completed: progressStore.overallLevel >= 15 }
        ],
        vr: [
          { id: 1, name: 'VRシナリオ体験', completed: progressStore.sections.vrAcademy?.level >= 1 },
          { id: 2, name: '3D英会話', completed: progressStore.sections.vrAcademy?.level >= 2 },
          { id: 3, name: '仮想世界探索', completed: progressStore.sections.vrAcademy?.level >= 3 },
          { id: 4, name: 'AIキャラクター対話', completed: progressStore.sections.vrAcademy?.level >= 4 },
          { id: 5, name: 'VR総合テスト', completed: progressStore.sections.vrAcademy?.level >= 5 }
        ]
      }
      return features[platformType] || []
    };

    // 全体進捗（Firebase データベース）
    const overallProgress = computed(() => {
      if (isLoading.value) return 0

      // プレビューモードの場合は0%から開始
      if (isPreviewMode.value) return 0

      // より自然な進捗計算
      const allSections = Object.values(progressStore.sections || {})
      if (allSections.length === 0) return 0

      // 各セクションの進捗を平均化
      const totalSectionProgress = allSections.reduce((sum, section) => {
        const sectionProgress = calculateSectionProgress(section)
        return sum + Math.min(100, sectionProgress)
      }, 0)

      // セクション数で割って平均進捗率を取得
      const averageProgress = totalSectionProgress / allSections.length

      return Math.round(averageProgress)
    });


    // プラットフォーム入場
    const enterPlatform = (platformId) => {
      const platform = platforms.value[platformId]

      if (!platform.unlocked) {
        alert('このプラットフォームはまだ解放されていません。前のプラットフォームを完了してください。')
        return
      }

      // 対応するプラットフォームページにリダイレクト
      switch (platformId) {
        case 'phonics':
          router.push('/platforms/phonics-adventure')
          break
        case 'grammar':
          router.push('/platforms/grammar-galaxy')
          break
        case 'vocabulary':
          router.push('/platforms/vocabulary-world')
          break
        case 'typing':
          router.push('/platforms/typing-arena')
          break
        case 'integrated':
          router.push('/platforms/integrated-challenge')
          break
        case 'vr':
          router.push('/vr-academy')
          break
      }
    };

    // 直接ゲームプレイ
    const playDirectGame = (feature) => {
      if (feature.gameId && feature.component) {
        router.push({
          name: 'VocabularyGame',
          params: { gameId: feature.gameId },
          query: { component: feature.component }
        })
      }
    };

    onMounted(async () => {
      // Firebase から進捗データを読み込み
      if (authStore.currentUser?.uid && authStore.isAuthenticated) {
        await progressStore.loadFromFirebase()
      } else {
        // 未認証ユーザーの場合はダミープレビューを表示
        logger.log('📋 Showing platform preview for unauthenticated user')
      }
      isLoading.value = false
    });

    return {
      platforms,
      overallProgress,
      circumference,
      isLoading,
      isPreviewMode,
      enterPlatform,
      playDirectGame,
      calculateSectionProgress,
      calculateStars,
      generateFeatures
    }
  }
}
</script>

<style scoped>
.platform-hub {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1e1e3a 50%, #2d1b69 100%);
  padding: 2rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
}

.overall-progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.progress-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.platform-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.platform-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.platform-card.grammar-platform::before {
  background: linear-gradient(90deg, #8b5cf6, #a855f7);
}

.platform-card.vocabulary-platform::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.platform-card.typing-platform::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.platform-card.integrated-platform::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.platform-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.platform-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.platform-card.locked:hover {
  transform: none;
  box-shadow: none;
}

.platform-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.platform-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.platform-info {
  flex: 1;
}

.platform-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.platform-description {
  color: #cbd5e1;
  font-size: 0.875rem;
  line-height: 1.5;
}

.platform-progress {
  flex-shrink: 0;
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
}

.platform-features {
  margin-bottom: 1.5rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.feature-clickable {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.feature-clickable:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.platform-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
}

.stat-icon {
  width: 1rem;
  height: 1rem;
  color: #60a5fa;
}

#progressGradient {
  stop-color: #60a5fa;
}

@media (max-width: 768px) {
  .platform-hub {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .platforms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .platform-card {
    padding: 1.5rem;
  }

  .platform-header {
    flex-direction: column;
    text-align: center;
  }

  .platform-stats {
    justify-content: center;
    gap: 2rem;
  }
}

/* VR Platform Specific Styles */
.vr-platform {
  background: linear-gradient(135deg, rgba(6, 214, 160, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 2px solid rgba(6, 214, 160, 0.2);
}

.vr-platform:not(.locked):hover {
  border-color: rgba(6, 214, 160, 0.4);
  box-shadow: 0 8px 25px rgba(6, 214, 160, 0.15);
}
</style>