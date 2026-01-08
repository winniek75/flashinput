// src/components/games/grammar-galaxy/shared/problemGenerator.js

import { grammarContentManager } from '@/data/grammarContentManager.js'
import logger from '@/utils/logger'

/**
 * 動的問題生成システム
 * CSVデータから適切な問題を生成し、ゲームプレイを最適化
 */
export class ProblemGenerator {
  constructor() {
    this.contentData = []
    this.problemSets = []
    this.visualElements = []
    this.usedProblemIds = new Set()
    this.recentProblemIds = [] // 🔧 最近使用した問題IDを追跡（重複防止）
    this.maxRecentProblems = 10 // 最近の10問は除外（多様性を確保）
    this.difficultySettings = this.createDifficultySettings()
    this.isInitialized = false
  }

  /**
   * 初期化
   * @returns {Promise<boolean>} 初期化成功フラグ
   */
  async initialize(content, problems, visuals) {
    logger.log('🏁 ProblemGenerator 初期化開始')
    this.contentData = Array.isArray(content) ? content : []
    this.problemSets = Array.isArray(problems) ? problems : []
    this.visualElements = Array.isArray(visuals) ? visuals : []
    this.isInitialized = true
    
    logger.log('✅ ProblemGenerator 初期化完了:', {
      contentData: this.contentData.length,
      problemSets: this.problemSets.length,
      visualElements: this.visualElements.length,
      isInitialized: this.isInitialized
    })
    
    // 問題セットの最初の数個をサンプル表示
    if (this.problemSets.length > 0) {
      logger.log('📋 問題セットサンプル:', this.problemSets.slice(0, 3).map(ps => ({
        set_id: ps.set_id,
        level: ps.level,
        category: ps.category,
        target_sentence: ps.target_sentence
      })))
    }
    
    return true
  }

  /**
   * 指定条件で問題を生成
   * @param {Object} options - 生成オプション
   * @returns {Object} 生成された問題
   */
  async generateProblem(options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const {
      level = 'beginner',
      eiken_level = null,
      category = null,
      difficulty = 'normal',
      excludeUsed = true,
      targetSentenceCount = 1
    } = options

    logger.log('🎯 問題生成開始:', options)
    logger.log('📊 利用可能データ:', {
      problemSets: this.problemSets?.length || 0,
      contentData: this.contentData?.length || 0,
      visualElements: this.visualElements?.length || 0,
      isInitialized: this.isInitialized
    })

    try {
      // 1. 適切な問題セットを選択
      const problemSet = this.selectProblemSet({
        level,
        eiken_level,
        category,
        excludeUsed
      })

      logger.log('🔍 問題セット選択結果:', problemSet)
      if (!problemSet) {
        logger.error('❌ 問題セットが見つかりません。利用可能な問題セット:')
        logger.log('問題セット数:', this.problemSets?.length || 0)
        if (this.problemSets?.length > 0) {
          logger.log('最初の問題セット:', this.problemSets[0])
          logger.log('全問題セットのレベル:', [...new Set(this.problemSets.map(ps => ps.level))])
          logger.log('全問題セットのカテゴリ:', [...new Set(this.problemSets.map(ps => ps.category))])
        }
        throw new Error('適切な問題セットが見つかりません')
      }

      // 2. 問題セットから要素を生成
      logger.log('🔧 要素生成開始:', problemSet.set_id, problemSet.target_sentence)
      const elements = await this.generateElementsFromProblemSet(problemSet, difficulty)
      logger.log('🔧 要素生成完了:', elements.length, '個')

      // 3. 視覚的テーマを適用
      const visualTheme = this.getVisualTheme(problemSet.visual_theme)

      // 4. 使用済みとしてマーク
      if (excludeUsed) {
        this.usedProblemIds.add(problemSet.set_id)
      }
      
      // 🔧 最近使用した問題として追跡（重複防止）
      this.recentProblemIds.push(problemSet.set_id)
      
      // 最大数を超えた場合、古い問題IDを削除
      if (this.recentProblemIds.length > this.maxRecentProblems) {
        this.recentProblemIds.shift()
      }

      const problem = {
        id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        problemSetId: problemSet.set_id,
        level: problemSet.level,
        eiken_level: problemSet.eiken_level,
        category: problemSet.category,
        targetSentence: problemSet.target_sentence,
        hintJapanese: problemSet.hint_ja,
        difficulty: difficulty,
        estimatedDifficulty: problemSet.estimated_difficulty || problemSet.difficulty_score,
        elements: elements,
        visualTheme: visualTheme,
        generatedAt: new Date().toISOString()
      }

      // デバッグ用：生成された要素の検証
      logger.log('🎲 Generated problem validation:')
      logger.log('- Target sentence:', problem.targetSentence)
      logger.log('- Elements count:', problem.elements.length)
      logger.log('- Position distribution:',
        problem.elements.reduce((acc, el) => {
          acc[el.position] = (acc[el.position] || 0) + 1
          return acc
        }, {})
      )

      return problem

    } catch (error) {
      logger.error('❌ 問題生成エラー:', error)
      logger.error('❌ エラースタック:', error.stack)
      logger.error('❌ エラー発生時の状態:', {
        isInitialized: this.isInitialized,
        problemSetsCount: this.problemSets?.length || 0,
        contentDataCount: this.contentData?.length || 0,
        visualElementsCount: this.visualElements?.length || 0
      })

      // フォールバック問題を生成
      return this.generateFallbackProblem(options)
    }
  }

  /**
   * ゲームで使用するメイン関数：問題を一括生成
   * @param {string} difficulty - 難易度（英検レベル）
   * @param {number} count - 生成する問題数
   * @returns {Promise<Array>} 生成された問題配列
   */
  async generateProblems(difficulty, count) {
    logger.log(`🎮 [generateProblems] 開始: difficulty=${difficulty}, count=${count}`)

    // データ確認とフォールバック判定
    if (!this.isInitialized || !this.problemSets || this.problemSets.length === 0) {
      logger.warn('⚠️ [generateProblems] 問題セットが空、フォールバック問題を生成')
      return this.generateFallbackProblems(count)
    }

    try {
      // 難易度から適切なオプションを作成
      const options = {
        level: 'beginner', // デフォルトレベル
        eiken_level: difficulty,
        difficulty: 'normal',
        excludeUsed: true
      }

      logger.log(`🎯 [generateProblems] オプション設定:`, options)
      logger.log(`📊 [generateProblems] 利用可能データ:`, {
        problemSets: this.problemSets.length,
        contentData: this.contentData.length,
        eiken_level_matches: this.problemSets.filter(p => p.eiken_level === difficulty).length
      })

      // 複数問題を生成
      const problems = await this.generateMultipleProblems(count, options)

      logger.log(`✅ [generateProblems] 生成完了: ${problems.length}/${count}問`)

      if (problems.length === 0) {
        logger.warn('⚠️ [generateProblems] 問題が生成されなかったため、フォールバック使用')
        return this.generateFallbackProblems(count)
      }

      return problems

    } catch (error) {
      logger.error('❌ [generateProblems] エラー:', error)
      logger.error('❌ [generateProblems] フォールバック問題を返します')

      // エラー時はフォールバック問題を複数生成
      return this.generateFallbackProblems(count)
    }
  }

  /**
   * 複数の問題を一括生成
   * @param {number} count - 生成する問題数
   * @param {Object} options - 生成オプション
   * @returns {Promise<Array>} 生成された問題配列
   */
  async generateMultipleProblems(count, options = {}) {
    const problems = []
    const usedCategories = new Set()
    const usedPatterns = new Set()
    const sessionUsedIds = new Set() // このセッションで使用した問題IDを追跡

    for (let i = 0; i < count; i++) {
      try {
        // カテゴリの多様性を確保
        let categoryOptions = { ...options }
        if (usedCategories.size > 0 && !options.category) {
          const availableCategories = this.getAvailableCategories(options.level)
          const unusedCategories = availableCategories.filter(cat => !usedCategories.has(cat))
          if (unusedCategories.length > 0) {
            categoryOptions.category = unusedCategories[Math.floor(Math.random() * unusedCategories.length)]
          }
        }

        // 文パターンの多様性を確保
        const sentencePattern = this.selectDiversePattern(usedPatterns, options.eiken_level)
        categoryOptions.preferredPattern = sentencePattern

        // 同じ問題を選択しないように複数回試行
        let problem = null
        let attempts = 0
        const maxAttempts = 10
        
        do {
          problem = await this.generateProblem({
            ...categoryOptions,
            excludeUsed: true
          })
          attempts++
          
          // 既にこのセッションで使用した問題なら再試行
          if (problem && sessionUsedIds.has(problem.set_id)) {
            logger.log(`🔄 問題 ${problem.set_id} は既に使用済み、再選択中...`)
            problem = null
          }
        } while (!problem || (sessionUsedIds.has(problem.set_id) && attempts < maxAttempts))

        if (problem && !sessionUsedIds.has(problem.set_id)) {
          // パターンに基づいて問題を強化
          const enhancedProblem = this.enhanceProblemWithPattern(problem, sentencePattern)
          problems.push(enhancedProblem)
          sessionUsedIds.add(problem.set_id) // セッション使用済みに追加
          usedCategories.add(problem.category)
          usedPatterns.add(sentencePattern)
        }

        // カテゴリリセット（全て使用した場合）
        if (usedCategories.size >= this.getAvailableCategories(options.level).length) {
          usedCategories.clear()
        }

        // パターンリセット（多様性のため）
        if (usedPatterns.size >= 8) {
          usedPatterns.clear()
        }

      } catch (error) {
        logger.warn(`⚠️ 問題 ${i + 1} の生成に失敗:`, error)
      }
    }

    logger.log(`🎲 ${count}問中${problems.length}問生成完了`)
    return problems
  }

  /**
   * 多様な文パターンを選択
   * @param {Set} usedPatterns - 使用済みパターン
   * @param {string} eikenLevel - 英検レベル
   * @returns {string} 選択されたパターン
   */
  selectDiversePattern(usedPatterns, eikenLevel) {
    const patterns = this.getSentencePatterns(eikenLevel)
    const availablePatterns = patterns.filter(pattern => !usedPatterns.has(pattern.id))
    
    if (availablePatterns.length === 0) {
      return patterns[Math.floor(Math.random() * patterns.length)]
    }
    
    return availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
  }

  /**
   * 英検レベルに応じた文パターンを取得
   * @param {string} eikenLevel - 英検レベル
   * @returns {Array} 文パターン配列
   */
  getSentencePatterns(eikenLevel) {
    const basePatterns = [
      { id: 'svo', name: 'Subject-Verb-Object', structure: ['subject', 'verb', 'object'], example: 'I like cats' },
      { id: 'sv', name: 'Subject-Verb', structure: ['subject', 'verb'], example: 'She runs' },
      { id: 'svc', name: 'Subject-Verb-Complement', structure: ['subject', 'verb', 'complement'], example: 'I am happy' },
      { id: 'question_do', name: 'Do-Question', structure: ['auxiliary', 'subject', 'verb', 'object'], example: 'Do you like cats?' },
      { id: 'question_be', name: 'Be-Question', structure: ['auxiliary', 'subject', 'complement'], example: 'Are you happy?' },
      { id: 'negative', name: 'Negative', structure: ['subject', 'auxiliary', 'verb', 'object'], example: 'I do not like cats' },
      { id: 'there_be', name: 'There-be Structure', structure: ['there', 'be', 'subject'], example: 'There is a cat' },
      { id: 'imperative', name: 'Imperative', structure: ['verb', 'object'], example: 'Open the door' }
    ]

    const advancedPatterns = [
      { id: 'present_perfect', name: 'Present Perfect', structure: ['subject', 'auxiliary', 'verb', 'object'], example: 'I have finished homework' },
      { id: 'past_continuous', name: 'Past Continuous', structure: ['subject', 'auxiliary', 'verb'], example: 'I was reading' },
      { id: 'future_will', name: 'Future with Will', structure: ['subject', 'auxiliary', 'verb', 'object'], example: 'I will study English' },
      { id: 'modal_can', name: 'Modal Can', structure: ['subject', 'auxiliary', 'verb', 'object'], example: 'I can speak English' },
      { id: 'comparative', name: 'Comparative', structure: ['subject', 'verb', 'comparative'], example: 'This is bigger' },
      { id: 'superlative', name: 'Superlative', structure: ['subject', 'verb', 'superlative'], example: 'This is the biggest' }
    ]

    const expertPatterns = [
      { id: 'passive', name: 'Passive Voice', structure: ['subject', 'auxiliary', 'verb'], example: 'The book was written' },
      { id: 'conditional', name: 'Conditional', structure: ['if', 'subject', 'verb', 'subject', 'auxiliary', 'verb'], example: 'If I study, I will pass' },
      { id: 'relative_clause', name: 'Relative Clause', structure: ['subject', 'relative', 'verb', 'verb', 'object'], example: 'The book that I read is interesting' },
      { id: 'gerund', name: 'Gerund', structure: ['gerund', 'verb', 'complement'], example: 'Reading is fun' },
      { id: 'infinitive', name: 'Infinitive', structure: ['subject', 'verb', 'to', 'verb'], example: 'I want to go' }
    ]

    switch (eikenLevel) {
      case '5':
        return basePatterns.slice(0, 6) // Basic patterns only
      case '4':
        return [...basePatterns, ...advancedPatterns.slice(0, 4)]
      case '3':
        return [...basePatterns, ...advancedPatterns, ...expertPatterns.slice(0, 3)]
      default:
        return [...basePatterns, ...advancedPatterns, ...expertPatterns]
    }
  }

  /**
   * パターンで問題を強化
   * @param {Object} problem - 基本問題
   * @param {Object} pattern - 文パターン
   * @returns {Object} 強化された問題
   */
  enhanceProblemWithPattern(problem, pattern) {
    const enhancedProblem = { ...problem }
    
    // パターン情報を追加
    enhancedProblem.sentencePattern = pattern
    enhancedProblem.patternHint = `文型: ${pattern.name} (例: ${pattern.example})`
    
    // 要素の位置をパターンに合わせて調整
    if (enhancedProblem.elements) {
      enhancedProblem.elements = enhancedProblem.elements.map(element => {
        if (element.isCorrect) {
          // パターンに基づいて位置を再調整
          const newPosition = this.mapElementToPattern(element, pattern)
          return { ...element, position: newPosition || element.position }
        }
        return element
      })
    }
    
    // 難易度調整
    enhancedProblem.patternDifficulty = this.calculatePatternDifficulty(pattern)
    enhancedProblem.estimatedDifficulty = (enhancedProblem.estimatedDifficulty || 1) * enhancedProblem.patternDifficulty
    
    return enhancedProblem
  }

  /**
   * 要素をパターンにマッピング
   * @param {Object} element - 要素
   * @param {Object} pattern - パターン
   * @returns {string} 新しい位置
   */
  mapElementToPattern(element, pattern) {
    const { structure } = pattern
    const { type, word } = element
    
    // 特定の単語タイプに基づいてマッピング
    if (['do', 'does', 'did', 'will', 'can', 'could', 'should', 'would'].includes(word.toLowerCase())) {
      return 'auxiliary'
    }
    
    if (['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(word.toLowerCase())) {
      return 'subject'
    }
    
    if (type === 'be-verb' || type === 'general' || type === 'verb') {
      return 'verb'
    }
    
    // デフォルトは既存位置を保持
    return element.position
  }

  /**
   * パターンの難易度を計算
   * @param {Object} pattern - パターン
   * @returns {number} 難易度倍率
   */
  calculatePatternDifficulty(pattern) {
    const complexityMap = {
      'sv': 0.8,
      'svo': 1.0,
      'svc': 1.1,
      'question_do': 1.3,
      'question_be': 1.2,
      'negative': 1.4,
      'there_be': 1.3,
      'imperative': 0.9,
      'present_perfect': 1.6,
      'past_continuous': 1.5,
      'future_will': 1.4,
      'modal_can': 1.3,
      'comparative': 1.5,
      'superlative': 1.6,
      'passive': 1.8,
      'conditional': 2.0,
      'relative_clause': 2.2,
      'gerund': 1.7,
      'infinitive': 1.6
    }
    
    return complexityMap[pattern.id] || 1.0
  }

  /**
   * 利用可能なカテゴリを取得
   * @param {string} level - レベル
   * @returns {Array} カテゴリ配列
   */
  getAvailableCategories(level) {
    if (!this.problemSets || this.problemSets.length === 0) {
      return ['basic', 'questions', 'negative', 'time', 'daily']
    }
    
    const categories = [...new Set(
      this.problemSets
        .filter(ps => !level || ps.level === level)
        .map(ps => ps.category)
        .filter(cat => cat && cat.length > 0)
    )]
    
    return categories.length > 0 ? categories : ['basic', 'questions', 'negative', 'time', 'daily']
  }

  /**
   * 問題セットを選択
   * @param {Object} criteria - 選択条件
   * @returns {Object|null} 選択された問題セット
   */
  selectProblemSet(criteria) {
    logger.log('🔍 問題セット選択開始:', criteria)
    logger.log('💾 全問題セット数:', this.problemSets?.length || 0)
    
    if (!this.problemSets || this.problemSets.length === 0) {
      logger.error('❌ 問題セットが初期化されていません')
      return null
    }
    
    // 統計情報を表示
    const eikenStats = this.problemSets.reduce((stats, ps) => {
      const level = ps.eiken_level || 'unknown'
      stats[level] = (stats[level] || 0) + 1
      return stats
    }, {})
    logger.log('📊 英検レベル別問題数:', eikenStats)
    logger.log('🔍 使用済み問題数:', this.usedProblemIds.size)

    let candidates = [...this.problemSets]
    logger.log('📋 初期候補数:', candidates.length)

    // レベルフィルタ
    if (criteria.level) {
      const beforeFilter = candidates.length
      candidates = candidates.filter(ps => ps.level === criteria.level)
      logger.log(`🎯 レベルフィルタ後 (${criteria.level}): ${beforeFilter} → ${candidates.length}個`)
      
      // レベル一致がない場合は、レベルを無視して検索
      if (candidates.length === 0) {
        logger.log(`⚠️ レベル「${criteria.level}」の問題セットが見つからないため、レベルを無視して検索`)
        candidates = [...this.problemSets]
      }
    }

    // 英検レベルフィルタ (より優先的にフィルタリング)
    if (criteria.eiken_level) {
      const beforeFilter = candidates.length
      
      // デバッグ: 使用可能な英検レベルを表示
      const availableEikenLevels = [...new Set(this.problemSets.map(ps => ps.eiken_level).filter(Boolean))]
      logger.log(`📚 利用可能な英検レベル: [${availableEikenLevels.join(', ')}]`)
      
      // eiken_levelの文字列マッチングを改善
      candidates = candidates.filter(ps => {
        const psLevel = ps.eiken_level || ps.level || ''
        const matches = psLevel === criteria.eiken_level || 
               psLevel === criteria.eiken_level.toString() ||
               psLevel.includes(criteria.eiken_level)
        
        if (criteria.eiken_level === '4' && matches) {
          logger.log(`🎯 4級問題見つかった: ${ps.target_sentence} (eiken_level: ${ps.eiken_level})`)
        }
        
        return matches
      })
      logger.log(`📚 英検レベルフィルタ後 (${criteria.eiken_level}): ${beforeFilter} → ${candidates.length}個`)
      
      // 4級の場合、具体的な問題例を表示
      if (criteria.eiken_level === '4' && candidates.length > 0) {
        logger.log(`📝 4級問題サンプル (最初の10個):`)
        candidates.slice(0, 10).forEach((ps, i) => {
          logger.log(`  ${i + 1}. "${ps.target_sentence}" (set_id: ${ps.set_id}, level: ${ps.level})`)
        })
        logger.log(`📝 4級問題サンプル (最後の5個):`)
        candidates.slice(-5).forEach((ps, i) => {
          logger.log(`  ${candidates.length - 5 + i + 1}. "${ps.target_sentence}" (set_id: ${ps.set_id}, level: ${ps.level})`)
        })
      }
      
      // 英検レベル一致がない場合のフォールバック
      if (candidates.length === 0) {
        logger.log(`⚠️ 英検「${criteria.eiken_level}」の問題セットが見つからないため、フォールバック検索`)
        
        // フォールバック1: レベルフィルタに戻す
        candidates = this.problemSets.filter(ps => ps.level === criteria.level)
        logger.log(`🔄 レベルフィルタフォールバック: ${candidates.length}個`)
        
        // フォールバック2: 全ての問題セットを使用
        if (candidates.length === 0) {
          candidates = [...this.problemSets]
          logger.log(`🔄 全問題セットフォールバック: ${candidates.length}個`)
        }
      }
    }

    // カテゴリフィルタ  
    if (criteria.category) {
      candidates = candidates.filter(ps => ps.category === criteria.category)
      logger.log(`🏷️ カテゴリフィルタ後 (${criteria.category}):`, candidates.length, '個')
    }

    // 使用済み除外
    if (criteria.excludeUsed) {
      const beforeFilter = candidates.length
      logger.log(`🔍 使用済み問題リスト (${this.usedProblemIds.size}個):`, [...this.usedProblemIds])
      
      candidates = candidates.filter(ps => !this.usedProblemIds.has(ps.set_id))
      logger.log(`🚫 使用済み除外後: ${beforeFilter} → ${candidates.length}個`)
    }
    
    // 🔧 最近使用した問題を除外（重複防止）
    const beforeRecentFilter = candidates.length
    logger.log(`🔍 最近使用した問題 (${this.recentProblemIds.length}個):`, this.recentProblemIds)
    
    candidates = candidates.filter(ps => !this.recentProblemIds.includes(ps.set_id))
    logger.log(`🚫 最近使用問題除外後: ${beforeRecentFilter} → ${candidates.length}個`)
    
    // 4級でフィルタリング後の候補を詳しく表示
    if (criteria.eiken_level === '4' && candidates.length > 0) {
      logger.log(`📝 4級候補問題 (${candidates.length}個):`)
      candidates.slice(0, 10).forEach((ps, i) => {
        logger.log(`  ${i + 1}. "${ps.target_sentence}" (ID: ${ps.set_id})`)
      })
      if (candidates.length > 10) {
        logger.log(`  ... and ${candidates.length - 10} more`)
      }
    }

    // 候補がない場合は使用済みリセット（但し警告を表示）
    if (candidates.length === 0 && criteria.excludeUsed) {
      logger.warn('⚠️ 使用済み問題をリセット - 全ての問題を一度プレイしました')
      logger.log(`📊 リセット前の使用済み問題数: ${this.usedProblemIds.size}`)
      logger.log(`📊 リセット前の最近使用問題数: ${this.recentProblemIds.length}`)
      
      // 🔧 使用済みリストと最近使用リストの両方をクリア
      this.usedProblemIds.clear()
      this.recentProblemIds = []
      
      return this.selectProblemSet({ ...criteria, excludeUsed: false })
    }

    // ランダム選択（難易度を考慮した重み付き）
    if (candidates.length === 0) {
      logger.warn('⚠️ 条件に合う問題セットが見つかりません')
      return null
    }

    // 純粋にランダム選択（重複を防ぐ）
    let selected = candidates[Math.floor(Math.random() * candidates.length)]
    logger.log('🎲 純粋ランダム選択使用')
    
    logger.log('✅ 選択された問題セット:', selected?.set_id, selected?.target_sentence)
    
    // 🔧 デバッグ情報を詳細に表示（常に表示）
    if (selected) {
      logger.log('📊 4級問題選択詳細:')
      logger.log(`  - 全4級問題数: ${this.problemSets.filter(ps => ps.eiken_level === '4').length}`)
      logger.log(`  - 使用済み問題数: ${this.usedProblemIds.size}`)
      logger.log(`  - 最近使用問題数: ${this.recentProblemIds.length}`)
      logger.log(`  - 候補問題数: ${candidates.length}`)
      logger.log(`  - 選択方法: 純粋ランダム`)
      logger.log(`  - 選択された問題: "${selected.target_sentence}" (ID: ${selected.set_id})`)
      
      // 🎯 最近選ばれた問題の履歴を表示
      if (this.recentProblemIds.length > 0) {
        const recentProblems = this.recentProblemIds.map(id => {
          const problem = this.problemSets.find(ps => ps.set_id === id)
          return problem ? `"${problem.target_sentence}" (${id})` : `Unknown (${id})`
        })
        logger.log(`  - 最近の問題履歴: [${recentProblems.join(', ')}]`)
      }
    }
    
    return selected
  }

  /**
   * 問題セットから要素を生成
   * @param {Object} problemSet - 問題セット
   * @param {string} difficulty - 難易度
   * @returns {Promise<Array>} 生成された要素配列
   */
  async generateElementsFromProblemSet(problemSet, difficulty) {
    const diffSettings = this.difficultySettings[difficulty]
    const targetWords = this.parseTargetSentence(problemSet.target_sentence)

    // 正解要素を作成
    const correctElements = await this.createCorrectElements(targetWords, problemSet)

    // ダミー要素を作成
    const distractorElements = await this.createDistractorElements(
      correctElements,
      problemSet,
      diffSettings.distractorCount
    )

    // シャッフル前にpositionを検証
    const allElements = [...correctElements, ...distractorElements]
    logger.log('🔧 All elements before shuffle:', allElements.map(el => ({
      word: el.word,
      position: el.position,
      isCorrect: el.isCorrect
    })))
    // シャッフルして返却、positionを保持
    return this.shuffleArray(allElements).map((element, index) => ({
      ...element,
      id: `element_${problemSet.set_id}_${index}`,
      isUsed: false,
      position: element.position
    }))
  }

  /**
   * 正解要素を作成
   * @param {Array} targetWords - ターゲット単語配列
   * @param {Object} problemSet - 問題セット
   * @returns {Promise<Array>} 正解要素配列
   */
  async createCorrectElements(targetWords, problemSet) {
    const elements = []
    
    // words_poolから直接正解要素を作成
    if (problemSet.words_pool && Array.isArray(problemSet.words_pool)) {
      logger.log('🎯 Creating elements from words_pool:', problemSet.words_pool)
      
      for (const wordData of problemSet.words_pool) {
        const { word, position } = wordData
        
        // コンテンツデータから対応する要素を検索
        const contentItem = this.findContentItem(word, problemSet.level, problemSet.category)
        
        if (contentItem) {
          logger.log(`[createCorrectElements] Creating element: word="${word}", poolPosition="${position}", contentPosition="${contentItem.position}"`)
          
          elements.push({
            word: word, // words_poolから取った元の単語（大文字小文字保持）
            type: contentItem.type,
            color: contentItem.color,
            position: position, // words_poolからのposition（文脈に応じた役割）を最優先
            japanese: contentItem.japanese,
            hint: contentItem.hint,
            isCorrect: true,
            sourceType: 'content',
            // 文脈情報を追加
            contextualRole: position,
            originalPosition: contentItem.position, // grammar_content.jsonの元のposition
            // デバッグ情報
            poolWord: word,
            poolPosition: position
          })
          
          logger.log(`[createCorrectElements] ✓ Element created with position="${position}" (from words_pool)`)
        } else {
          // フォールバック要素を作成
          const fallback = this.createFallbackElement(word, problemSet, position)
          elements.push(fallback)
        }
      }
    } else {
      // フォールバック: targetWordsから作成
      // 4単語以上の場合は助動詞も含める (Do you like cats? など)
      const positions = targetWords.length >= 4 ? 
        ['auxiliary', 'subject', 'verb', 'object'] : 
        ['subject', 'verb', 'object']
      
      logger.log('🎯 Creating correct elements for words:', targetWords)
      logger.log('🎯 Using positions:', positions)
      
      for (let i = 0; i < Math.min(targetWords.length, positions.length); i++) {
        const word = targetWords[i]
        const position = positions[i]
        logger.log(`📍 Processing word ${i}: "${word}" → position: "${position}"`)
        
        const contentItem = this.findContentItem(word, problemSet.level, problemSet.category)
        if (contentItem) {
          elements.push({
            word: contentItem.word,
            type: contentItem.type,
            color: contentItem.color,
            position: position,
            japanese: contentItem.japanese,
            hint: contentItem.hint,
            isCorrect: true,
            sourceType: 'content'
          })
        } else {
          const fallback = this.createFallbackElement(word, problemSet, position)
          elements.push(fallback)
        }
      }
    }
    
    logger.log('[problemGenerator] createCorrectElements result:', elements.map(e => ({ word: e.word, position: e.position, type: e.type })))
    return elements
  }

  /**
   * ダミー要素を作成
   * @param {Array} correctElements - 正解要素
   * @param {Object} problemSet - 問題セット
   * @param {number} count - 作成数
   * @returns {Promise<Array>} ダミー要素配列
   */
  async createDistractorElements(correctElements, problemSet, count) {
    const distractors = []
    const usedWords = new Set(correctElements.map(e => e.word.toLowerCase()))
    
    logger.log('🔧 [createDistractorElements] 開始', {
      correctElementsCount: correctElements.length,
      targetCount: count,
      usedWords: [...usedWords]
    })
    
    // contentDataから候補を取得（レベル・カテゴリに関係なく幅広く選択）
    const allCandidates = this.contentData.filter(item =>
      item.word && 
      !usedWords.has(item.word.toLowerCase()) &&
      item.position // positionが設定されているもののみ
    )
    
    logger.log('🔧 [createDistractorElements] 候補数:', allCandidates.length)
    
    if (allCandidates.length === 0) {
      logger.warn('⚠️ [createDistractorElements] 候補がないため、基本的なダミー要素を生成')
      // フォールバック: 基本的なダミー要素を生成
      const fallbackDistractors = [
        { word: "cat", type: "noun", color: "blue", position: "object", japanese: "猫", isCorrect: false, sourceType: 'fallback' },
        { word: "dog", type: "noun", color: "blue", position: "object", japanese: "犬", isCorrect: false, sourceType: 'fallback' },
        { word: "run", type: "verb", color: "red", position: "verb", japanese: "走る", isCorrect: false, sourceType: 'fallback' },
        { word: "big", type: "adjective", color: "blue", position: "object", japanese: "大きい", isCorrect: false, sourceType: 'fallback' },
        { word: "small", type: "adjective", color: "blue", position: "object", japanese: "小さい", isCorrect: false, sourceType: 'fallback' }
      ].slice(0, count)
      
      return fallbackDistractors
    }
    
    // ランダムに選択（バランス重視）
    const selectedDistractors = this.shuffleArray(allCandidates)
      .slice(0, count)
      .map(item => ({
        ...item,
        isCorrect: false,
        sourceType: 'content_distractor'
      }))
    
    logger.log('🔧 [createDistractorElements] 生成完了:', selectedDistractors.length, '個')
    logger.log('🔧 [createDistractorElements] 生成された要素:', selectedDistractors.map(d => ({ word: d.word, position: d.position })))
    
    return selectedDistractors
  }

  /**
   * ターゲット文を解析
   * @param {string} sentence - ターゲット文
   * @returns {Array} 単語配列
   */
  parseTargetSentence(sentence) {
    const words = sentence
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .split(' ')
      .filter(word => word.length > 0)
    logger.log('📝 Parsed target sentence:', sentence, '→', words)
    // 3つの単語が確実にあることを確認
    if (words.length < 3) {
      logger.warn('⚠️ Target sentence has less than 3 words:', words)
      // 必要に応じてパディングやエラー処理をここで追加可能
    }
    return words
  }

  /**
   * コンテンツアイテムを検索
   * @param {string} word - 検索単語
   * @param {string} level - レベル
   * @param {string} category - カテゴリ
   * @returns {Object|null} 見つかったアイテム
   */
  findContentItem(word, level, category) {
    logger.log(`[findContentItem] Searching for: word="${word}", level="${level}", category="${category}"`)
    
    // 完全一致検索
    let found = this.contentData.find(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.level === level &&
      item.category === category
    )

    if (found) {
      logger.log(`[findContentItem] ✓ Perfect match found:`, found)
      return found
    }

    // レベルを無視して検索
    found = this.contentData.find(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.category === category
    )

    if (found) {
      logger.log(`[findContentItem] ✓ Category match found (ignoring level):`, found)
      return found
    }

    // カテゴリを無視して検索
    found = this.contentData.find(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.level === level
    )

    if (found) {
      logger.log(`[findContentItem] ✓ Level match found (ignoring category):`, found)
      return found
    }

    // 最終手段: 単語名のみで検索
    found = this.contentData.find(item =>
      item.word.toLowerCase() === word.toLowerCase()
    )

    if (found) {
      logger.log(`[findContentItem] ✓ Word-only match found:`, found)
      return found
    }

    logger.log(`[findContentItem] ✗ No match found for "${word}"`)
    return null
  }

  /**
   * フォールバック要素を作成
   * @param {string} word - 単語
   * @param {Object} problemSet - 問題セット
   * @param {string} position - 位置
   * @returns {Object} フォールバック要素
   */
  createFallbackElement(word, problemSet, position = 'object') {
    // 基本的な推測ロジック
    let type = 'unknown'
    let color = 'blue'
    
    // positionは引数で必ず受け取る
    if (['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(word.toLowerCase())) {
      type = 'pronoun'
    } else if (['am', 'is', 'are', 'was', 'were'].includes(word.toLowerCase())) {
      type = 'be-verb'
    } else if (['do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'shall'].includes(word.toLowerCase())) {
      type = 'auxiliary'
      color = 'yellow'
    } else if (word.endsWith('s') && !['is', 'was'].includes(word.toLowerCase())) {
      type = 'general'
      color = 'red'
    }
    
    const fallback = {
      word: word,
      type: type,
      color: color,
      position: position, // 必ずsubject,verb,object,auxiliary
      japanese: `[${word}]`,
      hint: 'フォールバック要素',
      isCorrect: true,
      sourceType: 'fallback'
    }
    // デバッグ用: フォールバック要素のpositionを出力
    logger.log('[problemGenerator] createFallbackElement:', fallback)
    return fallback
  }

  /**
   * 視覚テーマを取得
   * @param {string} themeName - テーマ名
   * @returns {Object} 視覚テーマ
   */
  getVisualTheme(themeName) {
    const theme = this.visualElements.find(ve => ve.keyword === themeName)

    if (theme) {
      return {
        name: themeName,
        icon: theme.icon_name,
        backgroundColor: theme.background_color,
        animation: theme.animation,
        description: theme.description_ja,
        cssClass: theme.cssClass
      }
    }

    // デフォルトテーマ
    return {
      name: 'default',
      icon: 'circle',
      backgroundColor: 'linear-gradient(135deg, #f3f4f6, #9ca3af)',
      animation: 'fade',
      description: 'デフォルトテーマ',
      cssClass: 'visual-default'
    }
  }

  /**
   * 選択重みを計算
   * @param {Object} problemSet - 問題セット
   * @returns {number} 重み値
   */
  calculateSelectionWeight(problemSet) {
    // 🔧 より均等な選択のため、重み付けを簡素化
    let weight = 1

    // 使用頻度による重み調整のみ（難易度による偏りを削除）
    const usageCount = this.getProblemUsageCount(problemSet.set_id)
    weight = Math.max(0.3, 1 - (usageCount * 0.1)) // より緩やかな重み調整

    return weight
  }

  /**
   * 重み付きランダム選択
   * @param {Array} candidates - 候補配列（weightプロパティ付き）
   * @returns {Object} 選択されたアイテム
   */
  selectWeightedRandom(candidates) {
    const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    for (const candidate of candidates) {
      currentWeight += candidate.weight
      if (random <= currentWeight) {
        return candidate
      }
    }

    // フォールバック
    return candidates[candidates.length - 1]
  }

  /**
   * 配列をシャッフル
   * @param {Array} array - 対象配列
   * @returns {Array} シャッフル済み配列
   */
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 利用可能なカテゴリを取得
   * @param {string} level - レベル
   * @returns {Array} カテゴリ配列
   */
  getAvailableCategories(level) {
    const categories = [...new Set(
      this.problemSets
        .filter(ps => ps.level === level)
        .map(ps => ps.category)
    )]
    return categories
  }

  /**
   * 問題使用回数を取得（将来の統計機能用）
   * @param {string} problemSetId - 問題セットID
   * @returns {number} 使用回数
   */
  getProblemUsageCount(problemSetId) {
    // 将来的にはローカルストレージやサーバーから取得
    return 0
  }

  /**
   * 複数のフォールバック問題を生成
   * @param {number} count - 生成する問題数
   * @returns {Array} フォールバック問題配列
   */
  generateFallbackProblems(count) {
    logger.log(`🔄 [generateFallbackProblems] ${count}個のフォールバック問題を生成`)

    const fallbackTemplates = [
      {
        targetSentence: 'I am happy',
        hintJapanese: '私は幸せです',
        words_pool: [
          { word: 'I', position: 'zone-0' },
          { word: 'am', position: 'zone-1' },
          { word: 'happy', position: 'zone-2' }
        ]
      },
      {
        targetSentence: 'You are nice',
        hintJapanese: 'あなたは素敵です',
        words_pool: [
          { word: 'You', position: 'zone-0' },
          { word: 'are', position: 'zone-1' },
          { word: 'nice', position: 'zone-2' }
        ]
      },
      {
        targetSentence: 'She likes cats',
        hintJapanese: '彼女は猫が好きです',
        words_pool: [
          { word: 'She', position: 'zone-0' },
          { word: 'likes', position: 'zone-1' },
          { word: 'cats', position: 'zone-2' }
        ]
      },
      {
        targetSentence: 'We play soccer',
        hintJapanese: '私たちはサッカーをします',
        words_pool: [
          { word: 'We', position: 'zone-0' },
          { word: 'play', position: 'zone-1' },
          { word: 'soccer', position: 'zone-2' }
        ]
      },
      {
        targetSentence: 'They eat lunch',
        hintJapanese: '彼らは昼食を食べます',
        words_pool: [
          { word: 'They', position: 'zone-0' },
          { word: 'eat', position: 'zone-1' },
          { word: 'lunch', position: 'zone-2' }
        ]
      }
    ]

    const problems = []
    for (let i = 0; i < count; i++) {
      const template = fallbackTemplates[i % fallbackTemplates.length]
      const problem = {
        id: `fallback_${i + 1}`,
        japanese: template.hintJapanese,
        hint_ja: template.hintJapanese,
        targetSentence: template.targetSentence,
        target_sentence: template.targetSentence,
        sentence: template.targetSentence,
        words_pool: template.words_pool,
        elements: template.words_pool.map((wordData, index) => ({
          id: `fb_${i}_${index}`,
          word: wordData.word,
          type: 'general',
          japanese: `[${wordData.word}]`,
          position: wordData.position,
          isUsed: false,
          isSelected: false
        }))
      }
      problems.push(problem)
    }

    logger.log(`✅ [generateFallbackProblems] ${problems.length}個のフォールバック問題を生成完了`)
    return problems
  }

  /**
   * フォールバック問題を生成
   * @param {Object} options - オプション
   * @returns {Object} フォールバック問題
   */
  generateFallbackProblem(options) {
    logger.log('🔄 フォールバック問題を生成')

    const fallbackProblems = [
      {
        id: 'fallback_1',
        problemSetId: 'fallback_1',
        level: options.level || 'beginner',
        category: 'be_verb',
        targetSentence: 'I am happy',
        hintJapanese: '私は幸せです',
        difficulty: options.difficulty || 'normal',
        estimatedDifficulty: 1,
        elements: [
          { id: 'f1', word: 'I', type: 'pronoun', color: 'blue', position: 'subject', isCorrect: true, isUsed: false },
          { id: 'f2', word: 'am', type: 'be-verb', color: 'blue', position: 'verb', isCorrect: true, isUsed: false },
          { id: 'f3', word: 'happy', type: 'adjective', color: 'blue', position: 'object', isCorrect: true, isUsed: false },
          { id: 'f4', word: 'You', type: 'pronoun', color: 'blue', position: 'subject', isCorrect: false, isUsed: false },
          { id: 'f5', word: 'sad', type: 'adjective', color: 'blue', position: 'object', isCorrect: false, isUsed: false }
        ],
        visualTheme: {
          name: 'happiness',
          icon: 'smile',
          backgroundColor: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
          animation: 'bounce'
        },
        generatedAt: new Date().toISOString()
      }
    ]

    return fallbackProblems[0]
  }

  /**
   * 難易度設定を作成
   * @returns {Object} 難易度設定
   */
  createDifficultySettings() {
    return {
      easy: {
        distractorCount: 3,
        timeLimit: 90,
        hintEnabled: true,
        visualCues: true
      },
      normal: {
        distractorCount: 5,
        timeLimit: 60,
        hintEnabled: false,
        visualCues: true
      },
      hard: {
        distractorCount: 8,
        timeLimit: 45,
        hintEnabled: false,
        visualCues: false
      }
    }
  }

  /**
   * 使用済み問題をリセット
   */
  resetUsedProblems() {
    this.usedProblemIds.clear()
    this.recentProblemIds = []
    logger.log('🔄 使用済み問題をリセットしました（最近使用履歴もクリア）')
  }

  /**
   * 統計情報を取得
   * @returns {Object} 統計情報
   */
  getStatistics() {
    if (!this.isInitialized) {
      return { error: '初期化されていません' }
    }

    const stats = grammarContentManager.getContentStatistics(this.contentData)

    return {
      ...stats,
      problemSets: {
        total: this.problemSets.length,
        byLevel: this.groupBy(this.problemSets, 'level'),
        byCategory: this.groupBy(this.problemSets, 'category')
      },
      visualElements: this.visualElements.length,
      usedProblems: this.usedProblemIds.size,
      initialized: this.isInitialized
    }
  }

  /**
   * 配列をキーでグループ化
   * @param {Array} array - 配列
   * @param {string} key - グループ化キー
   * @returns {Object} グループ化結果
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }
}

// シングルトンインスタンス
export const problemGenerator = new ProblemGenerator()

// デバッグ用のグローバル露出（開発環境のみ）
if (import.meta.env.DEV) {
  window.problemGenerator = problemGenerator
}

// デバッグ用：問題生成テスト
async function testProblemGeneration() {
  logger.log('🧪 Testing problem generation...')
  try {
    const problem = await problemGenerator.generateProblem({
      level: 'beginner',
      difficulty: 'normal'
    })
    logger.log('✅ Test results:')
    logger.log('- Problem generated successfully')
    logger.log('- Elements:', problem.elements.length)
    const correctElements = problem.elements.filter(el => el.isCorrect)
    logger.log('- Correct elements:', correctElements.length)
    logger.log('- Positions:', correctElements.map(el => `${el.word}(${el.position})`))
    return true
  } catch (error) {
    logger.error('❌ Test failed:', error)
    return false
  }
}

// グローバル露出
if (import.meta.env.DEV) {
  window.problemGenerator = problemGenerator
  window.testProblemGeneration = testProblemGeneration
}