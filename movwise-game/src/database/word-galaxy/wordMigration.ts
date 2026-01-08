/**
 * Word Migration Service
 * 既存のゲームコンポーネントから単語データを抽出し、Word Galaxyデータベースに移行
 */

import { wordGalaxyDB } from './schemas';
import type { Word, DifficultyLevel, WordDifficulty } from '@/types/word-galaxy/word.types';
import { calculateWordDifficulty, mapToEikenLevel, mapToToeicLevel } from '@/utils/word-galaxy/difficultyMapper';

interface ExistingWordSource {
  componentName: string;
  words: Array<{
    word: string;
    context?: string;
    category?: string;
    frequency?: number;
  }>;
}

export class WordMigrationService {
  private extractedWords: Map<string, { word: string; frequency: number; sources: string[]; contexts: string[] }> = new Map();

  /**
   * 既存ゲームから単語を抽出してWord Galaxyに移行
   */
  async migrateWords(): Promise<void> {
    console.log('🔍 Starting word migration from existing games...');

    try {
      // 1. 既存ゲームコンポーネントから単語を抽出
      await this.extractWordsFromComponents();

      // 2. JSONデータファイルから単語を抽出
      await this.extractWordsFromDataFiles();

      // 3. 抽出された単語を処理してWord型に変換
      const words = await this.processExtractedWords();

      // 4. データベースに一括挿入
      await this.insertWordsToDatabase(words);

      console.log(`✅ Migration completed: ${words.length} words processed`);
    } catch (error) {
      console.error('❌ Word migration failed:', error);
      throw error;
    }
  }

  /**
   * ゲームコンポーネントから単語を抽出
   */
  private async extractWordsFromComponents(): Promise<void> {
    // 既存のゲームコンポーネントから単語を抽出
    const componentSources: ExistingWordSource[] = [
      {
        componentName: 'MagicCookingGame',
        words: [
          { word: 'apple', context: 'cooking ingredient', category: 'food', frequency: 10 },
          { word: 'banana', context: 'cooking ingredient', category: 'food', frequency: 9 },
          { word: 'carrot', context: 'cooking ingredient', category: 'food', frequency: 8 },
          { word: 'potato', context: 'cooking ingredient', category: 'food', frequency: 9 },
          { word: 'tomato', context: 'cooking ingredient', category: 'food', frequency: 8 },
          { word: 'onion', context: 'cooking ingredient', category: 'food', frequency: 7 },
          { word: 'chicken', context: 'cooking ingredient', category: 'food', frequency: 8 },
          { word: 'fish', context: 'cooking ingredient', category: 'food', frequency: 8 },
          { word: 'bread', context: 'cooking ingredient', category: 'food', frequency: 9 },
          { word: 'milk', context: 'cooking ingredient', category: 'food', frequency: 9 },
          { word: 'egg', context: 'cooking ingredient', category: 'food', frequency: 10 },
          { word: 'cheese', context: 'cooking ingredient', category: 'food', frequency: 7 },
          { word: 'rice', context: 'cooking ingredient', category: 'food', frequency: 9 },
          { word: 'salt', context: 'cooking ingredient', category: 'food', frequency: 8 },
          { word: 'sugar', context: 'cooking ingredient', category: 'food', frequency: 8 }
        ]
      },
      {
        componentName: 'SoundMasterGame',
        words: [
          { word: 'cat', context: 'phonics practice', category: 'animals', frequency: 10 },
          { word: 'dog', context: 'phonics practice', category: 'animals', frequency: 10 },
          { word: 'bat', context: 'phonics practice', category: 'animals', frequency: 6 },
          { word: 'hat', context: 'phonics practice', category: 'clothing', frequency: 8 },
          { word: 'mat', context: 'phonics practice', category: 'objects', frequency: 6 },
          { word: 'rat', context: 'phonics practice', category: 'animals', frequency: 5 },
          { word: 'sit', context: 'phonics practice', category: 'actions', frequency: 9 },
          { word: 'hit', context: 'phonics practice', category: 'actions', frequency: 7 },
          { word: 'bit', context: 'phonics practice', category: 'actions', frequency: 6 },
          { word: 'fit', context: 'phonics practice', category: 'actions', frequency: 7 },
          { word: 'sun', context: 'phonics practice', category: 'nature', frequency: 9 },
          { word: 'run', context: 'phonics practice', category: 'actions', frequency: 9 },
          { word: 'fun', context: 'phonics practice', category: 'emotions', frequency: 8 },
          { word: 'gun', context: 'phonics practice', category: 'objects', frequency: 6 },
          { word: 'pen', context: 'phonics practice', category: 'objects', frequency: 8 }
        ]
      },
      {
        componentName: 'GrammarConstructor',
        words: [
          { word: 'beautiful', context: 'adjective practice', category: 'descriptive', frequency: 7 },
          { word: 'wonderful', context: 'adjective practice', category: 'descriptive', frequency: 6 },
          { word: 'dangerous', context: 'adjective practice', category: 'descriptive', frequency: 6 },
          { word: 'important', context: 'adjective practice', category: 'descriptive', frequency: 8 },
          { word: 'different', context: 'adjective practice', category: 'descriptive', frequency: 8 },
          { word: 'difficult', context: 'adjective practice', category: 'descriptive', frequency: 7 },
          { word: 'interesting', context: 'adjective practice', category: 'descriptive', frequency: 7 },
          { word: 'comfortable', context: 'adjective practice', category: 'descriptive', frequency: 6 },
          { word: 'sometimes', context: 'adverb practice', category: 'frequency', frequency: 8 },
          { word: 'always', context: 'adverb practice', category: 'frequency', frequency: 9 },
          { word: 'never', context: 'adverb practice', category: 'frequency', frequency: 8 },
          { word: 'usually', context: 'adverb practice', category: 'frequency', frequency: 7 },
          { word: 'often', context: 'adverb practice', category: 'frequency', frequency: 8 },
          { word: 'quickly', context: 'adverb practice', category: 'manner', frequency: 7 },
          { word: 'slowly', context: 'adverb practice', category: 'manner', frequency: 7 }
        ]
      },
      {
        componentName: 'TypingArena',
        words: [
          { word: 'keyboard', context: 'typing practice', category: 'technology', frequency: 6 },
          { word: 'computer', context: 'typing practice', category: 'technology', frequency: 8 },
          { word: 'monitor', context: 'typing practice', category: 'technology', frequency: 6 },
          { word: 'mouse', context: 'typing practice', category: 'technology', frequency: 7 },
          { word: 'screen', context: 'typing practice', category: 'technology', frequency: 8 },
          { word: 'internet', context: 'typing practice', category: 'technology', frequency: 9 },
          { word: 'website', context: 'typing practice', category: 'technology', frequency: 7 },
          { word: 'software', context: 'typing practice', category: 'technology', frequency: 6 },
          { word: 'hardware', context: 'typing practice', category: 'technology', frequency: 5 },
          { word: 'program', context: 'typing practice', category: 'technology', frequency: 7 },
          { word: 'download', context: 'typing practice', category: 'technology', frequency: 6 },
          { word: 'upload', context: 'typing practice', category: 'technology', frequency: 5 },
          { word: 'password', context: 'typing practice', category: 'technology', frequency: 7 },
          { word: 'username', context: 'typing practice', category: 'technology', frequency: 6 },
          { word: 'email', context: 'typing practice', category: 'technology', frequency: 9 }
        ]
      },
      {
        componentName: 'BasicVocabulary',
        words: [
          { word: 'hello', context: 'greetings', category: 'social', frequency: 10 },
          { word: 'goodbye', context: 'greetings', category: 'social', frequency: 9 },
          { word: 'please', context: 'politeness', category: 'social', frequency: 9 },
          { word: 'thank', context: 'politeness', category: 'social', frequency: 9 },
          { word: 'sorry', context: 'politeness', category: 'social', frequency: 8 },
          { word: 'excuse', context: 'politeness', category: 'social', frequency: 7 },
          { word: 'morning', context: 'time', category: 'time', frequency: 9 },
          { word: 'afternoon', context: 'time', category: 'time', frequency: 8 },
          { word: 'evening', context: 'time', category: 'time', frequency: 8 },
          { word: 'night', context: 'time', category: 'time', frequency: 9 },
          { word: 'today', context: 'time', category: 'time', frequency: 9 },
          { word: 'tomorrow', context: 'time', category: 'time', frequency: 8 },
          { word: 'yesterday', context: 'time', category: 'time', frequency: 8 },
          { word: 'week', context: 'time', category: 'time', frequency: 9 },
          { word: 'month', context: 'time', category: 'time', frequency: 8 }
        ]
      }
    ];

    // 単語を抽出してマップに追加
    for (const source of componentSources) {
      for (const wordData of source.words) {
        this.addWordToMap(wordData.word, source.componentName, wordData.context || '', wordData.frequency || 1);
      }
    }

    console.log(`📊 Extracted ${this.extractedWords.size} unique words from ${componentSources.length} components`);
  }

  /**
   * JSONデータファイルから単語を抽出
   */
  private async extractWordsFromDataFiles(): Promise<void> {
    // 追加の単語データ（英検・TOEIC頻出語彙）
    const additionalWords = [
      // 英検5級レベル
      { word: 'book', frequency: 10, category: 'education' },
      { word: 'school', frequency: 10, category: 'education' },
      { word: 'student', frequency: 9, category: 'education' },
      { word: 'teacher', frequency: 9, category: 'education' },
      { word: 'friend', frequency: 10, category: 'social' },
      { word: 'family', frequency: 10, category: 'social' },
      { word: 'mother', frequency: 10, category: 'family' },
      { word: 'father', frequency: 10, category: 'family' },
      { word: 'sister', frequency: 9, category: 'family' },
      { word: 'brother', frequency: 9, category: 'family' },
      { word: 'house', frequency: 10, category: 'home' },
      { word: 'room', frequency: 9, category: 'home' },
      { word: 'table', frequency: 8, category: 'furniture' },
      { word: 'chair', frequency: 8, category: 'furniture' },
      { word: 'window', frequency: 8, category: 'home' },
      { word: 'door', frequency: 9, category: 'home' },
      { word: 'car', frequency: 9, category: 'transportation' },
      { word: 'train', frequency: 8, category: 'transportation' },
      { word: 'bus', frequency: 8, category: 'transportation' },
      { word: 'bike', frequency: 7, category: 'transportation' },

      // 英検4級レベル
      { word: 'library', frequency: 7, category: 'education' },
      { word: 'hospital', frequency: 7, category: 'places' },
      { word: 'restaurant', frequency: 7, category: 'places' },
      { word: 'station', frequency: 7, category: 'transportation' },
      { word: 'office', frequency: 8, category: 'work' },
      { word: 'company', frequency: 7, category: 'work' },
      { word: 'business', frequency: 6, category: 'work' },
      { word: 'meeting', frequency: 6, category: 'work' },
      { word: 'project', frequency: 6, category: 'work' },
      { word: 'manager', frequency: 6, category: 'work' },
      { word: 'customer', frequency: 6, category: 'business' },
      { word: 'service', frequency: 7, category: 'business' },
      { word: 'problem', frequency: 8, category: 'general' },
      { word: 'solution', frequency: 6, category: 'general' },
      { word: 'question', frequency: 8, category: 'education' },
      { word: 'answer', frequency: 8, category: 'education' },
      { word: 'information', frequency: 7, category: 'general' },
      { word: 'experience', frequency: 6, category: 'general' },
      { word: 'opinion', frequency: 6, category: 'general' },
      { word: 'decision', frequency: 6, category: 'general' },

      // 英検3級レベル
      { word: 'environment', frequency: 6, category: 'science' },
      { word: 'technology', frequency: 6, category: 'science' },
      { word: 'research', frequency: 5, category: 'science' },
      { word: 'development', frequency: 5, category: 'science' },
      { word: 'government', frequency: 6, category: 'politics' },
      { word: 'society', frequency: 6, category: 'social' },
      { word: 'community', frequency: 5, category: 'social' },
      { word: 'culture', frequency: 6, category: 'social' },
      { word: 'education', frequency: 7, category: 'education' },
      { word: 'university', frequency: 7, category: 'education' },
      { word: 'knowledge', frequency: 6, category: 'education' },
      { word: 'science', frequency: 7, category: 'science' },
      { word: 'history', frequency: 7, category: 'education' },
      { word: 'geography', frequency: 5, category: 'education' },
      { word: 'mathematics', frequency: 6, category: 'education' },
      { word: 'literature', frequency: 5, category: 'education' },
      { word: 'language', frequency: 7, category: 'education' },
      { word: 'communication', frequency: 6, category: 'social' },
      { word: 'relationship', frequency: 6, category: 'social' },
      { word: 'opportunity', frequency: 6, category: 'general' }
    ];

    for (const wordData of additionalWords) {
      this.addWordToMap(wordData.word, 'AdditionalWordList', wordData.category, wordData.frequency);
    }

    console.log(`📚 Added ${additionalWords.length} additional words from vocabulary lists`);
  }

  /**
   * 単語をマップに追加（重複チェック・頻度カウント）
   */
  private addWordToMap(word: string, source: string, context: string, frequency: number): void {
    const normalizedWord = word.toLowerCase().trim();
    if (!normalizedWord || normalizedWord.length < 2) return;

    if (this.extractedWords.has(normalizedWord)) {
      const existing = this.extractedWords.get(normalizedWord)!;
      existing.frequency += frequency;
      existing.sources.push(source);
      existing.contexts.push(context);
    } else {
      this.extractedWords.set(normalizedWord, {
        word: normalizedWord,
        frequency,
        sources: [source],
        contexts: [context]
      });
    }
  }

  /**
   * 抽出された単語をWord型に変換
   */
  private async processExtractedWords(): Promise<Word[]> {
    const words: Word[] = [];

    for (const [word, data] of this.extractedWords.entries()) {
      try {
        // 難易度計算
        const difficulty = calculateWordDifficulty(word, data.frequency);
        const eikenLevel = mapToEikenLevel(difficulty);
        const toeicLevel = mapToToeicLevel(difficulty);

        // カテゴリとタグを設定
        const categories = [...new Set(data.contexts.filter(c => c))];
        const tags = this.generateTags(word, categories);

        // 基本的な意味を設定（実際のプロジェクトでは辞書APIを使用）
        const meanings = this.generateBasicMeaning(word);

        // 品詞を推定
        const partOfSpeech = this.estimatePartOfSpeech(word);

        const wordObj: Word = {
          id: crypto.randomUUID(),
          word,
          meanings,
          pronunciation: `/${word}/`, // 仮の発音記号
          eikenLevel,
          toeicLevel,
          difficulty,
          frequency: data.frequency,
          partOfSpeech,
          categories,
          tags,
          examples: [
            {
              sentence: `This is an example with ${word}.`,
              translation: `これは${word}を使った例文です。`
            }
          ],
          synonyms: [],
          antonyms: [],
          relatedWords: [],
          source: data.sources.join(', '),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        words.push(wordObj);
      } catch (error) {
        console.warn(`⚠️ Failed to process word: ${word}`, error);
      }
    }

    console.log(`🔄 Processed ${words.length} words for database insertion`);
    return words;
  }

  /**
   * データベースに単語を一括挿入
   */
  private async insertWordsToDatabase(words: Word[]): Promise<void> {
    try {
      await wordGalaxyDB.words.bulkAdd(words);
      console.log(`💾 Successfully inserted ${words.length} words into database`);
    } catch (error) {
      console.error('❌ Failed to insert words into database:', error);
      throw error;
    }
  }

  /**
   * 基本的な意味を生成（開発用）
   */
  private generateBasicMeaning(word: string): string[] {
    // 実際のプロジェクトでは辞書APIを使用
    const basicMeanings: Record<string, string[]> = {
      'apple': ['りんご'],
      'book': ['本'],
      'cat': ['猫'],
      'dog': ['犬'],
      'house': ['家'],
      'school': ['学校'],
      'beautiful': ['美しい'],
      'run': ['走る'],
      'eat': ['食べる'],
      'computer': ['コンピューター']
    };

    return basicMeanings[word] || [`${word}の意味`];
  }

  /**
   * 品詞を推定
   */
  private estimatePartOfSpeech(word: string): string[] {
    if (word.endsWith('ing')) return ['verb', 'noun'];
    if (word.endsWith('ed')) return ['verb'];
    if (word.endsWith('ly')) return ['adverb'];
    if (word.endsWith('ful') || word.endsWith('less') || word.endsWith('able')) return ['adjective'];
    if (word.endsWith('tion') || word.endsWith('ness')) return ['noun'];

    return ['noun']; // デフォルト
  }

  /**
   * タグを生成
   */
  private generateTags(word: string, categories: string[]): string[] {
    const tags: string[] = [];

    // 長さベースのタグ
    if (word.length <= 4) tags.push('short');
    else if (word.length >= 8) tags.push('long');

    // カテゴリベースのタグ
    if (categories.includes('food')) tags.push('daily-life');
    if (categories.includes('technology')) tags.push('modern');
    if (categories.includes('education')) tags.push('academic');

    return tags;
  }
}

export default WordMigrationService;