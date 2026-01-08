/**
 * Enhanced Logger Utility
 * 本番環境・開発環境対応のログシステム
 */

const isProduction = process.env.NODE_ENV === 'production'
const logLevel = process.env.LOG_LEVEL || 'info'

// ログレベル定義
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

// カラーコード（開発環境用）
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

class Logger {
  constructor() {
    this.level = LOG_LEVELS[logLevel] || LOG_LEVELS.info
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const pid = process.pid

    if (isProduction) {
      // 本番環境：JSON形式
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        pid,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        ...(data && { data })
      }
      return JSON.stringify(logEntry)
    } else {
      // 開発環境：色付きフォーマット
      const color = {
        error: COLORS.red,
        warn: COLORS.yellow,
        info: COLORS.blue,
        debug: COLORS.cyan
      }[level] || COLORS.reset

      let formatted = `${color}[${timestamp}] ${level.toUpperCase()} [${pid}]${COLORS.reset} ${message}`

      if (data) {
        formatted += `\n${COLORS.magenta}Data:${COLORS.reset} ${JSON.stringify(data, null, 2)}`
      }

      return formatted
    }
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.level
  }

  error(message, data = null) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data))
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data))
    }
  }

  info(message, data = null) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data))
    }
  }

  log(message, data = null) {
    this.info(message, data)
  }

  debug(message, data = null) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data))
    }
  }

  // Stripe関連のログ
  stripe(message, data = null) {
    this.info(`💳 Stripe: ${message}`, data)
  }

  // サブスクリプション関連のログ
  subscription(message, data = null) {
    this.info(`📋 Subscription: ${message}`, data)
  }

  // セキュリティ関連のログ
  security(message, data = null) {
    this.warn(`🔒 Security: ${message}`, data)
  }

  // API関連のログ
  api(method, path, status, duration = null) {
    const statusColor = status >= 400 ? COLORS.red :
                       status >= 300 ? COLORS.yellow :
                       COLORS.green

    const message = isProduction ?
      `API ${method} ${path} ${status}${duration ? ` ${duration}ms` : ''}` :
      `${statusColor}API ${method} ${path} ${status}${COLORS.reset}${duration ? ` ${duration}ms` : ''}`

    this.info(message)
  }

  // エラーハンドリング用
  handleError(error, context = '') {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    }

    if (error.code) errorData.code = error.code
    if (error.statusCode) errorData.statusCode = error.statusCode

    this.error(`❌ ${context ? `${context}: ` : ''}${error.message}`, errorData)
  }

  // 成功ログ
  success(message, data = null) {
    const successMessage = isProduction ? message : `${COLORS.green}✅ ${message}${COLORS.reset}`
    this.info(successMessage, data)
  }

  // 開始ログ
  start(message, data = null) {
    const startMessage = isProduction ? message : `${COLORS.cyan}🚀 ${message}${COLORS.reset}`
    this.info(startMessage, data)
  }

  // 終了ログ
  stop(message, data = null) {
    const stopMessage = isProduction ? message : `${COLORS.magenta}🛑 ${message}${COLORS.reset}`
    this.info(stopMessage, data)
  }
}

// シングルトンインスタンス
const logger = new Logger()

export default logger