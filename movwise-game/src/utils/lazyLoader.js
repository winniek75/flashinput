/**
 * Lazy Loading Utility
 * Provides enhanced lazy loading with fallbacks and loading states
 */

import { defineAsyncComponent, ref } from 'vue'
import logger from './logger'

// Loading state management
export const isLoading = ref(false)
export const loadingComponent = ref(null)

// Simple loading component
const LoadingComponent = {
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>
  `
}

// Error component
const ErrorComponent = {
  props: ['error'],
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
        <strong class="font-bold">読み込みエラー</strong>
        <span class="block sm:inline">コンポーネントの読み込み中にエラーが発生しました。</span>
        <div class="mt-2">
          <button
            @click="() => window.location.reload()"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            リロード
          </button>
        </div>
      </div>
    </div>
  `
}

/**
 * Enhanced lazy component loader with proper error handling
 */
export function lazyComponent(importFn, options = {}) {
  const {
    loadingComponent = LoadingComponent,
    errorComponent = ErrorComponent,
    delay = 200,
    timeout = 10000,
    retries = 3,
    componentName = 'Unknown Component'
  } = options

  return defineAsyncComponent({
    loader: async () => {
      isLoading.value = true
      loadingComponent.value = componentName

      let lastError = null

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          logger.log(`🔄 Loading component: ${componentName} (attempt ${attempt}/${retries})`)

          const module = await importFn()

          isLoading.value = false
          loadingComponent.value = null

          logger.log(`✅ Component loaded: ${componentName}`)
          return module

        } catch (error) {
          lastError = error
          logger.warn(`❌ Failed to load ${componentName} (attempt ${attempt}/${retries}):`, error)

          if (attempt < retries) {
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      isLoading.value = false
      loadingComponent.value = null

      logger.error(`❌ Component failed to load after ${retries} attempts: ${componentName}`, lastError)
      throw lastError
    },
    loadingComponent,
    errorComponent,
    delay,
    timeout
  })
}

/**
 * Pre-defined lazy loaders for common component types
 */
export const LazyLoaders = {
  // Game components
  game: (path, name) => lazyComponent(
    () => import(`@/components/games/${path}.vue`),
    { componentName: `Game: ${name}`, timeout: 15000 }
  ),

  // UI components
  ui: (path, name) => lazyComponent(
    () => import(`@/components/ui/${path}.vue`),
    { componentName: `UI: ${name}` }
  ),

  // Teacher components
  teacher: (path, name) => lazyComponent(
    () => import(`@/components/teacher/${path}.vue`),
    { componentName: `Teacher: ${name}` }
  ),

  // Grammar components
  grammar: (path, name) => lazyComponent(
    () => import(`@/components/games/grammar-galaxy/${path}.vue`),
    { componentName: `Grammar: ${name}` }
  ),

  // View components
  view: (path, name) => lazyComponent(
    () => import(`@/views/${path}.vue`),
    { componentName: `View: ${name}`, timeout: 15000 }
  ),

  // Cooperative components
  cooperative: (path, name) => lazyComponent(
    () => import(`@/components/cooperative/${path}.vue`),
    { componentName: `Cooperative: ${name}` }
  )
}

/**
 * Preload critical components
 */
export async function preloadCriticalComponents() {
  const criticalComponents = [
    () => import('@/views/HomeView.vue'),
    () => import('@/components/platforms/PhonicsAdventure.vue'),
    () => import('@/views/GrammarGalaxyHub.vue'),
    () => import('@/components/CommonFooter.vue')
  ]

  logger.log('🚀 Preloading critical components...')

  try {
    await Promise.all(criticalComponents.map(loader => loader()))
    logger.log('✅ Critical components preloaded')
  } catch (error) {
    logger.warn('⚠️ Some critical components failed to preload:', error)
  }
}

/**
 * Component registry for tracking loaded components
 */
export class ComponentRegistry {
  constructor() {
    this.loaded = new Set()
    this.loading = new Set()
    this.failed = new Set()
  }

  markAsLoaded(componentName) {
    this.loaded.add(componentName)
    this.loading.delete(componentName)
  }

  markAsLoading(componentName) {
    this.loading.add(componentName)
  }

  markAsFailed(componentName) {
    this.failed.add(componentName)
    this.loading.delete(componentName)
  }

  getStats() {
    return {
      loaded: this.loaded.size,
      loading: this.loading.size,
      failed: this.failed.size,
      loadedComponents: Array.from(this.loaded),
      failedComponents: Array.from(this.failed)
    }
  }
}

export const componentRegistry = new ComponentRegistry()

export default lazyComponent