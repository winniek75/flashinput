/**
 * Firebase Configuration
 * Uses environment variables for security
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

// Validate environment variables
const validateConfig = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  const missing = required.filter(key => !import.meta.env[key])

  if (missing.length > 0) {
    console.warn('⚠️ Missing Firebase configuration:', missing)
    console.warn('Please check your .env file and ensure all required variables are set.')

    // Return demo config for development
    return {
      apiKey: 'demo-api-key',
      authDomain: 'demo.firebaseapp.com',
      databaseURL: 'https://demo.firebaseio.com',
      projectId: 'demo-project',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abc123'
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }
}

// Initialize Firebase with validated config
const firebaseConfig = validateConfig()

let app
let auth
let database
let storage

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  database = getDatabase(app)
  storage = getStorage(app)

  if (import.meta.env.DEV) {
    console.info('✅ Firebase initialized successfully')
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
  // Provide fallback for development
  app = null
  auth = null
  database = null
  storage = null
}

export { app, auth, database, storage }
export default app