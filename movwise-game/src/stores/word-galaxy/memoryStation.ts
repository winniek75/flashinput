/**
 * Memory Station Pinia Store
 * SRS（間隔反復学習）の状態管理
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { srsEngine } from '@/services/word-galaxy/srsAlgorithm';
import type { Word, UserWordProgress, MemoryStationState } from '@/types/word-galaxy/word.types';
import { useDailyMissionStore } from './dailyMission';

export const useMemoryStationStore = defineStore('memoryStation', () => {
  // ===== State =====
  const reviewWords = ref<Word[]>([]);
  const reviewProgress = ref<UserWordProgress[]>([]);
  const currentWordIndex = ref(0);
  const sessionStats = ref({
    total: 0,
    correct: 0,
    wrong: 0,
    averageTime: 0,
    startTime: null as Date | null,
    endTime: null as Date | null
  });
  const isReviewActive = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 学習統計
  const learningStats = ref({
    totalWords: 0,
    masteredWords: 0,
    reviewsDue: 0,
    averageMastery: 0,
    levelDistribution: {} as Record<number, number>,
    streakStats: {
      currentStreak: 0,
      longestStreak: 0
    }
  });

  const forgettingCurveData = ref({
    levels: [] as number[],
    retentionRates: [] as number[]
  });

  // ===== Getters =====
  const currentWord = computed(() => {
    if (reviewWords.value.length === 0 || currentWordIndex.value >= reviewWords.value.length) {
      return null;
    }
    return reviewWords.value[currentWordIndex.value];
  });

  const currentProgress = computed(() => {
    if (reviewProgress.value.length === 0 || currentWordIndex.value >= reviewProgress.value.length) {
      return null;
    }
    return reviewProgress.value[currentWordIndex.value];
  });

  const hasMoreWords = computed(() => {
    return currentWordIndex.value < reviewWords.value.length - 1;
  });

  const accuracy = computed(() => {
    if (sessionStats.value.total === 0) return 0;
    return Math.round((sessionStats.value.correct / sessionStats.value.total) * 100);
  });

  const sessionProgress = computed(() => {
    if (reviewWords.value.length === 0) return 0;
    return Math.round((currentWordIndex.value / reviewWords.value.length) * 100);
  });

  const pendingReviewCount = computed(() => {
    return learningStats.value.reviewsDue;
  });

  const masteryPercentage = computed(() => {
    if (learningStats.value.totalWords === 0) return 0;
    return Math.round((learningStats.value.masteredWords / learningStats.value.totalWords) * 100);
  });

  // ===== Actions =====

  /**
   * 復習可能な単語を読み込み
   */
  async function loadReviewWords(userId: string, limit: number = 20) {
    loading.value = true;
    error.value = null;

    try {
      const result = await srsEngine.getWordsForReview(userId, limit);
      reviewWords.value = result.words;
      reviewProgress.value = result.progress;
      currentWordIndex.value = 0;

      // セッション統計をリセット
      sessionStats.value = {
        total: 0,
        correct: 0,
        wrong: 0,
        averageTime: 0,
        startTime: null,
        endTime: null
      };

      console.log(`📚 Loaded ${result.words.length} words for review`);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load review words';
      console.error('Failed to load review words:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 復習セッションを開始
   */
  async function startReviewSession(userId?: string) {
    // userIdが提供された場合のみloadReviewWordsを呼び出す
    if (userId) {
      await loadReviewWords(userId);
    }

    if (reviewWords.value.length > 0) {
      isReviewActive.value = true;
      sessionStats.value.startTime = new Date();
      console.log('📖 Review session started');
    } else {
      error.value = '復習する単語がありません。新しい単語を学習するか、しばらく後にお試しください。';
    }
  }

  /**
   * 回答を送信
   */
  async function submitAnswer(userId: string, isCorrect: boolean, responseTime: number) {
    if (!currentWord.value) {
      throw new Error('No current word to submit answer for');
    }

    try {
      // デバッグ情報を追加
      console.log('🔍 Debug submitAnswer:', {
        userId,
        wordId: currentWord.value.id,
        isCorrect,
        responseTime
      });

      // SRSエンジンに記録
      await srsEngine.recordReview(userId, currentWord.value.id, isCorrect, responseTime);

      // セッション統計更新
      sessionStats.value.total++;
      if (isCorrect) {
        sessionStats.value.correct++;
      } else {
        sessionStats.value.wrong++;
      }

      // 平均時間更新
      const currentAvg = sessionStats.value.averageTime;
      const newCount = sessionStats.value.total;
      sessionStats.value.averageTime = (currentAvg * (newCount - 1) + responseTime) / newCount;

      // Daily Mission進捗更新
      const dailyMissionStore = useDailyMissionStore();
      await dailyMissionStore.updateMissionProgress('vocabulary_review', 1);

      console.log(`✅ Answer recorded: ${isCorrect ? 'Correct' : 'Wrong'} in ${responseTime}ms`);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit answer';
      console.error('Failed to submit answer:', err);
      throw err;
    }
  }

  /**
   * 次の単語に進む
   */
  function nextWord() {
    if (hasMoreWords.value) {
      currentWordIndex.value++;
    } else {
      endReviewSession();
    }
  }

  /**
   * 復習セッションを終了
   */
  async function endReviewSession() {
    isReviewActive.value = false;
    sessionStats.value.endTime = new Date();

    const duration = sessionStats.value.endTime.getTime() - (sessionStats.value.startTime?.getTime() || 0);
    const durationMinutes = Math.round(duration / (1000 * 60));

    // Daily Mission進捗チェック
    const dailyMissionStore = useDailyMissionStore();

    // Perfect Score チェック
    if (accuracy.value === 100) {
      await dailyMissionStore.updateMissionProgress('perfect_score', 1);
    }

    // Speed Challenge チェック (15分以内に20問以上)
    if (durationMinutes <= 15 && sessionStats.value.total >= 20) {
      await dailyMissionStore.updateMissionProgress('speed_challenge', sessionStats.value.total);
    }

    console.log(`🏁 Review session ended. Duration: ${durationMinutes}min, Accuracy: ${accuracy.value}%`);
  }

  /**
   * 学習統計を読み込み
   */
  async function loadLearningStats(userId: string) {
    loading.value = true;
    error.value = null;

    try {
      const stats = await srsEngine.getLearningStats(userId);
      learningStats.value = stats;

      console.log(`📊 Loaded learning stats: ${stats.totalWords} words, ${stats.masteredWords} mastered`);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load learning stats';
      console.error('Failed to load learning stats:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 忘却曲線データを読み込み
   */
  async function loadForgettingCurveData(userId: string) {
    try {
      const data = await srsEngine.getForgettingCurveData(userId);
      forgettingCurveData.value = data;

      console.log('📈 Loaded forgetting curve data');
    } catch (err) {
      console.error('Failed to load forgetting curve data:', err);
    }
  }

  /**
   * 新しい単語の学習を開始
   */
  async function startLearningWord(userId: string, wordId: string) {
    loading.value = true;
    error.value = null;

    try {
      await srsEngine.startLearning(userId, wordId);
      console.log(`🎯 Started learning word: ${wordId}`);

      // 統計を更新
      await loadLearningStats(userId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start learning word';
      console.error('Failed to start learning word:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 特定難易度の復習単語を取得
   */
  async function loadReviewWordsByDifficulty(
    userId: string,
    difficultyLevel: string,
    limit: number = 10
  ) {
    loading.value = true;
    error.value = null;

    try {
      const result = await srsEngine.getReviewWordsByDifficulty(userId, difficultyLevel, limit);
      reviewWords.value = result.words;
      reviewProgress.value = result.progress;
      currentWordIndex.value = 0;

      console.log(`📚 Loaded ${result.words.length} words for difficulty: ${difficultyLevel}`);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load words by difficulty';
      console.error('Failed to load words by difficulty:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 新しい単語を取得
   */
  async function loadNewWords(
    userId: string,
    difficultyLevels: string[] = [],
    limit: number = 10
  ) {
    loading.value = true;
    error.value = null;

    try {
      const words = await srsEngine.getNewWords(userId, difficultyLevels, limit);
      return words;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load new words';
      console.error('Failed to load new words:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * レビュー用の単語を直接設定
   */
  function setReviewWords(words: Word[]) {
    reviewWords.value = words;
    currentWordIndex.value = 0;
    console.log(`📝 Set ${words.length} words for review session`);
  }

  /**
   * 学習セッションを開始（単語は既に設定済み）
   */
  function startLearningSession() {
    if (reviewWords.value.length > 0) {
      isReviewActive.value = true;
      sessionStats.value.startTime = new Date();
      sessionStats.value.total = 0;
      sessionStats.value.correct = 0;
      sessionStats.value.wrong = 0;
      console.log(`📖 Learning session started with ${reviewWords.value.length} words`);
    } else {
      error.value = '学習する単語が設定されていません。';
    }
  }

  /**
   * セッションをリセット
   */
  function resetSession() {
    reviewWords.value = [];
    reviewProgress.value = [];
    currentWordIndex.value = 0;
    isReviewActive.value = false;
    sessionStats.value = {
      total: 0,
      correct: 0,
      wrong: 0,
      averageTime: 0,
      startTime: null,
      endTime: null
    };
    error.value = null;
  }

  /**
   * エラーをクリア
   */
  function clearError() {
    error.value = null;
  }

  /**
   * ユーザーの学習進捗をリセット（デモ用）
   */
  async function resetUserProgress(): Promise<void> {
    const userId = 'demo-user';
    loading.value = true;
    error.value = null;

    try {
      console.log('🔄 Resetting user progress...');

      const { wordGalaxyDB } = await import('@/database/word-galaxy/schemas');

      // 該当ユーザーの進捗レコードを全削除
      await wordGalaxyDB.userWordProgress
        .where('userId')
        .equals(userId)
        .delete();

      console.log('✅ User progress reset completed');

      // 統計を再読み込み
      await loadLearningStats(userId);

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reset progress';
      console.error('Failed to reset user progress:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * レベル別で新しい単語を学習キューに追加（ランダム選択）
   */
  async function addNewWordsByLevel(
    level: 'beginner' | 'intermediate' | 'advanced',
    count: number = 50
  ): Promise<{ count: number; words: Word[] }> {
    const userId = 'demo-user'; // TODO: 実際のユーザーIDを使用
    loading.value = true;
    error.value = null;

    try {
      console.log(`🎯 Adding ${count} ${level} words to learning queue...`);

      // 型定義をimportしてenumの正確な値を使用
      const { DifficultyLevel } = await import('@/types/word-galaxy/word.types');

      // レベル別の難易度設定
      const levelFilters = {
        beginner: {
          eikenLevels: [DifficultyLevel.EIKEN_5, DifficultyLevel.EIKEN_4],
          difficultyRange: [1, 3],
          description: '初級（英検5級〜4級）'
        },
        intermediate: {
          eikenLevels: [DifficultyLevel.EIKEN_3, DifficultyLevel.EIKEN_PRE_2],
          difficultyRange: [3, 6],
          description: '中級（英検3級〜準2級）'
        },
        advanced: {
          eikenLevels: [DifficultyLevel.EIKEN_2, DifficultyLevel.EIKEN_PRE_1, DifficultyLevel.EIKEN_1],
          difficultyRange: [6, 10],
          description: '上級（英検2級〜1級）'
        }
      };

      const filter = levelFilters[level];
      console.log(`📊 Using filter for ${filter.description}: difficulty ${filter.difficultyRange[0]}-${filter.difficultyRange[1]}`);

      // データベースから単語データを取得
      const { wordGalaxyDB } = await import('@/database/word-galaxy/schemas');
      const allWords = await wordGalaxyDB.words.toArray();
      console.log(`📚 Total words in database: ${allWords.length}`);

      // データベース内容のサンプリングデバッグ
      if (allWords.length > 0) {
        console.log('🔍 Sample words from database:');
        allWords.slice(0, 10).forEach(word => {
          console.log(`  - ${word.word}: eikenLevel="${word.eikenLevel}" (type: ${typeof word.eikenLevel}), difficulty=${word.difficulty}`);
        });

        // フィルタ条件をログ出力
        console.log('🎯 Filter conditions for', level, ':', {
          eikenLevels: filter.eikenLevels,
          difficultyRange: filter.difficultyRange
        });
      }

      if (allWords.length === 0) {
        console.error('❌ Database is completely empty. Attempting to re-initialize...');

        // データベース再初期化を試行
        try {
          const { initializeWordGalaxy } = await import('@/database/word-galaxy');
          await initializeWordGalaxy();

          // 再度取得を試行
          const retryWords = await wordGalaxyDB.words.toArray();
          if (retryWords.length > 0) {
            console.log(`✅ Re-initialization successful: ${retryWords.length} words loaded`);
            allWords.splice(0, allWords.length, ...retryWords);
          } else {
            throw new Error('Re-initialization failed');
          }
        } catch (reinitError) {
          console.error('❌ Re-initialization failed:', reinitError);
          throw new Error('Could not load word database. Please refresh the page.');
        }
      }

      // レベル別フィルタリング
      console.log('🔍 Starting word filtering...');
      const levelWords = allWords.filter((word, index) => {
        // 英検レベルでの完全一致チェック
        const matchesEiken = filter.eikenLevels.includes(word.eikenLevel as string);

        // 難易度範囲でのチェック
        const matchesDifficulty = word.difficulty >= filter.difficultyRange[0] &&
                                  word.difficulty <= filter.difficultyRange[1];

        // 最初の10単語の詳細ログ
        if (index < 10) {
          console.log(`🔍 Word ${index + 1}: "${word.word}"`, {
            eikenLevel: `"${word.eikenLevel}"`,
            eikenLevelType: typeof word.eikenLevel,
            difficulty: word.difficulty,
            filterEikenLevels: filter.eikenLevels,
            filterDifficultyRange: filter.difficultyRange,
            matchesEiken,
            matchesDifficulty,
            finalMatch: level === 'beginner' ? matchesEiken : (matchesEiken || matchesDifficulty)
          });
        }

        // 初級コースは英検レベルのみでフィルタリング（修正中）
        const finalMatch = level === 'beginner' ? matchesEiken : (matchesEiken || matchesDifficulty);

        // 緊急フォールバック: 英検レベルマッチングが全て失敗した場合、難易度のみで判定
        if (!finalMatch && index < 5) {
          console.warn(`⚠️ Word "${word.word}" didn't match any filter. Eiken: "${word.eikenLevel}", Difficulty: ${word.difficulty}`);
        }

        return finalMatch;
      });

      console.log(`🎯 Found ${levelWords.length} ${level} level words`);

      if (levelWords.length > 0) {
        console.log(`📋 First few ${level} words found:`, levelWords.slice(0, 5).map(w => ({
          word: w.word,
          eikenLevel: w.eikenLevel,
          difficulty: w.difficulty
        })));
      } else {
        console.warn(`⚠️ No words found for ${level} level with filter:`, filter);
        // 全単語で英検レベルの分布を確認
        const eikenDistribution = {};
        allWords.forEach(word => {
          const level = word.eikenLevel;
          eikenDistribution[level] = (eikenDistribution[level] || 0) + 1;
        });
        console.log('📊 Eiken level distribution in database:', eikenDistribution);
      }

      // 既存の学習進捗を取得
      const userProgress = await wordGalaxyDB.userWordProgress
        .where('userId')
        .equals(userId)
        .toArray();

      const learnedWordIds = new Set(userProgress.map(p => p.wordId));

      // デバッグ: 学習進捗の状況を確認
      console.log(`📊 User progress state for ${userId}:`);
      console.log(`  - Total progress records: ${userProgress.length}`);
      console.log(`  - Total words in database: ${allWords.length}`);
      console.log(`  - Learned word IDs: ${Array.from(learnedWordIds).slice(0, 10)} ${learnedWordIds.size > 10 ? '...' : ''}`);

      if (userProgress.length === allWords.length) {
        console.warn('⚠️ ALL words appear to be marked as learned! This might be the issue.');
        console.log('💡 Consider resetting progress or this might be a test account with all words completed.');
      }

      // 未学習の指定レベル単語をフィルタリング
      const availableWords = levelWords.filter(word => !learnedWordIds.has(word.id));
      console.log(`📖 Available unlearned ${level} words: ${availableWords.length}`);

      if (availableWords.length === 0) {
        console.warn(`⚠️ No ${level} words found. Trying fallback approach...`);

        // 緊急フォールバック1: 初級の場合は英検レベルのみ、それ以外は難易度のみでフィルタリング
        const difficultyOnlyWords = allWords.filter(word => {
          const notLearned = !learnedWordIds.has(word.id);

          if (level === 'beginner') {
            // 初級は英検5級と4級のみ
            const matchesEiken = filter.eikenLevels.includes(word.eikenLevel as string);
            return matchesEiken && notLearned;
          } else {
            // 中級・上級は難易度範囲でフィルタ
            const inRange = word.difficulty >= filter.difficultyRange[0] &&
                           word.difficulty <= filter.difficultyRange[1];
            return inRange && notLearned;
          }
        });

        console.log(`🔄 Fallback 1: Found ${difficultyOnlyWords.length} words by ${level === 'beginner' ? 'EIKEN level' : 'difficulty'} filter`);

        if (difficultyOnlyWords.length > 0) {
          // 難易度のみフィルタで見つかった場合、それを使用
          const shuffled = [...difficultyOnlyWords].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, Math.min(count, shuffled.length));
          console.log(`✅ Using ${selected.length} words from fallback`);

          // フォールバックで選択された単語の英検レベルを確認
          console.log(`📊 Fallback words EIKEN level distribution:`, selected.slice(0, 5).map(w => ({
            word: w.word,
            eikenLevel: w.eikenLevel
          })));

          // SRSシステムに追加（同じロジック）
          let addedCount = 0;
          for (const word of selected) {
            const initialProgress: Omit<UserWordProgress, 'id'> = {
              userId,
              wordId: word.id,
              srsLevel: 1,
              lastReviewedAt: new Date(),
              nextReviewAt: new Date(),
              totalAttempts: 0,
              correctAttempts: 0,
              consecutiveCorrect: 0,
              consecutiveWrong: 0,
              masteryLevel: 0,
              isMastered: false,
              firstLearnedAt: new Date(),
              usedInBattles: 0,
              usedInReviews: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const progressId = `${userId}-${word.id}`;
            await wordGalaxyDB.userWordProgress.add({
              ...initialProgress,
              id: progressId
            });

            addedCount++;
            console.log(`✅ Added fallback word: ${word.word} (difficulty: ${word.difficulty})`);
          }

          await loadLearningStats(userId);
          return { count: addedCount, words: selected };
        }

        // 緊急フォールバック2: 全ての未学習単語から最初のN個を使用
        if (allWords.length > 0) {
          const anyUnlearnedWords = allWords.filter(word => !learnedWordIds.has(word.id));
          console.log(`🔄 Fallback 2: Found ${anyUnlearnedWords.length} total unlearned words`);

          if (anyUnlearnedWords.length > 0) {
            const shuffled = [...anyUnlearnedWords].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, Math.min(10, shuffled.length)); // 最大10個
            console.log(`✅ Using ${selected.length} words from any unlearned fallback`);

            let addedCount = 0;
            for (const word of selected) {
              const initialProgress: Omit<UserWordProgress, 'id'> = {
                userId,
                wordId: word.id,
                srsLevel: 1,
                lastReviewedAt: new Date(),
                nextReviewAt: new Date(),
                totalAttempts: 0,
                correctAttempts: 0,
                consecutiveCorrect: 0,
                consecutiveWrong: 0,
                masteryLevel: 0,
                isMastered: false,
                firstLearnedAt: new Date(),
                usedInBattles: 0,
                usedInReviews: 0,
                createdAt: new Date(),
                updatedAt: new Date()
              };

              const progressId = `${userId}-${word.id}`;
              await wordGalaxyDB.userWordProgress.add({
                ...initialProgress,
                id: progressId
              });

              addedCount++;
              console.log(`✅ Added any word: ${word.word}`);
            }

            await loadLearningStats(userId);
            return { count: addedCount, words: selected };
          }
        }

        // 緊急フォールバック3: 学習進捗状況に応じたエラーメッセージ
        if (learnedWordIds.size >= allWords.length * 0.8) {
          console.log('💡 Most/all words appear to be learned. This might be the issue.');
          throw new Error(`${filter.description}レベルの新しい単語がありません。ほとんどの単語が学習済みです。学習進捗をリセットして再開してください。`);
        }

        console.log(`😊 No more ${level} words to learn - all completed or database empty!`);
        throw new Error(`${filter.description}レベルの新しい単語がありません。他のレベルをお試しください。`);
      }

      // ランダムに選択（シャッフル）
      const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);
      const selectedWords = shuffledWords.slice(0, Math.min(count, shuffledWords.length));

      console.log(`🎲 Randomly selected ${selectedWords.length} words for learning`);

      // 選択された単語の英検レベルを確認（デバッグ用）
      console.log(`📊 Selected words EIKEN level distribution for ${level}:`);
      const eikenCount = {};
      selectedWords.forEach(word => {
        const level = word.eikenLevel || 'undefined';
        eikenCount[level] = (eikenCount[level] || 0) + 1;
      });
      console.log(eikenCount);
      console.log(`🔍 First 5 selected words:`, selectedWords.slice(0, 5).map(w => ({
        word: w.word,
        eikenLevel: w.eikenLevel,
        difficulty: w.difficulty
      })));

      // SRSシステムに追加
      let addedCount = 0;
      for (const word of selectedWords) {
        const initialProgress: Omit<UserWordProgress, 'id'> = {
          userId,
          wordId: word.id,
          srsLevel: 1,
          lastReviewedAt: new Date(),
          nextReviewAt: new Date(), // 即座に復習可能

          totalAttempts: 0,
          correctAttempts: 0,
          consecutiveCorrect: 0,
          consecutiveWrong: 0,

          masteryLevel: 0,
          isMastered: false,

          firstLearnedAt: new Date(),

          usedInBattles: 0,
          usedInReviews: 0,

          createdAt: new Date(),
          updatedAt: new Date()
        };

        const progressId = `${userId}-${word.id}`;
        await wordGalaxyDB.userWordProgress.add({
          ...initialProgress,
          id: progressId
        });

        addedCount++;
        console.log(`✅ Added ${level} word to learning: ${word.word} (difficulty: ${word.difficulty})`);
      }

      console.log(`🎉 Successfully added ${addedCount} ${level} words to learning queue`);

      // 学習統計を即座に更新
      await loadLearningStats(userId);

      return { count: addedCount, words: selectedWords };

    } catch (err) {
      console.error(`❌ Failed to add ${level} words to learning:`, err);
      error.value = err instanceof Error ? err.message : `Failed to add ${level} words`;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 新しい単語を学習キューに追加（レガシー関数）
   */
  async function addNewWordsToLearning(count: number = 5): Promise<number> {
    try {
      loading.value = true;
      console.log(`🆕 Adding ${count} new words to learning queue...`);

      const { wordGalaxyDB } = await import('@/database/word-galaxy/schemas');

      // デバッグ: データベース状態を確認
      const allWords = await wordGalaxyDB.words.toArray();
      const userProgress = await wordGalaxyDB.userWordProgress.toArray();

      console.log(`📊 Database status: ${allWords.length} total words, ${userProgress.length} user progress records`);

      if (allWords.length === 0) {
        console.log('⚠️ No words in database - trying emergency fallback...');

        // Emergency fallback: use in-memory words
        try {
          console.log('🔄 [Emergency] Loading fallback word data...');

          // Create minimal word objects for immediate use
          const fallbackWords = [
            {
              id: 'word-1',
              word: 'cat',
              meanings: ['猫'],
              pronunciation: '/kæt/',
              eikenLevel: 'eiken-5' as any,
              toeicLevel: 'toeic-beginner' as any,
              difficulty: 1,
              frequency: 10,
              partOfSpeech: ['noun'],
              categories: ['animals'],
              tags: ['basic'],
              examples: [{ sentence: 'I have a cat.', translation: '私は猫を飼っています。' }],
              synonyms: [],
              antonyms: [],
              relatedWords: [],
              source: 'Emergency',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'word-2',
              word: 'dog',
              meanings: ['犬'],
              pronunciation: '/dɔːg/',
              eikenLevel: 'eiken-5' as any,
              toeicLevel: 'toeic-beginner' as any,
              difficulty: 1,
              frequency: 10,
              partOfSpeech: ['noun'],
              categories: ['animals'],
              tags: ['basic'],
              examples: [{ sentence: 'The dog is running.', translation: '犬が走っています。' }],
              synonyms: [],
              antonyms: [],
              relatedWords: [],
              source: 'Emergency',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'word-3',
              word: 'book',
              meanings: ['本'],
              pronunciation: '/bʊk/',
              eikenLevel: 'eiken-5' as any,
              toeicLevel: 'toeic-beginner' as any,
              difficulty: 1,
              frequency: 10,
              partOfSpeech: ['noun'],
              categories: ['objects'],
              tags: ['basic'],
              examples: [{ sentence: 'I read a book.', translation: '私は本を読みます。' }],
              synonyms: [],
              antonyms: [],
              relatedWords: [],
              source: 'Emergency',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          console.log(`✅ [Emergency] Created ${fallbackWords.length} fallback words`);
          allWords.splice(0, allWords.length, ...fallbackWords);
          console.log('✅ [Emergency] Fallback words ready for use');
        } catch (fallbackError) {
          console.error('❌ [Emergency] Even fallback failed:', fallbackError);
          throw new Error('Complete system failure. Please refresh the page.');
        }
      }

      const learnedWordIds = new Set(userProgress.map(p => p.wordId));

      // 未学習の単語をフィルタリング
      const unlearnedWords = allWords.filter(word => !learnedWordIds.has(word.id));

      console.log(`📚 Found ${unlearnedWords.length} unlearned words out of ${allWords.length} total words`);

      if (unlearnedWords.length === 0) {
        console.log('🎉 No new words available - all words already learned');
        return 0;
      }

      // 難易度順でソート（易しいものから）
      const sortedWords = unlearnedWords.sort((a, b) => a.difficulty - b.difficulty);

      // 指定された数の単語を選択
      const wordsToAdd = sortedWords.slice(0, Math.min(count, sortedWords.length));

      // SRSシステムに追加
      let addedCount = 0;
      for (const word of wordsToAdd) {
        const initialProgress: Omit<UserWordProgress, 'id'> = {
          userId: 'demo-user', // TODO: 実際のユーザーIDを使用
          wordId: word.id,
          srsLevel: 1, // レベル1から開始
          lastReviewedAt: new Date(),
          nextReviewAt: new Date(), // 即座に復習可能

          totalAttempts: 0,
          correctAttempts: 0,
          consecutiveCorrect: 0,
          consecutiveWrong: 0,

          masteryLevel: 0,
          isMastered: false,

          firstLearnedAt: new Date(),

          usedInBattles: 0,
          usedInReviews: 0,

          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Generate UUID with fallback
        function generateUUID(): string {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
          }
          // Fallback UUID generator
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }

        const progressId = `${initialProgress.userId}-${word.id}`;
        await wordGalaxyDB.userWordProgress.add({
          ...initialProgress,
          id: progressId
        });

        addedCount++;
        console.log(`✅ Added word to learning: ${word.word}`);
      }

      console.log(`🎉 Successfully added ${addedCount} new words to learning queue`);

      // 学習統計を即座に更新
      await loadLearningStats('demo-user'); // TODO: 実際のユーザーIDを使用

      return addedCount;

    } catch (err) {
      console.error('❌ Failed to add new words to learning:', err);
      error.value = err instanceof Error ? err.message : 'Failed to add new words';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 全データを初期化（開発用）
   */
  function resetStore() {
    resetSession();
    learningStats.value = {
      totalWords: 0,
      masteredWords: 0,
      reviewsDue: 0,
      averageMastery: 0,
      levelDistribution: {},
      streakStats: {
        currentStreak: 0,
        longestStreak: 0
      }
    };
    forgettingCurveData.value = {
      levels: [],
      retentionRates: []
    };
  }

  return {
    // State
    reviewWords,
    reviewProgress,
    currentWordIndex,
    sessionStats,
    isReviewActive,
    loading,
    error,
    learningStats,
    forgettingCurveData,

    // Getters
    currentWord,
    currentProgress,
    hasMoreWords,
    accuracy,
    sessionProgress,
    pendingReviewCount,
    masteryPercentage,

    // Actions
    loadReviewWords,
    setReviewWords,
    startReviewSession,
    startLearningSession,
    submitAnswer,
    nextWord,
    endReviewSession,
    loadLearningStats,
    loadForgettingCurveData,
    startLearningWord,
    loadReviewWordsByDifficulty,
    loadNewWords,
    addNewWordsToLearning,
    addNewWordsByLevel,
    resetSession,
    clearError,
    resetUserProgress,
    resetStore
  };
});