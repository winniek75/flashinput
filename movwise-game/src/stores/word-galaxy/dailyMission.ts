/**
 * Daily Mission Store
 * 毎日のミッション管理、ストリーク追跡、報酬システム
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  DailyMission,
  MissionType,
  PlayerStats,
  WeeklyMilestone,
  Achievement,
  RewardBundle
} from '@/types/word-galaxy/word.types';

export const useDailyMissionStore = defineStore('dailyMission', () => {
  // State
  const playerStats = ref<PlayerStats>({
    currentStreak: 0,
    longestStreak: 0,
    crystals: 0,
    totalXP: 0,
    level: 1,
    lastLoginDate: null,
    totalMissionsCompleted: 0,
    weeklyMissionsCompleted: 0
  });

  const todaysMissions = ref<DailyMission[]>([]);
  const weeklyMilestones = ref<WeeklyMilestone[]>([]);
  const achievements = ref<Achievement[]>([]);
  const missionHistory = ref<DailyMission[]>([]);
  const initialized = ref(false);

  // Mission Templates
  const missionTemplates: Partial<DailyMission>[] = [
    {
      id: 'daily_vocabulary_review',
      name: '単語復習ミッション',
      description: 'Memory Stationで10個の単語を復習しよう',
      type: 'vocabulary_review',
      target: 10,
      icon: '📚',
      rewards: { crystals: 50, xp: 100 },
      difficulty: 'easy'
    },
    {
      id: 'new_words_challenge',
      name: '新単語チャレンジ',
      description: '5個の新しい単語を学習しよう',
      type: 'new_words',
      target: 5,
      icon: '✨',
      rewards: { crystals: 80, xp: 150 },
      difficulty: 'medium'
    },
    {
      id: 'streak_maintenance',
      name: 'ストリーク維持',
      description: '今日も学習を続けてストリークを維持しよう',
      type: 'streak_maintenance',
      target: 1,
      icon: '🔥',
      rewards: { crystals: 30, xp: 50 },
      difficulty: 'easy'
    },
    {
      id: 'perfect_score_challenge',
      name: 'パーフェクトスコア',
      description: '復習セッションで100%の正解率を達成しよう',
      type: 'perfect_score',
      target: 1,
      icon: '🎯',
      rewards: { crystals: 100, xp: 200 },
      difficulty: 'hard'
    },
    {
      id: 'speed_learning',
      name: 'スピード学習',
      description: '15分以内に20個の単語を復習しよう',
      type: 'speed_challenge',
      target: 20,
      icon: '⚡',
      rewards: { crystals: 120, xp: 250 },
      difficulty: 'hard'
    },
    {
      id: 'vocabulary_battle',
      name: '語彙バトル勝利',
      description: 'Vocabulary Arenaで1回勝利しよう',
      type: 'vocabulary_battle',
      target: 1,
      icon: '⚔️',
      rewards: { crystals: 100, xp: 200 },
      difficulty: 'medium'
    }
  ];

  // Computed
  const currentLevel = computed(() => {
    const xp = playerStats.value.totalXP;
    return Math.floor(xp / 1000) + 1;
  });

  const xpToNextLevel = computed(() => {
    const currentLevelXP = (currentLevel.value - 1) * 1000;
    const nextLevelXP = currentLevel.value * 1000;
    return nextLevelXP - playerStats.value.totalXP;
  });

  const todaysProgress = computed(() => {
    const completed = todaysMissions.value.filter(m => m.completed).length;
    const total = todaysMissions.value.length;
    return total > 0 ? (completed / total) * 100 : 0;
  });

  // Actions
  async function initialize() {
    if (initialized.value) return;

    try {
      await loadPlayerStats();
      await loadMissionHistory();
      await checkDailyReset();
      await generateWeeklyMilestones();

      initialized.value = true;
      console.log('📅 Daily Mission Store initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Daily Mission Store:', error);
      throw error;
    }
  }

  async function loadPlayerStats() {
    // Load from localStorage for now, later integrate with database
    const saved = localStorage.getItem('wordGalaxy_playerStats');
    if (saved) {
      playerStats.value = { ...playerStats.value, ...JSON.parse(saved) };
    }

    // Check and update streak
    await updateStreak();
  }

  async function savePlayerStats() {
    localStorage.setItem('wordGalaxy_playerStats', JSON.stringify(playerStats.value));
  }

  async function updateStreak() {
    const today = new Date().toDateString();
    const lastLogin = playerStats.value.lastLoginDate;

    if (!lastLogin) {
      // First time login
      playerStats.value.currentStreak = 1;
      playerStats.value.lastLoginDate = today;
    } else {
      const lastLoginDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, no change needed
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        playerStats.value.currentStreak += 1;
        playerStats.value.lastLoginDate = today;
      } else {
        // Streak broken, reset to 1
        playerStats.value.currentStreak = 1;
        playerStats.value.lastLoginDate = today;
      }

      // Update longest streak record
      if (playerStats.value.currentStreak > playerStats.value.longestStreak) {
        playerStats.value.longestStreak = playerStats.value.currentStreak;
      }
    }

    await savePlayerStats();
  }

  async function generateDailyMissions() {
    const today = new Date().toDateString();
    const existingMissions = localStorage.getItem(`wordGalaxy_missions_${today}`);

    if (existingMissions) {
      todaysMissions.value = JSON.parse(existingMissions);
      return;
    }

    // Generate new missions for today
    const newMissions: DailyMission[] = [];
    const selectedTemplates = selectMissionTemplates();

    selectedTemplates.forEach((template, index) => {
      const mission: DailyMission = {
        id: `${today}_${template.id}_${index}`,
        name: template.name!,
        description: template.description!,
        type: template.type!,
        target: template.target!,
        progress: 0,
        completed: false,
        locked: index > 0 && newMissions[index - 1] && !newMissions[index - 1].completed,
        icon: template.icon!,
        rewards: template.rewards!,
        difficulty: template.difficulty!,
        createdAt: Date.now(),
        unlockCondition: index === 0 ? '' : `Complete "${newMissions[index - 1]?.name}"`
      };

      newMissions.push(mission);
    });

    todaysMissions.value = newMissions;
    await saveDailyMissions();
  }

  function selectMissionTemplates(): Partial<DailyMission>[] {
    const streak = playerStats.value.currentStreak;
    const level = currentLevel.value;

    // Basic missions (always included)
    const selected = [
      missionTemplates[0], // vocabulary_review
      missionTemplates[2]  // streak_maintenance
    ];

    // Add difficulty-based missions
    if (level >= 3 || streak >= 3) {
      selected.push(missionTemplates[1]); // new_words_challenge
    }

    if (level >= 5 || streak >= 7) {
      selected.push(missionTemplates[3]); // perfect_score_challenge
    }

    if (level >= 10 || streak >= 14) {
      selected.push(missionTemplates[4]); // speed_learning
    }

    if (level >= 7 || streak >= 10) {
      selected.push(missionTemplates[5]); // vocabulary_battle
    }

    return selected.slice(0, 4); // Max 4 missions per day
  }

  async function startMission(missionId: string) {
    const mission = todaysMissions.value.find(m => m.id === missionId);
    if (!mission || mission.locked || mission.completed) {
      throw new Error('Mission not available');
    }

    mission.startedAt = Date.now();
    await saveDailyMissions();
  }

  async function updateMissionProgress(missionType: MissionType, increment: number = 1) {
    const mission = todaysMissions.value.find(m => m.type === missionType && !m.completed);

    if (mission) {
      mission.progress = Math.min(mission.progress + increment, mission.target);

      if (mission.progress >= mission.target) {
        await completeMission(mission.id);
      } else {
        await saveDailyMissions();
      }
    }
  }

  async function completeMission(missionId: string) {
    const mission = todaysMissions.value.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    mission.completed = true;
    mission.completedAt = Date.now();

    // Award rewards
    playerStats.value.crystals += mission.rewards.crystals;
    playerStats.value.totalXP += mission.rewards.xp;
    playerStats.value.totalMissionsCompleted += 1;

    // Update level
    playerStats.value.level = currentLevel.value;

    // Unlock next mission
    const currentIndex = todaysMissions.value.findIndex(m => m.id === missionId);
    if (currentIndex < todaysMissions.value.length - 1) {
      todaysMissions.value[currentIndex + 1].locked = false;
    }

    await saveDailyMissions();
    await savePlayerStats();

    // Check for achievements
    await checkAchievements();

    console.log(`✅ Mission completed: ${mission.name}`);
  }

  async function checkAchievements(): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    // Streak achievements
    if (playerStats.value.currentStreak === 7 && !hasAchievement('streak_7')) {
      newAchievements.push(createAchievement(
        'streak_7',
        '🔥 週間学習者',
        '7日連続で学習を継続！',
        'streak',
        { crystals: 200, xp: 500 }
      ));
    }

    if (playerStats.value.currentStreak === 30 && !hasAchievement('streak_30')) {
      newAchievements.push(createAchievement(
        'streak_30',
        '🔥 月間マスター',
        '30日連続で学習を継続！',
        'streak',
        { crystals: 1000, xp: 2000 }
      ));
    }

    // Mission achievements
    if (playerStats.value.totalMissionsCompleted === 10 && !hasAchievement('missions_10')) {
      newAchievements.push(createAchievement(
        'missions_10',
        '📋 ミッション初心者',
        '10個のミッションを完了！',
        'mission',
        { crystals: 100, xp: 200 }
      ));
    }

    // Level achievements
    if (currentLevel.value === 5 && !hasAchievement('level_5')) {
      newAchievements.push(createAchievement(
        'level_5',
        '⭐ 中級学習者',
        'レベル5に到達！',
        'level',
        { crystals: 300, xp: 600 }
      ));
    }

    // Award achievement rewards
    for (const achievement of newAchievements) {
      playerStats.value.crystals += achievement.rewards.crystals;
      playerStats.value.totalXP += achievement.rewards.xp;
      achievements.value.push(achievement);
    }

    if (newAchievements.length > 0) {
      await savePlayerStats();
      await saveAchievements();
    }

    return newAchievements;
  }

  function createAchievement(
    id: string,
    title: string,
    description: string,
    category: string,
    rewards: RewardBundle
  ): Achievement {
    return {
      id,
      title,
      description,
      category,
      icon: getAchievementIcon(category),
      rewards,
      unlockedAt: Date.now(),
      type: 'achievement'
    };
  }

  function getAchievementIcon(category: string): string {
    const icons: Record<string, string> = {
      streak: '🔥',
      mission: '📋',
      level: '⭐',
      perfect: '🎯',
      speed: '⚡'
    };
    return icons[category] || '🏆';
  }

  function hasAchievement(achievementId: string): boolean {
    return achievements.value.some(a => a.id === achievementId);
  }

  async function generateWeeklyMilestones() {
    const milestones: WeeklyMilestone[] = [
      {
        id: 'week_milestone_1',
        label: '10 Missions',
        icon: '📋',
        target: 10,
        current: playerStats.value.weeklyMissionsCompleted >= 10,
        completed: playerStats.value.weeklyMissionsCompleted >= 10,
        reward: 100
      },
      {
        id: 'week_milestone_2',
        label: '20 Missions',
        icon: '🎯',
        target: 20,
        current: playerStats.value.weeklyMissionsCompleted >= 20,
        completed: playerStats.value.weeklyMissionsCompleted >= 20,
        reward: 250
      },
      {
        id: 'week_milestone_3',
        label: '35 Missions',
        icon: '👑',
        target: 35,
        current: playerStats.value.weeklyMissionsCompleted >= 35,
        completed: playerStats.value.weeklyMissionsCompleted >= 35,
        reward: 500
      }
    ];

    weeklyMilestones.value = milestones;
  }

  function getWeekEndTime(): number {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek.getTime();
  }

  async function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('wordGalaxy_lastReset');

    if (lastReset !== today) {
      // Reset daily progress
      await generateDailyMissions();
      localStorage.setItem('wordGalaxy_lastReset', today);
    } else {
      // Load existing missions
      const saved = localStorage.getItem(`wordGalaxy_missions_${today}`);
      if (saved) {
        todaysMissions.value = JSON.parse(saved);
      }
    }
  }

  async function saveDailyMissions() {
    const today = new Date().toDateString();
    localStorage.setItem(`wordGalaxy_missions_${today}`, JSON.stringify(todaysMissions.value));
  }

  async function loadMissionHistory() {
    const saved = localStorage.getItem('wordGalaxy_missionHistory');
    if (saved) {
      missionHistory.value = JSON.parse(saved);
    }
  }

  async function saveAchievements() {
    localStorage.setItem('wordGalaxy_achievements', JSON.stringify(achievements.value));
  }

  // Public API
  return {
    // State
    playerStats,
    todaysMissions,
    weeklyMilestones,
    achievements,
    initialized,

    // Computed
    currentLevel,
    xpToNextLevel,
    todaysProgress,

    // Actions
    initialize,
    generateDailyMissions,
    startMission,
    updateMissionProgress,
    completeMission,
    checkAchievements,
    getWeekEndTime
  };
});