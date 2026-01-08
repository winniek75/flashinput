import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useSubscriptionStore } from './subscriptionStore'
import logger from '@/utils/logger'

export const useParentStore = defineStore('parent', () => {
  // State
  const children = ref([])
  const parentProfile = ref(null)
  const notifications = ref([])
  const reportHistory = ref([])
  const dashboardSettings = ref({
    weeklyReports: true,
    monthlyReports: true,
    emergencyNotifications: true,
    progressAlerts: true,
    emailNotifications: true,
    language: 'ja'
  })
  
  // Loading states
  const isLoading = ref(false)
  const error = ref(null)
  
  // Computed values
  const totalChildren = computed(() => children.value.length)
  const activeChildren = computed(() => 
    children.value.filter(child => child.isOnline).length
  )
  const averageProgress = computed(() => {
    if (children.value.length === 0) return 0
    const totalProgress = children.value.reduce((sum, child) => 
      sum + (child.progress?.currentLevel || 0), 0)
    return Math.round((totalProgress / children.value.length) * 10) // Assuming max level 10
  })
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead).length
  )
  const needsAttention = computed(() =>
    children.value.filter(child => 
      child.needsHelp || child.hasLowPerformance || child.hasInactivity
    ).length
  )
  
  // Child management functions
  const addChildConnection = async (childData) => {
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    
    // Check subscription limits for parent accounts
    if (!subscriptionStore.checkFeatureAccess('parent_portal')) {
      throw new Error('親ポータル機能はファミリープラン以上で利用可能です。')
    }
    
    // Validate connection code or invitation
    if (!childData.connectionCode && !childData.invitationId) {
      throw new Error('接続コードまたは招待IDが必要です。')
    }
    
    // In real app, this would connect to teacher's system
    const connectedChild = {
      id: `child_${Date.now()}`,
      name: childData.name,
      email: childData.email,
      teacherId: childData.teacherId,
      teacherName: childData.teacherName,
      schoolName: childData.schoolName,
      className: childData.className,
      connectionCode: childData.connectionCode,
      connectedAt: new Date().toISOString(),
      isOnline: false,
      lastActivity: null,
      progress: {
        currentLevel: childData.currentLevel || 1,
        totalGamesPlayed: childData.totalGamesPlayed || 0,
        totalScore: childData.totalScore || 0,
        averageAccuracy: childData.averageAccuracy || 0,
        strongAreas: childData.strongAreas || [],
        weakAreas: childData.weakAreas || [],
        recentAchievements: []
      },
      analytics: {
        weeklyPlayTime: 0,
        monthlyPlayTime: 0,
        learningStreak: 0,
        favoriteGames: [],
        improvementAreas: []
      },
      needsHelp: false,
      hasLowPerformance: false,
      hasInactivity: false,
      parentId: authStore.currentUser.id
    }
    
    children.value.push(connectedChild)
    
    // Create welcome notification
    addNotification({
      type: 'connection',
      title: `${childData.name}さんと接続しました`,
      message: `${childData.teacherName}先生のクラスに参加している${childData.name}さんの学習状況を確認できるようになりました。`,
      childId: connectedChild.id,
      priority: 'info'
    })
    
    return connectedChild
  }
  
  const removeChildConnection = (childId) => {
    const child = children.value.find(c => c.id === childId)
    if (child) {
      children.value = children.value.filter(c => c.id !== childId)
      
      addNotification({
        type: 'disconnection',
        title: `${child.name}さんとの接続を解除`,
        message: '学習状況の確認ができなくなりました。',
        priority: 'warning'
      })
    }
  }
  
  const updateChildProgress = (childId, progressUpdate) => {
    const child = children.value.find(c => c.id === childId)
    if (child) {
      child.progress = { ...child.progress, ...progressUpdate }
      child.lastActivity = new Date().toISOString()
      
      // Check for achievements and progress milestones
      checkForProgressAlerts(child)
    }
  }
  
  // Notification system
  const addNotification = (notificationData) => {
    const notification = {
      id: `notification_${Date.now()}`,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      childId: notificationData.childId || null,
      teacherId: notificationData.teacherId || null,
      priority: notificationData.priority || 'normal', // low, normal, high, urgent
      timestamp: new Date().toISOString(),
      isRead: false,
      actionRequired: notificationData.actionRequired || false,
      actionUrl: notificationData.actionUrl || null
    }
    
    notifications.value.unshift(notification)
    
    // Send email notification if enabled
    if (dashboardSettings.value.emailNotifications) {
      sendEmailNotification(notification)
    }
    
    return notification
  }
  
  const markNotificationAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
  }
  
  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(n => n.isRead = true)
  }
  
  const deleteNotification = (notificationId) => {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }
  
  // Progress monitoring and alerts
  const checkForProgressAlerts = (child) => {
    const progress = child.progress
    
    // Level up achievement
    if (progress.currentLevel > (progress.previousLevel || 0)) {
      addNotification({
        type: 'achievement',
        title: 'レベルアップ！',
        message: `${child.name}さんがレベル${progress.currentLevel}に到達しました！`,
        childId: child.id,
        priority: 'high'
      })
    }
    
    // Low performance alert
    if (progress.averageAccuracy < 60 && progress.totalGamesPlayed > 5) {
      child.hasLowPerformance = true
      if (dashboardSettings.value.progressAlerts) {
        addNotification({
          type: 'concern',
          title: '学習サポートが必要かもしれません',
          message: `${child.name}さんの正答率が${progress.averageAccuracy}%と低めです。先生にご相談することをお勧めします。`,
          childId: child.id,
          priority: 'high',
          actionRequired: true
        })
      }
    }
    
    // Inactivity alert
    const daysSinceLastActivity = child.lastActivity ? 
      Math.floor((new Date() - new Date(child.lastActivity)) / (1000 * 60 * 60 * 24)) : 0
    
    if (daysSinceLastActivity > 3) {
      child.hasInactivity = true
      if (dashboardSettings.value.progressAlerts) {
        addNotification({
          type: 'inactivity',
          title: '学習活動が少なくなっています',
          message: `${child.name}さんが${daysSinceLastActivity}日間学習していません。`,
          childId: child.id,
          priority: 'normal'
        })
      }
    }
  }
  
  // Reporting functions
  const generateWeeklyReport = (childId) => {
    const child = children.value.find(c => c.id === childId)
    if (!child) return null
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 7)
    
    const report = {
      id: `report_${Date.now()}`,
      childId: child.id,
      childName: child.name,
      reportType: 'weekly',
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: '1週間'
      },
      summary: {
        totalPlayTime: child.analytics.weeklyPlayTime || 0,
        gamesPlayed: child.progress.totalGamesPlayed || 0,
        averageAccuracy: child.progress.averageAccuracy || 0,
        levelProgress: child.progress.currentLevel || 1,
        strongAreas: child.progress.strongAreas || [],
        improvementAreas: child.progress.weakAreas || []
      },
      achievements: child.progress.recentAchievements || [],
      recommendations: generateChildRecommendations(child),
      teacherComments: `${child.name}さんは今週もよく頑張りました。`,
      generatedAt: new Date().toISOString()
    }
    
    reportHistory.value.unshift(report)
    return report
  }
  
  const generateMonthlyReport = (childId) => {
    const child = children.value.find(c => c.id === childId)
    if (!child) return null
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - 1)
    
    const report = {
      id: `report_${Date.now()}`,
      childId: child.id,
      childName: child.name,
      reportType: 'monthly',
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: '1ヶ月'
      },
      summary: {
        totalPlayTime: child.analytics.monthlyPlayTime || 0,
        gamesPlayed: child.progress.totalGamesPlayed || 0,
        averageAccuracy: child.progress.averageAccuracy || 0,
        levelProgress: child.progress.currentLevel || 1,
        strongAreas: child.progress.strongAreas || [],
        improvementAreas: child.progress.weakAreas || [],
        learningStreak: child.analytics.learningStreak || 0
      },
      achievements: child.progress.recentAchievements || [],
      recommendations: generateChildRecommendations(child),
      teacherComments: `${child.name}さんの1ヶ月間の成長が素晴らしいです。`,
      generatedAt: new Date().toISOString()
    }
    
    reportHistory.value.unshift(report)
    return report
  }
  
  // Communication functions
  const sendMessageToTeacher = async (childId, message) => {
    const child = children.value.find(c => c.id === childId)
    if (!child) {
      throw new Error('子供の情報が見つかりません')
    }
    
    // In real app, this would send to teacher's system
    const messageData = {
      id: `message_${Date.now()}`,
      fromParent: true,
      parentName: parentProfile.value.name,
      childId: childId,
      childName: child.name,
      teacherId: child.teacherId,
      teacherName: child.teacherName,
      message: message,
      timestamp: new Date().toISOString(),
      isRead: false,
      replies: []
    }
    
    addNotification({
      type: 'message_sent',
      title: '先生にメッセージを送信しました',
      message: `${child.teacherName}先生に「${message.substring(0, 50)}...」を送信しました。`,
      childId: childId,
      priority: 'info'
    })
    
    return messageData
  }
  
  const requestTeacherMeeting = async (childId, preferredDates) => {
    const child = children.value.find(c => c.id === childId)
    if (!child) {
      throw new Error('子供の情報が見つかりません')
    }
    
    // In real app, this would integrate with teacher's calendar system
    const meetingRequest = {
      id: `meeting_${Date.now()}`,
      childId: childId,
      childName: child.name,
      teacherId: child.teacherId,
      teacherName: child.teacherName,
      parentName: parentProfile.value.name,
      preferredDates: preferredDates,
      reason: 'progress_discussion',
      status: 'pending',
      requestedAt: new Date().toISOString()
    }
    
    addNotification({
      type: 'meeting_requested',
      title: '面談を申し込みました',
      message: `${child.teacherName}先生との面談を申し込みました。先生からの返信をお待ちください。`,
      childId: childId,
      priority: 'normal',
      actionRequired: false
    })
    
    return meetingRequest
  }
  
  // Utility functions
  const sendEmailNotification = (notification) => {
    // In real app, this would integrate with email service
    logger.log('Email notification would be sent:', notification)
  }
  
  const generateChildRecommendations = (child) => {
    const recommendations = []
    
    if (child.progress.weakAreas.length > 0) {
      recommendations.push({
        type: 'improvement',
        title: '苦手分野のサポート',
        description: `${child.progress.weakAreas.join('、')}の学習をご家庭でもサポートしてあげてください。`,
        priority: 'high',
        actionItems: [
          '関連する絵本や教材を活用する',
          '日常会話に取り入れる',
          '先生に追加のアドバイスを求める'
        ]
      })
    }
    
    if (child.analytics.learningStreak < 3) {
      recommendations.push({
        type: 'engagement',
        title: '学習習慣の定着',
        description: '毎日少しずつでも学習を続けることで効果が高まります。',
        priority: 'medium',
        actionItems: [
          '決まった時間に学習する',
          '短時間でも毎日続ける',
          '達成したら褒めてあげる'
        ]
      })
    }
    
    if (child.progress.strongAreas.length > 2) {
      recommendations.push({
        type: 'strength',
        title: '得意分野を活用',
        description: `${child.progress.strongAreas.join('、')}が得意なので、これを活用して学習意欲を高めましょう。`,
        priority: 'medium',
        actionItems: [
          '得意分野から関連領域に広げる',
          '教える機会を作る',
          '得意分野を褒めて自信をつける'
        ]
      })
    }
    
    return recommendations
  }
  
  // Initialize parent data
  const initializeParentData = async () => {
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    
    if (!authStore.currentUser || authStore.isTeacher) {
      throw new Error('親アカウントが必要です')
    }
    
    isLoading.value = true
    try {
      // Initialize parent profile
      parentProfile.value = {
        id: authStore.currentUser.id,
        name: authStore.currentUser.displayName,
        email: authStore.currentUser.email,
        createdAt: new Date().toISOString(),
        settings: dashboardSettings.value,
        subscriptionPlan: subscriptionStore.currentPlan
      }
      
      // Load demo children if none exist
      if (children.value.length === 0) {
        await addDemoChildren()
      }
      
      // Set up automated report generation
      if (dashboardSettings.value.weeklyReports) {
        scheduleWeeklyReports()
      }
      
      logger.log('✅ Parent store initialized successfully')
    } catch (error) {
      logger.error('❌ Parent store initialization failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const addDemoChildren = async () => {
    const demoChildren = [
      {
        name: '太郎',
        email: 'taro@example.com',
        teacherId: 'teacher_001',
        teacherName: 'Sarah先生',
        schoolName: 'MovWise英語学院',
        className: '小学3年A組',
        connectionCode: 'MW-2024-001',
        currentLevel: 3,
        totalGamesPlayed: 15,
        averageAccuracy: 85,
        strongAreas: ['フォニックス基礎', '単語認識'],
        weakAreas: ['文法基礎']
      }
    ]
    
    for (const childData of demoChildren) {
      try {
        await addChildConnection(childData)
      } catch (error) {
        logger.log('Demo child creation skipped:', error.message)
      }
    }
  }
  
  const scheduleWeeklyReports = () => {
    // In real app, this would set up actual scheduling
    logger.log('Weekly reports scheduled')
  }
  
  return {
    // State
    children,
    parentProfile,
    notifications,
    reportHistory,
    dashboardSettings,
    isLoading,
    error,
    
    // Computed
    totalChildren,
    activeChildren,
    averageProgress,
    unreadNotifications,
    needsAttention,
    
    // Actions
    addChildConnection,
    removeChildConnection,
    updateChildProgress,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    generateWeeklyReport,
    generateMonthlyReport,
    sendMessageToTeacher,
    requestTeacherMeeting,
    initializeParentData
  }
})