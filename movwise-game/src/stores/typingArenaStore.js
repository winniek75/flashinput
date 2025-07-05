import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTypingArenaStore = defineStore('typingArena', () => {
  // ===== 練習モードデータ =====
  const practiceStats = ref({
    totalSessions: 0,
    totalTime: 0,
    bestWPM: 0,
    averageAccuracy: 0,
    levelProgress: {
      eiken5: { completed: 0, total: 20, bestScore: 0 },
      eiken4: { completed: 0, total: 20, bestScore: 0 },
      eiken3: { completed: 0, total: 20, bestScore: 0 },
      eikenPre2: { completed: 0, total: 20, bestScore: 0 },
      eiken2: { completed: 0, total: 20, bestScore: 0 }
    }
  })

  // ===== ストーリーモードデータ =====
  const storyMode = ref({
    unlocked: true,
    currentChapter: 1,
    currentStage: 1,
    completedStages: [],
    chapters: {
      1: {
        id: 'earthCrisis',
        name: '地球の危機',
        description: '謎の「言葉食いモンスター」が地球の英語を消去',
        stages: 10,
        bossId: 'wordEater',
        unlocked: true,
        completed: false
      },
      2: {
        id: 'moonMystery',
        name: '月面基地の謎',
        description: '月面基地の通信システムが文法エラーで故障',
        stages: 12,
        bossId: 'grammarDragon',
        unlocked: false,
        completed: false
      },
      3: {
        id: 'marsColony',
        name: '火星植民地計画',
        description: '火星移住のための通信システム構築',
        stages: 15,
        bossId: 'sentenceKing',
        unlocked: false,
        completed: false
      },
      4: {
        id: 'timeDistortion',
        name: '時空の歪み修復',
        description: '時制エラーで時空に歪みが発生',
        stages: 18,
        bossId: 'tenseMaster',
        unlocked: false,
        completed: false
      },
      5: {
        id: 'galaxyPeace',
        name: '英語銀河の平和',
        description: 'すべての英語スキルが試される最終決戦',
        stages: 20,
        bossId: 'languageEmperor',
        unlocked: false,
        completed: false
      }
    },
    bosses: {
      wordEater: { defeated: false, bestTime: null, attempts: 0 },
      grammarDragon: { defeated: false, bestTime: null, attempts: 0 },
      sentenceKing: { defeated: false, bestTime: null, attempts: 0 },
      tenseMaster: { defeated: false, bestTime: null, attempts: 0 },
      languageEmperor: { defeated: false, bestTime: null, attempts: 0 }
    }
  })

  // ===== キャラクターデータ =====
  const character = ref({
    name: 'ギャラクシー・タイパー',
    title: 'タイピング・ルーキー',
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    totalExp: 0,
    stats: {
      speed: 10,      // WPMに影響
      accuracy: 10,   // 正確率ボーナス
      stamina: 10,    // 連続プレイ時間
      vocabulary: 10, // 新単語習得速度
      focus: 10,      // 集中力（ミス時の回復速度）
      leadership: 0   // マルチプレイ時のボーナス
    },
    skills: {
      active: {
        focusMode: {
          id: 'focusMode',
          name: '集中モード',
          unlocked: false,
          level: 0,
          maxLevel: 5,
          effect: '制限時間延長',
          cooldown: 300,
          currentCooldown: 0,
          description: '深い集中状態に入り、制限時間が延長される'
        },
        perfectHint: {
          id: 'perfectHint',
          name: '完璧ヒント',
          unlocked: false,
          level: 0,
          maxLevel: 3,
          effect: '正解表示',
          cooldown: 180,
          currentCooldown: 0,
          description: '次の単語の正解を一瞬表示する'
        },
        recoveryBoost: {
          id: 'recoveryBoost',
          name: '復活チャンス',
          unlocked: false,
          level: 0,
          maxLevel: 1,
          effect: 'ボス戦復活',
          cooldown: 600,
          currentCooldown: 0,
          description: 'ボス戦で一度だけ復活できる'
        }
      },
      passive: {
        speedBoost: {
          id: 'speedBoost',
          name: 'スピードブースト',
          unlocked: false,
          level: 0,
          maxLevel: 10,
          effect: 'WPM増加',
          value: 0,
          description: '基本タイピング速度が上昇'
        },
        errorRecovery: {
          id: 'errorRecovery',
          name: 'エラー耐性',
          unlocked: false,
          level: 0,
          maxLevel: 5,
          effect: 'ミスペナルティ軽減',
          value: 0,
          description: 'ミスした時のペナルティが軽減される'
        },
        expBonus: {
          id: 'expBonus',
          name: '経験値ブースト',
          unlocked: false,
          level: 0,
          maxLevel: 5,
          effect: '獲得経験値増加',
          value: 0,
          description: 'すべての活動で獲得する経験値が増加'
        }
      }
    },
    equipment: {
      keyboard: null,
      gloves: null,
      badge: null
    }
  })

  // ===== ペットデータ =====
  const pets = ref({
    current: 'alphabetBird',
    owned: ['alphabetBird'],
    petData: {
      alphabetBird: {
        id: 'alphabetBird',
        name: 'アルファベット・バード',
        type: 'サポート',
        level: 1,
        experience: 0,
        nextLevelExp: 50,
        affection: 0,
        maxAffection: 100,
        abilities: {
          hint: {
            name: '文字ヒント',
            unlocked: true,
            description: '次の文字を光らせる',
            cooldown: 30,
            currentCooldown: 0
          },
          encourage: {
            name: '応援',
            unlocked: true,
            passive: true,
            description: 'ミス時に励ましてストレス軽減',
            effect: 'ミスペナルティ -20%'
          },
          wordMemory: {
            name: '単語記憶',
            unlocked: false,
            unlockLevel: 3,
            description: '習得した単語を記録し復習を提案'
          }
        },
        evolution: {
          level5: { name: 'スマート・バード', evolved: false },
          level10: { name: 'ワイズ・イーグル', evolved: false }
        }
      }
    }
  })

  // ===== 実績システム =====
  const achievements = ref({
    story: [],
    practice: [],
    special: [],
    total: 0,
    points: 0
  })

  // ===== 統計データ =====
  const globalStats = ref({
    totalPlayTime: 0,
    totalWordsTyped: 0,
    totalCharactersTyped: 0,
    totalMistakes: 0,
    favoriteLevel: null,
    longestStreak: 0,
    perfectGames: 0
  })

  // ===== Computed Properties =====
  const currentChapterData = computed(() => {
    return storyMode.value.chapters[storyMode.value.currentChapter]
  })

  const characterTitle = computed(() => {
    const level = character.value.level
    if (level >= 50) return 'タイピング・レジェンド'
    if (level >= 40) return 'タイピング・マスター'
    if (level >= 30) return 'タイピング・エキスパート'
    if (level >= 20) return 'タイピング・コマンダー'
    if (level >= 10) return 'タイピング・エクスプローラー'
    return 'タイピング・ルーキー'
  })

  const overallProgress = computed(() => {
    let completed = 0
    let total = 0
    
    // ストーリーモード進捗
    Object.values(storyMode.value.chapters).forEach(chapter => {
      total += chapter.stages + 1 // ステージ数 + ボス
      if (chapter.completed) completed += chapter.stages + 1
    })
    
    // 練習モード進捗
    Object.values(practiceStats.value.levelProgress).forEach(level => {
      total += level.total
      completed += level.completed
    })
    
    return total > 0 ? Math.round((completed / total) * 100) : 0
  })

  // ===== Actions =====
  // ストーリー進行
  function progressStory(stageId, performance) {
    storyMode.value.completedStages.push({
      id: stageId,
      timestamp: Date.now(),
      performance
    })
    
    // 経験値獲得
    const expGained = calculateExperience(performance)
    gainExperience(expGained)
    
    // 次のステージ解禁チェック
    checkUnlocks()
  }

  // ボス撃破
  function defeatBoss(bossId, performance) {
    const boss = storyMode.value.bosses[bossId]
    boss.defeated = true
    boss.attempts++
    
    if (!boss.bestTime || performance.time < boss.bestTime) {
      boss.bestTime = performance.time
    }
    
    // 次の章解禁
    const nextChapter = storyMode.value.currentChapter + 1
    if (storyMode.value.chapters[nextChapter]) {
      storyMode.value.chapters[nextChapter].unlocked = true
      storyMode.value.currentChapter = nextChapter
    }
    
    // 特別報酬
    awardBossRewards(bossId)
  }

  // キャラクター経験値獲得
  function gainExperience(amount) {
    character.value.experience += amount
    character.value.totalExp += amount
    
    // レベルアップ判定
    while (character.value.experience >= character.value.nextLevelExp) {
      levelUp()
    }
  }

  // レベルアップ処理
  function levelUp() {
    character.value.level++
    character.value.experience -= character.value.nextLevelExp
    character.value.nextLevelExp = Math.floor(character.value.nextLevelExp * 1.2)
    
    // ステータス成長
    character.value.stats.speed += 2
    character.value.stats.accuracy += 1.5
    character.value.stats.stamina += 1.8
    character.value.stats.vocabulary += 2.2
    character.value.stats.focus += 1.7
    
    // スキルポイント獲得
    if (character.value.level % 5 === 0) {
      unlockNewSkill()
    }
  }

  // ペット育成
  function feedPet(petId, foodType) {
    const pet = pets.value.petData[petId]
    if (!pet) return
    
    const affectionGain = foodType === 'premium' ? 20 : 10
    pet.affection = Math.min(pet.affection + affectionGain, pet.maxAffection)
    
    // 親密度による能力解放
    if (pet.affection >= 50 && !pet.abilities.wordMemory.unlocked && pet.level >= 3) {
      pet.abilities.wordMemory.unlocked = true
    }
  }

  // ペット経験値
  function gainPetExperience(amount) {
    const currentPet = pets.value.petData[pets.value.current]
    if (!currentPet) return
    
    currentPet.experience += amount
    
    // レベルアップ判定
    while (currentPet.experience >= currentPet.nextLevelExp) {
      petLevelUp(currentPet)
    }
  }

  // ペットレベルアップ
  function petLevelUp(pet) {
    pet.level++
    pet.experience -= pet.nextLevelExp
    pet.nextLevelExp = Math.floor(pet.nextLevelExp * 1.3)
    
    // 進化チェック
    if (pet.level === 5 && !pet.evolution.level5.evolved) {
      pet.evolution.level5.evolved = true
      pet.name = pet.evolution.level5.name
    } else if (pet.level === 10 && !pet.evolution.level10.evolved) {
      pet.evolution.level10.evolved = true
      pet.name = pet.evolution.level10.name
    }
  }

  // 練習モード統計更新
  function updatePracticeStats(session) {
    practiceStats.value.totalSessions++
    practiceStats.value.totalTime += session.duration
    
    if (session.wpm > practiceStats.value.bestWPM) {
      practiceStats.value.bestWPM = session.wpm
    }
    
    // 平均正確率の更新
    const totalAccuracy = practiceStats.value.averageAccuracy * (practiceStats.value.totalSessions - 1)
    practiceStats.value.averageAccuracy = (totalAccuracy + session.accuracy) / practiceStats.value.totalSessions
    
    // レベル別進捗
    if (session.level && practiceStats.value.levelProgress[session.level]) {
      const levelData = practiceStats.value.levelProgress[session.level]
      levelData.completed = Math.min(levelData.completed + 1, levelData.total)
      
      if (session.score > levelData.bestScore) {
        levelData.bestScore = session.score
      }
    }
  }

  // ユーティリティ関数
  function calculateExperience(performance) {
    let exp = 50 // 基本経験値
    
    // WPMボーナス
    exp += Math.floor(performance.wpm * 0.5)
    
    // 正確率ボーナス
    if (performance.accuracy >= 95) exp += 50
    else if (performance.accuracy >= 90) exp += 30
    else if (performance.accuracy >= 85) exp += 20
    
    // 連続正解ボーナス
    exp += Math.floor(performance.maxStreak * 0.2)
    
    // 経験値ブーストスキル
    const expBoostSkill = character.value.skills.passive.expBonus
    if (expBoostSkill.unlocked) {
      exp *= (1 + expBoostSkill.level * 0.1)
    }
    
    return Math.floor(exp)
  }

  function checkUnlocks() {
    // 章の解禁チェック
    const currentChapter = storyMode.value.chapters[storyMode.value.currentChapter]
    const completedInChapter = storyMode.value.completedStages.filter(
      stage => stage.id.startsWith(`chapter${storyMode.value.currentChapter}`)
    ).length
    
    if (completedInChapter >= currentChapter.stages * 0.8) {
      // 80%以上クリアでボス解禁
      currentChapter.bossUnlocked = true
    }
  }

  function unlockNewSkill() {
    // レベルに応じてスキル解禁
    const level = character.value.level
    
    if (level === 5) {
      character.value.skills.active.focusMode.unlocked = true
    } else if (level === 10) {
      character.value.skills.passive.speedBoost.unlocked = true
    } else if (level === 15) {
      character.value.skills.active.perfectHint.unlocked = true
    } else if (level === 20) {
      character.value.skills.passive.errorRecovery.unlocked = true
    } else if (level === 25) {
      character.value.skills.active.recoveryBoost.unlocked = true
    } else if (level === 30) {
      character.value.skills.passive.expBonus.unlocked = true
    }
  }

  function awardBossRewards(bossId) {
    const rewards = {
      wordEater: {
        title: 'ワードハンター',
        pet: 'grammarCat',
        skillPoints: 3
      },
      grammarDragon: {
        title: 'グラマーマスター',
        pet: 'speedDog',
        skillPoints: 5
      },
      sentenceKing: {
        title: 'センテンスコマンダー',
        equipment: 'goldenKeyboard',
        skillPoints: 7
      },
      tenseMaster: {
        title: 'タイムキーパー',
        equipment: 'chronoGloves',
        skillPoints: 10
      },
      languageEmperor: {
        title: 'ランゲージレジェンド',
        pet: 'cosmicGuardian',
        equipment: 'legendaryBadge',
        skillPoints: 15
      }
    }
    
    const reward = rewards[bossId]
    if (!reward) return
    
    // 称号付与
    if (reward.title) {
      character.value.title = reward.title
    }
    
    // ペット獲得
    if (reward.pet && !pets.value.owned.includes(reward.pet)) {
      pets.value.owned.push(reward.pet)
    }
    
    // 装備獲得
    if (reward.equipment) {
      // 装備システムの実装時に追加
    }
  }

  // スキル使用
  function useActiveSkill(skillId) {
    const skill = character.value.skills.active[skillId]
    if (!skill || !skill.unlocked || skill.currentCooldown > 0) {
      return false
    }
    
    // スキル効果の適用
    skill.currentCooldown = skill.cooldown
    
    // クールダウンタイマー開始
    const cooldownInterval = setInterval(() => {
      skill.currentCooldown--
      if (skill.currentCooldown <= 0) {
        clearInterval(cooldownInterval)
      }
    }, 1000)
    
    return true
  }

  // セーブ/ロード機能
  function saveProgress() {
    const saveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      practiceStats: practiceStats.value,
      storyMode: storyMode.value,
      character: character.value,
      pets: pets.value,
      achievements: achievements.value,
      globalStats: globalStats.value
    }
    
    localStorage.setItem('typingArenaProgress', JSON.stringify(saveData))
  }

  function loadProgress() {
    const savedData = localStorage.getItem('typingArenaProgress')
    if (!savedData) return false
    
    try {
      const data = JSON.parse(savedData)
      
      // バージョンチェック
      if (data.version !== '1.0.0') {
        console.warn('Save data version mismatch')
        return false
      }
      
      // データ復元
      practiceStats.value = data.practiceStats || practiceStats.value
      storyMode.value = data.storyMode || storyMode.value
      character.value = data.character || character.value
      pets.value = data.pets || pets.value
      achievements.value = data.achievements || achievements.value
      globalStats.value = data.globalStats || globalStats.value
      
      return true
    } catch (error) {
      console.error('Failed to load save data:', error)
      return false
    }
  }

  // リセット機能
  function resetProgress(type = 'all') {
    if (type === 'all' || type === 'story') {
      storyMode.value.currentChapter = 1
      storyMode.value.currentStage = 1
      storyMode.value.completedStages = []
      Object.keys(storyMode.value.bosses).forEach(bossId => {
        storyMode.value.bosses[bossId] = { defeated: false, bestTime: null, attempts: 0 }
      })
    }
    
    if (type === 'all' || type === 'character') {
      character.value.level = 1
      character.value.experience = 0
      character.value.totalExp = 0
      // スキルリセット
      Object.values(character.value.skills.active).forEach(skill => {
        skill.unlocked = false
        skill.level = 0
      })
      Object.values(character.value.skills.passive).forEach(skill => {
        skill.unlocked = false
        skill.level = 0
      })
    }
    
    if (type === 'all') {
      localStorage.removeItem('typingArenaProgress')
    }
  }

  return {
    // State
    practiceStats,
    storyMode,
    character,
    pets,
    achievements,
    globalStats,
    
    // Computed
    currentChapterData,
    characterTitle,
    overallProgress,
    
    // Actions
    progressStory,
    defeatBoss,
    gainExperience,
    feedPet,
    gainPetExperience,
    updatePracticeStats,
    useActiveSkill,
    saveProgress,
    loadProgress,
    resetProgress
  }
})