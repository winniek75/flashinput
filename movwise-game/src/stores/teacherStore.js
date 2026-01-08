import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useSubscriptionStore } from './subscriptionStore'
import logger from '@/utils/logger'

export const useTeacherStore = defineStore('teacher', () => {
  // State
  const students = ref([])
  const classes = ref([])
  const activeSessions = ref([])
  const sessionHistory = ref([])
  const emergencyCalls = ref([])
  const teacherProfile = ref(null)
  const dashboardSettings = ref({
    autoAcceptStudents: false,
    notificationsEnabled: true,
    sessionRecording: true,
    emergencyAlertSound: true
  })
  
  // Loading states
  const isLoading = ref(false)
  const error = ref(null)
  
  // Computed values
  const totalStudents = computed(() => students.value.length)
  const activeStudents = computed(() => 
    students.value.filter(student => student.isOnline).length
  )
  const todaySessionsCount = computed(() => {
    const today = new Date().toDateString()
    return sessionHistory.value.filter(session => 
      new Date(session.startTime).toDateString() === today
    ).length
  })
  const pendingEmergencyCalls = computed(() => 
    emergencyCalls.value.filter(call => call.status === 'pending').length
  )
  const totalClasses = computed(() => classes.value.length)
  const averageClassSize = computed(() => {
    if (classes.value.length === 0) return 0
    const studentsInClasses = students.value.filter(s => s.classId && s.classId !== 'default').length
    return Math.round(studentsInClasses / classes.value.length)
  })
  
  // Student management functions
  const addStudent = (studentData) => {
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    
    // サブスクリプション制限チェック
    if (!subscriptionStore.canAddStudent) {
      const currentPlan = subscriptionStore.planDetails
      throw new Error(
        `生徒数が上限（${currentPlan.maxStudents}名）に達しています。` +
        'プランをアップグレードしてください。'
      )
    }
    
    const newStudent = {
      id: `student_${Date.now()}`,
      name: studentData.name,
      email: studentData.email,
      classId: studentData.classId || 'default',
      joinedAt: new Date().toISOString(),
      isOnline: false,
      lastActivity: null,
      progress: {
        totalGamesPlayed: 0,
        totalScore: 0,
        averageAccuracy: 0,
        strongAreas: [],
        weakAreas: [],
        currentLevel: 1
      },
      preferences: {
        language: 'ja',
        difficultyLevel: 'beginner',
        favoriteGames: []
      },
      teacherId: authStore.currentUser.id
    }
    
    students.value.push(newStudent)
    
    // 使用量更新
    subscriptionStore.updateUsage({ 
      studentCount: students.value.length 
    })
    
    return newStudent
  }
  
  const removeStudent = (studentId) => {
    const index = students.value.findIndex(s => s.id === studentId)
    if (index !== -1) {
      students.value.splice(index, 1)
      
      // 使用量更新
      const subscriptionStore = useSubscriptionStore()
      subscriptionStore.updateUsage({ 
        studentCount: students.value.length 
      })
    }
  }
  
  const updateStudentProgress = (studentId, progressUpdate) => {
    const student = students.value.find(s => s.id === studentId)
    if (student) {
      student.progress = { ...student.progress, ...progressUpdate }
      student.lastActivity = new Date().toISOString()
    }
  }
  
  // Class management functions
  const createClass = (classData) => {
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    
    // プロプラン以上でのみクラス管理機能を利用可能
    if (!subscriptionStore.checkFeatureAccess('class_management')) {
      throw new Error('クラス管理機能はプロプラン以上で利用可能です。')
    }
    
    const newClass = {
      id: `class_${Date.now()}`,
      name: classData.name,
      description: classData.description || '',
      teacherId: authStore.currentUser.id,
      studentIds: [],
      createdAt: new Date().toISOString(),
      settings: {
        gameRestrictions: classData.gameRestrictions || [],
        difficultyLevel: classData.difficultyLevel || 'mixed',
        sessionDuration: classData.sessionDuration || 30
      },
      schedule: classData.schedule || []
    }
    
    classes.value.push(newClass)
    return newClass
  }
  
  const assignStudentToClass = (studentId, classId) => {
    const student = students.value.find(s => s.id === studentId)
    const classObj = classes.value.find(c => c.id === classId)
    
    if (student && classObj) {
      student.classId = classId
      if (!classObj.studentIds.includes(studentId)) {
        classObj.studentIds.push(studentId)
      }
    }
  }
  
  // Session management
  const startSession = (sessionData) => {
    const authStore = useAuthStore()
    
    const newSession = {
      id: `session_${Date.now()}`,
      teacherId: authStore.currentUser.id,
      name: sessionData.name,
      gameType: sessionData.gameType,
      participants: [],
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active',
      settings: sessionData.settings || {},
      analytics: {
        totalParticipants: 0,
        averageScore: 0,
        completionRate: 0,
        emergencyCallsCount: 0
      }
    }
    
    activeSessions.value.push(newSession)
    return newSession
  }
  
  const endSession = (sessionId) => {
    const sessionIndex = activeSessions.value.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      const session = activeSessions.value[sessionIndex]
      session.endTime = new Date().toISOString()
      session.status = 'completed'
      
      // セッション履歴に移動
      sessionHistory.value.push(session)
      activeSessions.value.splice(sessionIndex, 1)
      
      return session
    }
  }
  
  const addParticipantToSession = (sessionId, studentId) => {
    const session = activeSessions.value.find(s => s.id === sessionId)
    if (session && !session.participants.includes(studentId)) {
      session.participants.push(studentId)
      session.analytics.totalParticipants = session.participants.length
    }
  }
  
  // Emergency call management
  const handleEmergencyCall = (callData) => {
    const emergencyCall = {
      id: `emergency_${Date.now()}`,
      studentId: callData.studentId,
      studentName: callData.studentName,
      sessionId: callData.sessionId,
      message: callData.message,
      timestamp: new Date().toISOString(),
      status: 'pending',
      priority: callData.priority || 'normal'
    }
    
    emergencyCalls.value.unshift(emergencyCall)
    
    // 通知音再生
    if (dashboardSettings.value.emergencyAlertSound) {
      playNotificationSound()
    }
    
    return emergencyCall
  }
  
  const respondToEmergencyCall = (callId, response) => {
    const call = emergencyCalls.value.find(c => c.id === callId)
    if (call) {
      call.status = 'responded'
      call.response = response
      call.respondedAt = new Date().toISOString()
    }
  }
  
  const dismissEmergencyCall = (callId) => {
    const index = emergencyCalls.value.findIndex(c => c.id === callId)
    if (index !== -1) {
      emergencyCalls.value.splice(index, 1)
    }
  }
  
  // Analytics and reporting
  const generateStudentProgressReport = (studentId, timeRange = '1week') => {
    const student = students.value.find(s => s.id === studentId)
    if (!student) return null
    
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '1week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '1month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3)
        break
    }
    
    // セッション履歴から該当期間のデータを集計
    const studentSessions = sessionHistory.value.filter(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= startDate && 
             sessionDate <= endDate && 
             session.participants.includes(studentId)
    })
    
    return {
      student: {
        id: student.id,
        name: student.name,
        progress: student.progress
      },
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: timeRange
      },
      summary: {
        totalSessions: studentSessions.length,
        totalPlayTime: studentSessions.reduce((total, session) => {
          const duration = session.endTime ? 
            new Date(session.endTime) - new Date(session.startTime) : 0
          return total + duration
        }, 0),
        averageScore: studentSessions.length > 0 ?
          studentSessions.reduce((sum, s) => sum + (s.analytics.averageScore || 0), 0) / studentSessions.length :
          0,
        gamesPlayed: [...new Set(studentSessions.map(s => s.gameType))],
        improvementTrend: this.calculateImprovementTrend(student.id)
      },
      recommendations: generateStudentRecommendations(student)
    }
  }
  
  const generateClassSummaryReport = (classId) => {
    const classObj = classes.value.find(c => c.id === classId)
    if (!classObj) return null
    
    const classStudents = students.value.filter(s => s.classId === classId)
    const totalStudents = classStudents.length
    const activeStudents = classStudents.filter(s => s.isOnline).length
    
    return {
      class: classObj,
      summary: {
        totalStudents,
        activeStudents,
        averageProgress: totalStudents > 0 ?
          classStudents.reduce((sum, s) => sum + s.progress.currentLevel, 0) / totalStudents :
          0,
        strongestAreas: getMostCommonAreas(classStudents.map(s => s.progress.strongAreas).flat()),
        weakestAreas: getMostCommonAreas(classStudents.map(s => s.progress.weakAreas).flat())
      },
      students: classStudents.map(student => ({
        id: student.id,
        name: student.name,
        progress: student.progress,
        lastActivity: student.lastActivity
      }))
    }
  }
  
  // Utility functions
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(e => logger.log('Audio play failed:', e))
    } catch (error) {
      logger.log('Notification sound not available')
    }
  }
  
  const generateStudentRecommendations = (student) => {
    const recommendations = []
    
    if (student.progress.weakAreas.length > 0) {
      recommendations.push({
        type: 'improvement',
        title: '苦手分野の強化',
        description: `${student.progress.weakAreas.join('、')}の練習を増やしましょう`,
        priority: 'high'
      })
    }
    
    if (student.progress.totalGamesPlayed < 10) {
      recommendations.push({
        type: 'engagement',
        title: 'ゲーム体験の拡大',
        description: '様々なタイプのゲームに挑戦してみましょう',
        priority: 'medium'
      })
    }
    
    return recommendations
  }
  
  const getMostCommonAreas = (areas) => {
    const frequency = {}
    areas.forEach(area => {
      frequency[area] = (frequency[area] || 0) + 1
    })
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area)
  }
  
  // Initialize teacher data
  const initializeTeacherData = async () => {
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    
    if (!authStore.currentUser || !authStore.isTeacher) {
      throw new Error('教師認証が必要です')
    }
    
    isLoading.value = true
    try {
      // 教師プロフィールの初期化
      teacherProfile.value = {
        id: authStore.currentUser.id,
        name: authStore.currentUser.displayName,
        email: authStore.currentUser.email,
        schoolId: authStore.currentSchoolId,
        createdAt: new Date().toISOString(),
        settings: dashboardSettings.value
      }
      
      // サブスクリプション情報と連携
      await subscriptionStore.initialize()
      
      // 使用量を正しく設定
      subscriptionStore.updateUsage({
        studentCount: students.value.length,
        teacherCount: 1
      })
      
      logger.log('✅ Teacher store initialized successfully')
    } catch (error) {
      logger.error('❌ Teacher store initialization failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    // State
    students,
    classes,
    activeSessions,
    sessionHistory,
    emergencyCalls,
    teacherProfile,
    dashboardSettings,
    isLoading,
    error,
    
    // Computed
    totalStudents,
    activeStudents,
    todaySessionsCount,
    pendingEmergencyCalls,
    totalClasses,
    averageClassSize,
    
    // Actions
    addStudent,
    removeStudent,
    updateStudentProgress,
    createClass,
    assignStudentToClass,
    startSession,
    endSession,
    addParticipantToSession,
    handleEmergencyCall,
    respondToEmergencyCall,
    dismissEmergencyCall,
    generateStudentProgressReport,
    generateClassSummaryReport,
    initializeTeacherData

  calculateImprovementTrend(studentId) {
    const sessions = this.studentSessions?.[studentId] || []
    if (sessions.length < 2) return 'neutral'

    const recent = sessions.slice(-5)
    const older = sessions.slice(-10, -5)

    if (recent.length === 0 || older.length === 0) return 'neutral'

    const recentAvg = recent.reduce((sum, s) => sum + (s.score || 0), 0) / recent.length
    const olderAvg = older.reduce((sum, s) => sum + (s.score || 0), 0) / older.length

    if (recentAvg > olderAvg * 1.1) return 'positive'
    if (recentAvg < olderAvg * 0.9) return 'negative'
    return 'neutral'
  },
  }
})