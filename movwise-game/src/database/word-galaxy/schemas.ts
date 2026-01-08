/**
 * Word Galaxy Database Schema
 * Dexie.js (IndexedDB) を使用したローカルデータベース
 */

import Dexie, { Table } from 'dexie';
import type {
  Word,
  UserWordProgress,
  DailyMission,
  StreakRecord,
  BattleRecord,
  UserStats,
  DifficultyLevel
} from '@/types/word-galaxy/word.types';

// ===== Dexieデータベースクラス =====
export class WordGalaxyDatabase extends Dexie {
  // テーブル定義
  words!: Table<Word, string>;
  userWordProgress!: Table<UserWordProgress, string>;
  dailyMissions!: Table<DailyMission, string>;
  streakRecords!: Table<StreakRecord, string>;
  battleRecords!: Table<BattleRecord, string>;
  userStats!: Table<UserStats, string>;

  constructor() {
    super('WordGalaxyDB');

    // スキーマ定義（バージョン1）
    this.version(1).stores({
      // 単語マスターデータ
      words: 'id, word, eikenLevel, toeicLevel, difficulty, *categories, *tags, *partOfSpeech',

      // ユーザー単語進捗
      userWordProgress: 'id, userId, wordId, [userId+srsLevel], [userId+nextReviewAt], [userId+masteryLevel], srsLevel, nextReviewAt, lastReviewedAt',

      // デイリーミッション
      dailyMissions: 'id, userId, date, [userId+date], allCompleted',

      // 連続記録
      streakRecords: 'userId, currentStreak, longestStreak, lastActiveDate',

      // 対戦記録
      battleRecords: 'id, userId, playedAt, mode, result, [userId+playedAt]',

      // ユーザー統計
      userStats: 'userId, totalWordsLearned, totalWordsMastered, totalBattles'
    });

    // フック設定
    this.words.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.words.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    this.userWordProgress.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.userWordProgress.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });
  }

  // ===== ユーティリティメソッド =====

  /**
   * データベースを初期化
   */
  async initialize(): Promise<void> {
    try {
      await this.open();
      console.log('✅ Word Galaxy Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Word Galaxy Database:', error);
      throw error;
    }
  }

  /**
   * 全データをクリア（開発用）
   */
  async clearAllData(): Promise<void> {
    await this.transaction('rw', this.tables, async () => {
      await Promise.all(this.tables.map(table => table.clear()));
    });
    console.log('🗑️ All Word Galaxy data cleared');
  }

  /**
   * データベース統計を取得
   */
  async getStats(): Promise<{
    words: number;
    users: number;
    totalProgress: number;
    todayMissions: number;
    battles: number;
  }> {
    const [
      words,
      uniqueUsers,
      totalProgress,
      todayMissions,
      battles
    ] = await Promise.all([
      this.words.count(),
      this.userWordProgress.orderBy('userId').uniqueKeys().then(keys => keys.length),
      this.userWordProgress.count(),
      this.dailyMissions.where('date').equals(new Date().toISOString().split('T')[0]).count(),
      this.battleRecords.count()
    ]);

    return {
      words,
      users: uniqueUsers,
      totalProgress,
      todayMissions,
      battles
    };
  }

  /**
   * ユーザーの全データを取得
   */
  async getUserData(userId: string): Promise<{
    progress: UserWordProgress[];
    missions: DailyMission[];
    streak: StreakRecord | undefined;
    battles: BattleRecord[];
    stats: UserStats | undefined;
  }> {
    const [progress, missions, streak, battles, stats] = await Promise.all([
      this.userWordProgress.where('userId').equals(userId).toArray(),
      this.dailyMissions.where('userId').equals(userId).reverse().limit(30).toArray(),
      this.streakRecords.get(userId),
      this.battleRecords.where('userId').equals(userId).reverse().limit(100).toArray(),
      this.userStats.get(userId)
    ]);

    return { progress, missions, streak, battles, stats };
  }

  /**
   * 単語検索
   */
  async searchWords(
    query: string,
    difficulty?: DifficultyLevel,
    limit: number = 20
  ): Promise<Word[]> {
    let collection = this.words.orderBy('word');

    if (difficulty) {
      collection = collection.and(word =>
        word.eikenLevel === difficulty || word.toeicLevel === difficulty
      );
    }

    if (query) {
      collection = collection.and(word =>
        word.word.toLowerCase().includes(query.toLowerCase()) ||
        word.meanings.some(meaning => meaning.toLowerCase().includes(query.toLowerCase()))
      );
    }

    return collection.limit(limit).toArray();
  }

  /**
   * 復習が必要な単語を取得
   */
  async getWordsForReview(userId: string, limit: number = 20): Promise<{
    words: Word[];
    progress: UserWordProgress[];
  }> {
    const now = new Date();

    // 復習時刻が過ぎている進捗を取得
    const dueProgress = await this.userWordProgress
      .where('[userId+nextReviewAt]')
      .between([userId, new Date(0)], [userId, now])
      .limit(limit)
      .toArray();

    // 対応する単語データを取得
    const wordIds = dueProgress.map(p => p.wordId);
    const words = await this.words.bulkGet(wordIds);

    // null値を除外
    const validWords = words.filter((word): word is Word => word !== undefined);

    return {
      words: validWords,
      progress: dueProgress
    };
  }

  /**
   * 難易度別の単語を取得
   */
  async getWordsByDifficulty(
    difficulty: DifficultyLevel,
    limit: number = 50
  ): Promise<Word[]> {
    return this.words
      .where('eikenLevel').equals(difficulty)
      .or('toeicLevel').equals(difficulty)
      .limit(limit)
      .toArray();
  }

  /**
   * ユーザーがまだ学習していない単語を取得
   */
  async getNewWords(
    userId: string,
    difficulty?: DifficultyLevel,
    limit: number = 10
  ): Promise<Word[]> {
    // ユーザーの進捗がある単語IDを取得
    const learnedWordIds = await this.userWordProgress
      .where('userId').equals(userId)
      .primaryKeys()
      .then(keys => keys.map(key => key.toString().split('-')[1]));

    // まだ学習していない単語を取得
    let collection = this.words.where('id').noneOf(learnedWordIds);

    if (difficulty) {
      collection = collection.and(word =>
        word.eikenLevel === difficulty || word.toeicLevel === difficulty
      );
    }

    return collection.limit(limit).toArray();
  }

  /**
   * バックアップデータを生成
   */
  async exportUserData(userId: string): Promise<string> {
    const userData = await this.getUserData(userId);
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      userId,
      version: '1.0.0',
      data: userData
    }, null, 2);
  }

  /**
   * バックアップからデータを復元
   */
  async importUserData(backupJson: string): Promise<void> {
    try {
      const backup = JSON.parse(backupJson);
      const { userId, data } = backup;

      await this.transaction('rw', [
        this.userWordProgress,
        this.dailyMissions,
        this.streakRecords,
        this.battleRecords,
        this.userStats
      ], async () => {
        // 既存データを削除
        await this.userWordProgress.where('userId').equals(userId).delete();
        await this.dailyMissions.where('userId').equals(userId).delete();
        await this.streakRecords.delete(userId);
        await this.battleRecords.where('userId').equals(userId).delete();
        await this.userStats.delete(userId);

        // 新しいデータを挿入
        if (data.progress.length > 0) {
          await this.userWordProgress.bulkAdd(data.progress);
        }
        if (data.missions.length > 0) {
          await this.dailyMissions.bulkAdd(data.missions);
        }
        if (data.streak) {
          await this.streakRecords.add(data.streak);
        }
        if (data.battles.length > 0) {
          await this.battleRecords.bulkAdd(data.battles);
        }
        if (data.stats) {
          await this.userStats.add(data.stats);
        }
      });

      console.log(`✅ User data imported successfully for ${userId}`);
    } catch (error) {
      console.error('❌ Failed to import user data:', error);
      throw error;
    }
  }
}

// シングルトンインスタンス
export const wordGalaxyDB = new WordGalaxyDatabase();

// 自動初期化
wordGalaxyDB.initialize().catch(console.error);