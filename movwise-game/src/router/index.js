// src/router/index.js - VR対応マイグレーション統合版
import { createRouter, createWebHistory } from 'vue-router'
import { useGameSettingsStore } from '../stores/gameSettings'
import { useGameStore } from '../stores/gameStore'
import DataMigrationSystem from '@/utils/dataMigration'
import logger from '@/utils/logger'

// Word Galaxy Integration
import { wordGalaxyRoutes, setupWordGalaxyGuards } from './wordGalaxy'

// ゲームコンポーネントの動的インポート
const RhymingGame = () => import('@/components/games/RhymingGame.vue')
const RhythmTapperGame = () => import('@/components/games/RhythmTapperGame.vue')
const RhythmPhonicsMini = () => import('@/components/games/RhythmPhonicsMini.vue')
const SinglePhonemeGame = () => import('@/components/games/SinglePhonemeGame.vue')
const BlendingBuilderGame = () => import('@/components/games/BlendingBuilderGame.vue')
const CvcWordGame = () => import('@/components/games/CvcWordGame.vue')
const SoundHunterGame = () => import('@/components/games/SoundHunterGame.vue')
// MagicESpaceJump component removed - replaced with MagicEGalaxyBuilder
const SightWordMaster = () => import('@/components/games/SightWordMaster.vue')
const WordRushGame = () => import('@/components/games/WordRushGame.vue')
const BeVerbRushGame = () => import('@/components/games/BeVerbRush.vue')
// EnhancedMagicEGalaxyBuilder component removed

// サウンドアドベンチャーハブ - 削除済み（PhonicsAdventureに移行）

// Word Building Hub
const WordBuildingHub = () => import('../views/WordBuildingHub.vue')

// 前置詞ゲームの動的インポート
const PrepositionSpaceStation = () => import('@/components/games/grammar-galaxy/preposition/PrepositionSpaceStationFallback.vue')
const PrepositionGamePlay = () => import('@/components/games/grammar-galaxy/preposition/PrepositionGamePlay.vue')

// 文法ゲームの動的インポート
const GrammarGalaxyFoundation = () => import('@/views/GrammarGalaxyFoundation.vue')
// Temporary fix for dynamic import issue
import GrammarColorCodeGame from '@/components/games/grammar-galaxy/GrammarColorCodeGame.vue'
// const GrammarColorCodeGame = () => import('@/components/games/grammar-galaxy/GrammarColorCodeGame.vue')
const PatternHunterGame = () => import('@/components/games/grammar-galaxy/PatternHunterGame.vue')
const GrammarReflexArena = () => import('@/components/games/grammar-galaxy/GrammarReflexArena.vue')
const SentenceBuilderMaster = () => import('@/components/games/SentenceBuilderMaster.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Word Galaxy Routes - Advanced Vocabulary Learning System - 保持（VocabularyWorldから参照）
    ...wordGalaxyRoutes,

    // ===== AI TESTING SUITE =====
    {
      path: '/ai-testing',
      name: 'AITesting',
      component: () => import('@/views/AITestingView.vue'),
      meta: {
        title: 'AI System Testing Suite',
        requiresMigrationCheck: false,
        devOnly: true
      }
    },
    {
      path: '/ai-demo',
      name: 'AIGameDemo',
      component: () => import('@/views/AIGameDemo.vue'),
      meta: {
        title: 'AI Game Demo',
        requiresMigrationCheck: false,
        devOnly: true
      }
    },

    // ===== UNIFIED PLATFORM ROUTES =====
    // Consolidated platform approach - Option A implementation

    // Phonics Adventure Platform
    {
      path: '/platforms/phonics-adventure',
      name: 'PhonicsAdventure',
      component: () => import('@/components/platforms/PhonicsAdventure.vue'),
      meta: {
        title: 'Phonics Adventure - フォニックス・アドベンチャー',
        requiresMigrationCheck: false,
        platform: 'phonics'
      }
    },

    // Grammar Galaxy Platform
    {
      path: '/platforms/grammar-galaxy',
      name: 'GrammarGalaxy',
      component: () => import('@/components/platforms/GrammarGalaxy.vue'),
      meta: {
        title: 'Grammar Galaxy - 文法銀河',
        requiresMigrationCheck: false,
        platform: 'grammar'
      }
    },

    // Vocabulary World Platform
    {
      path: '/platforms/vocabulary-world',
      name: 'VocabularyWorld',
      component: () => import('@/components/platforms/VocabularyWorld.vue'),
      meta: {
        title: 'Vocabulary World - 語彙の世界',
        requiresMigrationCheck: false,
        platform: 'vocabulary'
      }
    },

    // Typing Arena Platform
    {
      path: '/platforms/typing-arena',
      name: 'TypingArena',
      component: () => import('@/components/games/TypingArenaEnhanced.vue'),
      meta: {
        title: 'Typing Arena - タイピング・アリーナ',
        requiresMigrationCheck: false,
        platform: 'typing'
      }
    },

    // Integrated Skills Challenge Platform
    {
      path: '/platforms/integrated-challenge',
      name: 'IntegratedChallenge',
      component: () => import('@/components/platforms/IntegratedChallenge.vue'),
      meta: {
        title: 'Integrated Challenge - 総合スキル・チャレンジ',
        requiresMigrationCheck: false,
        platform: 'integrated'
      }
    },

    // Dynamic game route for grammar games
    {
      path: '/grammar-game/:gameId',
      name: 'GrammarGame',
      beforeEnter: (to, from, next) => {
        const gameComponent = to.query.component
        if (gameComponent) {
          // Navigate to the specific grammar game component
          import(`@/components/games/grammar-galaxy/${gameComponent}.vue`)
            .then(() => {
              next()
            })
            .catch(() => {
              import(`@/components/grammar/games/${gameComponent}.vue`)
                .then(() => {
                  next()
                })
                .catch(() => {
                  console.error('Grammar game component not found:', gameComponent)
                  next('/platforms/grammar-galaxy')
                })
            })
        } else {
          next('/platforms/grammar-galaxy')
        }
      },
      component: () => import('@/components/games/grammar-galaxy/GrammarGameWrapper.vue'),
      meta: {
        title: 'Grammar Game - 文法ゲーム',
        requiresMigrationCheck: false
      }
    },

    // Dynamic game route for vocabulary games
    {
      path: '/vocabulary-game/:gameId',
      name: 'VocabularyGame',
      beforeEnter: (to, from, next) => {
        const gameComponent = to.query.component
        if (gameComponent) {
          // Navigate to the specific vocabulary game component
          import(`@/components/games/${gameComponent}.vue`)
            .then(() => {
              next()
            })
            .catch(() => {
              import(`@/components/word-galaxy/${gameComponent}.vue`)
                .then(() => {
                  next()
                })
                .catch(() => {
                  console.error('Vocabulary game component not found:', gameComponent)
                  next('/platforms/vocabulary-world')
                })
            })
        } else {
          next('/platforms/vocabulary-world')
        }
      },
      component: () => import('@/components/games/VocabularyGameWrapper.vue'),
      meta: {
        title: 'Vocabulary Game - 語彙ゲーム',
        requiresMigrationCheck: false
      }
    },

    // Dynamic game route for phonics games
    {
      path: '/phonics-game/:gameId',
      name: 'PhonicsGame',
      beforeEnter: (to, from, next) => {
        const gameComponent = to.query.component
        if (gameComponent) {
          // Navigate to the specific phonics game component
          import(`@/components/games/${gameComponent}.vue`)
            .then(() => {
              next()
            })
            .catch(() => {
              console.error('Phonics game component not found:', gameComponent)
              next('/platforms/phonics-adventure')
            })
        } else {
          next('/platforms/phonics-adventure')
        }
      },
      component: () => import('@/components/games/PhonicsGameWrapper.vue'),
      meta: {
        title: 'Phonics Game - フォニックスゲーム',
        requiresMigrationCheck: false
      }
    },

    // ===== END UNIFIED PLATFORM ROUTES =====

    // 生徒用ダッシュボード
    {
      path: '/dashboard/student',
      name: 'DashboardStudent',
      component: () => import('../views/DashboardStudent.vue'),
      meta: {
        title: 'サウンド・ガーディアン司令部 - MovWISE',
        requiresUserType: 'student',
        requiresMigrationCheck: false
      }
    },

    // 講師用ダッシュボード
    {
      path: '/dashboard/teacher',
      name: 'DashboardTeacher',
      component: () => import('../views/DashboardTeacher.vue'),
      meta: {
        title: 'MovWISE 講師ダッシュボード',
        requiresUserType: 'teacher',
        requiresMigrationCheck: false
      }
    },

    // 保護者用ダッシュボード
    {
      path: '/dashboard/parent',
      name: 'DashboardParent',
      component: () => import('../views/DashboardParent.vue'),
      meta: {
        title: 'MovWISE 保護者ポータル',
        requiresUserType: 'parent',
        requiresMigrationCheck: false
      }
    },

    // ゲームライブラリ（優先度別表示）
    {
      path: '/game-library',
      name: 'GameLibrary',
      component: () => import('../views/GameLibraryView.vue'),
      meta: {
        title: 'ゲームライブラリ - MovWISE',
        requiresMigrationCheck: false
      }
    },

    // データマイグレーション画面
    {
      path: '/migration',
      name: 'migration',
      component: () => import('../views/MigrationScreen.vue'),
      meta: {
        title: 'MovWISE データ移行',
        requiresMigrationCheck: false
      }
    },

    // デモログイン画面 - Simple version
    {
      path: '/demo-login',
      name: 'demo-login',
      component: () => import('../views/SimpleDemoLogin.vue'),
      meta: {
        title: 'Demo Login - MovWISE Game',
        requiresMigrationCheck: false
      }
    },
    
    // Apple Planet - CVC Word Game with Galaxy Trading integration
    {
      path: '/apple-planet',
      name: 'apple-planet',
      component: () => import('@/views/ApplePlanetView.vue'),
      meta: {
        title: 'Apple Garden Planet - CVC単語農園',
        requiresMigrationCheck: false
      }
    },
    
    // Robot Planet - Blending Builder Game with Galaxy Trading integration
    {
      path: '/robot-planet',
      name: 'robot-planet',
      component: () => import('@/views/RobotPlanetView.vue'),
      meta: {
        title: 'Robot Tech Planet - 音素ブレンドファクトリー',
        requiresMigrationCheck: false
      }
    },
    
    // Grammar Moon - Pattern Hunter Game with Galaxy Trading integration
    {
      path: '/grammar-moon',
      name: 'grammar-moon',
      component: () => import('@/views/GrammarMoonView.vue'),
      meta: {
        title: 'Grammar Moon Academy - 文法パターン研究所',
        requiresMigrationCheck: false
      }
    },
    
    // VR QR Code Generator
    {
      path: '/vr-qr-generator',
      name: 'vr-qr-generator',
      component: () => import('@/components/vr/VRQRCodeGenerator.vue'),
      meta: {
        title: 'VR Academy Portal Generator - QRコード生成',
        requiresMigrationCheck: false
      }
    },
    
    // VR Readiness Assessment
    {
      path: '/vr-readiness',
      name: 'vr-readiness',
      component: () => import('@/components/vr/VRReadinessAssessment.vue'),
      meta: {
        title: 'VR Readiness Assessment - VR準備度評価',
        requiresMigrationCheck: false
      }
    },
    
    // ホーム
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: 'Sound Galaxy Academy - 音響銀河を救う英語学習',
        requiresMigrationCheck: true
      }
    },

    // アリーナハブ
    {
      path: '/arena-hub',
      name: 'arena-hub',
      component: () => import('../views/ArenaHub.vue'),
      meta: {
        title: 'バトルアリーナ - 学習バトル場',
        requiresMigrationCheck: false
      }
    },

    // プロフィール
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        title: 'プロフィール - MovWISE Galaxy'
      }
    },

    // 設定
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        title: '設定 - MovWISE Galaxy'
      }
    },

    // サブスクリプション管理
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('../views/SubscriptionView.vue'),
      meta: {
        title: 'プラン管理 - MovWISE Galaxy',
        requiresAuth: false
      }
    },

    // サブスクリプション成功ページ
    {
      path: '/subscription/success',
      name: 'subscription-success',
      component: () => import('../views/SubscriptionView.vue'),
      meta: {
        title: '決済完了 - MovWISE Galaxy',
        requiresAuth: false
      }
    },

    // サブスクリプションキャンセルページ
    {
      path: '/subscription/cancel',
      name: 'subscription-cancel',
      component: () => import('../views/SubscriptionView.vue'),
      meta: {
        title: '決済キャンセル - MovWISE Galaxy',
        requiresAuth: false
      }
    },

    // ログイン・サインアップ
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        title: 'ログイン - MovWISE Academy',
        requiresAuth: false
      }
    },

    // ログアウト
    {
      path: '/logout',
      name: 'logout',
      beforeEnter: async (to, from, next) => {
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        await authStore.signOut()
        next('/')
      }
    },

    // カスタマイズ可能なフォニックス・ジャーニー
    {
      path: '/customizable-phonics',
      name: 'customizable-phonics',
      component: () => import('@/components/games/CustomizablePhonicsJourney.vue'),
      meta: {
        title: 'カスタマイズ・フォニックス・ジャーニー - Jolly Phonics',
        requiresMigrationCheck: false
      }
    },

    // サウンド・マスタリー・アーキペラゴ メインハブ - PhonicsAdventureへリダイレクト
    {
      path: '/sound-adventure',
      redirect: '/platforms/phonics-adventure'
    },

    // Word Building Hub - 語彙構築惑星
    {
      path: '/word-building',
      name: 'WordBuildingHub',
      component: WordBuildingHub,
      meta: {
        title: 'Word Building City - 単語構築惑星',
        requiresAuth: false
      }
    },

    // 前置詞ゲーム - 宇宙ステーション（エントリーポイント）
    {
      path: '/grammar-galaxy/preposition-master',
      name: 'PrepositionSpaceStation',
      component: PrepositionSpaceStation,
      meta: {
        title: '前置詞マスター：宇宙の旅 - Preposition Master',
        requiresAuth: false
      }
    },

    // 前置詞ゲーム - 各惑星でのゲームプレイ
    {
      path: '/grammar-galaxy/preposition-master/play/:category',
      name: 'PrepositionGamePlay',
      component: PrepositionGamePlay,
      meta: {
        title: '前置詞ゲーム - プレイ中',
        requiresAuth: false
      }
    },

    // === Stage 1: サウンド・ファウンデーション島 ===
    // 純粋な音認識から開始（最重要基礎）
    {
      path: '/games/pure-sound-lab',
      name: 'pure-sound-lab',
      component: () => import('@/components/games/PureSoundLabBeatSaber.vue'),
      meta: {
        title: 'ピュア・サウンド・ラボ',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'pureSoundLab',
        icon: '🎵',
        description: 'ビートセイバー風フォニックス学習ゲーム',
        learningObjective: '音素認識能力の基礎構築',
        unlockRequirement: '常時アンロック（学習の出発点）'
      }
    },
    {
      path: '/games/sound-to-symbol',
      name: 'sound-to-symbol',
      component: SoundHunterGame, // 既存ゲームを音文字結合用に改修
      meta: {
        title: 'サウンド→シンボル・マッチング',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'soundToSymbolMatch',
        icon: '🎯',
        description: '音を聞いて対応する文字を選択する音文字結合',
        learningObjective: '聴覚と視覚の音韻情報結合',
        unlockRequirement: 'Pure Sound Lab 50%完了'
      }
    },
    {
      path: '/games/phoneme-pattern-lab',
      name: 'phoneme-pattern-lab',
      component: SinglePhonemeGame, // 既存ゲームをパターン学習用に改修
      meta: {
        title: 'フォニックス・パターン・ラボ',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'phonemePatternLab',
        icon: '⚗️',
        description: '同音素グループの体系的学習（短母音、長母音等）',
        learningObjective: '音素グループのパターン認識',
        unlockRequirement: 'Sound→Symbol Matching 60%完了'
      }
    },

    // Sound Master Tower - 音の門番タワー
    {
      path: '/games/sound-master-game',
      name: 'sound-master-game',
      component: () => import('@/components/games/SoundMasterGame.vue'),
      meta: {
        title: '音の門番タワー',
        stage: 'soundPlanet',
        difficulty: 'intermediate',
        gameId: 'soundMasterGame',
        icon: '🗼',
        description: '音声を聞いて正しい文字を選ぶ音素マスターゲーム',
        learningObjective: '音素の聴覚識別と文字対応',
        unlockRequirement: '音素研究所 60%完了'
      }
    },

    // Rhythm Phonics Mini - 3分リズムフォニックス
    {
      path: '/games/rhythm-phonics-mini',
      name: 'rhythm-phonics-mini',
      component: RhythmPhonicsMini,
      meta: {
        title: '3分リズムフォニックス',
        stage: 'soundFoundation',
        difficulty: 'beginner',
        gameId: 'rhythmPhonicsMini',
        icon: '🎵',
        description: 'リズムに合わせて音素を学ぶ3分間ミニゲーム',
        learningObjective: 'リズム感覚と音素認識の統合',
        unlockRequirement: 'なし（いつでも利用可能）'
      }
    },

    // Cosmic Sound Chain - 音素ブレンディング練習
    {
      path: '/games/cosmic-sound-chain',
      name: 'cosmic-sound-chain',
      component: () => import('@/components/games/CosmicSoundChain.vue'),
      meta: {
        title: 'コズミック・サウンドチェーン',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'cosmicSoundChain',
        icon: '🔗',
        description: '音素を繋げて単語を作るブレンディング練習',
        learningObjective: '2文字〜4文字の音素結合と単語構築',
        unlockRequirement: 'Phoneme Pattern Lab 50%完了'
      }
    },

    // Phonics Path Game - 音声認識双六ゲーム
    {
      path: '/games/phonics-path-game',
      name: 'phonics-path-game',
      component: () => import('@/components/games/PhonicsPathGame.vue'),
      meta: {
        title: 'フォニックス・パス・アドベンチャー',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'phonicsPathGame',
        icon: '🎯',
        description: '音声認識で進む双六スタイルのフォニックスゲーム',
        learningObjective: '子音+母音から3文字単語まで段階的発話練習',
        unlockRequirement: '常時アンロック'
      }
    },

    // === Stage 1.5: フォニックス・トレーニング・センター ===
    // CV発音練習と音素識別ゲーム
    {
      path: '/games/cv-pronunciation-trainer',
      name: 'cv-pronunciation-trainer',
      component: () => import('@/components/games/CvPronunciationTrainer.vue'),
      meta: {
        title: 'CV発音トレーナー',
        stage: 'phonicsTraining',
        stageOrder: 1.5,
        difficulty: 'beginner',
        gameId: 'cvPronunciationTrainer',
        icon: '🗣️',
        description: '子音＋母音の組み合わせ発音を集中練習',
        learningObjective: '音素の正確な発音と識別能力の習得',
        unlockRequirement: 'サウンド・ファウンデーション島 50%完了'
      }
    },

    {
      path: '/games/true-sound-impact',
      name: 'true-sound-impact',
      component: () => import('@/components/games/TrueSoundImpact.vue'),
      meta: {
        title: '浮遊文字ハント',
        stage: 'phonicsTraining',
        stageOrder: 1.6,
        difficulty: 'beginner',
        gameId: 'floatingLetterHunt',
        icon: '🎯',
        description: '聞こえた音に対応する文字を素早く見つけてタッチ',
        learningObjective: '音素と文字の対応関係の習得',
        unlockRequirement: 'サウンド・ファウンデーション島 50%完了'
      }
    },

    {
      path: '/games/phonics-training-hub',
      name: 'phonics-training-hub',
      component: () => import('@/components/games/PhonicsTrainingHub.vue'),
      meta: {
        title: 'フォニックス・トレーニング・センター',
        stage: 'phonicsTraining',
        stageOrder: 1.5,
        difficulty: 'beginner',
        gameId: 'phonicsTraining',
        icon: '🎤',
        description: 'CV発音練習と音素識別ゲーム！正確な発音を身につけよう',
        learningObjective: '音素の正確な発音と識別能力の習得',
        unlockRequirement: 'サウンド・ファウンデーション島 50%完了'
      }
    },

    // === Stage 2: サウンド・ルールズ島 ===
    // 音韻変化とルール学習
    // Old route redirected to new game
    {
      path: '/games/magic-e-space-jump',
      redirect: '/games/magic-e-galaxy-builder'
    },
    {
      path: '/games/voice-puzzle',
      name: 'voice-puzzle',
      component: () => import('@/components/games/VoicePuzzleGame.vue'),
      meta: {
        title: '宇宙音声パズル',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'advanced',
        gameId: 'voicePuzzle',
        icon: '🧩',
        description: '音声でパズルピースを選択して美しい絵を完成',
        learningObjective: '高度な音声認識練習',
        unlockRequirement: 'Magic Cooking 60%完了'
      }
    },
    {
      path: '/games/ghost-letter-hunters',
      name: 'ghost-letter-hunters',
      component: () => import('@/components/games/GhostLetterHunters.vue'),
      meta: {
        title: 'ゴーストレターハンターズ',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'ghostLetterHunters',
        icon: '👻',
        description: 'サイレントレターを捕獲する音声認識ゲーム',
        learningObjective: 'サイレントレター認識・発音練習',
        unlockRequirement: 'Voice Puzzle 50%完了'
      }
    },
    {
      path: '/games/double-letter-lab',
      name: 'double-letter-lab',
      component: () => import('@/components/games/DoubleLetterLabGame.vue'), // 新規開発必要
      meta: {
        title: 'ダブル・レター・ラボ',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'doubleLetterLab',
        icon: '👥',
        description: 'ff, ll, ssなどの重子音ルールを学習',
        learningObjective: '重子音パターンの理解',
        unlockRequirement: 'Silent Letter Detective 40%完了'
      }
    },

    // === Stage 3: ブレンディング・マスタリー島 ===
    // 音素合成とCVC構造学習
    {
      path: '/games/sequential-blending',
      name: 'sequential-blending',
      component: () => import('@/components/games/SequentialBlendingGame.vue'), // 新規開発必要
      meta: {
        title: 'シーケンシャル・ブレンディング',
        stage: 'blendingMastery',
        stageOrder: 3,
        difficulty: 'intermediate',
        gameId: 'sequentialBlending',
        icon: '📈',
        description: 'c-a-t → catの段階的音素合成を視覚化',
        learningObjective: '音素から単語への変換技術',
        unlockRequirement: 'サウンド・ルールズ島 60%完了'
      }
    },
    {
      path: '/games/cvc-word-factory',
      name: 'cvc-word-factory',
      component: CvcWordGame, // 既存ゲームを活用
      meta: {
        title: 'CVC ワード・ファクトリー',
        stage: 'blendingMastery',
        stageOrder: 3,
        difficulty: 'intermediate',
        gameId: 'cvcWordFactory',
        icon: '🏭',
        description: '子音-母音-子音パターンの体系的学習',
        learningObjective: 'CVC構造の完全理解',
        unlockRequirement: 'Sequential Blending 60%完了'
      }
    },

    // === Stage 4: ワード・ビルディング島 ===
    // 語彙拡張と単語認識（SightWordはここに配置）
    {
      path: '/games/sight-word-master',
      name: 'sight-word-master',
      component: SightWordMaster, // 既存ゲーム（配置修正）
      meta: {
        title: 'サイトワード・マスター',
        stage: 'wordBuilding',
        stageOrder: 4, // レベル1から4に変更！
        difficulty: 'advanced',
        gameId: 'sightWordMaster',
        icon: '👁️',
        description: '重要なサイトワード200語の瞬間認識',
        learningObjective: '高頻度語の自動認識',
        unlockRequirement: 'ブレンディング・マスタリー島 70%完了'
      }
    },

    // === ディクテーション＆スペリング・センター ===
    {
      path: '/games/word-dictation-challenge',
      name: 'word-dictation-challenge',
      component: () => import('@/components/games/WordDictationChallenge.vue'),
      meta: {
        title: 'ワード・ディクテーション・チャレンジ',
        stage: 'dictationSpelling',
        stageOrder: 4.5,
        difficulty: 'intermediate',
        gameId: 'wordDictationChallenge',
        icon: '📝',
        description: '音声を聞いて単語を正確にタイピング',
        learningObjective: '聴解力とスペリング能力の向上',
        unlockRequirement: 'ワード・ビルディング島 50%完了'
      }
    },
    {
      path: '/handwriting-dictation',
      name: 'handwriting-dictation',
      component: () => import('@/components/games/HandwritingDictation.vue'),
      meta: {
        title: '手書きディクテーション',
        stage: 'dictationSpelling',
        stageOrder: 4.6,
        difficulty: 'intermediate',
        gameId: 'handwritingDictation',
        icon: '✍️',
        description: '音声を聞いて単語を手書き',
        learningObjective: '筆記スキルとスペリング能力の向上',
        unlockRequirement: 'ワード・ビルディング島 30%完了'
      }
    },
    {
      path: '/games/typing-arena',
      name: 'typing-arena',
      component: () => import('@/components/games/TypingArena.vue'),
      meta: {
        title: '英検タイピング・アリーナ',
        stage: 'dictationSpelling',
        stageOrder: 4.5,
        difficulty: 'intermediate',
        gameId: 'typingArena',
        icon: '⌨️',
        description: '英検レベル別タイピング練習場',
        learningObjective: 'タイピングスキルと英語学習の統合',
        unlockRequirement: 'ワード・ビルディング島 50%完了'
      }
    },
    {
      path: '/games/spelling-bee-arena',
      name: 'spelling-bee-arena',
      component: () => import('@/components/games/TypingArena.vue'),
      meta: {
        title: '英検タイピング・アリーナ',
        stage: 'dictationSpelling',
        stageOrder: 4.5,
        difficulty: 'intermediate',
        gameId: 'spellingBeeArena',
        icon: '⌨️',
        description: '英検レベル別・3Dタイピング練習場',
        learningObjective: 'タイピングスピードと英語学習の統合',
        unlockRequirement: 'ワード・ビルディング島 50%完了'
      }
    },
    {
      path: '/games/sound-magic-arena',
      name: 'sound-magic-arena',
      component: () => import('@/components/games/SoundMagicArena.vue'),
      meta: {
        title: 'サウンドマジックアリーナ',
        stage: 'wordBuilding',
        stageOrder: 4,
        difficulty: 'advanced',
        gameId: 'soundMagicArena',
        icon: '⚔️',
        description: 'R制御母音の魔法でバトル！リズム音声認識ゲーム',
        learningObjective: 'R制御母音の習得・発音練習',
        unlockRequirement: 'Digraph Master 50%完了'
      }
    },
    {
      path: '/games/word-rush',
      name: 'WordRushGame',
      component: WordRushGame,
      meta: {
        title: 'ワード・ラッシュ・アリーナ',
        stage: 'wordBuilding',
        stageOrder: 4,
        difficulty: 'dynamic',
        gameId: 'wordRushArena',
        icon: '⚡',
        description: 'タイムプレッシャーの中で語彙認識速度を極限まで向上！画像・音声・定義から瞬時に英単語を識別する高速語彙習得ゲーム',
        learningObjective: '語彙認識速度の向上と応用',
        unlockRequirement: 'ブレンディング・マスタリー島 70%完了'
      }
    },

    // === Stage 5: リズム・アンド・プロソディ島 ===
    // 韻律とリズムパターン学習
    {
      path: '/games/stress-pattern-master',
      name: 'stress-pattern-master',
      component: () => import('@/components/games/StressPatternMasterGame.vue'), // 新規開発必要
      meta: {
        title: 'ストレス・パターン・マスター',
        stage: 'rhythmProsody',
        stageOrder: 5,
        difficulty: 'advanced',
        gameId: 'stressPatternMaster',
        icon: '🥁',
        description: '単語アクセント学習（PREsent vs preSENT）',
        learningObjective: '英語のストレスパターン習得',
        unlockRequirement: 'ワード・ビルディング島 70%完了'
      }
    },
    {
      path: '/games/intonation-wave',
      name: 'intonation-wave',
      component: () => import('@/components/games/IntonationWaveGame.vue'), // 新規開発必要
      meta: {
        title: 'イントネーション・ウェーブ',
        stage: 'rhythmProsody',
        stageOrder: 5,
        difficulty: 'advanced',
        gameId: 'intonationWave',
        icon: '🌊',
        description: '文の音調変化（疑問文、平叙文の違い）',
        learningObjective: '英語のイントネーション習得',
        unlockRequirement: 'Stress Pattern Master 50%完了'
      }
    },
    {
      path: '/games/rhyming-rush',
      name: 'rhyming-rush',
      component: RhymingGame, // 既存ゲームを活用
      meta: {
        title: 'ライミング・ラッシュ',
        stage: 'rhythmProsody',
        stageOrder: 5,
        difficulty: 'advanced',
        gameId: 'rhymingRush',
        icon: '🎪',
        description: '韻を踏む単語をスピードキャッチ',
        learningObjective: '英語の韻律感覚習得',
        unlockRequirement: 'Intonation Wave 40%完了'
      }
    },

    // === Stage 6: アドバンスド・フォニックス島 ===
    // 最終統合学習
    {
      path: '/games/complex-phoneme-patterns',
      name: 'complex-phoneme-patterns',
      component: () => import('@/components/games/ComplexPhonemePatternsGame.vue'), // 新規開発必要
      meta: {
        title: 'コンプレックス・フォニーム・パターンズ',
        stage: 'advancedPhonics',
        stageOrder: 6,
        difficulty: 'expert',
        gameId: 'complexPhonemePatterns',
        icon: '🧬',
        description: '上級音韻パターンの総合学習',
        learningObjective: '複雑音韻パターンの統合理解',
        unlockRequirement: 'リズム・アンド・プロソディ島 80%完了'
      }
    },
    {
      path: '/games/phonics-boss-challenge',
      name: 'phonics-boss-challenge',
      component: () => import('@/components/games/PhonicsBossChallengeGame.vue'), // 新規開発必要
      meta: {
        title: 'フォニックス・ボス・チャレンジ',
        stage: 'advancedPhonics',
        stageOrder: 6,
        difficulty: 'expert',
        gameId: 'phonicsBossChallenge',
        icon: '👑',
        description: 'すべての知識を駆使した最終バトル',
        learningObjective: '全フォニックス知識の総合統合',
        unlockRequirement: 'Complex Phoneme Patterns 70%完了'
      }
    },

    // === 既存ゲームの互換性維持 ===
    // 古いルート名での互換性
    {
      path: '/games/single-phoneme',
      redirect: '/games/phoneme-pattern-lab'
    },
    {
      path: '/games/sound-hunter',
      redirect: '/games/sound-to-symbol'
    },
    {
      path: '/games/blending-builder',
      redirect: '/games/sequential-blending'
    },
    {
      path: '/games/cvc',
      redirect: '/games/cvc-word-factory'
    },
    {
      path: '/games/magic-castle-jump',
      redirect: '/games/magic-e-galaxy-builder'
    },
    {
      path: '/games/magic-e-castle',
      redirect: '/games/magic-e-galaxy-builder'
    },
    {
      path: '/games/rhyming',
      redirect: '/games/rhyming-rush'
    },

    // CVC設定ページ（既存機能維持）
    {
      path: '/games/cvc/settings',
      name: 'cvc-settings',
      component: () => import('../components/games/CvcLevelSelector.vue'),
      meta: {
        title: 'CVC設定',
        stage: 'blendingMastery'
      }
    },

    // 旧ルートのリダイレクト
    {
      path: '/sound-master',
      redirect: '/platforms/phonics-adventure'
    },

    // 削除されたゲームのリダイレクト（適切な代替ルートに誘導）
    {
      path: '/games/medial-sound',
      redirect: '/games/phoneme-pattern-lab'
    },
    {
      path: '/games/pattern-builder',
      redirect: '/games/word-family-tree'
    },
    {
      path: '/games/alliteration',
      redirect: '/games/rhyming-rush'
    },
    {
      path: '/games/rhythm-tapper',
      redirect: '/games/stress-pattern-master'
    },
    {
      path: '/games/grammar-motion',
      redirect: '/grammar-galaxy'
    },


    // === 新規代名詞学習ゲーム ===
    {
      path: '/grammar-galaxy/holographic-story-deck',
      name: 'holographic-story-deck',
      component: () => import('@/components/games/HolographicStoryDeck.vue'),
      meta: {
        title: 'Holographic Story Deck - 代名詞学習',
        stage: 'grammarFoundation',
        stageOrder: 3,
        difficulty: 'intermediate',
        gameId: 'holographicStoryDeck',
        icon: '🎥',
        description: 'ホロデッキで代名詞学習シナリオを体験',
        learningObjective: '代名詞の正しい使い方を学習',
        unlockRequirement: 'Grammar Galaxy 基礎編 30%完了'
      }
    },

    // === 文法ゲーム ===
    {
      path: '/grammar-galaxy/foundation',
      name: 'grammar-galaxy-foundation',
      component: GrammarGalaxyFoundation,
      props: (route) => ({ planetId: route.query.planet || 'beVerb' }),
      meta: {
        title: 'Grammar Galaxy Foundation',
        requiresAuth: false
      }
    },
    {
      path: '/grammar-galaxy/color-code/:planetId',
      name: 'grammar-color-code',
      component: GrammarColorCodeGame,
      props: true,
      meta: {
        title: 'Galaxy Grammar Station - 宇宙文法ステーション',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'galaxyGrammarStation',
        icon: '🛸',
        description: '色分けされたモジュールで宇宙ステーションを建設し、文法構造を学習',
        learningObjective: '文法要素の視覚的認識と文構造の理解',
        unlockRequirement: '文法ギャラクシー基礎編 50%完了'
      }
    },
    {
      path: '/grammar-game/parts-of-speech',
      name: 'grammar-parts-of-speech',
      component: GrammarColorCodeGame,
      props: route => ({ component: route.query.component }),
      meta: {
        title: 'Grammar Parts of Speech - 品詞マスター',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'grammarColorCode',
        icon: '🛸',
        description: '品詞を色分けして文法構造を学習',
        learningObjective: '品詞の視覚的認識と文構造の理解',
        unlockRequirement: '文法ギャラクシー基礎編 50%完了'
      }
    },
    {
      path: '/sentence-builder-master',
      name: 'sentence-builder-master',
      component: SentenceBuilderMaster,
      meta: {
        title: '英作文マスター - Sentence Builder Master',
        stage: 'grammarFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'sentenceBuilderMaster',
        icon: '📝',
        description: '段階的に英文構造を学習する英作文練習ゲーム',
        learningObjective: '主語・動詞から始まる基本文構造の理解と英作文能力の向上',
        unlockRequirement: 'なし（初心者向け）'
      }
    },
    {
      path: '/grammar-galaxy/pattern-hunter',
      name: 'pattern-hunter',
      component: PatternHunterGame,
      meta: {
        title: 'Pattern Hunter Game',
        requiresAuth: false
      }
    },
    {
      path: '/grammar-galaxy/be-verb-rush',
      name: 'be-verb-rush',
      component: BeVerbRushGame,
      meta: {
        title: 'Be Verb Rush',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'beVerbRush',
        icon: '⚡',
        description: '高速Be動詞判定ゲーム',
        learningObjective: 'Be動詞の正しい使い方の習得',
        unlockRequirement: '文法ギャラクシー基礎編 40%完了'
      }
    },
    {
      path: '/grammar-galaxy/verb-rush',
      name: 'verb-rush',
      component: () => import('@/components/games/verbRushGame.vue'),
      meta: {
        title: 'Verb Rush',
        stage: 'rushZone',
        stageOrder: 1,
        difficulty: 'advanced',
        gameId: 'verbRush',
        icon: '⚡',
        description: '高速一般動詞判定ゲーム',
        learningObjective: '一般動詞の正しい使い方の習得',
        unlockRequirement: 'Rush Zone 解放'
      }
    },
    {
      path: '/grammar-galaxy/grammar-reflex-arena',
      name: 'grammar-reflex-arena',
      component: GrammarReflexArena,
      props: true,
      meta: {
        title: 'Grammar Reflex Arena',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'grammarReflexArena',
        icon: '⚡',
        description: '宇宙の反射神経で文法をマスター',
        learningObjective: '文法パターンの瞬間認識力習得',
        unlockRequirement: '文法ギャラクシー基礎編 30%完了'
      },
      beforeEnter: (to, from, next) => {
        // back イベントのハンドリング用にfromルート情報を保存
        to.meta.previousRoute = from
        next()
      }
    },
    {
      path: '/grammar-galaxy/grammar-puzzle-cascade',
      name: 'grammar-puzzle-cascade',
      component: () => import('@/components/games/grammar-galaxy/GrammarPuzzleCascadeGame.vue'),
      meta: {
        title: 'Grammar Puzzle Cascade',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'grammarPuzzleCascade',
        icon: '🧩',
        description: 'テトリス風の文法パズルゲーム',
        learningObjective: '文法要素の空間的配置理解',
        unlockRequirement: '文法ギャラクシー基礎編 40%完了'
      }
    },

    // === Grammar Galaxy Foundation Games ===
    {
      path: '/grammar-galaxy/verb-time-machine',
      name: 'verb-time-machine',
      component: () => import('@/components/grammar/games/VerbTimeMachine.vue'),
      meta: {
        title: 'Verb Time Machine - 動詞時空旅行',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'verbTimeMachine',
        icon: '🕐',
        description: '時代を旅して動詞の活用をマスターしよう！現在形・過去形・完了形を正確に選んでエネルギーを集めよう。',
        learningObjective: '動詞活用の理解と時制感覚の習得',
        unlockRequirement: 'Grammar Galaxy Foundation アクセス'
      }
    },
    {
      path: '/grammar-galaxy/galactic-question-navigator',
      name: 'galactic-question-navigator',
      component: () => import('@/components/grammar/games/GalacticQuestionNavigator.vue'),
      meta: {
        title: 'Galactic Question Navigator - 銀河疑問詞ナビゲーター',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'galacticQuestionNavigator',
        icon: '🚀',
        description: '宇宙船のAIナビゲーターとして、様々な惑星や宇宙ステーションからの通信に適切な疑問詞で応答する宇宙探索ゲーム！',
        learningObjective: '疑問詞の使い分けと瞬間認識能力の習得、宇宙テーマによる没入感向上',
        unlockRequirement: 'Grammar Galaxy Foundation アクセス'
      }
    },

    // === New Grammar Galaxy Games ===
    {
      path: '/grammar-galaxy/comparison-master',
      name: 'comparison-master',
      component: () => import('@/components/games/grammar-galaxy/ComparisonMasterGame.vue'),
      meta: {
        title: 'Comparison Master - 比較表現バトル',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'comparisonMaster',
        icon: '📊',
        description: '比較級・最上級・同等比較をマスターするバトルゲーム',
        learningObjective: '比較表現の完全習得',
        unlockRequirement: '文法ギャラクシー基礎編 40%完了'
      }
    },
    {
      path: '/grammar-galaxy/modal-verb-challenge',
      name: 'modal-verb-challenge',
      component: () => import('@/components/games/grammar-galaxy/ModalVerbChallengeGame.vue'),
      meta: {
        title: 'Modal Verb Challenge - 助動詞バトルアリーナ',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'modalVerbChallenge',
        icon: '🛡️',
        description: 'can/may/must/should を使いこなす助動詞バトル',
        learningObjective: '助動詞の正しい使い分け習得',
        unlockRequirement: '文法ギャラクシー基礎編 50%完了'
      }
    },
    {
      path: '/grammar-galaxy/conjunction-connection',
      name: 'conjunction-connection',
      component: () => import('@/components/games/grammar-galaxy/ConjunctionConnectionGame.vue'),
      meta: {
        title: 'Conjunction Connection - 接続表現パズル',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'conjunctionConnection',
        icon: '🔗',
        description: '文と文を正しい接続表現でつなげるパズルゲーム',
        learningObjective: '接続表現の習得とネットワーク構築',
        unlockRequirement: '文法ギャラクシー基礎編 60%完了'
      }
    },
    {
      path: '/grammar-galaxy/progressive-tense',
      name: 'progressive-tense',
      component: () => import('@/components/games/grammar-galaxy/ProgressiveTenseGame.vue'),
      meta: {
        title: 'Progressive Tense Flow - 進行形タイムライン',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'progressiveTense',
        icon: '🌊',
        description: '時間の流れをコントロールして進行形をマスター',
        learningObjective: '進行形の時間軸理解と習得',
        unlockRequirement: '文法ギャラクシー基礎編 70%完了'
      }
    },
    {
      path: '/grammar-galaxy/space-word-order-quest',
      name: 'space-word-order-quest',
      component: () => import('@/components/games/grammar-galaxy/SpaceWordOrderQuest.vue'),
      meta: {
        title: 'Space Word Order Quest - 宇宙語順クエスト',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'spaceWordOrderQuest',
        icon: '🌌',
        description: '宇宙を舞台にした英文並び替えゲーム。正しい語順で惑星を救おう！',
        learningObjective: '英語の語順感覚習得と文構造理解',
        unlockRequirement: '文法ギャラクシー基礎編 30%完了'
      }
    },

    // === Grammar Art Gallery ===
    {
      path: '/grammar-art-gallery',
      name: 'grammar-art-gallery',
      component: () => import('@/views/GrammarArtGalleryView.vue'),
      meta: {
        title: 'Grammar Art Gallery - Cosmic Edition',
        stage: 'grammarFoundation',
        stageOrder: 3,
        difficulty: 'advanced',
        gameId: 'grammarArtGallery',
        icon: '🏛️',
        description: '宇宙の文法アーティファクトを読み解き、言語の奥義を解き放て！',
        learningObjective: '高度な読解力と文法理解の統合',
        unlockRequirement: '文法ギャラクシー基礎編 50%完了',
        requiresMigrationCheck: false
      }
    },

    // === Phrase Galaxy - 英熟語学習ゲーム ===
    {
      path: '/games/phrase-galaxy',
      name: 'phrase-galaxy',
      component: () => import('@/components/games/PhraseGalaxy/PhraseGalaxyGame.vue'),
      meta: {
        title: 'Phrase Galaxy - 英熟語銀河',
        stage: 'multiLayerLearning',
        stageOrder: 5,
        difficulty: 'intermediate',
        gameId: 'phraseGalaxy',
        icon: '🌌',
        description: '流れる星と英熟語をマッチング！宇宙テーマの熟語学習',
        learningObjective: '英検5級〜2級レベルの英熟語習得',
        unlockRequirement: '常時アンロック（多層学習ゾーン）'
      }
    },

    // === Verb Pattern Galaxy ===
    {
      path: '/grammar-galaxy/verb-pattern-galaxy',
      name: 'verb-pattern-galaxy-hub',
      component: () => import('@/components/games/verb-pattern-galaxy/VerbPatternGalaxyHub.vue'),
      meta: {
        title: 'Verb Pattern Galaxy - 動詞パターン銀河',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'verbPatternGalaxy',
        icon: '🌌',
        description: '動詞パターン（verb + ing / to）を宇宙の冒険で習得しよう！',
        learningObjective: '動詞+ing/to パターンの完全習得',
        unlockRequirement: '文法ギャラクシー基礎編 30%完了',
        requiresMigrationCheck: false
      }
    },
    {
      path: '/grammar-galaxy/verb-pattern-galaxy/collector',
      name: 'verb-collector-game',
      component: () => import('@/components/games/verb-pattern-galaxy/VerbCollectorGame.vue'),
      meta: {
        title: 'Verb Collector - 動詞コレクター',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'verbCollector',
        icon: '🌟',
        description: '動詞を正しいパターンに分類して収集しよう',
        learningObjective: '動詞パターンの基礎識別',
        unlockRequirement: 'Verb Pattern Galaxy アクセス',
        requiresMigrationCheck: false
      }
    },
    {
      path: '/grammar-galaxy/verb-pattern-galaxy/pattern-builder',
      name: 'pattern-builder-game',
      component: () => import('@/components/games/verb-pattern-galaxy/PatternBuilderGame.vue'),
      meta: {
        title: 'Pattern Builder - パターン構築',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'patternBuilder',
        icon: '🛠️',
        description: '正しい動詞パターンで文を構築しよう',
        learningObjective: '動詞パターンの実践的構築',
        unlockRequirement: 'Verb Collector 70%完了',
        requiresMigrationCheck: false
      }
    },
    // Temporarily disabled due to syntax errors
    /*
    {
      path: '/grammar-galaxy/verb-pattern-galaxy/meaning-duel',
      name: 'meaning-duel-game',
      component: () => import('@/components/games/verb-pattern-galaxy/MeaningDuelGame.vue'),
      meta: {
        title: 'Meaning Duel - 意味決闘',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'advanced',
        gameId: 'meaningDuel',
        icon: '⚔️',
        description: '動詞パターンの微妙な意味の違いをマスターしよう',
        learningObjective: '動詞パターンの意味的差異の習得',
        unlockRequirement: 'Pattern Builder 70%完了',
        requiresMigrationCheck: false
      }
    },
    */
    {
      path: '/grammar-galaxy/verb-pattern-galaxy/collection',
      name: 'verb-card-collection',
      component: () => import('@/components/games/verb-pattern-galaxy/VerbCardCollection.vue'),
      meta: {
        title: 'Verb Card Collection - 動詞カードコレクション',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'review',
        gameId: 'verbCardCollection',
        icon: '📚',
        description: '収集した動詞カードを確認して復習しよう',
        learningObjective: '習得した動詞パターンの確認と復習',
        unlockRequirement: 'Verb Pattern Galaxy アクセス',
        requiresMigrationCheck: false
      }
    },

    // === NEW: サウンド・アドベンチャー・ゾーン ===
    // 新しい体験型音素学習ゲーム群
    {
      path: '/games/space-sound-adventure',
      name: 'space-sound-adventure',
      component: () => import('@/components/games/SpaceSoundAdventure.vue'),
      meta: {
        title: 'スペース・サウンド・アドベンチャー',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'intermediate',
        gameId: 'spaceSoundAdventure',
        icon: '🌌',
        description: '音素エネルギーを収集して宇宙船をアップグレード！',
        learningObjective: '冒険ゲーミフィケーションで音素習得',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/sound-battle-arena',
      name: 'sound-battle-arena',
      component: () => import('@/components/games/SoundBattleArena.vue'),
      meta: {
        title: 'サウンド・バトル・アリーナ',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'advanced',
        gameId: 'soundBattleArena',
        icon: '⚔️',
        description: '音素の力で相手を倒せ！連続バトルで音韻マスター',
        learningObjective: 'バトル要素で集中的音素練習',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/rhythm-phonics-dance',
      name: 'rhythm-phonics-dance',
      component: () => import('@/components/games/RhythmPhonicsDance.vue'),
      meta: {
        title: 'リズム・フォニックス・ダンス',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'intermediate',
        gameId: 'rhythmPhonicsDance',
        icon: '🎵',
        description: '音楽のリズムに合わせて正確な音素を選択',
        learningObjective: '音楽要素で音韻感覚向上',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/phonics-puzzle-quest',
      name: 'phonics-puzzle-quest',
      component: () => import('@/components/games/PhonicsPuzzleQuest.vue'),
      meta: {
        title: 'フォニックス・パズル・クエスト',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'advanced',
        gameId: 'phonicsPuzzleQuest',
        icon: '🧩',
        description: '音素パズルを解いて古代の音韻の秘宝を発見',
        learningObjective: 'パズル要素で論理的音素理解',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/sound-farm',
      name: 'sound-farm',
      component: () => import('@/components/games/SoundFarm.vue'),
      meta: {
        title: 'サウンド・ファーム',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'beginner',
        gameId: 'soundFarm',
        icon: '🌱',
        description: '音素の種を育てて語彙の収穫を楽しもう',
        learningObjective: '育成要素で継続的学習促進',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },

    // === Grammar Galaxy Hub ===
    {
      path: '/grammar-galaxy-hub',
      name: 'grammar-galaxy-hub',
      component: () => import('@/views/GrammarGalaxyHub.vue'),
      meta: {
        title: 'Grammar Galaxy Hub - グラマー・ギャラクシー司令部',
        requiresAuth: false,
        stage: 'grammarGalaxy',
        gameId: 'grammarGalaxyHub',
        requiresMigrationCheck: true
      }
    },

    // === Grammar Galaxy Foundation ===
    {
      path: '/grammar-galaxy-foundation',
      name: 'GrammarGalaxyFoundation',
      component: () => import('@/views/GrammarGalaxyFoundation.vue'),
      meta: {
        title: 'Grammar Galaxy Foundation',
        requiresAuth: false,
        stage: 'grammarGalaxy',
        stageOrder: 5,
        difficulty: 'intermediate',
        gameId: 'grammarGalaxyFoundation',
        icon: '🌌',
        description: '文法の基礎を宇宙の冒険で学ぶ',
        learningObjective: '基本的な文法要素の理解と応用',
        unlockRequirement: 'Word Building Island 60%完了'
      }
    },

    // === Unified Learning Center - 削除済み（生徒ダッシュボードに統合） ===
    {
      path: '/unified-learning-hub',
      redirect: '/dashboard/student'
    },

    // === Multi-Layer Learning Engine ===
    {
      path: '/multi-layer',
      name: 'MultiLayerHub',
      component: () => import('@/components/multi-layer/MultiLayerHub.vue'),
      meta: {
        title: 'Multi-Layer Learning Galaxy - 学習ゾーン選択',
        requiresAuth: false,
        stage: 'multiLayerLearning',
        stageOrder: 6,
        difficulty: 'adaptive',
        gameId: 'multiLayerHub',
        icon: '🌌',
        description: 'AI適応型学習エンジンで最適な学習ゾーンを選択',
        learningObjective: '個別最適化された効率的学習',
        unlockRequirement: '基礎学習50%完了'
      }
    },

    // Rush Zone
    {
      path: '/multi-layer/rush-zone',
      name: 'RushZone',
      component: () => import('@/components/multi-layer/RushZoneGame.vue'),
      meta: {
        title: 'Rush Zone - 高速反復練習',
        requiresAuth: false,
        stage: 'multiLayerLearning',
        difficulty: 'high-speed',
        icon: '⚡',
        description: '高速反復練習でスピードと正確性を向上',
        learningObjective: '瞬発力と正確性の同時向上'
      }
    },

    // Construction Zone
    {
      path: '/multi-layer/construction-zone',
      name: 'ConstructionZone',
      component: () => import('@/components/multi-layer/ConstructionZoneGame.vue'),
      meta: {
        title: 'Construction Zone - 協力構築学習',
        requiresAuth: false,
        stage: 'multiLayerLearning',
        difficulty: 'collaborative',
        icon: '🏗️',
        description: 'じっくり理解を構築する丁寧な学習',
        learningObjective: '段階的理解構築と協力学習'
      }
    },

    // Battle Zone
    {
      path: '/multi-layer/battle-zone',
      name: 'BattleZone',
      component: () => import('@/components/multi-layer/BattleZoneGame.vue'),
      meta: {
        title: 'Battle Zone - リアルタイム対戦',
        requiresAuth: false,
        stage: 'multiLayerLearning',
        difficulty: 'competitive',
        icon: '⚔️',
        description: '競争によるモチベーション向上と実戦練習',
        learningObjective: '競争環境での実践的スキル向上'
      }
    },

    // === Co-Learning Platform ===
    {
      path: '/co-pilot-dock',
      name: 'CoPilotDock',
      component: () => import('@/views/CoPilotDock.vue'),
      meta: {
        title: 'Co-Pilot Training Dock - 協力学習司令部',
        requiresAuth: false,
        stage: 'cooperativeLearning',
        stageOrder: 7,
        difficulty: 'collaborative',
        gameId: 'coPilotDock',
        icon: '👥',
        description: '講師と協力してリアルタイム学習ミッションを実行',
        learningObjective: '協力学習による効率的な言語習得',
        unlockRequirement: '基礎学習完了または講師の推奨'
      }
    },

    // Cooperative Games
    {
      path: '/cooperative/grammar-spacecraft',
      name: 'GrammarSpacecraft',
      component: () => import('@/components/cooperative/GrammarSpacecraft.vue'),
      meta: {
        title: '宇宙船協力修理ゲーム',
        requiresAuth: false,
        stage: 'cooperativeLearning',
        icon: '🚀',
        description: '講師と協力して宇宙船の文法エンジンを修理',
        learningObjective: '協力による文法パーツ学習'
      }
    },

    {
      path: '/cooperative/sound-radar',
      name: 'SoundRadarGame',
      component: () => import('@/components/cooperative/SoundRadarGame.vue'),
      meta: {
        title: '音響レーダー協力ゲーム',
        requiresAuth: false,
        stage: 'cooperativeLearning',
        icon: '📡',
        description: '講師と協力して音響レーダーで音素を探知',
        learningObjective: '協力による音素認識学習'
      }
    },

    // === VR Academy Integration ===
    {
      path: '/vr-academy',
      name: 'VRAcademy',
      component: () => import('@/views/VRAcademyHub.vue'),
      meta: {
        title: 'VR Academy - Spatial.io Integration',
        requiresAuth: false,
        stage: 'vrLearning',
        icon: '🥽',
        description: 'VR空間での没入型英語学習体験',
        learningObjective: '3D空間での実践的コミュニケーション'
      }
    },

    // === VR Readiness System Routes ===
    {
      path: '/vr-readiness-report',
      name: 'vr-readiness-report',
      component: () => import('@/views/VRReadinessReport.vue'),
      meta: {
        title: 'VR学習準備度レポート',
        requiresAuth: false,
        description: 'VRアカデミーへの準備状況を詳しく分析'
      }
    },

    {
      path: '/story/:chapterId',
      name: 'story-chapter',
      component: () => import('@/views/StoryChapterView.vue'),
      props: true,
      meta: {
        title: 'Story Chapter',
        requiresAuth: false,
        description: 'ストーリーチャプターの表示'
      }
    },
    {
      path: '/story/:chapterId/:sceneId',
      name: 'story-scene',
      component: () => import('@/views/StorySceneView.vue'),
      props: true,
      meta: {
        title: 'Story Scene',
        requiresAuth: false,
        description: 'ストーリーシーンの表示'
      }
    },

    // === VR Scenario Routes ===
    {
      path: '/vr-scenario/:scenarioId/preview',
      name: 'vr-scenario-preview',
      component: () => import('@/components/vr/VRScenarioPreview.vue'),
      props: true,
      meta: {
        title: 'VR Scenario Preview',
        requiresAuth: false,
        description: 'VRシナリオの2Dプレビュー'
      }
    },
    {
      path: '/vr-scenario/:scenarioId/experience',
      name: 'vr-scenario-experience',
      component: () => import('@/views/VRScenarioExperience.vue'),
      props: true,
      meta: {
        title: 'VR Experience',
        requiresAuth: false,
        description: 'VRシナリオの実体験'
      },
      beforeEnter: async (to, from, next) => {
        // VR準備度チェック
        const { usePlayerProfileStore } = await import('@/stores/playerProfile')
        const playerStore = usePlayerProfileStore()
        
        if (playerStore.overallVRReadiness < 40) {
          alert('VR準備度が不足しています。基礎学習を進めてからVR体験をお試しください。')
          next({ name: 'home' })
          return
        }
        next()
      }
    },

    // === WebXR Experience Routes ===
    {
      path: '/webxr/:scenarioId',
      name: 'webxr-experience',
      component: () => import('@/views/WebXRExperience.vue'),
      props: true,
      meta: {
        title: 'WebXR Experience',
        requiresAuth: false,
        description: 'WebXR対応VR学習体験'
      },
      beforeEnter: async (to, from, next) => {
        // WebXR対応チェック
        if (!navigator.xr) {
          alert('このブラウザはWebXRに対応していません。対応ブラウザでアクセスしてください。')
          next({ name: 'vr-scenario-preview', params: { scenarioId: to.params.scenarioId } })
          return
        }
        
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr')
          if (!supported) {
            alert('VRデバイスが検出されませんでした。2Dプレビューモードに切り替えます。')
            next({ name: 'vr-scenario-preview', params: { scenarioId: to.params.scenarioId } })
            return
          }
        } catch (error) {
          logger.error('WebXR compatibility check failed:', error)
          next({ name: 'vr-scenario-preview', params: { scenarioId: to.params.scenarioId } })
          return
        }
        
        next()
      }
    },

    // === Spatial.io Integration Routes ===
    {
      path: '/spatial/:spaceId',  
      name: 'spatial-experience',
      component: () => import('@/views/SpatialExperience.vue'),
      props: true,
      meta: {
        title: 'Spatial.io Experience',
        requiresAuth: false,
        description: 'Spatial.ioでのマルチプレイヤーVR体験'
      }
    },
    
    // PhoneticsPlanet VR Game
    {
      path: '/vr-academy/phonetics-planet',
      name: 'PhoneticsPlanetVR',
      component: () => import('@/views/PhoneticsPlanetVR.vue'),
      meta: {
        title: 'Phonetics Planet VR - Three.js WebXR Game',
        requiresAuth: false,
        requiresTickets: 1
      }
    },

    // ECHO AI Practice System
    {
      path: '/vr-academy/echo-practice',
      name: 'echo-practice',
      component: () => import('@/components/ai-practice/ECHOPracticeBuddy.vue'),
      meta: {
        title: 'ECHO AI Practice - VR Academy',
        requiresAuth: false,
        stage: 'vrLearning',
        icon: '🤖',
        description: 'AI練習相手とVRシナリオで安全に会話練習',
        learningObjective: '失敗を恐れない実践的会話能力の獲得'
      }
    },

    // === Teacher Dashboard ===
    {
      path: '/teacher',
      name: 'TeacherDashboard',
      component: () => import('@/views/teacher/TeacherDashboard.vue'),
      meta: {
        title: 'MovWISE 講師ダッシュボード',
        requiresAuth: true,
        role: 'teacher',
        description: 'リアルタイム協力学習管理センター',
        layout: 'teacher'
      }
    },

    {
      path: '/teacher/dashboard',
      redirect: '/teacher'
    },

    // Simple teacher dashboard for testing
    {
      path: '/teacher-simple',
      name: 'teacher-simple',
      component: () => import('@/views/teacher/SimpleTeacherDashboard.vue'),
      meta: {
        title: 'MovWISE 講師ダッシュボード - シンプル版',
        requiresAuth: false,
        role: 'teacher',
        description: 'シンプル版講師ダッシュボード',
        layout: 'teacher'
      }
    },

    // Alternative teacher dashboard path - Fixed version
    {
      path: '/teacher-dashboard',
      name: 'teacher-dashboard',
      component: () => import('@/views/teacher/FixedTeacherDashboard.vue'),
      meta: {
        title: 'MovWISE 講師ダッシュボード',
        requiresAuth: false, // 開発用に一時的に認証不要に設定
        role: 'teacher',
        description: 'AI統合型学習管理システム',
        layout: 'teacher'
      }
    },

    // Parent Portal Routes - Fixed version
    {
      path: '/parent/dashboard',
      name: 'parent-dashboard',
      component: () => import('@/views/parent/SimpleParentDashboard.vue'),
      meta: {
        title: 'MovWISE 親ポータル',
        requiresAuth: false, // 開発用に一時的に認証不要に設定
        role: 'parent',
        description: 'お子様の学習状況を確認',
        layout: 'parent'
      }
    },
    {
      path: '/parent',
      redirect: '/parent/dashboard'
    },

    // Student session route
    {
      path: '/student-session',
      name: 'student-session',
      component: () => import('@/views/student/StudentSession.vue'),
      meta: {
        title: '生徒セッション - 協力学習',
        requiresAuth: false,
        description: '講師との協力学習セッション'
      }
    },

    // Join session with invite code
    {
      path: '/join-session/:inviteCode',
      name: 'join-session',
      component: () => import('@/views/student/StudentSession.vue'),
      meta: {
        title: 'セッション参加 - 協力学習',
        requiresAuth: false,
        description: '招待コードでセッションに参加'
      },
      props: true
    },

    // === Speed Station Planet ===
    {
      path: '/speed-station',
      name: 'speed-station-hub',
      component: () => import('@/views/planets/SpeedStationHub.vue'),
      meta: {
        title: 'Speed Station - ハイスピード・タイピング宇宙ステーション',
        requiresAuth: false,
        stage: 'typingTraining',
        stageOrder: 5,
        difficulty: 'intermediate',
        gameId: 'speedStation',
        icon: '⌨️',
        description: '光速タイピングで銀河を駆け抜ける宇宙ステーション',
        learningObjective: 'タイピングスキルと英語学習の統合',
        unlockRequirement: 'Word Building Planet 60%完了'
      }
    },
    {
      path: '/typing-arena-enhanced',
      name: 'typing-arena-enhanced',
      component: () => import('@/components/games/TypingArenaEnhanced.vue'),
      meta: {
        title: 'Typing Arena Enhanced - 銀河タイピングアリーナ',
        requiresAuth: false,
        stage: 'typingTraining',
        stageOrder: 5,
        difficulty: 'intermediate',
        gameId: 'typingArenaEnhanced',
        icon: '⚔️',
        description: 'ストーリーモード搭載の本格タイピングバトル',
        learningObjective: 'ストーリーとキャラクター成長によるタイピング習得',
        unlockRequirement: 'Speed Station経由でアクセス'
      }
    },

    // === Cooperation Colony Planet ===
    {
      path: '/cooperation-colony',
      name: 'cooperation-hub',
      component: () => import('@/views/planets/CooperationHub.vue'),
      meta: {
        title: 'Cooperation Colony - 協力型学習コロニー',
        requiresAuth: false,
        stage: 'cooperativeLearning',
        stageOrder: 6,
        difficulty: 'collaborative',
        gameId: 'cooperationColony',
        icon: '🤝',
        description: '仲間と協力して銀河最大の言語チャレンジに挑戦',
        learningObjective: '協力学習による効率的な言語習得とコミュニケーション',
        unlockRequirement: 'Speed Station 40%完了'
      }
    },
    {
      path: '/grammar-spacecraft',
      name: 'grammar-spacecraft',
      component: () => import('@/components/cooperative/GrammarSpacecraft.vue'),
      meta: {
        title: 'Grammar Spacecraft - 文法宇宙船協力修理',
        requiresAuth: false,
        stage: 'cooperativeLearning',
        icon: '🚀',
        description: 'パートナーと協力して宇宙船の文法エンジンを修理',
        learningObjective: '協力による文法パーツ学習とチームワーク'
      }
    },
    {
      path: '/sound-radar-game',
      name: 'sound-radar-game',
      component: () => import('@/components/cooperative/SoundRadarGame.vue'),
      meta: {
        title: 'Sound Radar Game - 音響レーダー協力探知',
        requiresAuth: false,
        stage: 'cooperativeLearning',
        icon: '📡',
        description: 'パートナーと協力して音響レーダーで音素を探知',
        learningObjective: '協力による音素認識学習と連携'
      }
    },

    // 観戦モード
    {
      path: '/spectator-mode',
      name: 'spectator-mode',
      component: () => import('@/views/SpectatorModeView.vue'),
      meta: {
        title: '観戦モード - MovWISE Game',
        requiresAuth: false
      }
    },

    // 404対応
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ]
})

// ステージ順序とアンロック条件の定義
const STAGE_ORDER = {
  'soundFoundation': 1,
  'phonicsTraining': 1.5,
  'soundRules': 2,
  'blendingMastery': 3,
  'wordBuilding': 4,
  'dictationSpelling': 4.5,
  'rhythmProsody': 5,
  'advancedPhonics': 6
}

const STAGE_UNLOCK_REQUIREMENTS = {
  'soundFoundation': { requirement: null, threshold: 0 }, // 常時アンロック
  'phonicsTraining': { requirement: 'soundFoundation', threshold: 50 },
  'soundRules': { requirement: 'soundFoundation', threshold: 70 },
  'blendingMastery': { requirement: 'soundRules', threshold: 60 },
  'wordBuilding': { requirement: 'blendingMastery', threshold: 70 },
  'dictationSpelling': { requirement: 'wordBuilding', threshold: 60 },
  'rhythmProsody': { requirement: 'wordBuilding', threshold: 70 },
  'advancedPhonics': { requirement: 'rhythmProsody', threshold: 80 }
}

// アンロック条件チェック関数（科学的学習順序対応）
function checkGameUnlock(gameId, stageName) {
  logger.log(`🔓 アンロック条件チェック: ${gameId} (Stage: ${stageName})`)

  // 開発中は全ゲームアンロック
  if (import.meta.env.DEV) {
    return true
  }

  // 本番環境での厳密なアンロック条件チェック
  const gameStore = useGameStore()
  const stageRequirement = STAGE_UNLOCK_REQUIREMENTS[stageName]

  if (!stageRequirement) {
    logger.warn(`⚠️ 未定義のステージ: ${stageName}`)
    return false
  }

  // ステージ自体のアンロック条件チェック
  if (stageRequirement.requirement) {
    const requiredStageProgress = gameStore.getStageProgress(stageRequirement.requirement)
    if (requiredStageProgress < stageRequirement.threshold) {
      logger.log(`🔒 ${stageName}ステージ未アンロック: ${stageRequirement.requirement}を${stageRequirement.threshold}%完了する必要があります`)
      return false
    }
  }

  // ゲーム個別のアンロック条件（将来拡張用）
  return true
}

// 学習進捗に基づく次のおすすめゲーム取得
function getRecommendedNextGame() {
  const gameStore = useGameStore()

  // Stage順序で進捗をチェック
  for (const [stageName, order] of Object.entries(STAGE_ORDER)) {
    const stageProgress = gameStore.getStageProgress(stageName)

    if (stageProgress < 80) { // 80%未満のステージがあれば、そこを推奨
      return {
        stage: stageName,
        progress: stageProgress,
        message: `${stageName}ステージを続けることをお勧めします`
      }
    }
  }

  return {
    stage: 'advancedPhonics',
    progress: 100,
    message: '全ステージクリア！上級チャレンジに挑戦しましょう'
  }
}

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  logger.log(`🚀 Router: ${from.path} → ${to.path}`)

  // タイトル設定
  const title = to.meta?.title
    ? `${to.meta.title} - MovWISE`
    : 'MovWISE - 身体で覚える英語学習'
  document.title = title

  // ゲームアクセス制御
  if (to.meta?.stage && to.meta?.gameId) {
    const isUnlocked = checkGameUnlock(to.meta.gameId, to.meta.stage)

    if (!isUnlocked) {
      const unlockReq = to.meta.unlockRequirement || '前のステージを完了'
      alert(`🔒 このゲームはまだアンロックされていません！\n\n必要条件: ${unlockReq}`)
      next({ name: 'PhonicsAdventure' })
      return
    }

    // 学習段階の妥当性チェック
    const currentStageOrder = STAGE_ORDER[to.meta.stage]
    const gameStore = useGameStore()

    // あまりにも高いレベルのゲームに直接アクセスしようとした場合の警告
    if (currentStageOrder > 3) {
      const foundationProgress = gameStore.getStageProgress('soundFoundation')
      if (foundationProgress < 50) {
        const confirmed = confirm(
          `⚠️ 基礎学習が不十分です\n\n` +
          `サウンド・ファウンデーション島: ${foundationProgress}%\n\n` +
          `基礎をしっかり固めてからの方が効果的です。\n` +
          `それでも続けますか？`
        )

        if (!confirmed) {
          next({ name: 'PhonicsAdventure' })
          return
        }
      }
    }
  }

  // ゲームページの場合、ステージ情報をコンソールに出力
  if (to.meta?.stage) {
    logger.log(`🎮 ゲーム開始: ${to.meta.title} (Stage ${to.meta.stageOrder}: ${to.meta.stage})`)
    logger.log(`📚 学習目標: ${to.meta.learningObjective}`)
  }

  next()
})

// ルート後の処理
router.afterEach((to, from) => {
  logger.log(`✅ Router: 遷移完了 ${to.path}`)

  // ゲーム統計の更新
  if (to.meta?.gameId) {
    logger.log(`📊 ゲーム統計更新: ${to.meta.gameId}`)

    // 学習分析用ログ
    if (to.meta.stage && to.meta.stageOrder) {
      logger.log(`📈 学習進捗: Stage ${to.meta.stageOrder} - ${to.meta.stage}`)

      // 推奨学習パスとの比較
      const recommended = getRecommendedNextGame()
      if (recommended.stage !== to.meta.stage) {
        logger.info(`💡 推奨: ${recommended.message}`)
      }
    }
  }

  // 学習継続のためのエンゲージメント
  if (to.name === 'PhonicsAdventure') {
    setTimeout(() => {
      const recommended = getRecommendedNextGame()
      if (recommended.progress < 100) {
        logger.log(`🎯 次におすすめ: ${recommended.message}`)
      }
    }, 2000)
  }
})



// エラーハンドリング
router.onError((error) => {
  logger.error('❌ Router error:', error)

  // エラーの詳細情報を表示
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    alert(
      '🚧 ゲームの読み込み中にエラーが発生しました。\n\n' +
      'このゲームは開発中の可能性があります。\n' +
      'ページをリロードするか、他のゲームをお試しください。'
    )
  } else {
    alert('⚠️ ページの読み込み中にエラーが発生しました。\nホーム画面に戻ります。')
    router.push('/')
  }
})

// 開発環境でのデバッグ情報とルート検証
if (import.meta.env.DEV) {
  logger.log('🏗️ MovWISE Router initialized with Scientific Learning Order')
  logger.log('📍 Available routes by stage:')

  // ステージ別ルート表示
  const routesByStage = {}
  router.getRoutes().forEach(route => {
    if (route.meta?.stage) {
      if (!routesByStage[route.meta.stage]) {
        routesByStage[route.meta.stage] = []
      }
      routesByStage[route.meta.stage].push({
        path: route.path,
        name: route.name,
        title: route.meta.title,
        order: route.meta.stageOrder
      })
    }
  })

  // ステージ順序でソートして表示
  Object.entries(routesByStage)
    .sort(([, a], [, b]) => (a[0]?.order || 0) - (b[0]?.order || 0))
    .forEach(([stageName, routes]) => {
      logger.log(`  Stage ${routes[0]?.order}: ${stageName}`)
      routes.forEach(route => {
        logger.log(`    - ${route.path} (${route.title})`)
      })
    })

  // 学習順序の検証
  logger.log('🧪 Learning Order Validation:')
  logger.log('  ✅ Stage 1: Pure Sound Recognition (Foundation)')
  logger.log('  ✅ Stage 2: Sound Rules (Magic E, Silent Letters)')
  logger.log('  ✅ Stage 3: Blending Mastery (CVC, Word Families)')
  logger.log('  ✅ Stage 4: Word Building (Sight Words moved here!)')
  logger.log('  ✅ Stage 5: Rhythm & Prosody')
  logger.log('  ✅ Stage 6: Advanced Phonics')
}

// 存在しないゲームの処理を修正
const startGame = (gameId) => {
  logger.log(`🎮 ゲーム開始: ${gameId}`)
  // 実装済みゲームのマッピング
  const gameRoutes = {
    'pureSoundLab': 'pure-sound-lab',
    'soundToSymbolMatch': 'sound-to-symbol',
    'phonemePatternLab': 'phoneme-pattern-lab',
    'cvPronunciationTrainer': 'cv-pronunciation-trainer',
    'floatingLetterHunt': 'true-sound-impact',
    'magicESpaceJump': 'magic-e-galaxy-builder', // Redirect to new game
    'magicEGalaxyBuilder': 'magic-e-galaxy-builder',
    'cvcWordFactory': 'cvc-word-factory',
    'sightWordMaster': 'sight-word-master',
    'wordRushArena': 'word-rush',
    'rhymingRush': 'rhyming-rush',
    'grammarColorCode': 'grammar-color-code',
    'patternHunter': 'pattern-hunter',
    'beVerbRush': 'be-verb-rush',
    'comparisonMaster': 'comparison-master',
    'modalVerbChallenge': 'modal-verb-challenge',
    'conjunctionConnection': 'conjunction-connection',
    'progressiveTense': 'progressive-tense',
    'spaceWordOrderQuest': 'space-word-order-quest',
    'dictationSpellingHub': 'dictation-spelling-hub',
    'wordDictationChallenge': 'word-dictation-challenge',
    'typingArena': 'typing-arena',
    // Grammar Galaxy Foundation Games
    'verbTimeMachine': 'verb-time-machine',
    'galacticQuestionNavigator': 'galactic-question-navigator',
  }

  const routeName = gameRoutes[gameId]
  if (!routeName) {
    logger.error(`❌ 未実装のゲーム: ${gameId}`)
    return false
  }

  router.push({ name: routeName })
  return true
}

// マイグレーションチェック用のナビゲーションガード
router.beforeEach(async (to, from, next) => {
  try {
    // マイグレーション画面は常にアクセス可能
    if (to.name === 'migration') {
      next()
      return
    }

    // ユーザータイプチェック（統合HomeView使用のため、ダッシュボード系のみ）
    if (to.meta?.requiresUserType) {
      const { useUserStore } = await import('@/stores/userStore')
      const userStore = useUserStore()

      // ストアからユーザータイプを読み込み
      userStore.loadUserType()

      // ユーザータイプが未選択の場合、統合ホーム画面にリダイレクト
      if (!userStore.hasSelectedUserType) {
        logger.log('🎯 User type not selected, redirecting to home screen')
        next({ name: 'home' })
        return
      }

      // 必要なユーザータイプと現在のユーザータイプが一致しない場合
      if (userStore.userType !== to.meta.requiresUserType) {
        logger.warn(`❌ Access denied: required ${to.meta.requiresUserType}, but user is ${userStore.userType}`)
        alert(`このページは${to.meta.requiresUserType === 'student' ? '生徒' : to.meta.requiresUserType === 'teacher' ? '講師' : '保護者'}専用です。`)
        next({ name: 'home' })
        return
      }
    }

    // マイグレーションチェックが必要なルートの場合
    if (to.meta?.requiresMigrationCheck !== false) {
      // 開発環境では移行画面をスキップ
      if (import.meta.env.DEV) {
        logger.log('🚀 Development mode: Skipping migration check')
        next()
        return
      }

      const migrationCompleted = DataMigrationSystem.isMigrationCompleted()

      if (!migrationCompleted) {
        // マイグレーションが未完了の場合、マイグレーション画面にリダイレクト
        logger.log('🔄 Migration required, redirecting to migration screen')
        next({ name: 'migration' })
        return
      }
    }

    // タイトルの設定
    if (to.meta?.title) {
      document.title = to.meta.title
    }

    next()
  } catch (error) {
    logger.error('Router guard error:', error)
    // エラーが発生した場合は統合ホーム画面へ
    if (to.name !== 'home' && to.name !== 'migration') {
      next({ name: 'home' })
    } else {
      next()
    }
  }
})

// Set up Word Galaxy route guards
setupWordGalaxyGuards(router)

export default router