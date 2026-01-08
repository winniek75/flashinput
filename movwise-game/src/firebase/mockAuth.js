// Mock Firebase Auth for development without actual Firebase project
// This allows the application to work without real Firebase credentials

export const USER_ROLES = {
  CAPTAIN: 'captain',    // 講師 (Teacher)
  COPILOT: 'copilot'     // 生徒 (Student)
}

export const USER_TYPES = {
  TEACHER: 'teacher',
  STUDENT: 'student'
}

class MockAuthService {
  constructor() {
    this.currentUser = null
    this.userClaims = null
    this.authStateCallbacks = []
    
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('mockUser')
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser)
    }
  }

  async signIn(email, password) {
    // Mock authentication - always succeeds in development
    const mockUser = {
      uid: `mock_${Date.now()}`,
      email: email,
      displayName: email.split('@')[0],
      role: email.includes('teacher') || email.includes('captain') ? USER_ROLES.CAPTAIN : USER_ROLES.COPILOT
    }
    
    this.currentUser = mockUser
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    
    // Trigger auth state change
    this.authStateCallbacks.forEach(callback => callback(mockUser, { role: mockUser.role }))
    
    return {
      success: true,
      user: mockUser
    }
  }

  async signUp(email, password, displayName, role = USER_ROLES.COPILOT, schoolId = null) {
    const mockUser = {
      uid: `mock_${Date.now()}`,
      email: email,
      displayName: displayName,
      role: role,
      schoolId: schoolId,
      verified: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'online'
    }
    
    this.currentUser = mockUser
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    
    // Trigger auth state change
    this.authStateCallbacks.forEach(callback => callback(mockUser, { role: mockUser.role }))
    
    return {
      success: true,
      user: mockUser,
      role: role,
      userProfile: mockUser
    }
  }

  async signUpLegacy(email, password, displayName, userType = USER_TYPES.STUDENT) {
    const role = userType === USER_TYPES.TEACHER ? USER_ROLES.CAPTAIN : USER_ROLES.COPILOT
    return await this.signUp(email, password, displayName, role)
  }

  async signOutUser() {
    this.currentUser = null
    localStorage.removeItem('mockUser')
    
    // Trigger auth state change
    this.authStateCallbacks.forEach(callback => callback(null, null))
    
    return { success: true }
  }

  getCurrentUser() {
    return this.currentUser
  }

  onAuthStateChange(callback) {
    this.authStateCallbacks.push(callback)
    
    // Immediately call with current state
    if (this.currentUser) {
      callback(this.currentUser, { role: this.currentUser.role })
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback)
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1)
      }
    }
  }

  isAuthenticated() {
    return !!this.currentUser
  }

  isCaptain() {
    if (!this.currentUser) return false
    return this.currentUser.role === USER_ROLES.CAPTAIN ||
           this.currentUser.email?.includes('teacher') ||
           this.currentUser.email?.includes('captain') ||
           this.currentUser.email?.includes('admin')
  }

  isCoPilot() {
    if (!this.currentUser) return false
    return this.currentUser.role === USER_ROLES.COPILOT || 
           (this.isAuthenticated() && !this.isCaptain())
  }

  isTeacher() {
    return this.isCaptain()
  }

  isStudent() {
    return this.isCoPilot()
  }

  getUserRole() {
    if (!this.currentUser) return null
    return this.currentUser.role || (this.isCaptain() ? USER_ROLES.CAPTAIN : USER_ROLES.COPILOT)
  }

  getUserClaims() {
    if (!this.currentUser) return null
    return { role: this.currentUser.role }
  }

  async updateUserStatus(status = 'online') {
    if (!this.currentUser) return { success: false, error: 'Not authenticated' }
    
    this.currentUser.status = status
    this.currentUser.lastActive = new Date().toISOString()
    localStorage.setItem('mockUser', JSON.stringify(this.currentUser))
    
    return { success: true }
  }
}

export const authService = new MockAuthService()

// For compatibility with components that expect to import from auth.js
export default authService