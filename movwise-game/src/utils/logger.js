/**
 * Production-safe logger utility
 * Automatically disables console output in production
 */

const isDevelopment = import.meta.env.MODE === 'development'
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true'

class Logger {
  constructor(namespace = 'App') {
    this.namespace = namespace
  }

  log(...args) {
    if (isDevelopment || isDebugMode) {
      console.log(`[${this.namespace}]`, ...args)
    }
  }

  info(...args) {
    if (isDevelopment || isDebugMode) {
      console.info(`[${this.namespace}]`, ...args)
    }
  }

  warn(...args) {
    if (isDevelopment || isDebugMode) {
      console.warn(`[${this.namespace}]`, ...args)
    }
  }

  error(...args) {
    // Always log errors, but in production send to error tracking service
    if (isDevelopment || isDebugMode) {
      console.error(`[${this.namespace}]`, ...args)
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      this.reportError(...args)
    }
  }

  debug(...args) {
    if (isDevelopment && isDebugMode) {
      console.debug(`[${this.namespace}]`, ...args)
    }
  }

  table(...args) {
    if (isDevelopment || isDebugMode) {
      console.table(...args)
    }
  }

  time(label) {
    if (isDevelopment || isDebugMode) {
      console.time(`[${this.namespace}] ${label}`)
    }
  }

  timeEnd(label) {
    if (isDevelopment || isDebugMode) {
      console.timeEnd(`[${this.namespace}] ${label}`)
    }
  }

  group(label) {
    if (isDevelopment || isDebugMode) {
      console.group(`[${this.namespace}] ${label}`)
    }
  }

  groupEnd() {
    if (isDevelopment || isDebugMode) {
      console.groupEnd()
    }
  }

  reportError(...args) {
    // Placeholder for error reporting service integration
    // TODO: Integrate with Sentry or similar service
    // For now, store errors in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      errors.push({
        namespace: this.namespace,
        timestamp: new Date().toISOString(),
        error: args.map(arg => {
          if (arg instanceof Error) {
            return {
              message: arg.message,
              stack: arg.stack,
              name: arg.name
            }
          }
          return arg
        })
      })
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift()
      }
      localStorage.setItem('app_errors', JSON.stringify(errors))
    } catch (e) {
      // Fail silently if localStorage is not available
    }
  }
}

// Create default logger instance
const logger = new Logger()

// Export factory function for creating namespaced loggers
export function createLogger(namespace) {
  return new Logger(namespace)
}

// Export default logger
export default logger