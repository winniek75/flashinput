/**
 * Word Galaxy Database Exports
 */

export { WordGalaxyDatabase, wordGalaxyDB } from './schemas';
export { WordMigrationService } from './wordMigration';
export { initialWordData } from './initialData';

// データベース初期化ヘルパー
export async function initializeWordGalaxy(): Promise<void> {
  try {
    console.log('🚀 [Step 1] Starting Word Galaxy initialization...');

    // Step 1: Import modules
    console.log('🔄 [Step 2] Importing database modules...');
    const { wordGalaxyDB } = await import('./schemas');
    console.log('✅ [Step 2] Database module imported');

    console.log('🔄 [Step 3] Importing initial data module...');
    const { generateInitialWords } = await import('./initialData');
    console.log('✅ [Step 3] Initial data module imported');

    // Step 2: Initialize database
    console.log('🔄 [Step 4] Initializing database...');
    await wordGalaxyDB.initialize();
    console.log('✅ [Step 4] Database initialized');

    // Step 3: Check existing data
    console.log('🔄 [Step 5] Checking existing word count...');
    const wordCount = await wordGalaxyDB.words.count();
    console.log(`📊 [Step 5] Found ${wordCount} existing words`);

    if (wordCount === 0) {
      console.log('🔄 [Step 6] No words found, generating initial data...');

      // Generate initial words
      const initialWords = generateInitialWords();
      console.log(`📚 [Step 6] Generated ${initialWords.length} initial words`);

      // Validate data structure
      if (initialWords.length === 0) {
        throw new Error('Generated initial words array is empty');
      }

      console.log('🔄 [Step 7] Sample word:', JSON.stringify(initialWords[0], null, 2));

      // Insert to database
      console.log('🔄 [Step 8] Inserting words to database...');
      await wordGalaxyDB.words.bulkAdd(initialWords);
      console.log('✅ [Step 8] Words inserted successfully');

      // Verify insertion
      const finalWordCount = await wordGalaxyDB.words.count();
      console.log(`✅ [Step 9] Final word count: ${finalWordCount}`);
    } else {
      console.log(`✅ Word database already initialized with ${wordCount} words`);
    }

    console.log('🎉 Word Galaxy initialization completed successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Word Galaxy at step:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}