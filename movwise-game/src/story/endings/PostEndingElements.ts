import { ref, computed } from 'vue'
import { endingSystem } from './EndingSystem'
import { characterEpilogues } from './CharacterEpilogues'
import { gameStoryBridge } from '../integration/GameStoryBridge'
import type { EndingData, EndingType } from './EndingSystem'

// Post-ending content types
export enum PostEndingFeature {
  NEW_GAME_PLUS = 'new_game_plus',
  HIDDEN_STORIES = 'hidden_stories',
  CHARACTER_REUNION = 'character_reunion',
  DEVELOPER_ROOM = 'developer_room',
  ART_GALLERY = 'art_gallery',
  MUSIC_PLAYER = 'music_player',
  ACHIEVEMENT_SHOWCASE = 'achievement_showcase',
  INFINITE_MODE = 'infinite_mode',
  VR_ACADEMY_PREVIEW = 'vr_academy_preview',
  SEQUEL_TEASER = 'sequel_teaser'
}

// New Game+ variants
export interface NewGamePlusMode {
  id: string
  name: string
  description: string
  unlockCondition: string
  features: NewGamePlusFeature[]
  difficultyModifier: number
  specialRewards: string[]
}

export interface NewGamePlusFeature {
  type: 'skill_retention' | 'character_memory' | 'bonus_content' | 'enhanced_difficulty'
  description: string
  value: number | boolean | string
}

// Hidden stories unlocked after endings
export interface HiddenStory {
  id: string
  title: string
  description: string
  unlockCondition: EndingType[]
  content: HiddenStoryScene[]
  replayable: boolean
  specialCharacters: string[]
}

export interface HiddenStoryScene {
  id: string
  title: string
  background: string
  duration: number
  dialogue: any[]
  secretInformation: string
  exclusiveArt?: string
}

// Character reunion events
export interface ReunionEvent {
  id: string
  title: string
  description: string
  participatingCharacters: string[]
  unlockCondition: {
    endingsRequired: EndingType[]
    relationshipThreshold: number
  }
  eventScenes: ReunionScene[]
  rewards: ReunionReward[]
}

export interface ReunionScene {
  id: string
  title: string
  setting: string
  duration: number
  dialogue: any[]
  specialInteractions: ReunionInteraction[]
}

export interface ReunionInteraction {
  type: 'memory_sharing' | 'gift_exchange' | 'collaborative_activity'
  description: string
  outcome: string
}

export interface ReunionReward {
  type: 'art' | 'voice_line' | 'memory_fragment' | 'special_mode'
  content: string
  rarity: 'common' | 'rare' | 'legendary'
}

/**
 * Post-Ending Elements System
 * Manages content available after completing the main story
 */
export class PostEndingElements {
  private unlockedFeatures = ref<Set<PostEndingFeature>>(new Set())
  private newGamePlusModes = ref<NewGamePlusMode[]>([])
  private hiddenStories = ref<HiddenStory[]>([])
  private reunionEvents = ref<ReunionEvent[]>([])
  private completionData = ref<any>(null)

  constructor() {
    this.initializePostEndingContent()
    this.loadPostEndingProgress()
  }

  /**
   * Initialize all post-ending content based on completed endings
   */
  public initializePostEndingFeatures(): void {
    const completedEndings = endingSystem.getUnlockedEndings()
    
    completedEndings.forEach(ending => {
      this.unlockFeaturesForEnding(ending)
    })

    this.checkSpecialUnlocks()
    this.savePostEndingProgress()
  }

  /**
   * Unlock features specific to an ending
   */
  private unlockFeaturesForEnding(ending: EndingData): void {
    // Base features for any ending
    this.unlockedFeatures.value.add(PostEndingFeature.NEW_GAME_PLUS)
    this.unlockedFeatures.value.add(PostEndingFeature.ART_GALLERY)
    this.unlockedFeatures.value.add(PostEndingFeature.MUSIC_PLAYER)

    // Ending-specific unlocks
    switch (ending.type) {
      case 'true_ending':
        this.unlockedFeatures.value.add(PostEndingFeature.DEVELOPER_ROOM)
        this.unlockedFeatures.value.add(PostEndingFeature.INFINITE_MODE)
        this.unlockedFeatures.value.add(PostEndingFeature.SEQUEL_TEASER)
        break

      case 'good_ending':
        this.unlockedFeatures.value.add(PostEndingFeature.CHARACTER_REUNION)
        this.unlockedFeatures.value.add(PostEndingFeature.HIDDEN_STORIES)
        break

      case 'special_ending':
        this.unlockedFeatures.value.add(PostEndingFeature.VR_ACADEMY_PREVIEW)
        this.unlockedFeatures.value.add(PostEndingFeature.SEQUEL_TEASER)
        this.unlockedFeatures.value.add(PostEndingFeature.DEVELOPER_ROOM)
        break

      case 'normal_ending':
        this.unlockedFeatures.value.add(PostEndingFeature.ACHIEVEMENT_SHOWCASE)
        break
    }
  }

  /**
   * Check for special unlocks based on multiple conditions
   */
  private checkSpecialUnlocks(): void {
    const completedEndings = endingSystem.getUnlockedEndings()
    const playerStats = endingSystem.currentPlayerStats

    // Unlock special content for completing multiple endings
    if (completedEndings.length >= 3) {
      this.unlockedFeatures.value.add(PostEndingFeature.HIDDEN_STORIES)
      this.unlockedFeatures.value.add(PostEndingFeature.CHARACTER_REUNION)
    }

    // Perfect completion unlock
    if (completedEndings.length >= 4 && playerStats?.overallMastery === 100) {
      this.unlockedFeatures.value.add(PostEndingFeature.DEVELOPER_ROOM)
      this.unlockedFeatures.value.add(PostEndingFeature.INFINITE_MODE)
    }
  }

  /**
   * Get New Game+ modes available to player
   */
  public getAvailableNewGamePlusModes(): NewGamePlusMode[] {
    return this.newGamePlusModes.value.filter(mode => {
      return this.checkUnlockCondition(mode.unlockCondition)
    })
  }

  /**
   * Get hidden stories unlocked by player
   */
  public getUnlockedHiddenStories(): HiddenStory[] {
    const completedEndings = endingSystem.getUnlockedEndings()
    const completedTypes = completedEndings.map(e => e.type)

    return this.hiddenStories.value.filter(story => {
      return story.unlockCondition.some(condition => 
        completedTypes.includes(condition)
      )
    })
  }

  /**
   * Get available reunion events
   */
  public getAvailableReunionEvents(): ReunionEvent[] {
    const completedEndings = endingSystem.getUnlockedEndings()
    const completedTypes = completedEndings.map(e => e.type)
    const playerStats = endingSystem.currentPlayerStats

    return this.reunionEvents.value.filter(event => {
      const endingsMatch = event.unlockCondition.endingsRequired.some(required =>
        completedTypes.includes(required)
      )
      
      let relationshipMatch = true
      if (playerStats) {
        const avgRelationship = Array.from(playerStats.characterRelationships.values())
          .reduce((sum, val) => sum + val, 0) / playerStats.characterRelationships.size
        relationshipMatch = avgRelationship >= event.unlockCondition.relationshipThreshold
      }

      return endingsMatch && relationshipMatch
    })
  }

  /**
   * Initialize post-ending content data
   */
  private initializePostEndingContent(): void {
    // Initialize New Game+ modes
    this.newGamePlusModes.value = [
      {
        id: 'standard_plus',
        name: 'Standard New Game+',
        description: '基本的な引き継ぎでもう一度冒険',
        unlockCondition: 'any_ending',
        features: [
          {
            type: 'skill_retention',
            description: '学習レベルを50%引き継ぎ',
            value: 0.5
          },
          {
            type: 'character_memory',
            description: 'キャラクターがプレイヤーを覚えている',
            value: true
          }
        ],
        difficultyModifier: 1.0,
        specialRewards: ['ng_plus_badge']
      },
      {
        id: 'friendship_plus',
        name: 'Friendship Mode+',
        description: 'キャラクターとの絆を重視したプレイ',
        unlockCondition: 'good_ending',
        features: [
          {
            type: 'character_memory',
            description: '全キャラクターとの関係性を引き継ぎ',
            value: true
          },
          {
            type: 'bonus_content',
            description: '特別な交流イベントが発生',
            value: 'friendship_events'
          }
        ],
        difficultyModifier: 0.8,
        specialRewards: ['eternal_friend_title', 'friendship_gallery']
      },
      {
        id: 'master_plus',
        name: 'Master Mode+',
        description: 'すべてを引き継いで最高難易度に挑戦',
        unlockCondition: 'true_ending',
        features: [
          {
            type: 'skill_retention',
            description: '全スキルを100%引き継ぎ',
            value: 1.0
          },
          {
            type: 'enhanced_difficulty',
            description: '新しいチャレンジと高難易度コンテンツ',
            value: true
          },
          {
            type: 'bonus_content',
            description: 'マスター限定シナリオ',
            value: 'master_scenarios'
          }
        ],
        difficultyModifier: 1.5,
        specialRewards: ['master_crown', 'developer_commentary', 'concept_art']
      },
      {
        id: 'infinite_plus',
        name: 'Infinite Galaxy Mode',
        description: '終わりのない学習の旅',
        unlockCondition: 'true_ending_perfect',
        features: [
          {
            type: 'skill_retention',
            description: '全データを引き継ぎ',
            value: 1.0
          },
          {
            type: 'bonus_content',
            description: 'プロシージャル生成コンテンツ',
            value: 'procedural_content'
          }
        ],
        difficultyModifier: 2.0,
        specialRewards: ['infinity_badge', 'creator_tools']
      }
    ]

    // Initialize hidden stories
    this.hiddenStories.value = [
      {
        id: 'translator_origin',
        title: 'Universal Translatorの起源',
        description: 'Translatorがなぜ孤独な存在になったかの真実',
        unlockCondition: ['true_ending', 'special_ending'],
        replayable: true,
        specialCharacters: ['the_translator', 'ancient_entity'],
        content: [
          {
            id: 'origin_scene_1',
            title: '創造の日',
            background: '/images/hidden/translator_birth.jpg',
            duration: 20000,
            dialogue: [],
            secretInformation: 'Translatorは愛から生まれた存在だった',
            exclusiveArt: '/images/exclusive/translator_creation.jpg'
          }
        ]
      },
      {
        id: 'character_past_lives',
        title: 'キャラクターたちの前世',
        description: '仲間たちの知られざる過去',
        unlockCondition: ['good_ending'],
        replayable: true,
        specialCharacters: ['all'],
        content: [
          {
            id: 'past_lives_phonix',
            title: 'Professor Phonixの音楽院時代',
            background: '/images/hidden/phonix_youth.jpg',
            duration: 15000,
            dialogue: [],
            secretInformation: 'Phonixは元々音楽を嫌っていた'
          }
        ]
      },
      {
        id: 'galaxy_creation_myth',
        title: 'Language Galaxy創世記',
        description: 'この世界がどのように生まれたか',
        unlockCondition: ['true_ending'],
        replayable: false,
        specialCharacters: ['cosmic_entity'],
        content: [
          {
            id: 'creation_myth',
            title: '言語の誕生',
            background: '/images/hidden/galaxy_birth.jpg',
            duration: 25000,
            dialogue: [],
            secretInformation: 'Language Galaxyは学習者の願いから生まれた'
          }
        ]
      }
    ]

    // Initialize reunion events
    this.reunionEvents.value = [
      {
        id: 'friendship_reunion',
        title: '友情の再会',
        description: '全キャラクターとの特別な再会イベント',
        participatingCharacters: ['all'],
        unlockCondition: {
          endingsRequired: ['good_ending'],
          relationshipThreshold: 70
        },
        eventScenes: [
          {
            id: 'reunion_celebration',
            title: '再会パーティー',
            setting: '/images/reunion/celebration_hall.jpg',
            duration: 30000,
            dialogue: [],
            specialInteractions: [
              {
                type: 'memory_sharing',
                description: '冒険の思い出を語り合う',
                outcome: '絆がさらに深まる'
              },
              {
                type: 'gift_exchange',
                description: 'それぞれが特別な贈り物を交換',
                outcome: '記念品獲得'
              }
            ]
          }
        ],
        rewards: [
          {
            type: 'art',
            content: '全員集合記念イラスト',
            rarity: 'legendary'
          },
          {
            type: 'voice_line',
            content: 'キャラクター全員からの特別メッセージ',
            rarity: 'rare'
          }
        ]
      },
      {
        id: 'translator_reconciliation',
        title: 'Translatorとの和解',
        description: 'Universal Translatorとの深い対話',
        participatingCharacters: ['the_translator', 'captain_nova'],
        unlockCondition: {
          endingsRequired: ['true_ending'],
          relationshipThreshold: 85
        },
        eventScenes: [
          {
            id: 'deep_conversation',
            title: '真実の対話',
            setting: '/images/reunion/translator_sanctuary.jpg',
            duration: 25000,
            dialogue: [],
            specialInteractions: [
              {
                type: 'collaborative_activity',
                description: '新しい翻訳システムを一緒に設計',
                outcome: '完璧な調和システム完成'
              }
            ]
          }
        ],
        rewards: [
          {
            type: 'special_mode',
            content: 'Translator Partnership Mode',
            rarity: 'legendary'
          }
        ]
      }
    ]
  }

  /**
   * Check if unlock condition is met
   */
  private checkUnlockCondition(condition: string): boolean {
    const completedEndings = endingSystem.getUnlockedEndings()
    const playerStats = endingSystem.currentPlayerStats

    switch (condition) {
      case 'any_ending':
        return completedEndings.length > 0
      case 'good_ending':
        return completedEndings.some(e => e.type === 'good_ending')
      case 'true_ending':
        return completedEndings.some(e => e.type === 'true_ending')
      case 'true_ending_perfect':
        return completedEndings.some(e => e.type === 'true_ending') && 
               playerStats?.overallMastery === 100
      default:
        return false
    }
  }

  /**
   * Start a New Game+ with selected mode
   */
  public startNewGamePlus(modeId: string): void {
    const mode = this.newGamePlusModes.value.find(m => m.id === modeId)
    if (!mode) return

    // Save current progress as NG+ data
    const ngPlusData = {
      mode: mode,
      previousPlaythrough: {
        endings: endingSystem.getUnlockedEndings(),
        stats: endingSystem.currentPlayerStats,
        epilogues: characterEpilogues.unlockedEpilogueIds
      },
      startTime: new Date().toISOString()
    }

    localStorage.setItem('language_galaxy_ng_plus', JSON.stringify(ngPlusData))

    // Apply NG+ features
    this.applyNewGamePlusFeatures(mode)
  }

  /**
   * Apply New Game+ features to game state
   */
  private applyNewGamePlusFeatures(mode: NewGamePlusMode): void {
    mode.features.forEach(feature => {
      switch (feature.type) {
        case 'skill_retention':
          this.retainSkills(feature.value as number)
          break
        case 'character_memory':
          this.enableCharacterMemory()
          break
        case 'enhanced_difficulty':
          this.setDifficultyModifier(mode.difficultyModifier)
          break
      }
    })
  }

  /**
   * Retain skills from previous playthrough
   */
  private retainSkills(retentionRate: number): void {
    const previousStats = endingSystem.currentPlayerStats
    if (!previousStats) return

    const retainedStats = {
      overallMastery: previousStats.overallMastery * retentionRate,
      planetMasteries: new Map(),
      characterRelationships: new Map()
    }

    // Retain planet masteries
    previousStats.planetMasteries.forEach((mastery, planet) => {
      retainedStats.planetMasteries.set(planet, mastery * retentionRate)
    })

    // Retain character relationships if feature enabled
    previousStats.characterRelationships.forEach((relationship, character) => {
      retainedStats.characterRelationships.set(character, relationship * retentionRate)
    })

    // Save retained stats
    localStorage.setItem('language_galaxy_ng_plus_stats', JSON.stringify({
      retainedStats,
      retentionRate
    }))
  }

  /**
   * Enable character memory feature
   */
  private enableCharacterMemory(): void {
    localStorage.setItem('language_galaxy_character_memory', 'true')
  }

  /**
   * Set difficulty modifier
   */
  private setDifficultyModifier(modifier: number): void {
    localStorage.setItem('language_galaxy_difficulty_modifier', modifier.toString())
  }

  /**
   * Play hidden story
   */
  public async playHiddenStory(storyId: string): Promise<void> {
    const story = this.hiddenStories.value.find(s => s.id === storyId)
    if (!story) return

    // Mark as played
    const playedStories = JSON.parse(localStorage.getItem('language_galaxy_played_stories') || '[]')
    if (!playedStories.includes(storyId)) {
      playedStories.push(storyId)
      localStorage.setItem('language_galaxy_played_stories', JSON.stringify(playedStories))
    }

    // Play story scenes
    for (const scene of story.content) {
      await this.playHiddenScene(scene)
    }
  }

  /**
   * Play hidden story scene
   */
  private async playHiddenScene(scene: HiddenStoryScene): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, scene.duration)
    })
  }

  /**
   * Start reunion event
   */
  public async startReunionEvent(eventId: string): Promise<void> {
    const event = this.reunionEvents.value.find(e => e.id === eventId)
    if (!event) return

    // Mark as completed
    const completedEvents = JSON.parse(localStorage.getItem('language_galaxy_completed_reunions') || '[]')
    if (!completedEvents.includes(eventId)) {
      completedEvents.push(eventId)
      localStorage.setItem('language_galaxy_completed_reunions', JSON.stringify(completedEvents))
    }

    // Grant rewards
    event.rewards.forEach(reward => {
      this.grantReunionReward(reward)
    })
  }

  /**
   * Grant reunion reward
   */
  private grantReunionReward(reward: ReunionReward): void {
    const rewards = JSON.parse(localStorage.getItem('language_galaxy_reunion_rewards') || '[]')
    rewards.push(reward)
    localStorage.setItem('language_galaxy_reunion_rewards', JSON.stringify(rewards))
  }

  /**
   * Save post-ending progress
   */
  private savePostEndingProgress(): void {
    const progressData = {
      unlockedFeatures: Array.from(this.unlockedFeatures.value),
      completionDate: new Date().toISOString()
    }
    
    localStorage.setItem('language_galaxy_post_ending', JSON.stringify(progressData))
  }

  /**
   * Load post-ending progress
   */
  private loadPostEndingProgress(): void {
    const saved = localStorage.getItem('language_galaxy_post_ending')
    if (saved) {
      const data = JSON.parse(saved)
      this.unlockedFeatures.value = new Set(data.unlockedFeatures)
    }
  }

  // Public getters
  public get availableFeatures(): Set<PostEndingFeature> {
    return this.unlockedFeatures.value
  }

  public isFeatureUnlocked(feature: PostEndingFeature): boolean {
    return this.unlockedFeatures.value.has(feature)
  }

  public get completionPercentage(): number {
    const totalFeatures = Object.keys(PostEndingFeature).length
    return (this.unlockedFeatures.value.size / totalFeatures) * 100
  }
}

// Export singleton instance
export const postEndingElements = new PostEndingElements()
export default postEndingElements