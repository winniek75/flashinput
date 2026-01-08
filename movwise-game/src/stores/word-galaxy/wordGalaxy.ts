/**
 * Word Galaxy Main Store
 * Word Galaxy全体の状態管理とナビゲーション
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { initializeWordGalaxy } from '@/database/word-galaxy';
import type { WordGalaxyState, UserStats } from '@/types/word-galaxy/word.types';

export const useWordGalaxyStore = defineStore('wordGalaxy', () => {
  // ===== State =====
  const currentView = ref<'hub' | 'memory' | 'daily' | 'arena'>('hub');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const user = ref<{
    id: string;
    level: number;
    crystals: number;
    experience: number;
  } | null>(null);

  const userStats = ref<UserStats>({
    userId: '',
    totalWordsLearned: 0,
    totalWordsMastered: 0,
    totalReviews: 0,
    totalBattles: 0,
    battleWins: 0,
    battleLosses: 0,
    battleDraws: 0,
    currentElo: 1000,
    highestElo: 1000,
    rank: 'Bronze',
    totalTimeSpent: 0,
    averageSessionTime: 0,
    progressByLevel: {},
    lastUpdated: new Date()
  });

  // システム設定
  const settings = ref({
    soundEnabled: true,
    notificationsEnabled: true,
    autoPlay: false,
    difficultyMode: 'adaptive' as 'adaptive' | 'fixed',
    preferredDifficulty: 'eiken-3',
    sessionLength: 20, // デフォルト20問
    reviewReminders: true
  });

  // ===== Getters =====
  const isLoggedIn = computed(() => user.value !== null);

  const vocabularyProgress = computed(() => {
    if (!userStats.value) return 0;
    const { totalWordsLearned, totalWordsMastered } = userStats.value;
    if (totalWordsLearned === 0) return 0;
    return Math.round((totalWordsMastered / totalWordsLearned) * 100);
  });

  const currentRank = computed(() => {
    const elo = userStats.value?.currentElo || 1000;
    if (elo < 1200) return 'Bronze';
    if (elo < 1400) return 'Silver';
    if (elo < 1600) return 'Gold';
    if (elo < 1800) return 'Platinum';
    return 'Diamond';
  });

  const battleWinRate = computed(() => {
    const total = userStats.value.battleWins + userStats.value.battleLosses + userStats.value.battleDraws;
    if (total === 0) return 0;
    return Math.round((userStats.value.battleWins / total) * 100);
  });

  const dailyGoalProgress = computed(() => {
    // 今日の目標達成率（仮実装）
    // 実際はdailyMissionStoreから取得
    return 65; // %
  });

  // ===== Actions =====

  /**
   * Word Galaxyを初期化
   */
  async function initialize(userId?: string) {
    if (initialized.value) return;

    loading.value = true;
    error.value = null;

    try {
      console.log('🚀 Initializing Word Galaxy system...');

      // データベース初期化
      await initializeWordGalaxy();

      // データベース初期化後の検証
      const { wordGalaxyDB } = await import('@/database/word-galaxy/schemas');
      const wordCount = await wordGalaxyDB.words.count();
      console.log(`✅ Word Galaxy database initialized with ${wordCount} words`);

      if (wordCount === 0) {
        console.warn('⚠️ No words loaded - will retry when needed');
        // データベースが空でも初期化は続行する
      }

      // ユーザー情報設定
      if (userId) {
        user.value = {
          id: userId,
          level: 1,
          crystals: 0,
          experience: 0
        };
        userStats.value.userId = userId;
      }

      initialized.value = true;
      console.log('✅ Word Galaxy initialized successfully');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize Word Galaxy';
      console.error('❌ Word Galaxy initialization failed:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * ユーザーログイン
   */
  async function login(userId: string, userLevel: number = 1) {
    try {
      user.value = {
        id: userId,
        level: userLevel,
        crystals: 0,
        experience: 0
      };

      userStats.value.userId = userId;

      // ユーザー統計を読み込み
      await loadUserStats();

      console.log(`👤 User logged in: ${userId}`);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to login';
      console.error('Failed to login:', err);
      throw err;
    }
  }

  /**
   * ユーザーログアウト
   */
  function logout() {
    user.value = null;
    userStats.value = {
      userId: '',
      totalWordsLearned: 0,
      totalWordsMastered: 0,
      totalReviews: 0,
      totalBattles: 0,
      battleWins: 0,
      battleLosses: 0,
      battleDraws: 0,
      currentElo: 1000,
      highestElo: 1000,
      rank: 'Bronze',
      totalTimeSpent: 0,
      averageSessionTime: 0,
      progressByLevel: {},
      lastUpdated: new Date()
    };
    currentView.value = 'hub';
    console.log('👋 User logged out');
  }

  /**
   * ビューを変更
   */
  function setCurrentView(view: 'hub' | 'memory' | 'daily' | 'arena') {
    currentView.value = view;
    console.log(`📱 View changed to: ${view}`);
  }

  /**
   * ユーザー統計を読み込み
   */
  async function loadUserStats() {
    if (!user.value) return;

    loading.value = true;
    error.value = null;

    try {
      const { wordGalaxyDB } = await import('@/database/word-galaxy/schemas');
      const stats = await wordGalaxyDB.userStats.get(user.value.id);

      if (stats) {
        userStats.value = stats;
      }

      console.log('📊 User stats loaded');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user stats';
      console.error('Failed to load user stats:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * ユーザー統計を更新
   */
  async function updateUserStats(updates: Partial<UserStats>) {
    if (!user.value) return;

    try {
      const { wordGalaxyDB } = await import('@/database/word-galaxy/schemas');

      const updatedStats = {
        ...userStats.value,
        ...updates,
        lastUpdated: new Date()
      };

      await wordGalaxyDB.userStats.put(updatedStats);
      userStats.value = updatedStats;

      console.log('📈 User stats updated');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user stats';
      console.error('Failed to update user stats:', err);
    }
  }

  /**
   * クリスタルを獲得
   */
  async function addCrystals(amount: number, source: string) {
    if (!user.value) return;

    user.value.crystals += amount;

    // 既存のクリスタルシステムと統合
    try {
      // ここで既存のクリスタルストアを呼び出し
      console.log(`💎 Added ${amount} crystals from ${source}`);
    } catch (err) {
      console.error('Failed to add crystals:', err);
    }
  }

  /**
   * 経験値を獲得
   */
  async function addExperience(amount: number, category: string) {
    if (!user.value) return;

    user.value.experience += amount;

    // レベルアップチェック
    const newLevel = Math.floor(user.value.experience / 1000) + 1;
    if (newLevel > user.value.level) {
      user.value.level = newLevel;
      console.log(`🔥 Level up! New level: ${newLevel}`);

      // レベルアップ報酬
      await addCrystals(newLevel * 50, 'Level Up Bonus');
    }

    console.log(`⭐ Added ${amount} experience from ${category}`);
  }

  /**
   * 設定を更新
   */
  function updateSettings(newSettings: Partial<typeof settings.value>) {
    settings.value = { ...settings.value, ...newSettings };

    // ローカルストレージに保存
    try {
      localStorage.setItem('wordGalaxySettings', JSON.stringify(settings.value));
      console.log('⚙️ Settings updated');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }

  /**
   * 設定を読み込み
   */
  function loadSettings() {
    try {
      const saved = localStorage.getItem('wordGalaxySettings');
      if (saved) {
        settings.value = { ...settings.value, ...JSON.parse(saved) };
        console.log('⚙️ Settings loaded');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  /**
   * エラーをクリア
   */
  function clearError() {
    error.value = null;
  }

  /**
   * 学習セッションを記録
   */
  async function recordSession(
    sessionType: 'review' | 'battle' | 'learning',
    duration: number,
    wordsCount: number,
    accuracy: number
  ) {
    if (!user.value) return;

    try {
      // セッション統計を更新
      const updates: Partial<UserStats> = {
        totalTimeSpent: userStats.value.totalTimeSpent + duration,
        averageSessionTime: Math.round(
          (userStats.value.averageSessionTime * userStats.value.totalReviews + duration) /
          (userStats.value.totalReviews + 1)
        )
      };

      if (sessionType === 'review') {
        updates.totalReviews = userStats.value.totalReviews + 1;
      } else if (sessionType === 'battle') {
        updates.totalBattles = userStats.value.totalBattles + 1;
      }

      await updateUserStats(updates);

      // 経験値とクリスタル報酬
      const expGain = Math.round(wordsCount * (accuracy / 100) * 10);
      const crystalGain = Math.round(wordsCount * (accuracy / 100) * 5);

      await addExperience(expGain, sessionType);
      await addCrystals(crystalGain, `${sessionType} session`);

      console.log(`📝 Session recorded: ${sessionType}, ${wordsCount} words, ${accuracy}% accuracy`);
    } catch (err) {
      console.error('Failed to record session:', err);
    }
  }

  /**
   * ストアをリセット（開発用）
   */
  function resetStore() {
    currentView.value = 'hub';
    loading.value = false;
    error.value = null;
    initialized.value = false;
    user.value = null;
    userStats.value = {
      userId: '',
      totalWordsLearned: 0,
      totalWordsMastered: 0,
      totalReviews: 0,
      totalBattles: 0,
      battleWins: 0,
      battleLosses: 0,
      battleDraws: 0,
      currentElo: 1000,
      highestElo: 1000,
      rank: 'Bronze',
      totalTimeSpent: 0,
      averageSessionTime: 0,
      progressByLevel: {},
      lastUpdated: new Date()
    };
  }

  // 初期設定読み込み
  loadSettings();

  return {
    // State
    currentView,
    loading,
    error,
    initialized,
    user,
    userStats,
    settings,

    // Getters
    isLoggedIn,
    vocabularyProgress,
    currentRank,
    battleWinRate,
    dailyGoalProgress,

    // Actions
    initialize,
    login,
    logout,
    setCurrentView,
    loadUserStats,
    updateUserStats,
    addCrystals,
    addExperience,
    updateSettings,
    loadSettings,
    clearError,
    recordSession,
    resetStore
  };
});