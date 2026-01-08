/**
 * Language Galaxy Adventure - Story State Store
 * Pinia store for story progression and VR scenario management
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storyEngine } from '@/story/StoryEngine'
import { usePlayerProfileStore } from './playerProfile'
import logger from '@/utils/logger'
import type {
  StoryChapter,
  StoryScene,
  StoryProgress,
  VRScenarioData,
  VRScenarioHistory,
  CharacterType,
  StoryEvent,
  StorySavePoint
} from '@/story/types/StoryTypes'

export const useStoryState = defineStore('storyState', () => {
  // ======= 基本状態 =======
  const isStoryActive = ref(false)
  const isLoading = ref(false)
  const currentChapter = ref<StoryChapter | null>(null)
  const currentScene = ref<StoryScene | null>(null)
  const dialogueIndex = ref(0)
  const isAutoPlay = ref(false)
  const textSpeed = ref(50) // characters per second

  // ======= 進捗データ =======
  const progress = ref<StoryProgress>({
    currentChapter: '',
    currentScene: '',
    completedChapters: [],
    completedScenes: [],
    playerChoices: {},
    characterRelationships: {
      narrator: 50,
      echo: 0,
      sage: 0,
      crystal: 0,
      alien: 0,
      guardian: 0,
      player: 100
    },
    unlockedContent: [],
    vrScenarioHistory: [],
    savePoints: []
  })

  // ======= VR関連状態 =======
  const availableVRScenarios = ref<VRScenarioData[]>([])
  const currentVRScenario = ref<VRScenarioData | null>(null)
  const vrTransitionPending = ref(false)
  const vrReadinessThresholds = {
    basic: 30,
    intermediate: 50,
    advanced: 75,
    expert: 90
  }

  // ======= UI状態 =======
  const showSkipButton = ref(true)
  const showAutoPlayButton = ref(true)
  const showSaveMenu = ref(false)
  const storyUIVisible = ref(false)
  const backgroundMusic = ref<string | null>(null)
  const currentBackground = ref<string>('/images/story/default-bg.jpg')

  // ======= 依存関係 =======
  const playerProfileStore = usePlayerProfileStore()

  // ======= 計算プロパティ =======
  
  const canAdvanceStory = computed(() => {
    return currentScene.value && !isLoading.value
  })

  const hasActiveDialogue = computed(() => {
    return currentScene.value?.dialogues && 
           dialogueIndex.value < currentScene.value.dialogues.length
  })

  const currentDialogue = computed(() => {
    if (!currentScene.value?.dialogues) return null
    return currentScene.value.dialogues[dialogueIndex.value] || null
  })

  const canMakeChoices = computed(() => {
    return currentScene.value?.type === 'choice' && 
           currentScene.value.choices && 
           currentScene.value.choices.length > 0
  })

  const vrReadinessLevel = computed(() => {
    const readiness = playerProfileStore.overallVRReadiness
    if (readiness >= vrReadinessThresholds.expert) return 'expert'
    if (readiness >= vrReadinessThresholds.advanced) return 'advanced'
    if (readiness >= vrReadinessThresholds.intermediate) return 'intermediate'
    if (readiness >= vrReadinessThresholds.basic) return 'basic'
    return 'novice'
  })

  const unlockedChapters = computed(() => {
    return storyEngine.availableChapters.filter(chapter => {
      // 基本解放条件チェック
      const crystalsReq = chapter.requiredCrystals <= playerProfileStore.totalCrystals
      const vrReq = !chapter.vrReadinessRequired || 
                    playerProfileStore.overallVRReadiness >= chapter.vrReadinessRequired
      
      return crystalsReq && vrReq
    })
  })

  const completionStats = computed(() => {
    const totalChapters = storyEngine.availableChapters.length
    const totalScenes = storyEngine.availableChapters.reduce(
      (sum, chapter) => sum + chapter.scenes.length, 0
    )
    
    return {
      chaptersCompleted: progress.value.completedChapters.length,
      totalChapters,
      scenesCompleted: progress.value.completedScenes.length,
      totalScenes,
      overallProgress: totalScenes > 0 ? 
        Math.round((progress.value.completedScenes.length / totalScenes) * 100) : 0
    }
  })

  // ======= アクション =======

  async function initializeStory(): Promise<void> {
    try {
      isLoading.value = true
      
      // ストーリーチャプターを読み込み
      const chaptersModule = await import('@/data/storyChapters.json')
      await storyEngine.loadChapters(chaptersModule.default)
      
      // 保存された進捗を復元
      const savedProgress = localStorage.getItem('movwise-story-progress')
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress)
        progress.value = { ...progress.value, ...parsedProgress }
        storyEngine.loadProgress(progress.value)
      }

      // イベントリスナーを設定
      setupStoryEventListeners()
      
      logger.log('📚 Story system initialized')
    } catch (error) {
      logger.error('Failed to initialize story system:', error)
    } finally {
      isLoading.value = false
    }
  }

  function setupStoryEventListeners(): void {
    // ストーリーイベントのリスナー設定
    storyEngine.addEventListener('chapterStarted', (event) => {
      currentChapter.value = event.data.chapter
      updateBackground(event.data.chapter.scenes[0]?.background.image)
    })

    storyEngine.addEventListener('sceneStarted', (event) => {
      currentScene.value = event.data.scene
      dialogueIndex.value = 0
      updateBackground(event.data.scene.background.image)
      playBackgroundMusic(event.data.scene.background.music)
    })

    storyEngine.addEventListener('vrTransitionAvailable', (event) => {
      currentVRScenario.value = event.data.scenario
      vrTransitionPending.value = true
    })

    storyEngine.addEventListener('chapterCompleted', (event) => {
      showChapterCompletionDialog(event.data.chapter)
    })

    // ゲームイベントのリスナー設定
    playerProfileStore.$subscribe((mutation, state) => {
      // プレイヤーの進捗に応じてストーリートリガーをチェック
      storyEngine.checkTriggers('crystalGained', { 
        amount: state.totalCrystals 
      })
    })
  }

  async function startChapter(chapterId: string): Promise<boolean> {
    try {
      isLoading.value = true
      const success = await storyEngine.startChapter(chapterId)
      
      if (success) {
        isStoryActive.value = true
        storyUIVisible.value = true
        currentChapter.value = storyEngine.currentChapterData
        currentScene.value = storyEngine.currentSceneData
        progress.value = { ...storyEngine.progressData }
      }
      
      return success
    } catch (error) {
      logger.error('Failed to start chapter:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function advanceDialogue(): Promise<void> {
    if (!hasActiveDialogue.value) return

    if (dialogueIndex.value < currentScene.value!.dialogues.length - 1) {
      dialogueIndex.value++
    } else {
      // ダイアログ終了、シーン完了
      await completeScene()
    }
  }

  async function makeChoice(choiceId: string): Promise<void> {
    try {
      await storyEngine.makeChoice(choiceId)
      progress.value = { ...storyEngine.progressData }
      
      // 次のシーンの設定
      currentScene.value = storyEngine.currentSceneData
      dialogueIndex.value = 0
    } catch (error) {
      logger.error('Failed to make choice:', error)
    }
  }

  async function completeScene(): Promise<void> {
    try {
      await storyEngine.completeScene()
      progress.value = { ...storyEngine.progressData }
      
      // 次のシーンがあるかチェック
      if (storyEngine.currentSceneData) {
        currentScene.value = storyEngine.currentSceneData
        dialogueIndex.value = 0
      } else {
        // チャプター完了
        await endStory()
      }
    } catch (error) {
      logger.error('Failed to complete scene:', error)
    }
  }

  async function skipToNextScene(): Promise<void> {
    if (!canAdvanceStory.value) return
    
    dialogueIndex.value = currentScene.value!.dialogues.length - 1
    await advanceDialogue()
  }

  function toggleAutoPlay(): void {
    isAutoPlay.value = !isAutoPlay.value
  }

  function setTextSpeed(speed: number): void {
    textSpeed.value = Math.max(10, Math.min(100, speed))
  }

  // ======= VRシナリオ管理 =======

  async function prepareVRTransition(scenarioId: string): Promise<VRScenarioData | null> {
    const scenario = await storyEngine.prepareVRTransition(scenarioId)
    if (scenario) {
      currentVRScenario.value = scenario
      return scenario
    }
    return null
  }

  async function startVRScenario(scenarioId: string): Promise<void> {
    const scenario = await prepareVRTransition(scenarioId)
    if (!scenario) {
      throw new Error(`VR scenario ${scenarioId} not available`)
    }

    // VRアカデミーブリッジを使用してVRセッションを開始
    // 実装は vrAcademyBridge.ts で行う
    logger.log('🥽 Starting VR scenario:', scenario.title)
    
    // VRシナリオ履歴に追加
    const historyEntry: VRScenarioHistory = {
      scenarioId: scenario.id,
      completedAt: new Date().toISOString(),
      duration: 0, // 実際の実装では実時間を計測
      participants: [playerProfileStore.profile.name],
      achievements: [],
      rating: 0
    }
    
    progress.value.vrScenarioHistory.push(historyEntry)
    vrTransitionPending.value = false
  }

  function getAvailableVRScenarios(): VRScenarioData[] {
    if (!currentChapter.value) return []
    
    return currentChapter.value.vrScenarios.filter(scenario => {
      return playerProfileStore.overallVRReadiness >= scenario.requiredVRReadiness
    })
  }

  // ======= セーブ・ロード機能 =======

  function createManualSavePoint(description: string): void {
    storyEngine.createSavePoint(description)
    progress.value = { ...storyEngine.progressData }
  }

  async function loadFromSavePoint(savePointId: string): Promise<boolean> {
    const success = await storyEngine.loadFromSavePoint(savePointId)
    if (success) {
      progress.value = { ...storyEngine.progressData }
      currentChapter.value = storyEngine.currentChapterData
      currentScene.value = storyEngine.currentSceneData
      dialogueIndex.value = 0
    }
    return success
  }

  function getSavePoints(): StorySavePoint[] {
    return progress.value.savePoints.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  // ======= UI制御 =======

  function showStoryUI(): void {
    storyUIVisible.value = true
  }

  function hideStoryUI(): void {
    storyUIVisible.value = false
  }

  function toggleStoryUI(): void {
    storyUIVisible.value = !storyUIVisible.value
  }

  function updateBackground(imagePath?: string): void {
    if (imagePath) {
      currentBackground.value = imagePath
    }
  }

  function playBackgroundMusic(musicPath?: string): void {
    if (musicPath) {
      backgroundMusic.value = musicPath
      // 実際の音楽再生ロジックをここに実装
    }
  }

  function showChapterCompletionDialog(chapter: StoryChapter): void {
    // チャプター完了ダイアログの表示
    logger.log(`🎉 Chapter completed: ${chapter.title}`)
  }

  async function endStory(): Promise<void> {
    isStoryActive.value = false
    storyUIVisible.value = false
    currentChapter.value = null
    currentScene.value = null
    dialogueIndex.value = 0
    
    // 最終セーブポイントを作成
    storyEngine.createSavePoint('Story session ended')
  }

  // ======= キャラクター関係性 =======

  function getCharacterRelationship(characterId: CharacterType): number {
    return progress.value.characterRelationships[characterId] || 0
  }

  function updateCharacterRelationship(characterId: CharacterType, change: number): void {
    const current = progress.value.characterRelationships[characterId] || 0
    progress.value.characterRelationships[characterId] = 
      Math.max(0, Math.min(100, current + change))
  }

  // ======= データ永続化 =======

  function saveProgressToStorage(): void {
    localStorage.setItem('movwise-story-progress', JSON.stringify(progress.value))
  }

  function loadProgressFromStorage(): boolean {
    try {
      const saved = localStorage.getItem('movwise-story-progress')
      if (saved) {
        const parsedProgress = JSON.parse(saved)
        progress.value = { ...progress.value, ...parsedProgress }
        return true
      }
      return false
    } catch (error) {
      logger.error('Failed to load story progress:', error)
      return false
    }
  }

  // ======= ウォッチャー =======

  // 進捗データが変更されたら自動保存
  watch(
    () => progress.value,
    () => {
      saveProgressToStorage()
    },
    { deep: true }
  )

  // ======= 戻り値 =======

  return {
    // 状態
    isStoryActive,
    isLoading,
    currentChapter,
    currentScene,
    dialogueIndex,
    isAutoPlay,
    textSpeed,
    progress,
    availableVRScenarios,
    currentVRScenario,
    vrTransitionPending,
    storyUIVisible,
    backgroundMusic,
    currentBackground,
    showSkipButton,
    showAutoPlayButton,
    showSaveMenu,

    // 計算プロパティ
    canAdvanceStory,
    hasActiveDialogue,
    currentDialogue,
    canMakeChoices,
    vrReadinessLevel,
    unlockedChapters,
    completionStats,

    // アクション
    initializeStory,
    startChapter,
    advanceDialogue,
    makeChoice,
    completeScene,
    skipToNextScene,
    toggleAutoPlay,
    setTextSpeed,
    prepareVRTransition,
    startVRScenario,
    getAvailableVRScenarios,
    createManualSavePoint,
    loadFromSavePoint,
    getSavePoints,
    showStoryUI,
    hideStoryUI,
    toggleStoryUI,
    endStory,
    getCharacterRelationship,
    updateCharacterRelationship,
    saveProgressToStorage,
    loadProgressFromStorage
  }
})