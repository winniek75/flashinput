#!/usr/bin/env node

/**
 * Script to replace all console.log statements with logger utility
 * Usage: node scripts/replace-console-logs.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SRC_DIR = path.join(__dirname, '..', 'src')
const LOGGER_IMPORT = "import logger from '@/utils/logger'"
const LOGGER_CREATE_IMPORT = "import { createLogger } from '@/utils/logger'"

let totalFiles = 0
let modifiedFiles = 0
let totalReplacements = 0

// Patterns to replace
const patterns = [
  { from: /console\.log\(/g, to: 'logger.log(' },
  { from: /console\.info\(/g, to: 'logger.info(' },
  { from: /console\.warn\(/g, to: 'logger.warn(' },
  { from: /console\.error\(/g, to: 'logger.error(' },
  { from: /console\.debug\(/g, to: 'logger.debug(' },
  { from: /console\.table\(/g, to: 'logger.table(' },
  { from: /console\.time\(/g, to: 'logger.time(' },
  { from: /console\.timeEnd\(/g, to: 'logger.timeEnd(' },
  { from: /console\.group\(/g, to: 'logger.group(' },
  { from: /console\.groupEnd\(/g, to: 'logger.groupEnd(' }
]

// Files to exclude
const excludePatterns = [
  /node_modules/,
  /\.test\./,
  /\.spec\./,
  /logger\.js$/,
  /replace-console-logs\.js$/
]

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => pattern.test(filePath))
}

function processFile(filePath) {
  if (shouldExclude(filePath)) {
    return
  }

  totalFiles++

  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    let originalContent = content
    let fileModified = false
    let fileReplacements = 0

    // Check if file contains any console statements
    const hasConsole = patterns.some(pattern => pattern.from.test(content))

    if (!hasConsole) {
      return
    }

    // Apply replacements
    patterns.forEach(pattern => {
      const matches = content.match(pattern.from)
      if (matches) {
        fileReplacements += matches.length
        content = content.replace(pattern.from, pattern.to)
        fileModified = true
      }
    })

    if (fileModified) {
      // Add logger import if not already present
      const hasLoggerImport = content.includes("from '@/utils/logger'") ||
                              content.includes('from "@/utils/logger"')

      if (!hasLoggerImport) {
        // For Vue files, add import after <script> tag
        if (filePath.endsWith('.vue')) {
          const scriptMatch = content.match(/<script[^>]*>/)
          if (scriptMatch) {
            const insertPos = scriptMatch.index + scriptMatch[0].length
            content = content.slice(0, insertPos) +
                     '\n' + LOGGER_IMPORT + '\n' +
                     content.slice(insertPos)
          }
        } else {
          // For JS/TS files, add import at the beginning
          const importMatch = content.match(/^(import .* from .*\n)+/m)
          if (importMatch) {
            // Add after existing imports
            const insertPos = importMatch.index + importMatch[0].length
            content = content.slice(0, insertPos) +
                     LOGGER_IMPORT + '\n' +
                     content.slice(insertPos)
          } else {
            // Add at the beginning of the file
            content = LOGGER_IMPORT + '\n\n' + content
          }
        }
      }

      // Write the modified content back
      fs.writeFileSync(filePath, content, 'utf-8')
      modifiedFiles++
      totalReplacements += fileReplacements
      console.log(`✓ Modified: ${filePath} (${fileReplacements} replacements)`)
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message)
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      if (!shouldExclude(fullPath)) {
        processDirectory(fullPath)
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (['.js', '.ts', '.vue', '.jsx', '.tsx'].includes(ext)) {
        processFile(fullPath)
      }
    }
  }
}

console.log('Starting console.log replacement...')
console.log('Processing directory:', SRC_DIR)
console.log('---')

processDirectory(SRC_DIR)

console.log('---')
console.log('Summary:')
console.log(`Total files scanned: ${totalFiles}`)
console.log(`Files modified: ${modifiedFiles}`)
console.log(`Total replacements: ${totalReplacements}`)
console.log('\nDone! Please review the changes and test your application.')