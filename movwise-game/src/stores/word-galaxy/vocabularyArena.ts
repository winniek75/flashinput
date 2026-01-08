/**
 * Vocabulary Arena Store
 * リアルタイム語彙対戦システムの状態管理
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  BattleSession,
  BattleQuestion,
  BattleAnswer,
  BattleMode,
  BattleRecord,
  Word
} from '@/types/word-galaxy/word.types';

interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  currentElo: number;
  highestElo: number;
  totalBattles: number;
  averageAccuracy: number;
  averageResponseTime: number;
  winStreak: number;
  longestWinStreak: number;
}

interface PlayerProfile {
  id: string;
  name: string;
  elo: number;
  rank: string;
  wins: number;
  losses: number;
  avatar?: string;
}

interface QueueEntry {
  playerId: string;
  mode: BattleMode;
  elo: number;
  joinTime: number;
}

export const useVocabularyArenaStore = defineStore('vocabularyArena', () => {
  // State
  const playerStats = ref<PlayerStats>({
    wins: 0,
    losses: 0,
    draws: 0,
    currentElo: 1200,
    highestElo: 1200,
    totalBattles: 0,
    averageAccuracy: 0,
    averageResponseTime: 0,
    winStreak: 0,
    longestWinStreak: 0
  });

  const currentBattle = ref<BattleSession | null>(null);
  const recentBattles = ref<BattleRecord[]>([]);
  const topPlayers = ref<PlayerProfile[]>([]);
  const queue = ref<QueueEntry[]>([]);
  const initialized = ref(false);
  const loading = ref(false);

  // Question pools by difficulty
  const questionPools = ref<{
    easy: BattleQuestion[];
    medium: BattleQuestion[];
    hard: BattleQuestion[];
  }>({
    easy: [],
    medium: [],
    hard: []
  });

  // ELO calculation constants
  const K_FACTOR = 32; // ELO K-factor
  const RANK_THRESHOLDS = {
    'Bronze': 0,
    'Silver': 1000,
    'Gold': 1400,
    'Platinum': 1800,
    'Diamond': 2200,
    'Master': 2600,
    'Grandmaster': 3000
  };

  // Computed
  const playerRank = computed(() => {
    const elo = playerStats.value.currentElo;

    for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS).reverse()) {
      if (elo >= threshold) {
        return rank;
      }
    }
    return 'Bronze';
  });

  const winRate = computed(() => {
    const total = playerStats.value.totalBattles;
    if (total === 0) return 0;
    return Math.round((playerStats.value.wins / total) * 100);
  });

  const isInQueue = computed(() => {
    return queue.value.some(entry => entry.playerId === getCurrentPlayerId());
  });

  // Actions
  async function initialize(playerId: string) {
    if (initialized.value) return;

    try {
      loading.value = true;

      // プレイヤー統計の読み込み
      await loadPlayerStats(playerId);

      // 問題プールの初期化
      await initializeQuestionPools();

      // リーダーボードの初期化
      await generateMockLeaderboard();

      initialized.value = true;
      console.log('⚔️ Vocabulary Arena initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Vocabulary Arena:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadPlayerStats(playerId: string) {
    // LocalStorageから統計を読み込み
    const saved = localStorage.getItem(`arena_stats_${playerId}`);
    if (saved) {
      playerStats.value = { ...playerStats.value, ...JSON.parse(saved) };
    }

    // Recent battlesの読み込み
    const battlesData = localStorage.getItem(`arena_battles_${playerId}`);
    if (battlesData) {
      recentBattles.value = JSON.parse(battlesData);
    }
  }

  async function savePlayerStats(playerId: string) {
    localStorage.setItem(`arena_stats_${playerId}`, JSON.stringify(playerStats.value));
    localStorage.setItem(`arena_battles_${playerId}`, JSON.stringify(recentBattles.value));
  }

  async function joinQueue(mode: BattleMode, playerId: string) {
    if (isInQueue.value) {
      throw new Error('Already in queue');
    }

    const queueEntry: QueueEntry = {
      playerId,
      mode,
      elo: playerStats.value.currentElo,
      joinTime: Date.now()
    };

    queue.value.push(queueEntry);

    // マッチメイキング試行
    await attemptMatchmaking();
  }

  async function leaveQueue(playerId: string) {
    queue.value = queue.value.filter(entry => entry.playerId !== playerId);
  }

  async function attemptMatchmaking() {
    // 同じモードのプレイヤーを探す
    const quickQueue = queue.value.filter(entry => entry.mode === 'quick');
    const rankedQueue = queue.value.filter(entry => entry.mode === 'ranked');

    // Quick battleのマッチメイキング
    if (quickQueue.length >= 2) {
      const [player1, player2] = quickQueue.slice(0, 2);
      await createMatchFromQueue(player1, player2, 'quick');
    }

    // Ranked battleのマッチメイキング（ELO差を考慮）
    if (rankedQueue.length >= 2) {
      for (let i = 0; i < rankedQueue.length - 1; i++) {
        for (let j = i + 1; j < rankedQueue.length; j++) {
          const player1 = rankedQueue[i];
          const player2 = rankedQueue[j];
          const eloDiff = Math.abs(player1.elo - player2.elo);

          // ELO差が200以内、または待ち時間が30秒以上
          const waitTime = Date.now() - Math.min(player1.joinTime, player2.joinTime);
          if (eloDiff <= 200 || waitTime > 30000) {
            await createMatchFromQueue(player1, player2, 'ranked');
            return;
          }
        }
      }
    }
  }

  async function createMatchFromQueue(player1: QueueEntry, player2: QueueEntry, mode: BattleMode) {
    // キューから削除
    queue.value = queue.value.filter(entry =>
      entry.playerId !== player1.playerId && entry.playerId !== player2.playerId
    );

    // バトルセッション作成
    const mockOpponent = {
      id: player2.playerId,
      name: 'Galaxy Warrior',
      elo: player2.elo,
      rank: calculateRank(player2.elo)
    };

    await createBattle(player1.playerId, mockOpponent, mode);
  }

  async function createBattle(playerId: string, opponent: PlayerProfile, mode: BattleMode) {
    try {
      // 問題を生成
      const questions = await generateBattleQuestions(mode, playerStats.value.currentElo);

      // バトルセッション作成
      const battle: BattleSession = {
        id: `battle_${Date.now()}`,
        playerId,
        opponent,
        mode,
        questions,
        answers: [],
        responseTimes: [],
        startTime: Date.now(),
        endTime: null,
        playerScore: 0,
        opponentScore: 0,
        winner: null,
        status: 'active'
      };

      currentBattle.value = battle;
      console.log('⚔️ Battle created:', battle.id);
    } catch (error) {
      console.error('❌ Failed to create battle:', error);
      throw error;
    }
  }

  async function generateBattleQuestions(mode: BattleMode, playerElo: number): Promise<BattleQuestion[]> {
    const questionCount = mode === 'quick' ? 10 : 15;
    const questions: BattleQuestion[] = [];

    // プレイヤーのELOに基づいて難易度分布を決定
    let easyCount, mediumCount, hardCount;

    if (playerElo < 1200) {
      easyCount = Math.floor(questionCount * 0.6);
      mediumCount = Math.floor(questionCount * 0.3);
      hardCount = questionCount - easyCount - mediumCount;
    } else if (playerElo < 1800) {
      easyCount = Math.floor(questionCount * 0.3);
      mediumCount = Math.floor(questionCount * 0.5);
      hardCount = questionCount - easyCount - mediumCount;
    } else {
      easyCount = Math.floor(questionCount * 0.2);
      mediumCount = Math.floor(questionCount * 0.4);
      hardCount = questionCount - easyCount - mediumCount;
    }

    // 各難易度から問題を選択
    questions.push(...selectRandomQuestions(questionPools.value.easy, easyCount, 'easy'));
    questions.push(...selectRandomQuestions(questionPools.value.medium, mediumCount, 'medium'));
    questions.push(...selectRandomQuestions(questionPools.value.hard, hardCount, 'hard'));

    // ランダムに並べ替え
    return shuffleArray(questions);
  }

  function selectRandomQuestions(pool: BattleQuestion[], count: number, difficulty: string): BattleQuestion[] {
    const shuffled = shuffleArray([...pool]);
    return shuffled.slice(0, count).map((q, index) => ({
      ...q,
      id: `${difficulty}_${index}_${Date.now()}`,
      difficulty
    }));
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async function submitAnswer(playerId: string, answer: BattleAnswer) {
    if (!currentBattle.value || currentBattle.value.status !== 'active') return;

    // 回答を記録
    currentBattle.value.answers.push(answer.isCorrect);
    currentBattle.value.responseTimes.push(answer.responseTime);

    // スコア更新
    if (answer.isCorrect) {
      const timeBonus = Math.max(0, 15000 - answer.responseTime) / 150; // Time bonus
      const basePoints = 100;
      const points = Math.floor(basePoints + timeBonus);
      currentBattle.value.playerScore += points;
    }
  }

  async function endBattle(result: { winner: string; playerScore: number; opponentScore: number; eloChange?: number }) {
    if (!currentBattle.value) return;

    const battle = currentBattle.value;
    battle.endTime = Date.now();
    battle.playerScore = result.playerScore;
    battle.opponentScore = result.opponentScore;
    battle.winner = result.winner;
    battle.status = 'completed';

    // 統計更新
    const isWin = result.winner === battle.playerId;
    const isDraw = result.playerScore === result.opponentScore;

    playerStats.value.totalBattles++;

    if (isWin) {
      playerStats.value.wins++;
      playerStats.value.winStreak++;
      playerStats.value.longestWinStreak = Math.max(
        playerStats.value.longestWinStreak,
        playerStats.value.winStreak
      );
    } else if (isDraw) {
      playerStats.value.draws++;
      playerStats.value.winStreak = 0;
    } else {
      playerStats.value.losses++;
      playerStats.value.winStreak = 0;
    }

    // ELO更新
    if (battle.mode === 'ranked' && result.eloChange) {
      const newElo = playerStats.value.currentElo + result.eloChange;
      playerStats.value.currentElo = Math.max(0, newElo);
      playerStats.value.highestElo = Math.max(playerStats.value.highestElo, playerStats.value.currentElo);
    }

    // 精度と応答時間の更新
    const accuracy = (battle.answers.filter(a => a).length / battle.answers.length) * 100;
    const avgResponseTime = battle.responseTimes.reduce((sum, time) => sum + time, 0) / battle.responseTimes.length;

    playerStats.value.averageAccuracy =
      (playerStats.value.averageAccuracy * (playerStats.value.totalBattles - 1) + accuracy) / playerStats.value.totalBattles;

    playerStats.value.averageResponseTime =
      (playerStats.value.averageResponseTime * (playerStats.value.totalBattles - 1) + avgResponseTime) / playerStats.value.totalBattles;

    // 履歴に追加
    const battleRecord: BattleRecord = {
      id: battle.id,
      opponentName: battle.opponent.name,
      mode: battle.mode,
      result: isWin ? 'win' : (isDraw ? 'draw' : 'loss'),
      playerScore: result.playerScore,
      opponentScore: result.opponentScore,
      duration: Math.floor((battle.endTime! - battle.startTime) / 1000),
      eloChange: result.eloChange || 0,
      date: new Date().toISOString()
    };

    recentBattles.value.unshift(battleRecord);
    recentBattles.value = recentBattles.value.slice(0, 20); // 最新20件まで保持

    // 保存
    await savePlayerStats(battle.playerId);

    // バトル終了
    currentBattle.value = null;
  }

  function calculateEloChange(playerElo: number, opponentElo: number, result: 'win' | 'loss' | 'draw'): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

    let actualScore;
    switch (result) {
      case 'win': actualScore = 1; break;
      case 'loss': actualScore = 0; break;
      case 'draw': actualScore = 0.5; break;
    }

    return Math.round(K_FACTOR * (actualScore - expectedScore));
  }

  function calculateRank(elo: number): string {
    for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS).reverse()) {
      if (elo >= threshold) {
        return rank;
      }
    }
    return 'Bronze';
  }

  async function initializeQuestionPools() {
    // デモ用の問題プールを生成
    questionPools.value.easy = generateMockQuestions('easy', 50);
    questionPools.value.medium = generateMockQuestions('medium', 40);
    questionPools.value.hard = generateMockQuestions('hard', 30);
  }

  function generateMockQuestions(difficulty: string, count: number): BattleQuestion[] {
    const questions: BattleQuestion[] = [];
    const types = ['meaning', 'pronunciation', 'usage', 'synonym', 'antonym'];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];

      questions.push({
        id: `${difficulty}_${type}_${i}`,
        type,
        difficulty,
        question: `What does "${getRandomWord(difficulty)}" mean?`,
        choices: generateChoices(difficulty),
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This is a ${difficulty} level word commonly used in English.`,
        timeLimit: 15,
        points: difficulty === 'easy' ? 100 : difficulty === 'medium' ? 150 : 200
      });
    }

    return questions;
  }

  function getRandomWord(difficulty: string): string {
    const words = {
      easy: ['cat', 'dog', 'house', 'car', 'book'],
      medium: ['adventure', 'beautiful', 'challenge', 'discover', 'environment'],
      hard: ['serendipity', 'ephemeral', 'ubiquitous', 'paradigm', 'acquiesce']
    };

    const wordList = words[difficulty as keyof typeof words] || words.easy;
    return wordList[Math.floor(Math.random() * wordList.length)];
  }

  function generateChoices(difficulty: string): string[] {
    const choices = {
      easy: [
        'A small animal', 'A large building', 'A type of food', 'A color'
      ],
      medium: [
        'An exciting experience', 'A difficult situation', 'A peaceful place', 'A creative process'
      ],
      hard: [
        'A pleasant surprise', 'A temporary moment', 'A widespread phenomenon', 'A fundamental change'
      ]
    };

    return choices[difficulty as keyof typeof choices] || choices.easy;
  }

  async function generateMockLeaderboard() {
    const mockPlayers: PlayerProfile[] = [
      { id: 'player1', name: 'WordMaster', elo: 2800, rank: 'Grandmaster', wins: 250, losses: 30 },
      { id: 'player2', name: 'VocabKing', elo: 2600, rank: 'Master', wins: 200, losses: 45 },
      { id: 'player3', name: 'LexiconLord', elo: 2400, rank: 'Diamond', wins: 180, losses: 60 },
      { id: 'player4', name: 'WordWarrior', elo: 2200, rank: 'Diamond', wins: 150, losses: 70 },
      { id: 'player5', name: 'VocabViking', elo: 2000, rank: 'Platinum', wins: 120, losses: 80 }
    ];

    topPlayers.value = mockPlayers;
  }

  async function loadRecentBattles(playerId: string) {
    // すでにloadPlayerStatsで読み込み済み
  }

  async function loadLeaderboard() {
    // すでにgenerateMockLeaderboardで初期化済み
  }

  function getCurrentPlayerId(): string {
    // 現在のプレイヤーIDを取得（実装に応じて調整）
    return 'current-player';
  }

  // Public API
  return {
    // State
    playerStats,
    currentBattle,
    recentBattles,
    topPlayers,
    initialized,
    loading,

    // Computed
    playerRank,
    winRate,
    isInQueue,

    // Actions
    initialize,
    loadPlayerStats,
    joinQueue,
    leaveQueue,
    createBattle,
    submitAnswer,
    endBattle,
    loadRecentBattles,
    loadLeaderboard
  };
});