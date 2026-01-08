/**
 * Spaced Repetition System (SRS) Algorithm
 * 間隔反復学習システム - 科学的な記憶定着メソッド
 */

import { wordGalaxyDB } from '@/database/word-galaxy/schemas';
import type { Word, UserWordProgress, SRSInterval } from '@/types/word-galaxy/word.types';

// ===== SRS設定定数 =====
/**
 * SRSレベルと復習間隔の定義
 * レベル1から8まで、段階的に間隔を延ばしていく
 */
export const SRS_INTERVALS: SRSInterval[] = [
  { level: 1, hours: 4 },      // 4時間後 - 初回学習直後
  { level: 2, hours: 24 },     // 1日後 - 短期記憶確認
  { level: 3, hours: 72 },     // 3日後 - 記憶定着確認
  { level: 4, hours: 168 },    // 1週間後 - 中期記憶確認
  { level: 5, hours: 336 },    // 2週間後 - 長期記憶移行
  { level: 6, hours: 720 },    // 1ヶ月後 - 長期記憶確認
  { level: 7, hours: 2160 },   // 3ヶ月後 - 習熟確認
  { level: 8, hours: 4320 }    // 6ヶ月後 - マスターレベル
];

/**
 * SRSエンジンクラス
 * 間隔反復学習のコアロジックを管理
 */
export class SRSEngine {
  /**
   * 次の復習時刻を計算
   */
  calculateNextReview(currentLevel: number, isCorrect: boolean): Date {
    const newLevel = this.updateLevel(currentLevel, isCorrect);
    const interval = SRS_INTERVALS.find(i => i.level === newLevel);

    if (!interval) {
      throw new Error(`Invalid SRS level: ${newLevel}`);
    }

    const nextReviewTime = new Date(Date.now() + interval.hours * 60 * 60 * 1000);
    return nextReviewTime;
  }

  /**
   * SRSレベル更新ロジック
   * 正解: +1レベル（最大8）
   * 不正解: -2レベル（最小1）
   */
  updateLevel(currentLevel: number, isCorrect: boolean): number {
    if (isCorrect) {
      // 正解: 1段階上げる（最大8レベル）
      return Math.min(currentLevel + 1, 8);
    } else {
      // 不正解: 2段階下げる（最小1レベル）
      return Math.max(currentLevel - 2, 1);
    }
  }

  /**
   * 復習が必要な単語を取得
   * 復習時刻が過ぎている単語を優先度順で取得
   */
  async getWordsForReview(userId: string, limit: number = 20): Promise<{
    words: Word[];
    progress: UserWordProgress[];
  }> {
    const now = new Date();

    try {
      // ユーザーIDの検証
      if (!userId || typeof userId !== 'string') {
        console.warn('Invalid userId provided to getWordsForReview:', userId);
        return { words: [], progress: [] };
      }

      // 復習時刻が過ぎている進捗データを取得
      // まずユーザーの全進捗を取得してから時刻でフィルタ
      const allUserProgress = await wordGalaxyDB.userWordProgress
        .where('userId')
        .equals(userId)
        .toArray();

      // 復習時刻が過ぎているものをフィルタ
      const dueProgress = allUserProgress
        .filter(progress => {
          if (!progress.nextReviewAt) return false;
          return new Date(progress.nextReviewAt) <= now;
        })
        .slice(0, limit);

      if (dueProgress.length === 0) {
        return { words: [], progress: [] };
      }

      // 対応する単語データを取得
      const wordIds = dueProgress.map(p => p.wordId);
      const words = await wordGalaxyDB.words.bulkGet(wordIds);

      // null値を除外して有効な単語のみ返す
      const validEntries: { word: Word; progress: UserWordProgress }[] = [];

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const progress = dueProgress[i];

        if (word) {
          validEntries.push({ word, progress });
        }
      }

      // 優先度でソート（SRSレベルが低い + 復習が遅れているほど優先）
      validEntries.sort((a, b) => {
        const aPriority = this.calculatePriority(a.progress, now);
        const bPriority = this.calculatePriority(b.progress, now);
        return bPriority - aPriority; // 降順
      });

      return {
        words: validEntries.map(e => e.word),
        progress: validEntries.map(e => e.progress)
      };
    } catch (error) {
      console.error('Failed to get words for review:', error);
      return { words: [], progress: [] };
    }
  }

  /**
   * 復習の優先度を計算
   * SRSレベルが低く、復習が遅れているほど高い優先度
   */
  private calculatePriority(progress: UserWordProgress, now: Date): number {
    const hoursOverdue = (now.getTime() - progress.nextReviewAt.getTime()) / (1000 * 60 * 60);
    const levelWeight = (9 - progress.srsLevel) * 10; // レベルが低いほど高いweight
    const overdueWeight = Math.max(hoursOverdue, 0); // 遅れているほど高いweight

    return levelWeight + overdueWeight;
  }

  /**
   * 新しい単語の学習を開始
   */
  async startLearning(userId: string, wordId: string): Promise<UserWordProgress> {
    const progressId = `${userId}-${wordId}`;

    // 既に進捗がある場合はエラー
    const existingProgress = await wordGalaxyDB.userWordProgress.get(progressId);
    if (existingProgress) {
      throw new Error('Word already started learning');
    }

    const now = new Date();
    const progress: UserWordProgress = {
      id: progressId,
      userId,
      wordId,
      srsLevel: 1,
      lastReviewedAt: now,
      nextReviewAt: this.calculateNextReview(1, true), // 初回は正解として扱う
      totalAttempts: 1,
      correctAttempts: 1,
      consecutiveCorrect: 1,
      consecutiveWrong: 0,
      masteryLevel: 10, // 初回10%
      isMastered: false,
      firstLearnedAt: now,
      usedInBattles: 0,
      usedInReviews: 0,
      createdAt: now,
      updatedAt: now
    };

    await wordGalaxyDB.userWordProgress.add(progress);
    return progress;
  }

  /**
   * 復習結果を記録
   */
  async recordReview(
    userId: string,
    wordId: string,
    isCorrect: boolean,
    responseTime: number
  ): Promise<UserWordProgress> {
    const progressId = `${userId}-${wordId}`;
    console.log('🔍 Debug recordReview lookup:', { userId, wordId, progressId });

    let progress = await wordGalaxyDB.userWordProgress.get(progressId);
    console.log('🔍 Found progress record:', progress ? 'YES' : 'NO');

    // プログレス記録が存在しない場合は新規作成
    if (!progress) {
      console.log(`🆕 Creating new progress record for word: ${wordId}`);

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

      progress = {
        id: progressId, // Use the consistent progressId format
        userId,
        wordId,
        srsLevel: 1,
        nextReviewAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4時間後
        lastReviewedAt: null,
        masteryLevel: 'learning',
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        averageResponseTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        firstLearnedAt: new Date(),
        usedInBattles: 0,
        usedInReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await wordGalaxyDB.userWordProgress.add(progress);
    }

    const now = new Date();

    // 統計更新
    progress.totalAttempts++;
    progress.lastReviewedAt = now;
    progress.usedInReviews++;

    if (isCorrect) {
      progress.correctAttempts++;
      progress.consecutiveCorrect++;
      progress.consecutiveWrong = 0;
      progress.lastCorrectAt = now;
    } else {
      progress.consecutiveCorrect = 0;
      progress.consecutiveWrong++;
      progress.lastWrongAt = now;
    }

    // SRSレベル更新
    const oldLevel = progress.srsLevel;
    progress.srsLevel = this.updateLevel(progress.srsLevel, isCorrect);
    progress.nextReviewAt = this.calculateNextReview(progress.srsLevel, isCorrect);

    // マスタリーレベル計算（複合的な指標）
    progress.masteryLevel = this.calculateMasteryLevel(progress);

    // マスター判定（レベル8 かつ マスタリー90%以上 かつ 連続正解5回以上）
    if (progress.srsLevel === 8 && progress.masteryLevel >= 90 && progress.consecutiveCorrect >= 5) {
      progress.isMastered = true;
      progress.masteredAt = now;
    }

    progress.updatedAt = now;

    await wordGalaxyDB.userWordProgress.put(progress);

    // レベルアップイベントを記録
    if (progress.srsLevel > oldLevel) {
      console.log(`🔥 SRS Level Up! ${oldLevel} → ${progress.srsLevel} for word: ${wordId}`);
    }

    return progress;
  }

  /**
   * マスタリーレベルを計算
   * 正答率、SRSレベル、連続正解、レスポンス時間を総合評価
   */
  private calculateMasteryLevel(progress: UserWordProgress): number {
    if (progress.totalAttempts === 0) return 0;

    // 正答率 (0-40点)
    const accuracy = progress.correctAttempts / progress.totalAttempts;
    const accuracyScore = accuracy * 40;

    // SRSレベル (0-30点)
    const levelScore = (progress.srsLevel / 8) * 30;

    // 連続正解ボーナス (0-20点)
    const streakScore = Math.min(progress.consecutiveCorrect / 10, 1) * 20;

    // 経験値ボーナス (0-10点) - 総試行回数が多いほど高い
    const experienceScore = Math.min(progress.totalAttempts / 20, 1) * 10;

    const totalScore = accuracyScore + levelScore + streakScore + experienceScore;
    return Math.min(Math.round(totalScore), 100);
  }

  /**
   * 学習統計を取得
   */
  async getLearningStats(userId: string): Promise<{
    totalWords: number;
    masteredWords: number;
    reviewsDue: number;
    averageMastery: number;
    levelDistribution: Record<number, number>;
    streakStats: {
      currentStreak: number;
      longestStreak: number;
    };
  }> {
    try {
      const allProgress = await wordGalaxyDB.userWordProgress
        .where('userId')
        .equals(userId)
        .toArray();

      const now = new Date();
      const reviewsDue = await wordGalaxyDB.userWordProgress
        .where('[userId+nextReviewAt]')
        .between([userId, new Date(0)], [userId, now])
        .count();

      // 統計計算
      const totalWords = allProgress.length;
      const masteredWords = allProgress.filter(p => p.isMastered).length;
      const averageMastery = totalWords > 0
        ? allProgress.reduce((sum, p) => sum + p.masteryLevel, 0) / totalWords
        : 0;

      // レベル分布
      const levelDistribution: Record<number, number> = {};
      for (let i = 1; i <= 8; i++) {
        levelDistribution[i] = allProgress.filter(p => p.srsLevel === i).length;
      }

      // ストリーク統計（簡易版）
      const streakStats = {
        currentStreak: this.calculateCurrentStreak(allProgress),
        longestStreak: this.calculateLongestStreak(allProgress)
      };

      return {
        totalWords,
        masteredWords,
        reviewsDue,
        averageMastery: Math.round(averageMastery),
        levelDistribution,
        streakStats
      };
    } catch (error) {
      console.error('Failed to get learning stats:', error);
      throw error;
    }
  }

  /**
   * 現在の連続正解ストリークを計算
   */
  private calculateCurrentStreak(progressList: UserWordProgress[]): number {
    // 最新の復習から遡って連続正解数をカウント
    const recentReviews = progressList
      .filter(p => p.lastReviewedAt)
      .sort((a, b) => b.lastReviewedAt.getTime() - a.lastReviewedAt.getTime());

    let streak = 0;
    for (const progress of recentReviews) {
      if (progress.consecutiveCorrect > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 最長連続正解ストリークを計算
   */
  private calculateLongestStreak(progressList: UserWordProgress[]): number {
    return Math.max(...progressList.map(p => p.consecutiveCorrect), 0);
  }

  /**
   * ユーザーがまだ学習していない新しい単語を取得
   */
  async getNewWords(
    userId: string,
    difficultyLevels: string[] = [],
    limit: number = 10
  ): Promise<Word[]> {
    try {
      // ユーザーが既に学習中の単語IDを取得
      const learnedWordIds = await wordGalaxyDB.userWordProgress
        .where('userId')
        .equals(userId)
        .primaryKeys()
        .then(keys => keys.map(key => key.toString().split('-')[1]));

      // 学習していない単語を取得
      let query = wordGalaxyDB.words.where('id').noneOf(learnedWordIds);

      // 難易度フィルター
      if (difficultyLevels.length > 0) {
        query = query.and(word =>
          difficultyLevels.includes(word.eikenLevel) ||
          difficultyLevels.includes(word.toeicLevel)
        );
      }

      // 難易度順（易しいものから）でソートして取得
      const newWords = await query
        .orderBy('difficulty')
        .limit(limit)
        .toArray();

      return newWords;
    } catch (error) {
      console.error('Failed to get new words:', error);
      return [];
    }
  }

  /**
   * 特定の難易度レベルの復習可能な単語を取得
   */
  async getReviewWordsByDifficulty(
    userId: string,
    difficultyLevel: string,
    limit: number = 10
  ): Promise<{ words: Word[]; progress: UserWordProgress[] }> {
    const now = new Date();

    try {
      const dueProgress = await wordGalaxyDB.userWordProgress
        .where('[userId+nextReviewAt]')
        .between([userId, new Date(0)], [userId, now])
        .limit(limit * 2) // 多めに取得してフィルタ
        .toArray();

      // 対応する単語を取得してフィルタ
      const validEntries: { word: Word; progress: UserWordProgress }[] = [];

      for (const progress of dueProgress) {
        const word = await wordGalaxyDB.words.get(progress.wordId);
        if (word && (word.eikenLevel === difficultyLevel || word.toeicLevel === difficultyLevel)) {
          validEntries.push({ word, progress });
        }

        if (validEntries.length >= limit) break;
      }

      return {
        words: validEntries.map(e => e.word),
        progress: validEntries.map(e => e.progress)
      };
    } catch (error) {
      console.error('Failed to get review words by difficulty:', error);
      return { words: [], progress: [] };
    }
  }

  /**
   * 忘却曲線データを生成（統計表示用）
   */
  async getForgettingCurveData(userId: string): Promise<{
    levels: number[];
    retentionRates: number[];
  }> {
    try {
      const allProgress = await wordGalaxyDB.userWordProgress
        .where('userId')
        .equals(userId)
        .toArray();

      const levels = [1, 2, 3, 4, 5, 6, 7, 8];
      const retentionRates = levels.map(level => {
        const wordsAtLevel = allProgress.filter(p => p.srsLevel === level);
        if (wordsAtLevel.length === 0) return 0;

        const retainedWords = wordsAtLevel.filter(p => {
          const accuracy = p.correctAttempts / Math.max(p.totalAttempts, 1);
          return accuracy >= 0.7; // 70%以上の正答率を「定着」とみなす
        });

        return (retainedWords.length / wordsAtLevel.length) * 100;
      });

      return { levels, retentionRates };
    } catch (error) {
      console.error('Failed to get forgetting curve data:', error);
      return { levels: [], retentionRates: [] };
    }
  }
}

// シングルトンインスタンス
export const srsEngine = new SRSEngine();