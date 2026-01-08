/**
 * Word Difficulty Calculation and Mapping
 * 単語の難易度を自動計算し、英検・TOEICレベルにマッピング
 */

import { DifficultyLevel, type WordDifficulty } from '@/types/word-galaxy/word.types';

// ===== 難易度マッピング定数 =====
export const DIFFICULTY_MAPPING = {
  'eiken-5': 'toeic-beginner',
  'eiken-4': 'toeic-beginner',
  'eiken-3': 'toeic-elementary',
  'eiken-pre2': 'toeic-intermediate',
  'eiken-2': 'toeic-intermediate',
  'eiken-pre1': 'toeic-advanced',
  'eiken-1': 'toeic-expert'
} as const;

// ===== 音節数計算 =====
/**
 * 簡易音節カウント（母音のグループ数ベース）
 */
export function countSyllables(word: string): number {
  const cleanWord = word.toLowerCase()
    // 語尾のeを除外（ただし、leで終わる場合は除く）
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    // 先頭のyを除外
    .replace(/^y/, '');

  // 母音のグループを検出
  const vowelGroups = cleanWord.match(/[aeiouy]{1,2}/g);
  const syllableCount = vowelGroups ? vowelGroups.length : 1;

  // 最低1音節は保証
  return Math.max(syllableCount, 1);
}

// ===== 難易度計算アルゴリズム =====
/**
 * 単語の難易度を計算（1-10スケール）
 */
export function calculateWordDifficulty(word: string, frequency: number = 5): number {
  let score = 5; // 基本スコア（中間値）

  // 1. 文字数による調整
  const length = word.length;
  if (length <= 3) score -= 2.5;      // 非常に短い -> 易しい
  else if (length <= 4) score -= 1.5; // 短い -> やや易しい
  else if (length <= 6) score -= 0.5; // 普通 -> 少し易しい
  else if (length >= 12) score += 3;  // 非常に長い -> 非常に難しい
  else if (length >= 10) score += 2;  // 長い -> 難しい
  else if (length >= 8) score += 1;   // やや長い -> やや難しい

  // 2. 音節数による調整
  const syllables = countSyllables(word);
  if (syllables === 1) score -= 1;       // 単音節 -> 易しい
  else if (syllables === 2) score -= 0.5; // 2音節 -> やや易しい
  else if (syllables >= 4) score += (syllables - 3) * 0.5; // 4音節以上 -> 難しい

  // 3. 使用頻度による調整
  if (frequency >= 9) score -= 2;     // 高頻度 -> 易しい
  else if (frequency >= 7) score -= 1; // 中高頻度 -> やや易しい
  else if (frequency <= 3) score += 1.5; // 低頻度 -> 難しい
  else if (frequency <= 1) score += 2;   // 非常に低頻度 -> 非常に難しい

  // 4. 単語パターンによる調整
  // 語尾パターン
  if (word.endsWith('ing')) score += 0.5;    // 動名詞・現在分詞
  if (word.endsWith('tion')) score += 1;     // 抽象名詞
  if (word.endsWith('ly')) score += 0.5;     // 副詞
  if (word.endsWith('ful')) score += 0.5;    // 形容詞
  if (word.endsWith('ness')) score += 1;     // 抽象名詞
  if (word.endsWith('ment')) score += 1;     // 抽象名詞

  // 接頭辞パターン
  if (word.startsWith('un')) score += 0.5;   // 否定接頭辞
  if (word.startsWith('pre')) score += 1;    // 前置接頭辞
  if (word.startsWith('anti')) score += 1.5; // 反対接頭辞
  if (word.startsWith('dis')) score += 1;    // 否定接頭辞

  // 5. 特殊文字・複雑さ
  if (word.includes('-')) score += 0.5;      // ハイフンあり
  if (/[^a-z]/i.test(word)) score += 1;      // 特殊文字あり

  // 6. 1-10の範囲に制限
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

// ===== 英検レベルマッピング =====
/**
 * 難易度スコアを英検レベルにマッピング
 */
export function mapToEikenLevel(difficulty: number): DifficultyLevel {
  if (difficulty <= 2) return DifficultyLevel.EIKEN_5;
  if (difficulty <= 3.5) return DifficultyLevel.EIKEN_4;
  if (difficulty <= 5) return DifficultyLevel.EIKEN_3;
  if (difficulty <= 6.5) return DifficultyLevel.EIKEN_PRE_2;
  if (difficulty <= 8) return DifficultyLevel.EIKEN_2;
  if (difficulty <= 9) return DifficultyLevel.EIKEN_PRE_1;
  return DifficultyLevel.EIKEN_1;
}

// ===== TOEICレベルマッピング =====
/**
 * 難易度スコアをTOEICレベルにマッピング
 */
export function mapToToeicLevel(difficulty: number): DifficultyLevel {
  if (difficulty <= 3) return DifficultyLevel.TOEIC_BEGINNER;
  if (difficulty <= 5) return DifficultyLevel.TOEIC_ELEMENTARY;
  if (difficulty <= 7) return DifficultyLevel.TOEIC_INTERMEDIATE;
  if (difficulty <= 8.5) return DifficultyLevel.TOEIC_ADVANCED;
  return DifficultyLevel.TOEIC_EXPERT;
}

// ===== 包括的難易度分析 =====
/**
 * 単語の包括的難易度分析
 */
export function analyzeWordDifficulty(word: string, frequency: number = 5): WordDifficulty {
  const difficulty = calculateWordDifficulty(word, frequency);
  const eikenLevel = mapToEikenLevel(difficulty);
  const toeicLevel = mapToToeicLevel(difficulty);

  return {
    word,
    eikenLevel,
    toeicLevel,
    frequency,
    academicLevel: Math.round(difficulty),
    syllableCount: countSyllables(word),
    letterCount: word.length
  };
}

// ===== 難易度分布ユーティリティ =====
/**
 * 単語リストの難易度分布を取得
 */
export function getDifficultyDistribution(words: string[]): Record<DifficultyLevel, number> {
  const distribution: Record<DifficultyLevel, number> = {
    [DifficultyLevel.EIKEN_5]: 0,
    [DifficultyLevel.EIKEN_4]: 0,
    [DifficultyLevel.EIKEN_3]: 0,
    [DifficultyLevel.EIKEN_PRE_2]: 0,
    [DifficultyLevel.EIKEN_2]: 0,
    [DifficultyLevel.EIKEN_PRE_1]: 0,
    [DifficultyLevel.EIKEN_1]: 0,
    [DifficultyLevel.TOEIC_BEGINNER]: 0,
    [DifficultyLevel.TOEIC_ELEMENTARY]: 0,
    [DifficultyLevel.TOEIC_INTERMEDIATE]: 0,
    [DifficultyLevel.TOEIC_ADVANCED]: 0,
    [DifficultyLevel.TOEIC_EXPERT]: 0
  };

  words.forEach(word => {
    const analysis = analyzeWordDifficulty(word);
    distribution[analysis.eikenLevel]++;
  });

  return distribution;
}

// ===== バランス検証 =====
/**
 * 難易度分布がバランスしているかチェック
 */
export function validateDifficultyBalance(
  distribution: Record<DifficultyLevel, number>,
  totalWords: number
): {
  isBalanced: boolean;
  recommendations: string[];
  percentages: Record<DifficultyLevel, number>;
} {
  const percentages = Object.fromEntries(
    Object.entries(distribution).map(([level, count]) => [
      level,
      Math.round((count / totalWords) * 100)
    ])
  ) as Record<DifficultyLevel, number>;

  const recommendations: string[] = [];
  let isBalanced = true;

  // 理想的な分布（英検ベース）
  const idealDistribution = {
    [DifficultyLevel.EIKEN_5]: 20,      // 20% - 基礎語彙
    [DifficultyLevel.EIKEN_4]: 18,      // 18% - 初級語彙
    [DifficultyLevel.EIKEN_3]: 16,      // 16% - 中学レベル
    [DifficultyLevel.EIKEN_PRE_2]: 14,  // 14% - 高校初級
    [DifficultyLevel.EIKEN_2]: 12,      // 12% - 高校レベル
    [DifficultyLevel.EIKEN_PRE_1]: 10,  // 10% - 大学初級
    [DifficultyLevel.EIKEN_1]: 10       // 10% - 上級語彙
  };

  Object.entries(idealDistribution).forEach(([level, ideal]) => {
    const actual = percentages[level as DifficultyLevel];
    const difference = Math.abs(actual - ideal);

    if (difference > 5) { // 5%以上の差がある場合
      isBalanced = false;
      if (actual < ideal) {
        recommendations.push(`${level}レベルの単語を${ideal - actual}%程度増やしてください`);
      } else {
        recommendations.push(`${level}レベルの単語を${actual - ideal}%程度減らしてください`);
      }
    }
  });

  return {
    isBalanced,
    recommendations,
    percentages
  };
}

// ===== レベル判定ユーティリティ =====
/**
 * ユーザーレベルに適した難易度範囲を取得
 */
export function getAppropriateLevel(userLevel: number): DifficultyLevel[] {
  if (userLevel < 10) {
    return [DifficultyLevel.EIKEN_5, DifficultyLevel.EIKEN_4];
  } else if (userLevel < 20) {
    return [DifficultyLevel.EIKEN_4, DifficultyLevel.EIKEN_3];
  } else if (userLevel < 30) {
    return [DifficultyLevel.EIKEN_3, DifficultyLevel.EIKEN_PRE_2];
  } else if (userLevel < 40) {
    return [DifficultyLevel.EIKEN_PRE_2, DifficultyLevel.EIKEN_2];
  } else if (userLevel < 50) {
    return [DifficultyLevel.EIKEN_2, DifficultyLevel.EIKEN_PRE_1];
  } else {
    return [DifficultyLevel.EIKEN_PRE_1, DifficultyLevel.EIKEN_1];
  }
}

/**
 * 難易度レベルの表示名を取得
 */
export function getDifficultyDisplayName(level: DifficultyLevel): string {
  const displayNames: Record<DifficultyLevel, string> = {
    [DifficultyLevel.EIKEN_5]: '英検5級',
    [DifficultyLevel.EIKEN_4]: '英検4級',
    [DifficultyLevel.EIKEN_3]: '英検3級',
    [DifficultyLevel.EIKEN_PRE_2]: '英検準2級',
    [DifficultyLevel.EIKEN_2]: '英検2級',
    [DifficultyLevel.EIKEN_PRE_1]: '英検準1級',
    [DifficultyLevel.EIKEN_1]: '英検1級',
    [DifficultyLevel.TOEIC_BEGINNER]: 'TOEIC 200-400',
    [DifficultyLevel.TOEIC_ELEMENTARY]: 'TOEIC 400-600',
    [DifficultyLevel.TOEIC_INTERMEDIATE]: 'TOEIC 600-730',
    [DifficultyLevel.TOEIC_ADVANCED]: 'TOEIC 730-860',
    [DifficultyLevel.TOEIC_EXPERT]: 'TOEIC 860-990'
  };

  return displayNames[level];
}

/**
 * 難易度レベルの色を取得（UI用）
 */
export function getDifficultyColor(level: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    [DifficultyLevel.EIKEN_5]: '#10B981',      // 緑
    [DifficultyLevel.EIKEN_4]: '#059669',      // 深緑
    [DifficultyLevel.EIKEN_3]: '#3B82F6',      // 青
    [DifficultyLevel.EIKEN_PRE_2]: '#1D4ED8',  // 深青
    [DifficultyLevel.EIKEN_2]: '#7C3AED',      // 紫
    [DifficultyLevel.EIKEN_PRE_1]: '#A855F7',  // 明紫
    [DifficultyLevel.EIKEN_1]: '#DC2626',      // 赤
    [DifficultyLevel.TOEIC_BEGINNER]: '#10B981',
    [DifficultyLevel.TOEIC_ELEMENTARY]: '#3B82F6',
    [DifficultyLevel.TOEIC_INTERMEDIATE]: '#F59E0B',
    [DifficultyLevel.TOEIC_ADVANCED]: '#EF4444',
    [DifficultyLevel.TOEIC_EXPERT]: '#DC2626'
  };

  return colors[level];
}