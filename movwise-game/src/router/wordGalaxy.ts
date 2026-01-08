/**
 * Word Galaxy Routes
 * Vue Router configuration for Word Galaxy module
 */

import type { RouteRecordRaw } from 'vue-router';

export const wordGalaxyRoutes: RouteRecordRaw[] = [
  // Word Galaxy Hub (top level)
  {
    path: '/word-galaxy',
    name: 'WordGalaxyHub',
    component: () => import('@/views/word-galaxy/WordGalaxyHub.vue'),
    meta: {
      title: 'Word Galaxy - 語彙学習の宇宙',
      description: '科学的な間隔反復学習で効率的に語彙力を向上',
      requiresAuth: false
    }
  },

  // Individual Word Galaxy pages (same level)
  {
    path: '/word-galaxy/memory-station',
    name: 'MemoryStation',
    component: () => import('@/views/word-galaxy/MemoryStation.vue'),
    meta: {
      title: 'Memory Station - 間隔反復学習',
      description: 'SRSアルゴリズムによる効果的な単語学習'
    }
  },
  {
    path: '/word-galaxy/daily-mission',
    name: 'DailyMission',
    component: () => import('@/views/word-galaxy/DailyMission.vue'),
    meta: {
      title: 'Daily Mission - デイリーミッション',
      description: '毎日の学習目標とストリーク管理'
    }
  },
  {
    path: '/word-galaxy/vocabulary-arena',
    name: 'VocabularyArena',
    component: () => import('@/views/word-galaxy/VocabularyArena.vue'),
    meta: {
      title: 'Vocabulary Arena - 語彙対戦',
      description: '対戦形式の語彙学習ゲーム'
    }
  },
  {
    path: '/word-galaxy/dashboard',
    name: 'LearningDashboard',
    component: () => import('@/views/word-galaxy/LearningDashboard.vue'),
    meta: {
      title: 'Learning Dashboard - 学習ダッシュボード',
      description: '詳細な学習統計と進捗分析'
    }
  }
  // 将来の機能は後で追加
  // {
  //   path: '/word-galaxy/learn-new',
  //   name: 'LearnNewWords',
  //   component: () => import('@/views/word-galaxy/LearnNewWords.vue'),
  //   meta: {
  //     title: '新しい単語を学習',
  //     description: '新規単語の学習開始'
  //   }
  // },
  // {
  //   path: '/word-galaxy/settings',
  //   name: 'WordGalaxySettings',
  //   component: () => import('@/views/word-galaxy/Settings.vue'),
  //   meta: {
  //     title: 'Word Galaxy 設定',
  //     description: '学習設定とカスタマイズ'
  //   }
  // }
];

/**
 * ルートガードの設定
 */
export function setupWordGalaxyGuards(router: any) {
  // 認証が必要なルートの保護
  router.beforeEach((to: any, from: any, next: any) => {
    if (to.matched.some((record: any) => record.meta.requiresAuth)) {
      // 認証チェックロジック
      const isAuthenticated = checkAuthentication();

      if (!isAuthenticated) {
        next({
          name: 'Login',
          query: { redirect: to.fullPath }
        });
        return;
      }
    }

    // Word Galaxy初期化チェック
    if (to.path.startsWith('/word-galaxy')) {
      initializeWordGalaxyIfNeeded();
    }

    next();
  });

  // ページタイトル設定
  router.afterEach((to: any) => {
    if (to.meta?.title) {
      document.title = `${to.meta.title} | MovWISE`;
    }

    // ページビュー追跡（必要に応じて）
    if (to.path.startsWith('/word-galaxy')) {
      trackPageView(to.path, to.meta?.title);
    }
  });
}

/**
 * 認証状態をチェック
 */
function checkAuthentication(): boolean {
  // 既存の認証システムと統合
  // 現在はデモ用にtrue
  return true;
}

/**
 * Word Galaxy初期化
 */
async function initializeWordGalaxyIfNeeded() {
  try {
    const { useWordGalaxyStore } = await import('@/stores/word-galaxy/wordGalaxy');
    const store = useWordGalaxyStore();

    if (!store.initialized) {
      console.log('🚀 Initializing Word Galaxy...');
      await store.initialize();
    }
  } catch (error) {
    console.error('❌ Failed to initialize Word Galaxy:', error);
  }
}

/**
 * ページビュー追跡
 */
function trackPageView(path: string, title?: string) {
  // アナリティクス統合
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title
    });
  }

  console.log(`📊 Page view: ${path} - ${title}`);
}

/**
 * 動的ルート生成（管理者用） - Week 3で実装予定
 */
// export function generateAdminRoutes(): RouteRecordRaw[] {
//   return [
//     {
//       path: '/word-galaxy/admin',
//       name: 'WordGalaxyAdmin',
//       component: () => import('@/views/word-galaxy/admin/AdminDashboard.vue'),
//       meta: {
//         title: 'Word Galaxy 管理画面',
//         requiresAuth: true,
//         requiresAdmin: true
//       },
//       children: [
//         {
//           path: 'words',
//           name: 'WordManagement',
//           component: () => import('@/views/word-galaxy/admin/WordManagement.vue')
//         },
//         {
//           path: 'users',
//           name: 'UserManagement',
//           component: () => import('@/views/word-galaxy/admin/UserManagement.vue')
//         },
//         {
//           path: 'analytics',
//           name: 'AnalyticsDashboard',
//           component: () => import('@/views/word-galaxy/admin/Analytics.vue')
//         }
//       ]
//     }
//   ];
// }

/**
 * ルートのプリロード
 */
export function preloadWordGalaxyRoutes() {
  // 重要なコンポーネントをプリロード
  const criticalRoutes = [
    () => import('@/views/word-galaxy/WordGalaxyHub.vue'),
    () => import('@/views/word-galaxy/MemoryStation.vue'),
    () => import('@/views/word-galaxy/DailyMission.vue'),
    () => import('@/views/word-galaxy/VocabularyArena.vue'),
    () => import('@/views/word-galaxy/LearningDashboard.vue')
  ];

  // アイドル時間にプリロード
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      criticalRoutes.forEach(loader => {
        loader().catch(console.error);
      });
    });
  }
}

/**
 * ルート名前空間の定数 (Week 1-3実装分)
 */
export const WORD_GALAXY_ROUTES = {
  HUB: 'WordGalaxyHub',
  MEMORY_STATION: 'MemoryStation',
  DAILY_MISSION: 'DailyMission',
  VOCABULARY_ARENA: 'VocabularyArena',
  DASHBOARD: 'LearningDashboard'
  // 将来追加予定:
  // LEARN_NEW: 'LearnNewWords',
  // SETTINGS: 'WordGalaxySettings'
} as const;

/**
 * ナビゲーションヘルパー
 */
export class WordGalaxyNavigation {
  constructor(private router: any) {}

  /**
   * Memory Stationに遷移
   */
  async toMemoryStation() {
    return this.router.push({ name: WORD_GALAXY_ROUTES.MEMORY_STATION });
  }

  /**
   * 復習セッションを開始
   */
  async startReviewSession() {
    return this.router.push({ name: WORD_GALAXY_ROUTES.REVIEW_SESSION });
  }

  /**
   * デイリーミッションに遷移
   */
  async toDailyMission() {
    return this.router.push({ name: WORD_GALAXY_ROUTES.DAILY_MISSION });
  }

  /**
   * Vocabulary Arenaに遷移
   */
  async toVocabularyArena() {
    return this.router.push({ name: WORD_GALAXY_ROUTES.VOCABULARY_ARENA });
  }

  /**
   * ダッシュボードに遷移
   */
  async toDashboard() {
    return this.router.push({ name: WORD_GALAXY_ROUTES.DASHBOARD });
  }

  /**
   * ハブに戻る
   */
  async toHub() {
    return this.router.push({ name: WORD_GALAXY_ROUTES.HUB });
  }

  /**
   * クエリパラメータ付きナビゲーション
   */
  async navigateWithParams(routeName: string, params: Record<string, any> = {}, query: Record<string, any> = {}) {
    return this.router.push({
      name: routeName,
      params,
      query
    });
  }
}

/**
 * ルートのバリデーション
 */
export function validateWordGalaxyRoute(to: any): boolean {
  // 必要なパラメータの検証
  if (to.name === WORD_GALAXY_ROUTES.REVIEW_SESSION) {
    // 復習セッションには事前に単語データが必要
    return true; // 実際のバリデーションロジック
  }

  return true;
}

export default wordGalaxyRoutes;