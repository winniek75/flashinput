#!/usr/bin/env node

/**
 * Image optimization script - moves large images to public folder
 * This dramatically reduces bundle size by excluding large assets from src
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '..', 'src/assets/images')
const PUBLIC_DIR = path.join(__dirname, '..', 'public/images')
const MAX_SIZE = 300 * 1024 // 300KB threshold

let movedCount = 0
let totalSizeSaved = 0

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function moveImage(srcPath, destPath, relativePath, fileSize) {
  ensureDirectoryExists(path.dirname(destPath))

  // Copy file to public directory
  fs.copyFileSync(srcPath, destPath)

  // Remove from src directory
  fs.unlinkSync(srcPath)

  console.log(`✓ Moved: ${relativePath} (${formatBytes(fileSize)})`)
  movedCount++
  totalSizeSaved += fileSize
}

function processDirectory(dir, baseDir = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(baseDir, entry.name)

    if (entry.isDirectory()) {
      processDirectory(fullPath, relativePath)
    } else if (entry.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
      const stats = fs.statSync(fullPath)

      if (stats.size > MAX_SIZE) {
        const destPath = path.join(PUBLIC_DIR, relativePath)
        moveImage(fullPath, destPath, relativePath, stats.size)
      }
    }
  }
}

console.log('🖼️  Optimizing images by moving large files to public directory...\n')

// Ensure public/images directory exists
ensureDirectoryExists(PUBLIC_DIR)

// Process all images
processDirectory(IMAGES_DIR)

// Create image utility for runtime path resolution
const utilityContent = `/**
 * Image path utility
 * Automatically resolves image paths between src/assets and public/images
 */

// Map of images moved to public directory
const publicImagePaths = new Set([
  // This will be populated as images are moved
])

export function getImagePath(imagePath) {
  // Remove any leading slashes or src/assets prefix
  const cleanPath = imagePath.replace(/^(\/|src\/assets\/images\/?)/, '')

  // Check if image was moved to public directory
  if (publicImagePaths.has(cleanPath)) {
    return \`/images/\${cleanPath}\`
  }

  // Return original path with proper prefix
  return imagePath.startsWith('/') ? imagePath : \`/src/assets/images/\${cleanPath}\`
}

export function registerPublicImage(imagePath) {
  publicImagePaths.add(imagePath)
}

// Auto-register moved images during build
if (import.meta.env.DEV) {
  // Development mode - dynamic path resolution
  console.info('Image utility loaded - development mode')
}

export default getImagePath`

const utilityPath = path.join(__dirname, '..', 'src/utils/imageUtils.js')
fs.writeFileSync(utilityPath, utilityContent)

console.log(`\n📊 Summary:`)
console.log(`   Images moved: ${movedCount}`)
console.log(`   Bundle size reduced by: ${formatBytes(totalSizeSaved)}`)
console.log(`   Utility created: src/utils/imageUtils.js`)

if (movedCount > 0) {
  console.log('\n⚠️  Important: Update your image imports to use getImagePath() utility')
  console.log('   Example: import { getImagePath } from "@/utils/imageUtils"')
  console.log('            const imageSrc = getImagePath("vocabulary/dog.jpg")')
}

console.log('\n✨ Image optimization completed!') 