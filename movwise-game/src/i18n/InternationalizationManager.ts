import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import logger from '@/utils/logger'

// Internationalization types
export interface I18nSettings {
  currentLanguage: string
  fallbackLanguage: string
  rtlLanguages: string[]
  supportedLanguages: SupportedLanguage[]
  dateTimeFormat: DateTimeFormatConfig
  numberFormat: NumberFormatConfig
  pluralizationRules: Map<string, PluralizationRule>
  localeSpecificSettings: Map<string, LocaleSettings>
}

export interface SupportedLanguage {
  code: string // ISO 639-1 code
  name: string
  nativeName: string
  region?: string // ISO 3166-1 alpha-2 code
  script?: string // ISO 15924 code
  direction: 'ltr' | 'rtl'
  completeness: number // 0-100% translation completeness
  translators: string[]
  lastUpdated: Date
  culturalNotes?: string[]
}

export interface DateTimeFormatConfig {
  dateStyle: 'full' | 'long' | 'medium' | 'short'
  timeStyle: 'full' | 'long' | 'medium' | 'short'
  calendar?: string
  numberingSystem?: string
  timezone?: string
  use12Hour?: boolean
}

export interface NumberFormatConfig {
  style: 'decimal' | 'currency' | 'percent'
  currency?: string
  currencyDisplay?: 'symbol' | 'code' | 'name'
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

export interface PluralizationRule {
  language: string
  rule: (count: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
  categories: string[]
}

export interface LocaleSettings {
  language: string
  culturalContext: CulturalContext
  educationalPreferences: EducationalPreferences
  uiCustomizations: UICustomizations
  contentAdaptations: ContentAdaptations
}

export interface CulturalContext {
  formalityLevel: 'very_formal' | 'formal' | 'neutral' | 'casual' | 'very_casual'
  honorifics: boolean
  genderNeutralLanguage: boolean
  culturalReferences: boolean
  localCustoms: boolean
  religiousConsiderations: string[]
  socialNorms: string[]
}

export interface EducationalPreferences {
  explainCultureDiffs: boolean
  showEtymology: boolean
  provideContext: boolean
  useLocalExamples: boolean
  adjustDifficulty: 'automatic' | 'manual'
  preferredExplanationStyle: 'detailed' | 'concise' | 'visual'
}

export interface UICustomizations {
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  textDirection: 'ltr' | 'rtl'
  layoutAdjustments: LayoutAdjustment[]
  iconCustomizations: IconCustomization[]
  colorSchemeAdjustments: ColorSchemeAdjustment[]
}

export interface LayoutAdjustment {
  component: string
  property: string
  value: any
  reason: string
}

export interface IconCustomization {
  iconId: string
  replacement?: string
  culturalReason: string
}

export interface ColorSchemeAdjustment {
  property: string
  originalColor: string
  adjustedColor: string
  culturalReason: string
}

export interface ContentAdaptations {
  charactersLocalizations: Map<string, CharacterLocalization>
  storyAdaptations: StoryAdaptation[]
  culturalNotes: CulturalNote[]
  localizedAssets: Map<string, string>
}

export interface CharacterLocalization {
  characterId: string
  localizedName?: string
  culturalBackground?: string
  personalityAdjustments?: string[]
  speechPatterns?: SpeechPattern[]
  visualAdjustments?: VisualAdjustment[]
}

export interface SpeechPattern {
  pattern: string
  description: string
  examples: string[]
  culturalSignificance: string
}

export interface VisualAdjustment {
  aspect: string
  description: string
  culturalReason: string
}

export interface StoryAdaptation {
  storyId: string
  adaptationType: 'cultural_reference' | 'local_context' | 'educational_approach' | 'content_sensitivity'
  originalContent: string
  adaptedContent: string
  reason: string
  reviewRequired: boolean
}

export interface CulturalNote {
  id: string
  trigger: string
  category: 'language' | 'culture' | 'etiquette' | 'history' | 'education'
  content: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  showByDefault: boolean
}

// Translation and localization
export interface TranslationKey {
  key: string
  defaultText: string
  context?: string
  variables?: string[]
  pluralization?: boolean
  characterLimit?: number
  translatorNotes?: string
}

export interface TranslationEntry {
  key: string
  language: string
  translation: string
  context?: string
  status: 'draft' | 'review' | 'approved' | 'outdated'
  translator: string
  reviewer?: string
  lastModified: Date
  version: number
}

export interface NamespaceTranslations {
  namespace: string
  translations: Map<string, Map<string, TranslationEntry>>
}

/**
 * Internationalization Manager
 * Comprehensive i18n system with cultural awareness
 */
export class InternationalizationManager {
  private settings = useStorage<I18nSettings>('language_galaxy_i18n', this.getDefaultSettings())
  private translations = ref<Map<string, NamespaceTranslations>>(new Map())
  private currentLocale = ref<Intl.Locale | null>(null)
  private fallbackTranslations = ref<Map<string, string>>(new Map())
  private missingTranslations = ref<Set<string>>(new Set())
  private rtlStylesheet = ref<HTMLStyleElement | null>(null)

  constructor() {
    this.initializeI18n()
    this.loadTranslations()
    this.setupLanguageDetection()
  }

  /**
   * Initialize i18n system
   */
  private async initializeI18n(): Promise<void> {
    // Set up current locale
    this.updateLocale(this.settings.value.currentLanguage)

    // Apply RTL if needed
    this.applyTextDirection()

    // Load cultural settings
    this.applyCulturalSettings()

    // Set up watchers
    this.setupWatchers()

    logger.log('Internationalization Manager initialized')
  }

  /**
   * Update current locale
   */
  private updateLocale(languageCode: string): void {
    try {
      const supportedLang = this.settings.value.supportedLanguages.find(l => l.code === languageCode)
      if (supportedLang) {
        const localeString = supportedLang.region 
          ? `${languageCode}-${supportedLang.region}`
          : languageCode

        this.currentLocale.value = new Intl.Locale(localeString)
        this.settings.value.currentLanguage = languageCode
      }
    } catch (error) {
      logger.error('Failed to set locale:', error)
      this.fallbackToDefault()
    }
  }

  /**
   * Get translation for key
   */
  public t(key: string, variables?: Record<string, any>, namespace: string = 'common'): string {
    const translation = this.getTranslation(key, namespace)
    
    if (!translation) {
      this.missingTranslations.value.add(`${namespace}:${key}`)
      return this.getFallbackTranslation(key) || key
    }

    return this.interpolateVariables(translation, variables)
  }

  /**
   * Get translation with pluralization
   */
  public tp(key: string, count: number, variables?: Record<string, any>, namespace: string = 'common'): string {
    const pluralRule = this.getPluralRule(this.settings.value.currentLanguage)
    const pluralForm = pluralRule ? pluralRule.rule(count) : 'other'
    
    const pluralKey = `${key}.${pluralForm}`
    let translation = this.getTranslation(pluralKey, namespace)
    
    if (!translation) {
      // Fall back to base key
      translation = this.getTranslation(key, namespace)
    }
    
    if (!translation) {
      this.missingTranslations.value.add(`${namespace}:${pluralKey}`)
      return this.getFallbackTranslation(key) || key
    }

    const allVariables = { ...variables, count }
    return this.interpolateVariables(translation, allVariables)
  }

  /**
   * Get localized date format
   */
  public formatDate(date: Date, options?: Partial<DateTimeFormatConfig>): string {
    if (!this.currentLocale.value) return date.toLocaleDateString()

    const formatOptions = {
      ...this.settings.value.dateTimeFormat,
      ...options
    }

    try {
      return new Intl.DateTimeFormat(this.currentLocale.value, formatOptions).format(date)
    } catch (error) {
      logger.error('Date formatting error:', error)
      return date.toLocaleDateString()
    }
  }

  /**
   * Get localized number format
   */
  public formatNumber(number: number, options?: Partial<NumberFormatConfig>): string {
    if (!this.currentLocale.value) return number.toString()

    const formatOptions = {
      ...this.settings.value.numberFormat,
      ...options
    }

    try {
      return new Intl.NumberFormat(this.currentLocale.value, formatOptions).format(number)
    } catch (error) {
      logger.error('Number formatting error:', error)
      return number.toString()
    }
  }

  /**
   * Get localized currency format
   */
  public formatCurrency(amount: number, currency?: string): string {
    const currencyCode = currency || this.settings.value.numberFormat.currency || 'USD'
    
    return this.formatNumber(amount, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol'
    })
  }

  /**
   * Change language
   */
  public async changeLanguage(languageCode: string): Promise<boolean> {
    const supportedLanguage = this.settings.value.supportedLanguages.find(l => l.code === languageCode)
    
    if (!supportedLanguage) {
      logger.error(`Language ${languageCode} is not supported`)
      return false
    }

    // Load translations for new language
    await this.loadLanguageTranslations(languageCode)

    // Update locale
    this.updateLocale(languageCode)

    // Apply RTL/LTR
    this.applyTextDirection()

    // Apply cultural settings
    this.applyCulturalSettings()

    // Notify language change
    this.notifyLanguageChange(languageCode)

    return true
  }

  /**
   * Apply text direction (RTL/LTR)
   */
  private applyTextDirection(): void {
    const currentLang = this.getCurrentLanguage()
    const isRTL = this.settings.value.rtlLanguages.includes(currentLang.code)
    
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = currentLang.code

    // Apply RTL styles if needed
    if (isRTL) {
      this.loadRTLStyles()
    } else {
      this.removeRTLStyles()
    }
  }

  /**
   * Load RTL specific styles
   */
  private loadRTLStyles(): void {
    if (this.rtlStylesheet.value) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/css/rtl.css'
    link.onload = () => {
      document.body.classList.add('rtl-layout')
    }
    
    document.head.appendChild(link)
    this.rtlStylesheet.value = link as any
  }

  /**
   * Remove RTL styles
   */
  private removeRTLStyles(): void {
    if (this.rtlStylesheet.value) {
      document.head.removeChild(this.rtlStylesheet.value)
      this.rtlStylesheet.value = null
    }
    document.body.classList.remove('rtl-layout')
  }

  /**
   * Apply cultural settings
   */
  private applyCulturalSettings(): void {
    const currentLang = this.getCurrentLanguage()
    const localeSettings = this.settings.value.localeSpecificSettings.get(currentLang.code)
    
    if (!localeSettings) return

    // Apply UI customizations
    this.applyUICustomizations(localeSettings.uiCustomizations)

    // Apply cultural context
    this.applyCulturalContext(localeSettings.culturalContext)
  }

  /**
   * Apply UI customizations for locale
   */
  private applyUICustomizations(customizations: UICustomizations): void {
    const root = document.documentElement

    // Font customizations
    if (customizations.fontFamily) {
      root.style.setProperty('--font-family-locale', customizations.fontFamily)
    }

    if (customizations.fontSize) {
      root.style.setProperty('--font-size-locale', `${customizations.fontSize}px`)
    }

    if (customizations.lineHeight) {
      root.style.setProperty('--line-height-locale', customizations.lineHeight.toString())
    }

    // Layout adjustments
    customizations.layoutAdjustments.forEach(adjustment => {
      root.style.setProperty(`--${adjustment.property}`, adjustment.value)
    })

    // Color scheme adjustments
    customizations.colorSchemeAdjustments.forEach(adjustment => {
      root.style.setProperty(`--${adjustment.property}`, adjustment.adjustedColor)
    })
  }

  /**
   * Apply cultural context settings
   */
  private applyCulturalContext(context: CulturalContext): void {
    // Store cultural context for use in components
    document.documentElement.setAttribute('data-formality-level', context.formalityLevel)
    document.documentElement.setAttribute('data-use-honorifics', context.honorifics.toString())
    document.documentElement.setAttribute('data-gender-neutral', context.genderNeutralLanguage.toString())
  }

  /**
   * Get character localization
   */
  public getCharacterLocalization(characterId: string): CharacterLocalization | null {
    const currentLang = this.getCurrentLanguage()
    const localeSettings = this.settings.value.localeSpecificSettings.get(currentLang.code)
    
    if (!localeSettings) return null

    return localeSettings.contentAdaptations.charactersLocalizations.get(characterId) || null
  }

  /**
   * Get cultural notes for context
   */
  public getCulturalNotes(trigger: string): CulturalNote[] {
    const currentLang = this.getCurrentLanguage()
    const localeSettings = this.settings.value.localeSpecificSettings.get(currentLang.code)
    
    if (!localeSettings) return []

    return localeSettings.contentAdaptations.culturalNotes.filter(note => 
      note.trigger === trigger || note.trigger === '*'
    )
  }

  /**
   * Detect browser language
   */
  private setupLanguageDetection(): void {
    const browserLanguages = navigator.languages || [navigator.language]
    const supportedCodes = this.settings.value.supportedLanguages.map(l => l.code)
    
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0]
      if (supportedCodes.includes(langCode)) {
        if (this.settings.value.currentLanguage === 'auto') {
          this.changeLanguage(langCode)
        }
        break
      }
    }
  }

  /**
   * Load translations for language
   */
  private async loadLanguageTranslations(languageCode: string): Promise<void> {
    try {
      // Load common translations
      const commonTranslations = await this.fetchTranslations('common', languageCode)
      this.storeTranslations('common', languageCode, commonTranslations)

      // Load UI translations
      const uiTranslations = await this.fetchTranslations('ui', languageCode)
      this.storeTranslations('ui', languageCode, uiTranslations)

      // Load story translations
      const storyTranslations = await this.fetchTranslations('story', languageCode)
      this.storeTranslations('story', languageCode, storyTranslations)

      // Load game translations
      const gameTranslations = await this.fetchTranslations('game', languageCode)
      this.storeTranslations('game', languageCode, gameTranslations)

    } catch (error) {
      logger.error(`Failed to load translations for ${languageCode}:`, error)
    }
  }

  /**
   * Load all translations
   */
  private async loadTranslations(): Promise<void> {
    const currentLang = this.settings.value.currentLanguage
    await this.loadLanguageTranslations(currentLang)
    
    // Load fallback language if different
    if (currentLang !== this.settings.value.fallbackLanguage) {
      await this.loadLanguageTranslations(this.settings.value.fallbackLanguage)
    }
  }

  /**
   * Fetch translations from server/files
   */
  private async fetchTranslations(namespace: string, languageCode: string): Promise<Record<string, string>> {
    try {
      const response = await fetch(`/locales/${languageCode}/${namespace}.json`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      logger.warn(`Failed to fetch ${namespace} translations for ${languageCode}:`, error)
      return {}
    }
  }

  /**
   * Store translations in memory
   */
  private storeTranslations(namespace: string, languageCode: string, translations: Record<string, string>): void {
    let namespaceTranslations = this.translations.value.get(namespace)
    if (!namespaceTranslations) {
      namespaceTranslations = {
        namespace,
        translations: new Map()
      }
      this.translations.value.set(namespace, namespaceTranslations)
    }

    const langTranslations = new Map<string, TranslationEntry>()
    Object.entries(translations).forEach(([key, translation]) => {
      langTranslations.set(key, {
        key,
        language: languageCode,
        translation,
        status: 'approved',
        translator: 'system',
        lastModified: new Date(),
        version: 1
      })
    })

    namespaceTranslations.translations.set(languageCode, langTranslations)
  }

  /**
   * Get translation from memory
   */
  private getTranslation(key: string, namespace: string): string | null {
    const currentLang = this.settings.value.currentLanguage
    const namespaceTranslations = this.translations.value.get(namespace)
    
    if (!namespaceTranslations) return null

    const langTranslations = namespaceTranslations.translations.get(currentLang)
    if (!langTranslations) return null

    const entry = langTranslations.get(key)
    return entry ? entry.translation : null
  }

  /**
   * Get fallback translation
   */
  private getFallbackTranslation(key: string): string | null {
    const fallbackLang = this.settings.value.fallbackLanguage
    // Try to get from fallback language
    // This is a simplified implementation
    return this.fallbackTranslations.value.get(key) || null
  }

  /**
   * Interpolate variables in translation
   */
  private interpolateVariables(translation: string, variables?: Record<string, any>): string {
    if (!variables) return translation

    return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match
    })
  }

  /**
   * Get plural rule for language
   */
  private getPluralRule(languageCode: string): PluralizationRule | null {
    return this.settings.value.pluralizationRules.get(languageCode) || null
  }

  /**
   * Setup watchers for reactive updates
   */
  private setupWatchers(): void {
    watch(() => this.settings.value.currentLanguage, (newLang) => {
      this.changeLanguage(newLang)
    })
  }

  /**
   * Notify components of language change
   */
  private notifyLanguageChange(languageCode: string): void {
    const event = new CustomEvent('languageChanged', {
      detail: { language: languageCode }
    })
    window.dispatchEvent(event)
  }

  /**
   * Fallback to default language
   */
  private fallbackToDefault(): void {
    const defaultLang = this.settings.value.supportedLanguages[0]
    if (defaultLang) {
      this.updateLocale(defaultLang.code)
    }
  }

  /**
   * Get current language info
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.settings.value.supportedLanguages.find(
      l => l.code === this.settings.value.currentLanguage
    ) || this.settings.value.supportedLanguages[0]
  }

  /**
   * Get default i18n settings
   */
  private getDefaultSettings(): I18nSettings {
    return {
      currentLanguage: 'ja',
      fallbackLanguage: 'en',
      rtlLanguages: ['ar', 'he', 'fa', 'ur'],
      supportedLanguages: [
        {
          code: 'ja',
          name: 'Japanese',
          nativeName: '日本語',
          region: 'JP',
          direction: 'ltr',
          completeness: 100,
          translators: ['Native Team'],
          lastUpdated: new Date(),
          culturalNotes: ['Honorific system important', 'Formal vs casual contexts']
        },
        {
          code: 'en',
          name: 'English',
          nativeName: 'English',
          region: 'US',
          direction: 'ltr',
          completeness: 100,
          translators: ['Native Team'],
          lastUpdated: new Date()
        },
        {
          code: 'ko',
          name: 'Korean',
          nativeName: '한국어',
          region: 'KR',
          direction: 'ltr',
          completeness: 95,
          translators: ['Community'],
          lastUpdated: new Date(),
          culturalNotes: ['Honorific levels crucial', 'Age-based speech patterns']
        },
        {
          code: 'zh',
          name: 'Chinese',
          nativeName: '中文',
          region: 'CN',
          script: 'Hans',
          direction: 'ltr',
          completeness: 90,
          translators: ['Community'],
          lastUpdated: new Date()
        },
        {
          code: 'es',
          name: 'Spanish',
          nativeName: 'Español',
          region: 'ES',
          direction: 'ltr',
          completeness: 85,
          translators: ['Community'],
          lastUpdated: new Date()
        },
        {
          code: 'fr',
          name: 'French',
          nativeName: 'Français',
          region: 'FR',
          direction: 'ltr',
          completeness: 80,
          translators: ['Community'],
          lastUpdated: new Date()
        },
        {
          code: 'de',
          name: 'German',
          nativeName: 'Deutsch',
          region: 'DE',
          direction: 'ltr',
          completeness: 75,
          translators: ['Community'],
          lastUpdated: new Date()
        },
        {
          code: 'ar',
          name: 'Arabic',
          nativeName: 'العربية',
          region: 'SA',
          direction: 'rtl',
          completeness: 70,
          translators: ['Community'],
          lastUpdated: new Date(),
          culturalNotes: ['RTL layout', 'Cultural sensitivities important']
        }
      ],
      dateTimeFormat: {
        dateStyle: 'medium',
        timeStyle: 'short'
      },
      numberFormat: {
        style: 'decimal',
        useGrouping: true
      },
      pluralizationRules: new Map([
        ['en', {
          language: 'en',
          rule: (count: number) => count === 1 ? 'one' : 'other',
          categories: ['one', 'other']
        }],
        ['ja', {
          language: 'ja',
          rule: () => 'other',
          categories: ['other']
        }],
        ['ko', {
          language: 'ko',
          rule: () => 'other',
          categories: ['other']
        }],
        ['zh', {
          language: 'zh',
          rule: () => 'other',
          categories: ['other']
        }],
        ['ar', {
          language: 'ar',
          rule: (count: number) => {
            if (count === 0) return 'zero'
            if (count === 1) return 'one'
            if (count === 2) return 'two'
            if (count >= 3 && count <= 10) return 'few'
            if (count >= 11 && count <= 99) return 'many'
            return 'other'
          },
          categories: ['zero', 'one', 'two', 'few', 'many', 'other']
        }]
      ]),
      localeSpecificSettings: new Map([
        ['ja', {
          language: 'ja',
          culturalContext: {
            formalityLevel: 'formal',
            honorifics: true,
            genderNeutralLanguage: false,
            culturalReferences: true,
            localCustoms: true,
            religiousConsiderations: ['Buddhist', 'Shinto'],
            socialNorms: ['Respect for age', 'Group harmony']
          },
          educationalPreferences: {
            explainCultureDiffs: true,
            showEtymology: true,
            provideContext: true,
            useLocalExamples: true,
            adjustDifficulty: 'automatic',
            preferredExplanationStyle: 'detailed'
          },
          uiCustomizations: {
            textDirection: 'ltr',
            layoutAdjustments: [],
            iconCustomizations: [],
            colorSchemeAdjustments: []
          },
          contentAdaptations: {
            charactersLocalizations: new Map(),
            storyAdaptations: [],
            culturalNotes: [],
            localizedAssets: new Map()
          }
        }])
      ])
    }
  }

  // Public API methods
  public getSettings(): I18nSettings {
    return this.settings.value
  }

  public getSupportedLanguages(): SupportedLanguage[] {
    return this.settings.value.supportedLanguages
  }

  public getMissingTranslations(): string[] {
    return Array.from(this.missingTranslations.value)
  }

  public clearMissingTranslations(): void {
    this.missingTranslations.value.clear()
  }

  public addTranslation(namespace: string, key: string, language: string, translation: string): void {
    let namespaceTranslations = this.translations.value.get(namespace)
    if (!namespaceTranslations) {
      namespaceTranslations = {
        namespace,
        translations: new Map()
      }
      this.translations.value.set(namespace, namespaceTranslations)
    }

    let langTranslations = namespaceTranslations.translations.get(language)
    if (!langTranslations) {
      langTranslations = new Map()
      namespaceTranslations.translations.set(language, langTranslations)
    }

    langTranslations.set(key, {
      key,
      language,
      translation,
      status: 'draft',
      translator: 'user',
      lastModified: new Date(),
      version: 1
    })
  }

  public exportTranslations(namespace: string, language: string): Record<string, string> {
    const namespaceTranslations = this.translations.value.get(namespace)
    if (!namespaceTranslations) return {}

    const langTranslations = namespaceTranslations.translations.get(language)
    if (!langTranslations) return {}

    const exported: Record<string, string> = {}
    langTranslations.forEach((entry, key) => {
      exported[key] = entry.translation
    })

    return exported
  }

  // Computed properties
  public get currentLanguageCode(): string {
    return this.settings.value.currentLanguage
  }

  public get isRTL(): boolean {
    return this.settings.value.rtlLanguages.includes(this.settings.value.currentLanguage)
  }

  public get locale(): Intl.Locale | null {
    return this.currentLocale.value
  }
}

// Export singleton instance
export const i18nManager = new InternationalizationManager()
export default i18nManager

// Vue composable for easy access
export function useI18n() {
  return {
    t: i18nManager.t.bind(i18nManager),
    tp: i18nManager.tp.bind(i18nManager),
    formatDate: i18nManager.formatDate.bind(i18nManager),
    formatNumber: i18nManager.formatNumber.bind(i18nManager),
    formatCurrency: i18nManager.formatCurrency.bind(i18nManager),
    changeLanguage: i18nManager.changeLanguage.bind(i18nManager),
    getCurrentLanguage: i18nManager.getCurrentLanguage.bind(i18nManager),
    isRTL: computed(() => i18nManager.isRTL),
    currentLanguage: computed(() => i18nManager.currentLanguageCode)
  }
}