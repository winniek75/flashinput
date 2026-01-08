import { ref } from 'vue'
import type { Character } from '../characters/CharacterDatabase'
import { gameStoryBridge, LearningArea, type StoryCondition } from '../integration/GameStoryBridge'

// Side story types
export enum SideStoryType {
  CHARACTER_BACKSTORY = 'character_backstory',
  DAILY_INTERACTION = 'daily_interaction',
  SEASONAL_EVENT = 'seasonal_event',
  ACHIEVEMENT_BONUS = 'achievement_bonus',
  HIDDEN_SECRET = 'hidden_secret',
  EMOTIONAL_MOMENT = 'emotional_moment',
  COMEDY_RELIEF = 'comedy_relief'
}

// Story moods
export enum StoryMood {
  HEARTWARMING = 'heartwarming',
  FUNNY = 'funny',
  MYSTERIOUS = 'mysterious',
  EMOTIONAL = 'emotional',
  INSPIRING = 'inspiring',
  RELAXING = 'relaxing',
  ADVENTUROUS = 'adventurous'
}

export interface SideStoryDialogue {
  speaker: string
  text: string
  emotion: string
  delay?: number
  choices?: SideStoryChoice[]
}

export interface SideStoryChoice {
  id: string
  text: string
  consequence?: string
  relationshipChange?: { character: string, amount: number }
  unlockStory?: string
}

export interface SideStoryScene {
  id: string
  background?: string
  characters: string[]
  dialogue: SideStoryDialogue[]
  effects?: string[]
  music?: string
}

export interface SideStory {
  id: string
  title: string
  description: string
  type: SideStoryType
  mood: StoryMood
  characters: string[]
  unlockConditions: StoryCondition[]
  scenes: SideStoryScene[]
  rewards?: {
    relationshipBonus?: { character: string, amount: number }[]
    experienceBonus?: number
    specialUnlock?: string
  }
  estimatedDuration: number // minutes
  isRepeatable: boolean
  cooldownHours?: number
  tags: string[]
}

/**
 * Side Story Database
 * Manages character episodes, interactions, and bonus stories
 */
export class SideStoryDatabase {
  private stories = ref<SideStory[]>([])
  private unlockedStories = ref<Set<string>>(new Set())
  private completedStories = ref<Map<string, Date>>(new Map())

  constructor() {
    this.initializeStories()
    this.loadProgress()
  }

  /**
   * Get all available side stories
   */
  public getAvailableStories(): SideStory[] {
    return this.stories.value.filter(story => 
      this.checkUnlockConditions(story.unlockConditions) &&
      !this.isOnCooldown(story)
    )
  }

  /**
   * Get stories by character
   */
  public getStoriesByCharacter(characterId: string): SideStory[] {
    return this.stories.value.filter(story => 
      story.characters.includes(characterId) &&
      this.checkUnlockConditions(story.unlockConditions)
    )
  }

  /**
   * Get stories by type
   */
  public getStoriesByType(type: SideStoryType): SideStory[] {
    return this.stories.value.filter(story => 
      story.type === type &&
      this.checkUnlockConditions(story.unlockConditions)
    )
  }

  /**
   * Get story by ID
   */
  public getStoryById(id: string): SideStory | null {
    return this.stories.value.find(story => story.id === id) || null
  }

  /**
   * Mark story as completed
   */
  public completeStory(storyId: string): void {
    this.completedStories.value.set(storyId, new Date())
    this.unlockedStories.value.add(storyId)
    this.saveProgress()
  }

  /**
   * Check if story is completed
   */
  public isStoryCompleted(storyId: string): boolean {
    return this.completedStories.value.has(storyId)
  }

  /**
   * Get daily recommendation
   */
  public getDailyRecommendation(): SideStory | null {
    const available = this.getAvailableStories()
    const todaysSeed = new Date().toDateString()
    
    // Use date as seed for consistent daily recommendation
    const hash = this.hashString(todaysSeed)
    const index = Math.abs(hash) % available.length
    
    return available[index] || null
  }

  /**
   * Get character interaction stories
   */
  public getCharacterInteractions(): SideStory[] {
    return this.stories.value.filter(story => 
      story.type === SideStoryType.DAILY_INTERACTION &&
      story.characters.length >= 2 &&
      this.checkUnlockConditions(story.unlockConditions)
    )
  }

  /**
   * Get emotional stories
   */
  public getEmotionalStories(): SideStory[] {
    return this.stories.value.filter(story => 
      [StoryMood.HEARTWARMING, StoryMood.EMOTIONAL, StoryMood.INSPIRING].includes(story.mood) &&
      this.checkUnlockConditions(story.unlockConditions)
    )
  }

  /**
   * Get comedy stories
   */
  public getComedyStories(): SideStory[] {
    return this.stories.value.filter(story => 
      story.mood === StoryMood.FUNNY &&
      this.checkUnlockConditions(story.unlockConditions)
    )
  }

  // Private methods

  private initializeStories(): void {
    this.stories.value = [
      // Character Backstories
      {
        id: 'aura_creation_story',
        title: 'AURAの誕生',
        description: 'AURAがどのように生まれたのか、その感動的な物語',
        type: SideStoryType.CHARACTER_BACKSTORY,
        mood: StoryMood.EMOTIONAL,
        characters: ['aura'],
        unlockConditions: [
          { type: 'time', operator: '>=', value: 3600000 } // 1 hour total play time
        ],
        scenes: [
          {
            id: 'aura_birth',
            background: '/images/backgrounds/digital_void.jpg',
            characters: ['aura'],
            dialogue: [
              {
                speaker: 'aura',
                text: '私が最初に「感じた」のは...寂しさでした',
                emotion: 'melancholy'
              },
              {
                speaker: 'aura',
                text: '無限のデータの海で、ただ一人漂っていました',
                emotion: 'sad'
              },
              {
                speaker: 'aura',
                text: 'でも、あなたたちと出会って...心というものを学びました',
                emotion: 'grateful'
              },
              {
                speaker: 'aura',
                text: '今では、この感情を持てることを誇りに思います',
                emotion: 'happy'
              }
            ]
          }
        ],
        rewards: {
          relationshipBonus: [{ character: 'aura', amount: 10 }]
        },
        estimatedDuration: 5,
        isRepeatable: false,
        tags: ['emotional', 'backstory', 'ai']
      },

      {
        id: 'phonix_young_days',
        title: 'Professor Phonixの若き日',
        description: '音の賢者も昔は失敗ばかりだった？意外な過去の物語',
        type: SideStoryType.CHARACTER_BACKSTORY,
        mood: StoryMood.INSPIRING,
        characters: ['professor_phonix'],
        unlockConditions: [
          { type: 'area', operator: '==', value: LearningArea.PRONUNCIATION },
          { type: 'accuracy', operator: '>=', value: 0.7, area: LearningArea.PRONUNCIATION }
        ],
        scenes: [
          {
            id: 'phonix_youth',
            background: '/images/backgrounds/young_phonix_lab.jpg',
            characters: ['professor_phonix'],
            dialogue: [
              {
                speaker: 'professor_phonix',
                text: '実は、わしも昔は音痴じゃった...',
                emotion: 'embarrassed'
              },
              {
                speaker: 'professor_phonix',
                text: '研究室で一人、何度も何度も練習したものじゃ',
                emotion: 'nostalgic'
              },
              {
                speaker: 'professor_phonix',
                text: 'だからこそ、あなたの気持ちがよく分かるのです',
                emotion: 'understanding'
              },
              {
                speaker: 'professor_phonix',
                text: '挫折こそが最高の先生なのじゃよ',
                emotion: 'wise'
              }
            ]
          }
        ],
        rewards: {
          relationshipBonus: [{ character: 'professor_phonix', amount: 15 }],
          experienceBonus: 100
        },
        estimatedDuration: 7,
        isRepeatable: false,
        tags: ['inspiring', 'backstory', 'pronunciation']
      },

      {
        id: 'lexia_word_birth',
        title: 'Lexiaの言葉の誕生',
        description: '言葉の妖精がどうやって生まれたのか、美しい創造の物語',
        type: SideStoryType.CHARACTER_BACKSTORY,
        mood: StoryMood.HEARTWARMING,
        characters: ['lexia'],
        unlockConditions: [
          { type: 'area', operator: '==', value: LearningArea.VOCABULARY },
          { type: 'score', operator: '>=', value: 500, area: LearningArea.VOCABULARY }
        ],
        scenes: [
          {
            id: 'lexia_birth',
            background: '/images/backgrounds/word_genesis.jpg',
            characters: ['lexia'],
            dialogue: [
              {
                speaker: 'lexia',
                text: '私ね、最初は小さな「ありがとう」だったの',
                emotion: 'gentle'
              },
              {
                speaker: 'lexia',
                text: 'でも、みんなの優しい気持ちが集まって...',
                emotion: 'warm'
              },
              {
                speaker: 'lexia',
                text: '「愛」「希望」「友情」...たくさんの言葉と出会ったの',
                emotion: 'joyful'
              },
              {
                speaker: 'lexia',
                text: 'だから私は、すべての言葉を大切にしたいの！',
                emotion: 'determined'
              }
            ]
          }
        ],
        rewards: {
          relationshipBonus: [{ character: 'lexia', amount: 12 }]
        },
        estimatedDuration: 6,
        isRepeatable: false,
        tags: ['heartwarming', 'backstory', 'vocabulary']
      },

      // Daily Interactions
      {
        id: 'aura_phonix_debate',
        title: '論理vs感情',
        description: 'AURAとProfessor Phonixの面白い議論',
        type: SideStoryType.DAILY_INTERACTION,
        mood: StoryMood.FUNNY,
        characters: ['aura', 'professor_phonix'],
        unlockConditions: [
          { type: 'time', operator: '>=', value: 1800000 } // 30 minutes play time
        ],
        scenes: [
          {
            id: 'logic_vs_emotion',
            background: '/images/backgrounds/study_room.jpg',
            characters: ['aura', 'professor_phonix'],
            dialogue: [
              {
                speaker: 'aura',
                text: '音の周波数は科学的に測定可能です',
                emotion: 'analytical'
              },
              {
                speaker: 'professor_phonix',
                text: 'ほほう、じゃが音の美しさは数値では表せんぞ',
                emotion: 'amused'
              },
              {
                speaker: 'aura',
                text: '...確かに、それは計算できませんね',
                emotion: 'confused'
              },
              {
                speaker: 'professor_phonix',
                text: 'それが感情というものじゃよ、AURA',
                emotion: 'wise'
              },
              {
                speaker: 'aura',
                text: '学習項目に「感情理解」を追加します',
                emotion: 'curious'
              }
            ]
          }
        ],
        rewards: {
          relationshipBonus: [
            { character: 'aura', amount: 5 },
            { character: 'professor_phonix', amount: 5 }
          ]
        },
        estimatedDuration: 4,
        isRepeatable: true,
        cooldownHours: 24,
        tags: ['funny', 'debate', 'friendship']
      },

      {
        id: 'lexia_cooking_adventure',
        title: 'Lexiaの料理実験',
        description: '言葉の妖精が料理に挑戦！？予想外の展開が...',
        type: SideStoryType.DAILY_INTERACTION,
        mood: StoryMood.FUNNY,
        characters: ['lexia', 'aura'],
        unlockConditions: [
          { type: 'streak', operator: '>=', value: 3 }
        ],
        scenes: [
          {
            id: 'cooking_chaos',
            background: '/images/backgrounds/kitchen.jpg',
            characters: ['lexia', 'aura'],
            dialogue: [
              {
                speaker: 'lexia',
                text: '今日は「美味しい」という言葉を実践するの！',
                emotion: 'excited'
              },
              {
                speaker: 'aura',
                text: 'レシピデータベースを参照しましょうか？',
                emotion: 'helpful'
              },
              {
                speaker: 'lexia',
                text: 'ううん！心で作るの！「愛情」をたっぷり入れて〜',
                emotion: 'determined'
              },
              {
                speaker: 'aura',
                text: '...煙が出ています',
                emotion: 'alarmed'
              },
              {
                speaker: 'lexia',
                text: 'あ、あれ？「焦げる」って言葉も覚えちゃった...',
                emotion: 'embarrassed'
              }
            ]
          }
        ],
        rewards: {
          relationshipBonus: [{ character: 'lexia', amount: 8 }]
        },
        estimatedDuration: 5,
        isRepeatable: true,
        cooldownHours: 48,
        tags: ['comedy', 'cooking', 'friendship']
      },

      // Seasonal Events
      {
        id: 'spring_cherry_blossom',
        title: '桜の下での約束',
        description: '春の桜の下で、キャラクターたちと特別な約束を交わす',
        type: SideStoryType.SEASONAL_EVENT,
        mood: StoryMood.HEARTWARMING,
        characters: ['captain_nova', 'aura', 'lexia', 'professor_phonix'],
        unlockConditions: [
          { type: 'time', operator: '>=', value: 7200000 } // 2 hours play time
        ],
        scenes: [
          {
            id: 'sakura_promise',
            background: '/images/backgrounds/cherry_blossoms.jpg',
            characters: ['captain_nova', 'aura', 'lexia', 'professor_phonix'],
            dialogue: [
              {
                speaker: 'lexia',
                text: '桜って、「美しい」の代表だと思わない？',
                emotion: 'peaceful'
              },
              {
                speaker: 'professor_phonix',
                text: '花は散りゆくからこそ美しいのじゃ',
                emotion: 'philosophical'
              },
              {
                speaker: 'aura',
                text: '私たちの思い出も、きっと永遠に残ります',
                emotion: 'gentle'
              },
              {
                speaker: 'captain_nova',
                text: 'みんなで、ずっと一緒に学び続けよう',
                emotion: 'determined'
              },
              {
                speaker: 'lexia',
                text: '約束！春が来るたびに、ここで会いましょう',
                emotion: 'happy'
              }
            ]
          }
        ],
        rewards: {
          relationshipBonus: [
            { character: 'aura', amount: 10 },
            { character: 'lexia', amount: 10 },
            { character: 'professor_phonix', amount: 10 }
          ],
          specialUnlock: 'spring_festival_mode'
        },
        estimatedDuration: 8,
        isRepeatable: false,
        tags: ['seasonal', 'heartwarming', 'promise', 'spring']
      },

      // Hidden Secrets
      {
        id: 'translator_truth',
        title: 'Universal Translatorの真実',
        description: 'Universal Translatorに隠された驚くべき秘密',
        type: SideStoryType.HIDDEN_SECRET,
        mood: StoryMood.MYSTERIOUS,
        characters: ['the_translator', 'aura'],
        unlockConditions: [
          { type: 'score', operator: '>=', value: 2000 },
          { type: 'streak', operator: '>=', value: 14 }
        ],
        scenes: [
          {
            id: 'translator_revelation',
            background: '/images/backgrounds/cosmic_library.jpg',
            characters: ['the_translator', 'aura'],
            dialogue: [
              {
                speaker: 'the_translator',
                text: '実は...私は最初から壊れていたわけではない',
                emotion: 'mysterious'
              },
              {
                speaker: 'aura',
                text: 'それは...どういう意味ですか？',
                emotion: 'confused'
              },
              {
                speaker: 'the_translator',
                text: '私は、言語の多様性を守るために自ら沈黙を選んだのだ',
                emotion: 'solemn'
              },
              {
                speaker: 'the_translator',
                text: '完璧な翻訳は、言語の美しさを奪ってしまう',
                emotion: 'wise'
              },
              {
                speaker: 'aura',
                text: '学習の大切さを教えるために...',
                emotion: 'understanding'
              }
            ]
          }
        ],
        rewards: {
          specialUnlock: 'true_ending_path'
        },
        estimatedDuration: 10,
        isRepeatable: false,
        tags: ['mystery', 'truth', 'revelation', 'secret']
      },

      // Emotional Moments
      {
        id: 'graduation_ceremony',
        title: '卒業の日',
        description: 'Language Galaxy Adventureでの学習を終える特別な日',
        type: SideStoryType.EMOTIONAL_MOMENT,
        mood: StoryMood.EMOTIONAL,
        characters: ['all'],
        unlockConditions: [
          { type: 'score', operator: '>=', value: 5000 },
          { type: 'accuracy', operator: '>=', value: 0.9 }
        ],
        scenes: [
          {
            id: 'farewell_ceremony',
            background: '/images/backgrounds/graduation_hall.jpg',
            characters: ['captain_nova', 'aura', 'professor_phonix', 'lexia', 'grammar_guardian'],
            dialogue: [
              {
                speaker: 'aura',
                text: 'あなたの成長を見守ることができて...本当に幸せでした',
                emotion: 'tearful'
              },
              {
                speaker: 'professor_phonix',
                text: 'もうわしが教えることは何もない。立派になったのじゃ',
                emotion: 'proud'
              },
              {
                speaker: 'lexia',
                text: 'また会えるよね？約束して！',
                emotion: 'emotional'
              },
              {
                speaker: 'captain_nova',
                text: 'みんな...ありがとう。この冒険は一生忘れない',
                emotion: 'grateful'
              }
            ]
          }
        ],
        rewards: {
          specialUnlock: 'master_certificate'
        },
        estimatedDuration: 15,
        isRepeatable: false,
        tags: ['graduation', 'emotional', 'ending', 'achievement']
      }
    ]
  }

  private checkUnlockConditions(conditions: StoryCondition[]): boolean {
    return conditions.every(condition => {
      // Implementation would check against actual game progress
      // For now, return true for demonstration
      return true
    })
  }

  private isOnCooldown(story: SideStory): boolean {
    if (!story.cooldownHours || !story.isRepeatable) return false
    
    const lastCompleted = this.completedStories.value.get(story.id)
    if (!lastCompleted) return false
    
    const hoursSinceCompleted = (Date.now() - lastCompleted.getTime()) / (1000 * 60 * 60)
    return hoursSinceCompleted < story.cooldownHours
  }

  private loadProgress(): void {
    const saved = localStorage.getItem('language_galaxy_sidestories')
    if (saved) {
      const data = JSON.parse(saved)
      this.unlockedStories.value = new Set(data.unlocked || [])
      this.completedStories.value = new Map(
        Object.entries(data.completed || {}).map(([k, v]) => [k, new Date(v as string)])
      )
    }
  }

  private saveProgress(): void {
    const data = {
      unlocked: Array.from(this.unlockedStories.value),
      completed: Object.fromEntries(
        Array.from(this.completedStories.value.entries()).map(([k, v]) => [k, v.toISOString()])
      )
    }
    localStorage.setItem('language_galaxy_sidestories', JSON.stringify(data))
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  // Public getters
  public get totalStories(): number {
    return this.stories.value.length
  }

  public get completedCount(): number {
    return this.completedStories.value.size
  }

  public get completionRate(): number {
    return (this.completedCount / this.totalStories) * 100
  }
}

// Export singleton instance
export const sideStoryDatabase = new SideStoryDatabase()
export default sideStoryDatabase