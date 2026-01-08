import { ref, computed, watch, nextTick } from 'vue'
import { useStorage } from '@vueuse/core'
import logger from '@/utils/logger'

// Accessibility interfaces
export interface AccessibilitySettings {
  keyboardNavigation: boolean
  screenReaderSupport: boolean
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  focusIndicators: boolean
  skipLinks: boolean
  audioDescriptions: boolean
  captionsEnabled: boolean
  fontSize: number
  animationSpeed: number
  colorBlindnessSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
}

export interface FocusableElement {
  element: HTMLElement
  priority: number
  group: string
  skipable: boolean
  ariaLabel?: string
  role?: string
}

export interface KeyboardShortcut {
  keys: string[]
  action: () => void
  description: string
  context: string
  enabled: boolean
}

export interface ScreenReaderAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  delay?: number
  region?: 'status' | 'alert' | 'log'
}

/**
 * Accessibility Manager
 * Comprehensive accessibility system for Language Galaxy
 */
export class AccessibilityManager {
  private settings = useStorage<AccessibilitySettings>('language_galaxy_accessibility', this.getDefaultSettings())
  private focusableElements = ref<Map<string, FocusableElement[]>>(new Map())
  private currentFocusGroup = ref<string>('main')
  private currentFocusIndex = ref<number>(0)
  private keyboardShortcuts = ref<Map<string, KeyboardShortcut>>(new Map())
  private announcements = ref<ScreenReaderAnnouncement[]>([])
  
  private ariaLiveRegions = ref<Map<string, HTMLElement>>(new Map())
  private skipLinks = ref<HTMLElement[]>([])
  private focusHistory = ref<HTMLElement[]>([])
  private trapFocusElement = ref<HTMLElement | null>(null)
  
  private keyPressBuffer = ref<string[]>([])
  private keyPressTimer = ref<NodeJS.Timeout | null>(null)
  private navigationMode = ref<'keyboard' | 'mouse' | 'touch'>('mouse')

  constructor() {
    this.initializeAccessibility()
    this.setupEventListeners()
    this.registerDefaultShortcuts()
    this.detectUserPreferences()
  }

  /**
   * Initialize accessibility system
   */
  private async initializeAccessibility(): Promise<void> {
    // Create ARIA live regions
    this.createAriaLiveRegions()
    
    // Setup focus management
    this.setupFocusManagement()
    
    // Apply accessibility settings
    this.applyAccessibilitySettings()
    
    // Create skip links
    this.createSkipLinks()
    
    logger.log('Accessibility Manager initialized')
  }

  /**
   * Create ARIA live regions for screen reader announcements
   */
  private createAriaLiveRegions(): void {
    // Status region for polite announcements
    const statusRegion = document.createElement('div')
    statusRegion.setAttribute('aria-live', 'polite')
    statusRegion.setAttribute('aria-atomic', 'true')
    statusRegion.setAttribute('aria-label', 'ステータス通知')
    statusRegion.className = 'sr-only'
    statusRegion.id = 'aria-status-region'
    document.body.appendChild(statusRegion)
    this.ariaLiveRegions.value.set('status', statusRegion)

    // Alert region for assertive announcements
    const alertRegion = document.createElement('div')
    alertRegion.setAttribute('aria-live', 'assertive')
    alertRegion.setAttribute('aria-atomic', 'true')
    alertRegion.setAttribute('aria-label', '重要な通知')
    alertRegion.className = 'sr-only'
    alertRegion.id = 'aria-alert-region'
    document.body.appendChild(alertRegion)
    this.ariaLiveRegions.value.set('alert', alertRegion)

    // Log region for sequential announcements
    const logRegion = document.createElement('div')
    logRegion.setAttribute('aria-live', 'polite')
    logRegion.setAttribute('aria-atomic', 'false')
    logRegion.setAttribute('aria-label', 'ゲーム進行ログ')
    logRegion.className = 'sr-only'
    logRegion.id = 'aria-log-region'
    document.body.appendChild(logRegion)
    this.ariaLiveRegions.value.set('log', logRegion)
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    // Track focus changes
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement
      if (target && target !== document.body) {
        this.onFocusChange(target)
      }
    })

    // Track navigation mode changes
    document.addEventListener('mousedown', () => {
      this.navigationMode.value = 'mouse'
    })

    document.addEventListener('touchstart', () => {
      this.navigationMode.value = 'touch'
    })
  }

  /**
   * Create skip navigation links
   */
  private createSkipLinks(): void {
    if (!this.settings.value.skipLinks) return

    const skipLinksContainer = document.createElement('nav')
    skipLinksContainer.setAttribute('aria-label', 'スキップナビゲーション')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.id = 'skip-links'

    const skipLinks = [
      { href: '#main-content', text: 'メインコンテンツへスキップ' },
      { href: '#main-navigation', text: 'メインナビゲーションへスキップ' },
      { href: '#game-area', text: 'ゲームエリアへスキップ' },
      { href: '#galaxy-map', text: '銀河マップへスキップ' }
    ]

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a')
      skipLink.href = link.href
      skipLink.textContent = link.text
      skipLink.className = 'skip-link'
      skipLink.addEventListener('click', (e) => {
        e.preventDefault()
        this.skipToContent(link.href.substring(1))
      })
      skipLinksContainer.appendChild(skipLink)
      this.skipLinks.value.push(skipLink)
    })

    document.body.insertBefore(skipLinksContainer, document.body.firstChild)
  }

  /**
   * Register focusable element group
   */
  public registerFocusGroup(groupName: string, elements: HTMLElement[]): void {
    const focusableElements: FocusableElement[] = elements.map((element, index) => ({
      element,
      priority: index,
      group: groupName,
      skipable: element.hasAttribute('data-skip-focus'),
      ariaLabel: element.getAttribute('aria-label') || undefined,
      role: element.getAttribute('role') || undefined
    }))

    this.focusableElements.value.set(groupName, focusableElements)
    this.updateFocusableElements(groupName)
  }

  /**
   * Navigate to next focusable element
   */
  public focusNext(): boolean {
    const currentGroup = this.focusableElements.value.get(this.currentFocusGroup.value)
    if (!currentGroup || currentGroup.length === 0) return false

    let nextIndex = this.currentFocusIndex.value + 1
    let attempts = 0

    while (attempts < currentGroup.length) {
      if (nextIndex >= currentGroup.length) {
        nextIndex = 0
      }

      const nextElement = currentGroup[nextIndex]
      if (this.isElementFocusable(nextElement.element) && !nextElement.skipable) {
        this.focusElement(nextElement.element)
        this.currentFocusIndex.value = nextIndex
        return true
      }

      nextIndex++
      attempts++
    }

    return false
  }

  /**
   * Navigate to previous focusable element
   */
  public focusPrevious(): boolean {
    const currentGroup = this.focusableElements.value.get(this.currentFocusGroup.value)
    if (!currentGroup || currentGroup.length === 0) return false

    let prevIndex = this.currentFocusIndex.value - 1
    let attempts = 0

    while (attempts < currentGroup.length) {
      if (prevIndex < 0) {
        prevIndex = currentGroup.length - 1
      }

      const prevElement = currentGroup[prevIndex]
      if (this.isElementFocusable(prevElement.element) && !prevElement.skipable) {
        this.focusElement(prevElement.element)
        this.currentFocusIndex.value = prevIndex
        return true
      }

      prevIndex--
      attempts++
    }

    return false
  }

  /**
   * Switch focus group
   */
  public switchFocusGroup(groupName: string): boolean {
    if (!this.focusableElements.value.has(groupName)) return false

    this.currentFocusGroup.value = groupName
    this.currentFocusIndex.value = 0

    const group = this.focusableElements.value.get(groupName)!
    if (group.length > 0) {
      this.focusElement(group[0].element)
      return true
    }

    return false
  }

  /**
   * Focus specific element with enhanced features
   */
  public focusElement(element: HTMLElement, options: FocusOptions = {}): void {
    if (!this.isElementFocusable(element)) return

    // Add to focus history
    this.focusHistory.value.push(element)
    if (this.focusHistory.value.length > 10) {
      this.focusHistory.value.shift()
    }

    // Focus the element
    element.focus(options)

    // Announce to screen reader if enabled
    if (this.settings.value.screenReaderSupport) {
      this.announceFocusChange(element)
    }

    // Scroll into view if needed
    this.scrollIntoViewIfNeeded(element)
  }

  /**
   * Trap focus within specific container
   */
  public trapFocus(container: HTMLElement): void {
    this.trapFocusElement.value = container
    
    const focusableElements = this.getFocusableElementsInContainer(container)
    if (focusableElements.length === 0) return

    // Focus first element
    this.focusElement(focusableElements[0])

    // Setup trap listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        const activeElement = document.activeElement as HTMLElement

        if (e.shiftKey) {
          if (activeElement === firstElement) {
            e.preventDefault()
            this.focusElement(lastElement)
          }
        } else {
          if (activeElement === lastElement) {
            e.preventDefault()
            this.focusElement(firstElement)
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    container.setAttribute('data-focus-trapped', 'true')
  }

  /**
   * Release focus trap
   */
  public releaseFocusTrap(): void {
    if (this.trapFocusElement.value) {
      this.trapFocusElement.value.removeAttribute('data-focus-trapped')
      this.trapFocusElement.value = null
    }
  }

  /**
   * Announce message to screen reader
   */
  public announce(announcement: ScreenReaderAnnouncement): void {
    if (!this.settings.value.screenReaderSupport) return

    this.announcements.value.push(announcement)

    const region = this.ariaLiveRegions.value.get(announcement.region || 'status')
    if (!region) return

    // Apply delay if specified
    const delay = announcement.delay || 0
    setTimeout(() => {
      region.textContent = announcement.message
      
      // Clear after announcement
      setTimeout(() => {
        if (region.textContent === announcement.message) {
          region.textContent = ''
        }
      }, 3000)
    }, delay)
  }

  /**
   * Register keyboard shortcut
   */
  public registerShortcut(id: string, shortcut: KeyboardShortcut): void {
    this.keyboardShortcuts.value.set(id, shortcut)
  }

  /**
   * Unregister keyboard shortcut
   */
  public unregisterShortcut(id: string): void {
    this.keyboardShortcuts.value.delete(id)
  }

  /**
   * Skip to content area
   */
  public skipToContent(targetId: string): void {
    const target = document.getElementById(targetId)
    if (target) {
      this.focusElement(target, { preventScroll: false })
      this.announce({
        message: `${targetId}エリアにスキップしました`,
        priority: 'polite'
      })
    }
  }

  /**
   * Update accessibility settings
   */
  public updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    Object.assign(this.settings.value, newSettings)
    this.applyAccessibilitySettings()
  }

  /**
   * Get current accessibility settings
   */
  public getSettings(): AccessibilitySettings {
    return { ...this.settings.value }
  }

  // Helper methods
  private onFocusChange(element: HTMLElement): void {
    if (this.navigationMode.value === 'keyboard') {
      this.updateCurrentFocusIndex(element)
    }
  }

  private updateCurrentFocusIndex(element: HTMLElement): void {
    for (const [groupName, elements] of this.focusableElements.value) {
      const index = elements.findIndex(fe => fe.element === element)
      if (index !== -1) {
        this.currentFocusGroup.value = groupName
        this.currentFocusIndex.value = index
        break
      }
    }
  }

  private isElementFocusable(element: HTMLElement): boolean {
    if (!element || element.hidden) return false
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') return false
    if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) return false

    const style = getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden') return false

    return true
  }

  private getFocusableElementsInContainer(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="link"]:not([aria-disabled="true"])'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => this.isElementFocusable(element as HTMLElement)) as HTMLElement[]
  }

  private updateFocusableElements(groupName: string): void {
    const elements = this.focusableElements.value.get(groupName)
    if (!elements) return

    // Update ARIA attributes for better screen reader support
    elements.forEach((focusableElement, index) => {
      const { element } = focusableElement
      
      // Add role if not present
      if (!element.hasAttribute('role') && element.tagName === 'DIV') {
        element.setAttribute('role', 'button')
      }

      // Add tabindex for keyboard navigation
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0')
      }

      // Add aria-label if not present
      if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
        const label = this.generateAriaLabel(element)
        if (label) {
          element.setAttribute('aria-label', label)
        }
      }

      // Add position information for screen readers
      if (elements.length > 1) {
        element.setAttribute('aria-setsize', elements.length.toString())
        element.setAttribute('aria-posinset', (index + 1).toString())
      }
    })
  }

  private generateAriaLabel(element: HTMLElement): string {
    // Try to extract meaningful label from element
    const textContent = element.textContent?.trim()
    const title = element.getAttribute('title')
    const dataLabel = element.getAttribute('data-label')
    
    return dataLabel || title || textContent || ''
  }

  private announceFocusChange(element: HTMLElement): void {
    const label = element.getAttribute('aria-label') || 
                 element.textContent?.trim() || 
                 element.getAttribute('title') || 
                 'フォーカス要素'

    const role = element.getAttribute('role') || element.tagName.toLowerCase()
    const announcement = `${label}, ${this.getRoleAnnouncement(role)}`

    this.announce({
      message: announcement,
      priority: 'polite',
      delay: 100
    })
  }

  private getRoleAnnouncement(role: string): string {
    const roleMap: Record<string, string> = {
      button: 'ボタン',
      link: 'リンク',
      input: '入力フィールド',
      select: '選択ボックス',
      checkbox: 'チェックボックス',
      radio: 'ラジオボタン',
      tab: 'タブ',
      menuitem: 'メニュー項目',
      dialog: 'ダイアログ',
      alert: 'アラート'
    }

    return roleMap[role] || '要素'
  }

  private scrollIntoViewIfNeeded(element: HTMLElement): void {
    const rect = element.getBoundingClientRect()
    const inView = rect.top >= 0 && rect.bottom <= window.innerHeight

    if (!inView) {
      element.scrollIntoView({
        behavior: this.settings.value.reducedMotion ? 'auto' : 'smooth',
        block: 'center'
      })
    }
  }

  private setupEventListeners(): void {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.settings.value.keyboardNavigation) return

      this.navigationMode.value = 'keyboard'
      this.handleKeyboardNavigation(e)
    })

    // Settings watcher
    watch(this.settings, () => {
      this.applyAccessibilitySettings()
    }, { deep: true })

    // Detect system preferences changes
    if (window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.addEventListener('change', () => {
        this.settings.value.reducedMotion = prefersReducedMotion.matches
      })

      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
      prefersHighContrast.addEventListener('change', () => {
        this.settings.value.highContrast = prefersHighContrast.matches
      })
    }
  }

  private handleKeyboardNavigation(e: KeyboardEvent): void {
    // Handle focus trap first
    if (this.trapFocusElement.value && !this.trapFocusElement.value.contains(e.target as Element)) {
      return
    }

    // Check for keyboard shortcuts
    this.handleKeyboardShortcut(e)

    // Handle standard navigation
    switch (e.key) {
      case 'Tab':
        // Tab navigation is handled by browser, but we track it
        break
      
      case 'ArrowDown':
      case 'ArrowRight':
        if (e.target && this.isInFocusGroup(e.target as HTMLElement)) {
          e.preventDefault()
          this.focusNext()
        }
        break
      
      case 'ArrowUp':
      case 'ArrowLeft':
        if (e.target && this.isInFocusGroup(e.target as HTMLElement)) {
          e.preventDefault()
          this.focusPrevious()
        }
        break
      
      case 'Home':
        if (e.target && this.isInFocusGroup(e.target as HTMLElement)) {
          e.preventDefault()
          this.focusFirst()
        }
        break
      
      case 'End':
        if (e.target && this.isInFocusGroup(e.target as HTMLElement)) {
          e.preventDefault()
          this.focusLast()
        }
        break
      
      case 'Escape':
        if (this.trapFocusElement.value) {
          this.releaseFocusTrap()
        }
        break
    }
  }

  private handleKeyboardShortcut(e: KeyboardEvent): void {
    const pressedKeys = []
    if (e.ctrlKey) pressedKeys.push('Ctrl')
    if (e.altKey) pressedKeys.push('Alt')
    if (e.shiftKey) pressedKeys.push('Shift')
    if (e.metaKey) pressedKeys.push('Meta')
    if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
      pressedKeys.push(e.key)
    }

    const keyCombo = pressedKeys.join('+')

    for (const [id, shortcut] of this.keyboardShortcuts.value) {
      if (shortcut.enabled && shortcut.keys.join('+') === keyCombo) {
        e.preventDefault()
        shortcut.action()
        
        // Announce shortcut activation
        this.announce({
          message: `ショートカット実行: ${shortcut.description}`,
          priority: 'polite'
        })
        break
      }
    }
  }

  private isInFocusGroup(element: HTMLElement): boolean {
    for (const elements of this.focusableElements.value.values()) {
      if (elements.some(fe => fe.element === element)) {
        return true
      }
    }
    return false
  }

  private focusFirst(): void {
    const currentGroup = this.focusableElements.value.get(this.currentFocusGroup.value)
    if (currentGroup && currentGroup.length > 0) {
      this.focusElement(currentGroup[0].element)
      this.currentFocusIndex.value = 0
    }
  }

  private focusLast(): void {
    const currentGroup = this.focusableElements.value.get(this.currentFocusGroup.value)
    if (currentGroup && currentGroup.length > 0) {
      const lastIndex = currentGroup.length - 1
      this.focusElement(currentGroup[lastIndex].element)
      this.currentFocusIndex.value = lastIndex
    }
  }

  private registerDefaultShortcuts(): void {
    // Navigation shortcuts
    this.registerShortcut('skip-to-main', {
      keys: ['Alt', '1'],
      action: () => this.skipToContent('main-content'),
      description: 'メインコンテンツへスキップ',
      context: 'global',
      enabled: true
    })

    this.registerShortcut('skip-to-nav', {
      keys: ['Alt', '2'],
      action: () => this.skipToContent('main-navigation'),
      description: 'ナビゲーションへスキップ',
      context: 'global',
      enabled: true
    })

    this.registerShortcut('toggle-focus-group', {
      keys: ['Alt', 'g'],
      action: () => this.cycleFocusGroups(),
      description: 'フォーカスグループ切り替え',
      context: 'global',
      enabled: true
    })

    // Game-specific shortcuts
    this.registerShortcut('read-instructions', {
      keys: ['Alt', 'i'],
      action: () => this.readGameInstructions(),
      description: 'ゲーム説明を読み上げ',
      context: 'game',
      enabled: true
    })

    this.registerShortcut('repeat-question', {
      keys: ['Alt', 'r'],
      action: () => this.repeatLastAnnouncement(),
      description: '最後の質問を繰り返し',
      context: 'game',
      enabled: true
    })
  }

  private cycleFocusGroups(): void {
    const groups = Array.from(this.focusableElements.value.keys())
    const currentIndex = groups.indexOf(this.currentFocusGroup.value)
    const nextIndex = (currentIndex + 1) % groups.length
    this.switchFocusGroup(groups[nextIndex])
    
    this.announce({
      message: `フォーカスグループ: ${groups[nextIndex]}`,
      priority: 'polite'
    })
  }

  private readGameInstructions(): void {
    const instructionsElement = document.querySelector('[data-game-instructions]')
    if (instructionsElement) {
      const instructions = instructionsElement.textContent || 'ゲーム説明が見つかりません'
      this.announce({
        message: instructions,
        priority: 'polite',
        region: 'log'
      })
    }
  }

  private repeatLastAnnouncement(): void {
    const lastAnnouncement = this.announcements.value[this.announcements.value.length - 1]
    if (lastAnnouncement) {
      this.announce({
        ...lastAnnouncement,
        delay: 0
      })
    }
  }

  private applyAccessibilitySettings(): void {
    const root = document.documentElement

    // Apply font size
    root.style.setProperty('--accessibility-font-scale', this.settings.value.fontSize.toString())

    // Apply high contrast
    if (this.settings.value.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduced motion
    if (this.settings.value.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Apply large text
    if (this.settings.value.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Apply color blindness support
    if (this.settings.value.colorBlindnessSupport !== 'none') {
      root.classList.add(`colorblind-${this.settings.value.colorBlindnessSupport}`)
    }

    // Update CSS custom properties
    root.style.setProperty('--animation-speed-multiplier', 
      this.settings.value.reducedMotion ? '0.01' : this.settings.value.animationSpeed.toString())
  }

  private detectUserPreferences(): void {
    // Detect system preferences
    if (window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (prefersReducedMotion.matches) {
        this.settings.value.reducedMotion = true
      }

      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
      if (prefersHighContrast.matches) {
        this.settings.value.highContrast = true
      }
    }

    // Detect screen reader
    const hasScreenReader = window.navigator.userAgent.includes('NVDA') ||
                           window.navigator.userAgent.includes('JAWS') ||
                           window.speechSynthesis !== undefined

    if (hasScreenReader) {
      this.settings.value.screenReaderSupport = true
    }
  }

  private getDefaultSettings(): AccessibilitySettings {
    return {
      keyboardNavigation: true,
      screenReaderSupport: false,
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      focusIndicators: true,
      skipLinks: true,
      audioDescriptions: false,
      captionsEnabled: false,
      fontSize: 1.0,
      animationSpeed: 1.0,
      colorBlindnessSupport: 'none'
    }
  }

  // Public getters
  public get currentSettings(): AccessibilitySettings {
    return this.settings.value
  }

  public get focusGroups(): string[] {
    return Array.from(this.focusableElements.value.keys())
  }

  public get currentFocus(): {
    group: string
    index: number
    element: HTMLElement | null
  } {
    const group = this.focusableElements.value.get(this.currentFocusGroup.value)
    const element = group?.[this.currentFocusIndex.value]?.element || null
    
    return {
      group: this.currentFocusGroup.value,
      index: this.currentFocusIndex.value,
      element
    }
  }

  public get shortcuts(): KeyboardShortcut[] {
    return Array.from(this.keyboardShortcuts.value.values())
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager()
export default accessibilityManager