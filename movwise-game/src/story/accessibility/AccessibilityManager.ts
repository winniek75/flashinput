import { ref, computed, watch } from 'vue'
import { useStorage, usePreferredColorScheme, usePreferredReducedMotion } from '@vueuse/core'
import logger from '@/utils/logger'

// Accessibility types
export interface AccessibilitySettings {
  visualSettings: VisualAccessibilitySettings
  auditorySettings: AuditoryAccessibilitySettings
  motorSettings: MotorAccessibilitySettings
  cognitiveSettings: CognitiveAccessibilitySettings
  screenReaderSettings: ScreenReaderSettings
  colorBlindnessSupport: ColorBlindnessSettings
  dyslexiaSupport: DyslexiaSettings
}

export interface VisualAccessibilitySettings {
  fontSize: number // 12-48px
  fontFamily: 'default' | 'dyslexia' | 'high_contrast' | 'sans_serif'
  lineHeight: number // 1.2-2.0
  letterSpacing: number // 0-0.2em
  contrast: 'normal' | 'high' | 'maximum'
  colorScheme: 'auto' | 'light' | 'dark'
  reduceMotion: boolean
  flashingContent: 'allow' | 'reduce' | 'disable'
  textOutline: boolean
  backgroundOpacity: number // 0-100
  cursorSize: 'small' | 'medium' | 'large' | 'extra_large'
  focusIndicator: 'default' | 'enhanced' | 'high_visibility'
}

export interface AuditoryAccessibilitySettings {
  soundEnabled: boolean
  musicEnabled: boolean
  voiceEnabled: boolean
  soundEffectsEnabled: boolean
  captionsEnabled: boolean
  captionStyle: CaptionStyle
  audioDescription: boolean
  hearingAssistMode: boolean
  frequencyFilter: FrequencyFilter
  volumeBoost: number // 0-200%
  speechRate: number // 0.5-2.0x
  audioFocus: boolean // Reduces background audio during dialogue
}

export interface MotorAccessibilitySettings {
  inputMode: 'mouse' | 'keyboard' | 'gamepad' | 'touch' | 'eye_tracking' | 'switch'
  keyboardNavigation: boolean
  mouseSensitivity: number // 0.1-3.0
  clickHoldDuration: number // ms
  doubleClickDelay: number // ms
  dragThreshold: number // pixels
  virtualKeyboard: boolean
  stickyKeys: boolean
  slowKeys: boolean
  bounceKeys: boolean
  oneHandedMode: boolean
  gestureSimplification: boolean
}

export interface CognitiveAccessibilitySettings {
  readingSpeed: 'very_slow' | 'slow' | 'normal' | 'fast'
  complexityLevel: 'simple' | 'moderate' | 'complex'
  timeExtension: number // Percentage extension for timed activities
  memoryAids: boolean
  navigationHelp: boolean
  progressIndicators: boolean
  confirmationDialogs: boolean
  errorPrevention: boolean
  consistentLayout: boolean
  clearInstructions: boolean
  languageSimplification: boolean
}

export interface ScreenReaderSettings {
  enabled: boolean
  provider: 'system' | 'built_in'
  verbosity: 'minimal' | 'normal' | 'detailed'
  announceChanges: boolean
  describeImages: boolean
  skipToContent: boolean
  landmarkNavigation: boolean
  headingNavigation: boolean
  liveRegionPoliteness: 'off' | 'polite' | 'assertive'
  tableNavigation: boolean
  speechRate: number // 0.5-3.0x
  speechPitch: number // 0.5-2.0x
  speechVolume: number // 0-100
}

export interface ColorBlindnessSettings {
  type: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'
  severity: 'mild' | 'moderate' | 'severe'
  colorCorrection: boolean
  alternativeIndicators: boolean
  patternOverlays: boolean
  customColorPalette: string[]
}

export interface DyslexiaSettings {
  fontEnabled: boolean
  fontFamily: string
  characterSpacing: number
  wordSpacing: number
  lineSpacing: number
  backgroundColor: string
  textColor: string
  syllableHighlighting: boolean
  phonemeHighlighting: boolean
  readingGuide: boolean
  wordPrediction: boolean
}

export interface CaptionStyle {
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  outline: boolean
  outlineColor: string
  position: 'bottom' | 'top' | 'center'
  alignment: 'left' | 'center' | 'right'
  opacity: number
}

export interface FrequencyFilter {
  lowCut: number // Hz
  highCut: number // Hz
  boost: number[] // Per frequency band
}

// Live region for screen reader announcements
export interface LiveRegion {
  id: string
  politeness: 'off' | 'polite' | 'assertive'
  atomic: boolean
  relevant: 'additions' | 'removals' | 'text' | 'all'
  busy: boolean
}

// Focus management
export interface FocusManager {
  currentFocus: HTMLElement | null
  focusHistory: HTMLElement[]
  skipLinks: HTMLElement[]
  focusTrap: HTMLElement | null
}

/**
 * Accessibility Manager
 * Comprehensive accessibility support system
 */
export class AccessibilityManager {
  private settings = useStorage<AccessibilitySettings>('language_galaxy_accessibility', this.getDefaultSettings())
  private liveRegions = ref<Map<string, LiveRegion>>(new Map())
  private focusManager = ref<FocusManager>({
    currentFocus: null,
    focusHistory: [],
    skipLinks: [],
    focusTrap: null
  })
  private speechSynthesis = ref<SpeechSynthesis | null>(null)
  private currentUtterance = ref<SpeechSynthesisUtterance | null>(null)
  private isInitialized = ref(false)

  constructor() {
    this.initializeAccessibility()
    this.setupEventListeners()
    this.applySystemPreferences()
  }

  /**
   * Initialize accessibility systems
   */
  private async initializeAccessibility(): Promise<void> {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      this.speechSynthesis.value = window.speechSynthesis
    }

    // Setup screen reader support
    this.initializeScreenReader()

    // Setup live regions
    this.createLiveRegions()

    // Setup focus management
    this.initializeFocusManagement()

    // Apply current settings
    this.applySettings()

    this.isInitialized.value = true
    logger.log('Accessibility Manager initialized')
  }

  /**
   * Initialize screen reader support
   */
  private initializeScreenReader(): void {
    if (!this.settings.value.screenReaderSettings.enabled) return

    // Create skip links
    this.createSkipLinks()

    // Setup ARIA live regions
    this.setupAriaLiveRegions()

    // Initialize navigation helpers
    this.initializeNavigationHelpers()
  }

  /**
   * Create skip navigation links
   */
  private createSkipLinks(): void {
    const skipContainer = document.createElement('div')
    skipContainer.className = 'skip-links'
    skipContainer.style.cssText = `
      position: fixed;
      top: -100px;
      left: 0;
      z-index: 10000;
      background: #000;
      color: #fff;
      padding: 8px;
    `

    const skipToContent = this.createSkipLink('メインコンテンツにスキップ', '#main-content')
    const skipToNavigation = this.createSkipLink('ナビゲーションにスキップ', '#main-navigation')
    const skipToFooter = this.createSkipLink('フッターにスキップ', '#footer')

    skipContainer.appendChild(skipToContent)
    skipContainer.appendChild(skipToNavigation)
    skipContainer.appendChild(skipToFooter)

    document.body.insertBefore(skipContainer, document.body.firstChild)
  }

  /**
   * Create individual skip link
   */
  private createSkipLink(text: string, target: string): HTMLAnchorElement {
    const link = document.createElement('a')
    link.href = target
    link.textContent = text
    link.className = 'skip-link'
    link.style.cssText = `
      display: block;
      padding: 8px 16px;
      color: #fff;
      text-decoration: none;
      border: 1px solid #fff;
      margin: 2px;
    `

    link.addEventListener('focus', () => {
      link.parentElement!.style.top = '0'
    })

    link.addEventListener('blur', () => {
      link.parentElement!.style.top = '-100px'
    })

    return link
  }

  /**
   * Setup ARIA live regions
   */
  private setupAriaLiveRegions(): void {
    const regions = [
      { id: 'announcements', politeness: 'polite' as const },
      { id: 'status', politeness: 'polite' as const },
      { id: 'alerts', politeness: 'assertive' as const },
      { id: 'log', politeness: 'polite' as const }
    ]

    regions.forEach(region => {
      this.createLiveRegion(region.id, region.politeness)
    })
  }

  /**
   * Create live region for announcements
   */
  private createLiveRegion(id: string, politeness: LiveRegion['politeness']): void {
    const element = document.createElement('div')
    element.id = `live-region-${id}`
    element.setAttribute('aria-live', politeness)
    element.setAttribute('aria-atomic', 'true')
    element.className = 'sr-only'
    element.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    `

    document.body.appendChild(element)

    this.liveRegions.value.set(id, {
      id,
      politeness,
      atomic: true,
      relevant: 'all',
      busy: false
    })
  }

  /**
   * Announce message to screen readers
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const regionId = priority === 'assertive' ? 'alerts' : 'announcements'
    const element = document.getElementById(`live-region-${regionId}`)
    
    if (element) {
      // Clear previous message
      element.textContent = ''
      
      // Set new message after brief delay
      setTimeout(() => {
        element.textContent = message
      }, 100)
    }

    // Also use speech synthesis if enabled
    if (this.settings.value.auditorySettings.voiceEnabled) {
      this.speak(message)
    }
  }

  /**
   * Speak text using speech synthesis
   */
  public speak(text: string, options?: Partial<SpeechSynthesisUtterance>): void {
    if (!this.speechSynthesis.value || !this.settings.value.auditorySettings.voiceEnabled) return

    // Cancel current speech
    this.speechSynthesis.value.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voiceSettings = this.settings.value.screenReaderSettings

    utterance.rate = voiceSettings.speechRate
    utterance.pitch = voiceSettings.speechPitch
    utterance.volume = voiceSettings.speechVolume / 100

    // Apply custom options
    if (options) {
      Object.assign(utterance, options)
    }

    this.currentUtterance.value = utterance
    this.speechSynthesis.value.speak(utterance)
  }

  /**
   * Stop current speech
   */
  public stopSpeaking(): void {
    if (this.speechSynthesis.value) {
      this.speechSynthesis.value.cancel()
    }
  }

  /**
   * Apply visual accessibility settings
   */
  private applyVisualSettings(): void {
    const visual = this.settings.value.visualSettings
    const root = document.documentElement

    // Font settings
    root.style.setProperty('--font-size-base', `${visual.fontSize}px`)
    root.style.setProperty('--line-height-base', visual.lineHeight.toString())
    root.style.setProperty('--letter-spacing-base', `${visual.letterSpacing}em`)

    // Color scheme
    root.setAttribute('data-color-scheme', visual.colorScheme)
    root.setAttribute('data-contrast', visual.contrast)

    // Motion preferences
    if (visual.reduceMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.style.setProperty('--transition-duration', '0.01ms')
    }

    // Focus indicator
    root.setAttribute('data-focus-style', visual.focusIndicator)

    // Apply font family
    this.applyFontFamily(visual.fontFamily)
  }

  /**
   * Apply font family
   */
  private applyFontFamily(fontFamily: VisualAccessibilitySettings['fontFamily']): void {
    const fontMap = {
      'default': 'system-ui, -apple-system, sans-serif',
      'dyslexia': 'OpenDyslexic, Arial, sans-serif',
      'high_contrast': 'Arial Black, Arial, sans-serif',
      'sans_serif': 'Arial, Helvetica, sans-serif'
    }

    document.documentElement.style.setProperty('--font-family-base', fontMap[fontFamily])
  }

  /**
   * Apply dyslexia support settings
   */
  private applyDyslexiaSettings(): void {
    const dyslexia = this.settings.value.dyslexiaSupport
    if (!dyslexia.fontEnabled) return

    const root = document.documentElement

    root.style.setProperty('--dyslexia-character-spacing', `${dyslexia.characterSpacing}em`)
    root.style.setProperty('--dyslexia-word-spacing', `${dyslexia.wordSpacing}em`)
    root.style.setProperty('--dyslexia-line-spacing', dyslexia.lineSpacing.toString())
    root.style.setProperty('--dyslexia-bg-color', dyslexia.backgroundColor)
    root.style.setProperty('--dyslexia-text-color', dyslexia.textColor)

    // Apply dyslexia class
    document.body.classList.toggle('dyslexia-support', true)
  }

  /**
   * Apply color blindness support
   */
  private applyColorBlindnessSettings(): void {
    const colorBlind = this.settings.value.colorBlindnessSupport
    if (colorBlind.type === 'none') return

    document.body.classList.add(`colorblind-${colorBlind.type}`)
    
    if (colorBlind.colorCorrection) {
      this.applyColorCorrection(colorBlind.type)
    }

    if (colorBlind.alternativeIndicators) {
      document.body.classList.add('alternative-indicators')
    }
  }

  /**
   * Apply color correction filter
   */
  private applyColorCorrection(type: ColorBlindnessSettings['type']): void {
    const filters = {
      'protanopia': 'url(#protanopia-filter)',
      'deuteranopia': 'url(#deuteranopia-filter)',
      'tritanopia': 'url(#tritanopia-filter)',
      'achromatopsia': 'grayscale(100%)'
    }

    if (type !== 'none') {
      document.documentElement.style.filter = filters[type] || 'none'
    }
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    if (!this.settings.value.motorSettings.keyboardNavigation) return

    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this))
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const { key, ctrlKey, altKey, shiftKey } = event

    // Skip if in input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (key) {
      case 'Tab':
        this.handleTabNavigation(event)
        break
      case 'Enter':
      case ' ':
        this.handleActivation(event)
        break
      case 'Escape':
        this.handleEscape(event)
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event)
        break
    }

    // Keyboard shortcuts
    if (ctrlKey) {
      switch (key) {
        case 'm':
          event.preventDefault()
          this.focusMainContent()
          break
        case 'h':
          event.preventDefault()
          this.navigateToNextHeading()
          break
        case 'l':
          event.preventDefault()
          this.navigateToNextLink()
          break
      }
    }
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements()
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    
    if (event.shiftKey) {
      // Navigate backward
      const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
      focusableElements[nextIndex]?.focus()
    } else {
      // Navigate forward
      const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
      focusableElements[nextIndex]?.focus()
    }
  }

  /**
   * Get all focusable elements
   */
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  }

  /**
   * Focus management
   */
  private initializeFocusManagement(): void {
    // Track focus changes
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement
      this.focusManager.value.currentFocus = target
      this.focusManager.value.focusHistory.push(target)
      
      // Limit history size
      if (this.focusManager.value.focusHistory.length > 10) {
        this.focusManager.value.focusHistory.shift()
      }
    })

    // Setup focus trap
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && this.focusManager.value.focusTrap) {
        this.trapFocus(event, this.focusManager.value.focusTrap)
      }
    })
  }

  /**
   * Trap focus within element
   */
  private trapFocus(event: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Set focus trap
   */
  public setFocusTrap(element: HTMLElement | null): void {
    this.focusManager.value.focusTrap = element
    if (element) {
      const firstFocusable = element.querySelector(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusable?.focus()
    }
  }

  /**
   * Apply system preferences
   */
  private applySystemPreferences(): void {
    const preferredColorScheme = usePreferredColorScheme()
    const preferredReducedMotion = usePreferredReducedMotion()

    // Auto-apply system color scheme preference
    if (this.settings.value.visualSettings.colorScheme === 'auto') {
      watch(preferredColorScheme, (scheme) => {
        document.documentElement.setAttribute('data-color-scheme', scheme)
      }, { immediate: true })
    }

    // Auto-apply reduced motion preference
    watch(preferredReducedMotion, (reduceMotion) => {
      if (reduceMotion === 'reduce') {
        this.settings.value.visualSettings.reduceMotion = true
        this.applyVisualSettings()
      }
    }, { immediate: true })
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for settings changes
    watch(this.settings, () => {
      this.applySettings()
    }, { deep: true })

    // Setup keyboard navigation
    this.setupKeyboardNavigation()

    // Setup error handling
    window.addEventListener('error', (event) => {
      if (this.settings.value.cognitiveSettings.errorPrevention) {
        this.announce(`エラーが発生しました: ${event.message}`, 'assertive')
      }
    })
  }

  /**
   * Apply all accessibility settings
   */
  private applySettings(): void {
    this.applyVisualSettings()
    this.applyDyslexiaSettings()
    this.applyColorBlindnessSettings()
  }

  /**
   * Navigation helpers
   */
  private focusMainContent(): void {
    const mainContent = document.getElementById('main-content') || document.querySelector('main')
    if (mainContent) {
      (mainContent as HTMLElement).focus()
      this.announce('メインコンテンツに移動しました')
    }
  }

  private navigateToNextHeading(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const currentFocus = document.activeElement
    let nextHeading: Element | null = null

    for (let i = 0; i < headings.length; i++) {
      if (headings[i] === currentFocus && i < headings.length - 1) {
        nextHeading = headings[i + 1]
        break
      }
    }

    if (!nextHeading && headings.length > 0) {
      nextHeading = headings[0]
    }

    if (nextHeading) {
      (nextHeading as HTMLElement).focus()
      this.announce(`見出し: ${nextHeading.textContent}`)
    }
  }

  private navigateToNextLink(): void {
    const links = document.querySelectorAll('a[href]')
    const currentFocus = document.activeElement
    let nextLink: Element | null = null

    for (let i = 0; i < links.length; i++) {
      if (links[i] === currentFocus && i < links.length - 1) {
        nextLink = links[i + 1]
        break
      }
    }

    if (!nextLink && links.length > 0) {
      nextLink = links[0]
    }

    if (nextLink) {
      (nextLink as HTMLElement).focus()
      this.announce(`リンク: ${nextLink.textContent}`)
    }
  }

  /**
   * Handle various keyboard events
   */
  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'A') {
      target.click()
    }
  }

  private handleEscape(event: KeyboardEvent): void {
    // Close modals, menus, etc.
    const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
    if (modal) {
      const closeButton = modal.querySelector('[aria-label="閉じる"], [aria-label="close"]') as HTMLElement
      closeButton?.click()
    }
  }

  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement
    const role = target.getAttribute('role')

    // Handle specific ARIA roles
    if (role === 'tablist') {
      this.handleTabListNavigation(event)
    } else if (role === 'menubar' || role === 'menu') {
      this.handleMenuNavigation(event)
    }
  }

  private handleTabListNavigation(event: KeyboardEvent): void {
    const tabList = event.target as HTMLElement
    const tabs = tabList.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>
    const currentIndex = Array.from(tabs).indexOf(document.activeElement as HTMLElement)

    let nextIndex: number
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1
    } else {
      nextIndex = currentIndex >= tabs.length - 1 ? 0 : currentIndex + 1
    }

    event.preventDefault()
    tabs[nextIndex].focus()
  }

  private handleMenuNavigation(event: KeyboardEvent): void {
    const menu = event.target as HTMLElement
    const items = menu.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>
    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement)

    let nextIndex: number
    if (event.key === 'ArrowUp') {
      nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1
    } else if (event.key === 'ArrowDown') {
      nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1
    } else {
      return
    }

    event.preventDefault()
    items[nextIndex].focus()
  }

  /**
   * Get default accessibility settings
   */
  private getDefaultSettings(): AccessibilitySettings {
    return {
      visualSettings: {
        fontSize: 16,
        fontFamily: 'default',
        lineHeight: 1.5,
        letterSpacing: 0,
        contrast: 'normal',
        colorScheme: 'auto',
        reduceMotion: false,
        flashingContent: 'allow',
        textOutline: false,
        backgroundOpacity: 100,
        cursorSize: 'medium',
        focusIndicator: 'default'
      },
      auditorySettings: {
        soundEnabled: true,
        musicEnabled: true,
        voiceEnabled: true,
        soundEffectsEnabled: true,
        captionsEnabled: false,
        captionStyle: {
          fontSize: 16,
          fontFamily: 'Arial, sans-serif',
          textColor: '#FFFFFF',
          backgroundColor: '#000000',
          outline: true,
          outlineColor: '#000000',
          position: 'bottom',
          alignment: 'center',
          opacity: 80
        },
        audioDescription: false,
        hearingAssistMode: false,
        frequencyFilter: {
          lowCut: 20,
          highCut: 20000,
          boost: []
        },
        volumeBoost: 100,
        speechRate: 1.0,
        audioFocus: false
      },
      motorSettings: {
        inputMode: 'mouse',
        keyboardNavigation: true,
        mouseSensitivity: 1.0,
        clickHoldDuration: 500,
        doubleClickDelay: 500,
        dragThreshold: 5,
        virtualKeyboard: false,
        stickyKeys: false,
        slowKeys: false,
        bounceKeys: false,
        oneHandedMode: false,
        gestureSimplification: false
      },
      cognitiveSettings: {
        readingSpeed: 'normal',
        complexityLevel: 'moderate',
        timeExtension: 0,
        memoryAids: false,
        navigationHelp: false,
        progressIndicators: true,
        confirmationDialogs: true,
        errorPrevention: true,
        consistentLayout: true,
        clearInstructions: true,
        languageSimplification: false
      },
      screenReaderSettings: {
        enabled: false,
        provider: 'system',
        verbosity: 'normal',
        announceChanges: true,
        describeImages: true,
        skipToContent: true,
        landmarkNavigation: true,
        headingNavigation: true,
        liveRegionPoliteness: 'polite',
        tableNavigation: true,
        speechRate: 1.0,
        speechPitch: 1.0,
        speechVolume: 100
      },
      colorBlindnessSupport: {
        type: 'none',
        severity: 'mild',
        colorCorrection: false,
        alternativeIndicators: false,
        patternOverlays: false,
        customColorPalette: []
      },
      dyslexiaSupport: {
        fontEnabled: false,
        fontFamily: 'OpenDyslexic',
        characterSpacing: 0.1,
        wordSpacing: 0.2,
        lineSpacing: 1.8,
        backgroundColor: '#FFFEF7',
        textColor: '#000000',
        syllableHighlighting: false,
        phonemeHighlighting: false,
        readingGuide: false,
        wordPrediction: false
      }
    }
  }

  // Public API methods
  public updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    Object.assign(this.settings.value, newSettings)
  }

  public getSettings(): AccessibilitySettings {
    return this.settings.value
  }

  public resetToDefaults(): void {
    this.settings.value = this.getDefaultSettings()
  }

  public exportSettings(): string {
    return JSON.stringify(this.settings.value, null, 2)
  }

  public importSettings(settingsJson: string): boolean {
    try {
      const parsed = JSON.parse(settingsJson)
      this.settings.value = { ...this.getDefaultSettings(), ...parsed }
      return true
    } catch {
      return false
    }
  }

  // Public getters
  public get isAccessibilityEnabled(): boolean {
    return this.isInitialized.value
  }

  public get currentSettings(): AccessibilitySettings {
    return this.settings.value
  }

  public get focusedElement(): HTMLElement | null {
    return this.focusManager.value.currentFocus
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager()
export default accessibilityManager