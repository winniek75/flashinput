// Auto Image Service for Phrase Galaxy
// フレーズに基づいて適切な画像を自動取得するサービス

interface ImageResult {
  url: string
  alt: string
  attribution: string
}

interface UnsplashPhoto {
  id: string
  urls: {
    small: string
    regular: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
  }
}

class ImageService {
  private cache = new Map<string, ImageResult>()
  private readonly fallbackImages = new Map<string, string>([
    // カテゴリ別のフォールバック画像
    ['drink', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop'],
    ['eat', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'],
    ['read', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'],
    ['write', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop'],
    ['play', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop'],
    ['run', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop'],
    ['walk', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'],
    ['sleep', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop'],
    ['study', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'],
    ['work', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop'],
    ['home', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'],
    ['school', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop'],
    ['happy', 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=400&h=300&fit=crop'],
    ['sad', 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=400&h=300&fit=crop'],
    ['family', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop'],
    ['friend', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop'],
    ['weather', 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop'],
    ['time', 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400&h=300&fit=crop'],
    ['money', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'],
    ['travel', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'],
    // デフォルト画像
    ['default', 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400&h=300&fit=crop']
  ])

  /**
   * フレーズから画像を取得
   * @param phrase 英語フレーズ
   * @returns 画像情報
   */
  async getImageForPhrase(phrase: string): Promise<ImageResult> {
    console.log('Getting image for phrase:', phrase)

    // キャッシュをチェック
    if (this.cache.has(phrase)) {
      console.log('Using cached image for:', phrase)
      return this.cache.get(phrase)!
    }

    try {
      // フレーズからキーワードを抽出
      const keywords = this.extractKeywords(phrase)
      console.log('Extracted keywords:', keywords)

      // Unsplash API (デモ用、本番環境ではAPIキーが必要)
      const result = await this.fetchFromUnsplash(keywords)

      if (result) {
        console.log('Unsplash image found:', result.url)
        this.cache.set(phrase, result)
        return result
      }
    } catch (error) {
      console.warn('Failed to fetch image from Unsplash:', error)
    }

    // フォールバック画像を使用
    console.log('Using fallback image for:', phrase)
    return this.getFallbackImage(phrase)
  }

  /**
   * フレーズからキーワードを抽出
   * @param phrase 英語フレーズ
   * @returns 検索キーワードの配列
   */
  private extractKeywords(phrase: string): string[] {
    // 一般的な前置詞や冠詞を除外
    const stopWords = ['a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'and', 'or', 'but']

    // フレーズを単語に分割し、重要な単語を抽出
    const words = phrase.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // 句読点を除去
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))

    // 最初の1-2個の重要な単語を使用
    return words.slice(0, 2)
  }

  /**
   * Unsplash APIから画像を取得（デモ版）
   * @param keywords 検索キーワード
   * @returns 画像情報またはnull
   */
  private async fetchFromUnsplash(keywords: string[]): Promise<ImageResult | null> {
    // デモ用：Unsplash Source APIを使用
    const query = keywords.join(' ')

    // 複数のUnsplash URLを試す
    const unsplashUrls = [
      `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`,
      `https://source.unsplash.com/featured/400x300/?${encodeURIComponent(query)}`,
      // より確実なPlaceholder URLもフォールバックに追加
      `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(query)}`
    ]

    for (const url of unsplashUrls) {
      try {
        return {
          url,
          alt: `Image representing: ${query}`,
          attribution: url.includes('placeholder') ? 'Placeholder image' : 'Photo by Unsplash'
        }
      } catch (error) {
        console.warn(`Failed to use URL: ${url}`, error)
        continue
      }
    }

    return null
  }

  /**
   * UTF-8対応のBase64エンコーディング
   * @param str エンコードする文字列
   * @returns Base64エンコードされた文字列
   */
  private safeBase64Encode(str: string): string {
    try {
      // UTF-8文字列をBase64に安全にエンコード
      return btoa(unescape(encodeURIComponent(str)))
    } catch (error) {
      console.warn('Base64 encoding failed in imageService')
      // フォールバック: そのまま返す（URL encoding版を使用）
      return encodeURIComponent(str)
    }
  }

  /**
   * SVGプレースホルダー画像を生成（画像のみ版）
   * @param text 表示するテキスト（使用しない）
   * @returns Base64エンコードされたSVG画像URL
   */
  private createSVGPlaceholder(text: string): string {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <circle cx="200" cy="150" r="60" fill="rgba(255,255,255,0.1)"/>
        <circle cx="200" cy="150" r="40" fill="rgba(255,255,255,0.1)"/>
        <circle cx="200" cy="150" r="20" fill="rgba(255,255,255,0.1)"/>
      </svg>
    `

    try {
      return `data:image/svg+xml;base64,${this.safeBase64Encode(svg)}`
    } catch (error) {
      console.warn('SVG encoding failed in imageService, using URL encoded SVG')
      // 最終フォールバック: URL encoded SVG
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    }
  }

  /**
   * フォールバック画像を取得
   * @param phrase フレーズ
   * @returns フォールバック画像情報
   */
  private getFallbackImage(phrase: string): ImageResult {
    const lowerPhrase = phrase.toLowerCase()

    // フレーズ内のキーワードでマッチング
    for (const [keyword, url] of this.fallbackImages) {
      if (lowerPhrase.includes(keyword)) {
        return {
          url,
          alt: `Image for: ${phrase}`,
          attribution: 'Stock photo'
        }
      }
    }

    // 最終フォールバック: SVGプレースホルダー
    return {
      url: this.createSVGPlaceholder(phrase),
      alt: `Placeholder for: ${phrase}`,
      attribution: 'Generated placeholder'
    }
  }

  /**
   * 複数のフレーズの画像を事前に読み込み
   * @param phrases フレーズの配列
   */
  async preloadImages(phrases: string[]): Promise<void> {
    const promises = phrases.map(phrase => this.getImageForPhrase(phrase))
    await Promise.allSettled(promises)
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// シングルトンインスタンス
export const imageService = new ImageService()

// 型エクスポート
export type { ImageResult }