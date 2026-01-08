/**
 * Language Galaxy Adventure - Story Engine
 * 統一ストーリーシステムのコアエンジン
 */

import { ref, reactive, computed, watch } from 'vue'
import { gsap } from 'gsap'
import logger from '@/utils/logger'
import type {
  StoryChapter,
  StoryScene,
  StoryProgress,
  StoryEvent,
  StorySavePoint,
  Choice,
  SceneCondition,
  SceneTrigger,
  VRScenarioData,
  StoryAnimation,
  TypewriterConfig,
  ChoiceConsequence
} from './types/StoryTypes'

export class StoryEngine {
  private chapters: Map<string, StoryChapter> = new Map()
  private currentChapter = ref<StoryChapter | null>(null)
  private currentScene = ref<StoryScene | null>(null)
  private progress = reactive<StoryProgress>({
    currentChapter: '',
    currentScene: '',
    completedChapters: [],
    completedScenes: [],
    playerChoices: {},
    characterRelationships: {},
    unlockedContent: [],
    vrScenarioHistory: [],
    savePoints: []
  })

  private eventHandlers: Map<string, ((event: StoryEvent) => void)[]> = new Map()
  private savePointInterval = 300000 // 5分ごとの自動セーブ
  private autoSaveTimer: number | null = null

  constructor() {
    this.initializeEventSystem()
    this.startAutoSave()
  }

  // ======= 初期化システム =======
  
  async loadChapters(chaptersData: StoryChapter[]): Promise<void> {
    try {
      chaptersData.forEach(chapter => {
        this.chapters.set(chapter.id, chapter)
      })
      
      logger.log(`📚 Loaded ${chaptersData.length} story chapters`)
      this.emitEvent('chaptersLoaded', { count: chaptersData.length })
    } catch (error) {
      logger.error('Failed to load story chapters:', error)
      throw new Error('Story engine initialization failed')
    }
  }

  loadProgress(savedProgress: Partial<StoryProgress>): void {
    Object.assign(this.progress, savedProgress)
    
    if (this.progress.currentChapter) {
      const chapter = this.chapters.get(this.progress.currentChapter)
      if (chapter) {
        this.currentChapter.value = chapter
        const scene = chapter.scenes.find(s => s.id === this.progress.currentScene)
        if (scene) {
          this.currentScene.value = scene
        }
      }
    }
    
    logger.log('📖 Story progress loaded:', this.progress)
  }

  // ======= ストーリー進行システム =======

  async startChapter(chapterId: string): Promise<boolean> {
    const chapter = this.chapters.get(chapterId)
    if (!chapter) {
      logger.error(`Chapter ${chapterId} not found`)
      return false
    }

    // 解放条件チェック
    if (!this.checkChapterUnlockConditions(chapter)) {
      logger.warn(`Chapter ${chapterId} unlock conditions not met`)
      return false
    }

    this.currentChapter.value = chapter
    this.progress.currentChapter = chapterId
    
    // 最初のシーンを開始
    if (chapter.scenes.length > 0) {
      await this.goToScene(chapter.scenes[0].id)
    }

    this.emitEvent('chapterStarted', { chapterId, chapter })
    this.createSavePoint(`Chapter ${chapter.title} started`)
    
    return true
  }

  async goToScene(sceneId: string, options: { skipAnimation?: boolean } = {}): Promise<boolean> {
    if (!this.currentChapter.value) {
      logger.error('No active chapter')
      return false
    }

    const scene = this.currentChapter.value.scenes.find(s => s.id === sceneId)
    if (!scene) {
      logger.error(`Scene ${sceneId} not found in current chapter`)
      return false
    }

    // シーン条件チェック
    if (!this.checkSceneConditions(scene)) {
      logger.warn(`Scene ${sceneId} conditions not met`)
      return false
    }

    // 現在のシーンを完了としてマーク
    if (this.currentScene.value && !this.progress.completedScenes.includes(this.currentScene.value.id)) {
      this.progress.completedScenes.push(this.currentScene.value.id)
    }

    this.currentScene.value = scene
    this.progress.currentScene = sceneId

    this.emitEvent('sceneStarted', { sceneId, scene })

    // VRシナリオチェック
    if (scene.vrScenario && this.shouldTransitionToVR(scene.vrScenario)) {
      this.emitEvent('vrTransitionAvailable', { scenario: scene.vrScenario })
    }

    return true
  }

  async makeChoice(choiceId: string): Promise<void> {
    if (!this.currentScene.value?.choices) {
      logger.error('No choices available in current scene')
      return
    }

    const choice = this.currentScene.value.choices.find(c => c.id === choiceId)
    if (!choice) {
      logger.error(`Choice ${choiceId} not found`)
      return
    }

    // 選択を記録
    this.progress.playerChoices[this.currentScene.value.id] = choiceId

    // 選択の結果を適用
    this.applyChoiceConsequences(choice.consequences)

    this.emitEvent('choiceMade', { 
      sceneId: this.currentScene.value.id, 
      choiceId, 
      choice 
    })

    // 次のシーンに進む
    if (choice.nextScene) {
      await this.goToScene(choice.nextScene)
    }
  }

  async completeScene(): Promise<void> {
    if (!this.currentScene.value) return

    const sceneId = this.currentScene.value.id
    
    if (!this.progress.completedScenes.includes(sceneId)) {
      this.progress.completedScenes.push(sceneId)
    }

    // 次のシーンがある場合は自動で進む
    if (this.currentScene.value.nextScene) {
      await this.goToScene(this.currentScene.value.nextScene)
    } else {
      // チャプター完了チェック
      await this.checkChapterCompletion()
    }

    this.emitEvent('sceneCompleted', { sceneId })
  }

  // ======= 条件システム =======

  private checkChapterUnlockConditions(chapter: StoryChapter): boolean {
    // 基本的な解放条件チェック
    if (chapter.requiredCrystals > 0) {
      const playerCrystals = this.getPlayerCrystals()
      if (playerCrystals < chapter.requiredCrystals) {
        return false
      }
    }

    if (chapter.vrReadinessRequired) {
      const vrReadiness = this.getVRReadiness()
      if (vrReadiness < chapter.vrReadinessRequired) {
        return false
      }
    }

    return true
  }

  private checkSceneConditions(scene: StoryScene): boolean {
    if (!scene.conditions) return true

    return scene.conditions.every(condition => {
      return this.evaluateCondition(condition)
    })
  }

  private evaluateCondition(condition: SceneCondition): boolean {
    switch (condition.type) {
      case 'crystal':
        const crystals = this.getPlayerCrystals()
        return this.compareValues(crystals, condition.operator, condition.value as number)
      
      case 'skill':
        const skillLevel = this.getPlayerSkill(condition.target)
        return this.compareValues(skillLevel, condition.operator, condition.value as number)
      
      case 'relationship':
        const relationship = this.progress.characterRelationships[condition.target as any] || 0
        return this.compareValues(relationship, condition.operator, condition.value as number)
      
      case 'vr_readiness':
        const vrReadiness = this.getVRReadiness()
        return this.compareValues(vrReadiness, condition.operator, condition.value as number)
      
      case 'chapter_complete':
        return this.progress.completedChapters.includes(condition.target)
      
      default:
        return true
    }
  }

  private compareValues(a: number, operator: string, b: number): boolean {
    switch (operator) {
      case '>=': return a >= b
      case '<=': return a <= b
      case '==': return a === b
      case '!=': return a !== b
      default: return false
    }
  }

  // ======= 選択結果適用システム =======

  private applyChoiceConsequences(consequences: ChoiceConsequence[]): void {
    consequences.forEach(consequence => {
      switch (consequence.type) {
        case 'relationship':
          const currentRel = this.progress.characterRelationships[consequence.target as any] || 0
          this.progress.characterRelationships[consequence.target as any] = 
            Math.max(0, Math.min(100, currentRel + consequence.value))
          break
        
        case 'crystal':
          this.addCrystals(consequence.value)
          break
        
        case 'skill':
          this.addSkillPoints(consequence.target, consequence.value)
          break
        
        case 'unlock':
          if (!this.progress.unlockedContent.includes(consequence.target)) {
            this.progress.unlockedContent.push(consequence.target)
          }
          break
      }
    })
  }

  // ======= トリガーシステム =======

  checkTriggers(event: string, data: any): void {
    this.chapters.forEach(chapter => {
      chapter.scenes.forEach(scene => {
        scene.triggers?.forEach(trigger => {
          if (this.shouldTriggerActivate(trigger, event, data)) {
            this.emitEvent('triggerActivated', {
              trigger,
              chapterId: chapter.id,
              sceneId: scene.id
            })
          }
        })
      })
    })
  }

  private shouldTriggerActivate(trigger: SceneTrigger, event: string, data: any): boolean {
    if (trigger.event !== event) return false
    
    switch (trigger.event) {
      case 'gameComplete':
        return data.gameId === trigger.target
      
      case 'scoreAchieved':
        return data.score >= (trigger.value || 0)
      
      case 'planetReached':
        return data.planetId === trigger.target
      
      case 'crystalGained':
        return data.amount >= (trigger.value || 1)
      
      default:
        return true
    }
  }

  // ======= VRシナリオ連携 =======

  private shouldTransitionToVR(scenario: VRScenarioData): boolean {
    const vrReadiness = this.getVRReadiness()
    return vrReadiness >= scenario.requiredVRReadiness
  }

  async prepareVRTransition(scenarioId: string): Promise<VRScenarioData | null> {
    // 現在のチャプターからVRシナリオを取得
    if (!this.currentChapter.value) return null

    const scenario = this.currentChapter.value.vrScenarios.find(s => s.id === scenarioId)
    if (!scenario) return null

    // VR準備度チェック
    if (!this.shouldTransitionToVR(scenario)) {
      logger.warn(`VR readiness insufficient for scenario ${scenarioId}`)
      return null
    }

    this.emitEvent('vrTransitionPrepared', { scenario })
    return scenario
  }

  // ======= セーブシステム =======

  createSavePoint(description: string): void {
    const savePoint: StorySavePoint = {
      id: `save_${Date.now()}`,
      chapterId: this.progress.currentChapter,
      sceneId: this.progress.currentScene,
      timestamp: new Date().toISOString(),
      playerState: this.getSerializablePlayerState(),
      description
    }

    this.progress.savePoints.push(savePoint)
    
    // 最大10個のセーブポイントを保持
    if (this.progress.savePoints.length > 10) {
      this.progress.savePoints.shift()
    }

    this.emitEvent('savePointCreated', { savePoint })
  }

  async loadFromSavePoint(savePointId: string): Promise<boolean> {
    const savePoint = this.progress.savePoints.find(sp => sp.id === savePointId)
    if (!savePoint) return false

    try {
      // セーブポイントの状態を復元
      this.progress.currentChapter = savePoint.chapterId
      this.progress.currentScene = savePoint.sceneId
      
      // プレイヤー状態を復元
      this.restorePlayerState(savePoint.playerState)
      
      // 現在のチャプターとシーンを設定
      await this.startChapter(savePoint.chapterId)
      await this.goToScene(savePoint.sceneId)

      this.emitEvent('savePointLoaded', { savePoint })
      return true
    } catch (error) {
      logger.error('Failed to load save point:', error)
      return false
    }
  }

  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }

    this.autoSaveTimer = window.setInterval(() => {
      if (this.currentScene.value) {
        this.createSavePoint('Auto save')
      }
    }, this.savePointInterval)
  }

  // ======= チャプター完了システム =======

  private async checkChapterCompletion(): Promise<void> {
    if (!this.currentChapter.value) return

    const chapter = this.currentChapter.value
    const allScenesCompleted = chapter.scenes.every(scene => 
      this.progress.completedScenes.includes(scene.id)
    )

    if (allScenesCompleted && !this.progress.completedChapters.includes(chapter.id)) {
      this.progress.completedChapters.push(chapter.id)
      
      // チャプター報酬を付与
      this.applyChapterRewards(chapter)
      
      this.emitEvent('chapterCompleted', { 
        chapterId: chapter.id, 
        chapter 
      })
      
      this.createSavePoint(`Chapter ${chapter.title} completed`)
    }
  }

  private applyChapterRewards(chapter: StoryChapter): void {
    chapter.rewards.forEach(reward => {
      switch (reward.type) {
        case 'crystal':
          this.addCrystals(reward.value as number)
          break
        case 'skill':
          // スキルポイント付与のロジック
          break
        case 'vrAccess':
          this.unlockVRContent(reward.value as string)
          break
      }
    })
  }

  // ======= イベントシステム =======

  private initializeEventSystem(): void {
    // GSAPプラグインの初期化
    gsap.registerPlugin()
  }

  addEventListener(eventType: string, handler: (event: StoryEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  removeEventListener(eventType: string, handler: (event: StoryEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emitEvent(type: string, data: any): void {
    const event: StoryEvent = {
      type: type as any,
      data,
      timestamp: new Date().toISOString(),
      source: 'system'
    }

    const handlers = this.eventHandlers.get(type)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }

    logger.log(`📡 Story event: ${type}`, data)
  }

  // ======= アニメーションシステム =======

  async playAnimation(animation: StoryAnimation): Promise<void> {
    return new Promise((resolve) => {
      const target = document.querySelector(animation.target)
      if (!target) {
        logger.warn(`Animation target not found: ${animation.target}`)
        resolve()
        return
      }

      const onComplete = () => {
        animation.onComplete?.()
        resolve()
      }

      switch (animation.type) {
        case 'fadeIn':
          gsap.fromTo(target, 
            { opacity: 0 }, 
            { 
              opacity: 1, 
              duration: animation.duration,
              delay: animation.delay || 0,
              ease: animation.ease || 'power2.out',
              onComplete
            }
          )
          break

        case 'slideIn':
          gsap.fromTo(target,
            { x: -100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: animation.duration,
              delay: animation.delay || 0,
              ease: animation.ease || 'back.out(1.7)',
              onComplete
            }
          )
          break

        case 'typewriter':
          this.playTypewriterAnimation(target as HTMLElement, animation, onComplete)
          break

        default:
          resolve()
      }
    })
  }

  private playTypewriterAnimation(
    element: HTMLElement, 
    animation: StoryAnimation,
    onComplete: () => void
  ): void {
    const text = element.textContent || ''
    const config: TypewriterConfig = {
      speed: 50, // characters per second
      pauseOnPunctuation: 200,
      skipable: true,
      ...animation
    }

    element.textContent = ''
    let index = 0
    let isSkipped = false

    const skipHandler = () => {
      if (config.skipable && !isSkipped) {
        isSkipped = true
        element.textContent = text
        onComplete()
      }
    }

    if (config.skipable) {
      document.addEventListener('click', skipHandler, { once: true })
      document.addEventListener('keydown', skipHandler, { once: true })
    }

    const typeNext = () => {
      if (isSkipped) return

      if (index < text.length) {
        element.textContent += text[index]
        index++

        const currentChar = text[index - 1]
        const isPunctuation = /[.!?]/.test(currentChar)
        const delay = isPunctuation ? config.pauseOnPunctuation : 1000 / config.speed

        setTimeout(typeNext, delay)
      } else {
        document.removeEventListener('click', skipHandler)
        document.removeEventListener('keydown', skipHandler)
        onComplete()
      }
    }

    typeNext()
  }

  // ======= ユーティリティメソッド =======

  private getPlayerCrystals(): number {
    // playerProfileStoreから取得（実際の実装では依存注入を使用）
    return 0 // プレースホルダー
  }

  private getPlayerSkill(skillName: string): number {
    // playerProfileStoreから取得
    return 0 // プレースホルダー
  }

  private getVRReadiness(): number {
    // playerProfileStoreから取得
    return 0 // プレースホルダー
  }

  private addCrystals(amount: number): void {
    // クリスタル追加のロジック
    this.emitEvent('crystalsAdded', { amount })
  }

  private addSkillPoints(skill: string, points: number): void {
    // スキルポイント追加のロジック
    this.emitEvent('skillPointsAdded', { skill, points })
  }

  private unlockVRContent(contentId: string): void {
    if (!this.progress.unlockedContent.includes(contentId)) {
      this.progress.unlockedContent.push(contentId)
      this.emitEvent('vrContentUnlocked', { contentId })
    }
  }

  private getSerializablePlayerState(): Record<string, any> {
    return {
      progress: { ...this.progress },
      timestamp: Date.now()
    }
  }

  private restorePlayerState(state: Record<string, any>): void {
    if (state.progress) {
      Object.assign(this.progress, state.progress)
    }
  }

  // ======= パブリックゲッター =======

  get currentChapterData() { return this.currentChapter.value }
  get currentSceneData() { return this.currentScene.value }
  get progressData() { return this.progress }
  get availableChapters() { return Array.from(this.chapters.values()) }

  // クリーンアップ
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }
    this.eventHandlers.clear()
  }
}

// グローバルストーリーエンジンインスタンス
export const storyEngine = new StoryEngine()