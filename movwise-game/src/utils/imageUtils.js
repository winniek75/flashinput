/**
 * Image path utility
 * Automatically resolves image paths between src/assets and public/images
 */

// Map of images moved to public directory
const publicImagePaths = new Set([
  // This will be populated as images are moved
])

export function getImagePath(imagePath) {
  // Remove any leading slashes or src/assets prefix
  const cleanPath = imagePath.replace(/^(/|src/assets/images/?)/, '')

  // Check if image was moved to public directory
  if (publicImagePaths.has(cleanPath)) {
    return `/images/${cleanPath}`
  }

  // Return original path with proper prefix
  return imagePath.startsWith('/') ? imagePath : `/src/assets/images/${cleanPath}`
}

export function registerPublicImage(imagePath) {
  publicImagePaths.add(imagePath)
}

// Auto-register moved images during build
if (import.meta.env.DEV) {
  // Development mode - dynamic path resolution
  console.info('Image utility loaded - development mode')
}

export default getImagePath