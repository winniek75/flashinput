<template>
  <div class="login-view">
    <!-- 背景エフェクト -->
    <div class="background-effects">
      <div class="stars-layer"></div>
      <div class="floating-shapes"></div>
    </div>
    
    <div class="login-container">
      <!-- ロゴとタイトル -->
      <div class="login-header">
        <div class="logo">
          <h1>🌌 MovWISE Academy</h1>
          <p>英語学習の宇宙へようこそ</p>
        </div>
      </div>
      
      <!-- ログイン/サインアップフォーム -->
      <div class="auth-form-container">
        <!-- タブ切り替え -->
        <div class="auth-tabs">
          <button 
            @click="currentMode = 'login'" 
            :class="{ active: currentMode === 'login' }"
            class="tab-button"
          >
            ログイン
          </button>
          <button 
            @click="currentMode = 'signup'" 
            :class="{ active: currentMode === 'signup' }"
            class="tab-button"
          >
            新規登録
          </button>
        </div>
        
        <!-- ログインフォーム -->
        <form v-if="currentMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <h2>おかえりなさい</h2>
          <p class="form-subtitle">学習の続きを始めましょう</p>
          
          <div class="form-group">
            <label for="loginEmail">メールアドレス</label>
            <input 
              id="loginEmail"
              v-model="loginForm.email"
              type="email" 
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="loginPassword">パスワード</label>
            <div class="password-input">
              <input 
                id="loginPassword"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="パスワードを入力"
                required
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            class="submit-btn login"
            :disabled="authStore.isLoading"
          >
            <i v-if="authStore.isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-rocket"></i>
            宇宙へ出発
          </button>
          
          <!-- ローカルログインオプション -->
          <div class="local-option">
            <div class="divider">または</div>
            <button 
              type="button" 
              @click="loginLocally" 
              class="local-btn"
              :disabled="authStore.isLoading"
            >
              <i class="fas fa-user"></i>
              ローカルアカウントで続ける
            </button>
          </div>
        </form>
        
        <!-- サインアップフォーム -->
        <form v-if="currentMode === 'signup'" @submit.prevent="handleSignup" class="auth-form">
          <h2>宇宙の冒険を開始</h2>
          <p class="form-subtitle">あなたの学習旅行が始まります</p>
          
          <div class="form-group">
            <label for="signupName">表示名</label>
            <input 
              id="signupName"
              v-model="signupForm.name"
              type="text" 
              placeholder="あなたの宇宙名"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="signupEmail">メールアドレス</label>
            <input 
              id="signupEmail"
              v-model="signupForm.email"
              type="email" 
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="signupPassword">パスワード</label>
            <div class="password-input">
              <input 
                id="signupPassword"
                v-model="signupForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="8文字以上のパスワード"
                required
                minlength="8"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="password-strength">
              <div class="strength-bar" :class="passwordStrength.level">
                <div class="strength-fill"></div>
              </div>
              <span class="strength-text">{{ passwordStrength.text }}</span>
            </div>
          </div>
          
          <!-- 役割選択 -->
          <div class="form-group">
            <label>あなたの役割</label>
            <div class="role-selection">
              <button 
                type="button"
                @click="signupForm.role = 'copilot'"
                :class="{ active: signupForm.role === 'copilot' }"
                class="role-btn student"
              >
                <i class="fas fa-user-graduate"></i>
                <span>生徒</span>
                <small>学習者として参加</small>
              </button>
              <button 
                type="button"
                @click="signupForm.role = 'captain'"
                :class="{ active: signupForm.role === 'captain' }"
                class="role-btn teacher"
              >
                <i class="fas fa-chalkboard-teacher"></i>
                <span>教師</span>
                <small>指導者として参加</small>
              </button>
            </div>
          </div>
          
          <!-- 学校ID（教師の場合） -->
          <div v-if="signupForm.role === 'captain'" class="form-group">
            <label for="schoolId">学校ID（任意）</label>
            <input 
              id="schoolId"
              v-model="signupForm.schoolId"
              type="text" 
              placeholder="学校やクラスのID"
            />
            <small>後で設定することもできます</small>
          </div>
          
          <button 
            type="submit" 
            class="submit-btn signup"
            :disabled="authStore.isLoading || !passwordValid"
          >
            <i v-if="authStore.isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-star"></i>
            アカデミー入学
          </button>
          
          <!-- プライバシー同意 -->
          <div class="privacy-notice">
            <label class="checkbox-wrapper">
              <input 
                v-model="agreePrivacy" 
                type="checkbox" 
                required
              />
              <span class="checkmark"></span>
              <span class="checkbox-text">
                <router-link to="/privacy" target="_blank">プライバシーポリシー</router-link>と
                <router-link to="/terms" target="_blank">利用規約</router-link>に同意します
              </span>
            </label>
          </div>
        </form>
        
        <!-- エラーメッセージ -->
        <div v-if="authStore.error" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          {{ authStore.error }}
          <button @click="authStore.clearError()" class="error-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- サブスクリプション情報 -->
        <div class="subscription-info">
          <h3>🎓 学習プランを選択</h3>
          <div class="plan-preview">
            <div class="plan-item free">
              <span class="plan-name">フリープラン</span>
              <span class="plan-description">基本ゲーム無料</span>
            </div>
            <div class="plan-item starter">
              <span class="plan-name">スタータープラン</span>
              <span class="plan-description">¥2,980/月 - 全機能利用可能</span>
            </div>
          </div>
          <p class="plan-note">
            登録後、いつでもプランをアップグレードできます
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    
    const currentMode = ref('login')
    const showPassword = ref(false)
    const agreePrivacy = ref(false)
    
    // ログインフォーム
    const loginForm = reactive({
      email: '',
      password: ''
    })
    
    // サインアップフォーム
    const signupForm = reactive({
      name: '',
      email: '',
      password: '',
      role: 'copilot',
      schoolId: ''
    })
    
    // パスワード強度計算
    const passwordStrength = computed(() => {
      const password = signupForm.password
      if (password.length === 0) return { level: 'none', text: '' }
      
      let score = 0
      if (password.length >= 8) score++
      if (password.match(/[a-z]/)) score++
      if (password.match(/[A-Z]/)) score++
      if (password.match(/[0-9]/)) score++
      if (password.match(/[^a-zA-Z0-9]/)) score++
      
      if (score < 2) return { level: 'weak', text: '弱い' }
      if (score < 4) return { level: 'medium', text: '普通' }
      return { level: 'strong', text: '強い' }
    })
    
    const passwordValid = computed(() => {
      return signupForm.password.length >= 8 && passwordStrength.value.level !== 'weak'
    })
    
    // ログイン処理
    const handleLogin = async () => {
      const result = await authStore.signInWithFirebase(loginForm.email, loginForm.password)

      if (result.success) {
        // ユーザータイプに応じたダッシュボードへリダイレクト
        const userType = route.query.userType || authStore.currentUser?.role || 'student'
        let targetRoute = '/'

        switch(userType) {
          case 'student':
          case 'copilot':
            targetRoute = '/dashboard/student'
            break
          case 'teacher':
          case 'captain':
            targetRoute = '/dashboard/teacher'
            break
          case 'parent':
            targetRoute = '/dashboard/parent'
            break
          default:
            targetRoute = '/dashboard/student'
        }

        router.push(targetRoute)
      }
    }
    
    // サインアップ処理
    const handleSignup = async () => {
      if (!agreePrivacy.value) {
        alert('プライバシーポリシーと利用規約に同意してください')
        return
      }
      
      const result = await authStore.signUpWithFirebase(
        signupForm.email,
        signupForm.password,
        signupForm.name,
        signupForm.role,
        signupForm.schoolId || null
      )
      
      if (result.success) {
        // 新規登録成功 - サブスクリプション選択画面へ
        router.push('/subscription?welcome=true')
      }
    }
    
    // ローカルログイン
    const loginLocally = async () => {
      const result = await authStore.signInLocal({
        name: 'ローカルユーザー',
        email: 'local@movwise.app',
        role: 'copilot'
      })

      if (result.success) {
        // 生徒ダッシュボードへ直接移動
        router.push('/dashboard/student')
      }
    }
    
    onMounted(() => {
      // URLパラメータでモード切り替え
      if (route.query.mode === 'signup') {
        currentMode.value = 'signup'
      }
    })
    
    return {
      authStore,
      currentMode,
      showPassword,
      agreePrivacy,
      loginForm,
      signupForm,
      passwordStrength,
      passwordValid,
      handleLogin,
      handleSignup,
      loginLocally
    }
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, transparent),
              radial-gradient(2px 2px at 20px 50px, #fff, transparent),
              radial-gradient(2px 2px at 30px 100px, #fff, transparent);
  background-size: 200px 200px;
  animation: twinkle 6s infinite;
  opacity: 0.4;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-shapes::before,
.floating-shapes::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 8s infinite ease-in-out;
}

.floating-shapes::before {
  width: 300px;
  height: 300px;
  top: 20%;
  left: 10%;
}

.floating-shapes::after {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.login-container {
  max-width: 500px;
  width: 90%;
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.logo p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.auth-form-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.tab-button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.auth-form h2 {
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.form-subtitle {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: white;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1.2rem;
}

.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-bar.weak .strength-fill {
  width: 33%;
  background: #ef4444;
}

.strength-bar.medium .strength-fill {
  width: 66%;
  background: #f59e0b;
}

.strength-bar.strong .strength-fill {
  width: 100%;
  background: #10b981;
}

.strength-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: bold;
}

.role-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-btn {
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.role-btn:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
}

.role-btn.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.role-btn i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.role-btn span {
  font-weight: bold;
  margin-bottom: 0.2rem;
}

.role-btn small {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.submit-btn.login {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
}

.submit-btn.signup {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.local-option {
  text-align: center;
}

.divider {
  color: rgba(255, 255, 255, 0.6);
  margin: 1rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.local-btn {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.local-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.privacy-notice {
  margin-top: 1rem;
  text-align: center;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.checkbox-wrapper input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.checkbox-wrapper input:checked + .checkmark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-wrapper input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.checkbox-text a {
  color: #3b82f6;
  text-decoration: none;
}

.checkbox-text a:hover {
  text-decoration: underline;
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  border-radius: 10px;
  padding: 1rem;
  color: white;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.error-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
}

.subscription-info {
  margin-top: 2rem;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.subscription-info h3 {
  color: white;
  margin-bottom: 1rem;
}

.plan-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.plan-item {
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
}

.plan-item.free {
  background: rgba(108, 117, 125, 0.2);
  border: 1px solid #6c757d;
}

.plan-item.starter {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
}

.plan-name {
  display: block;
  font-weight: bold;
  color: white;
  margin-bottom: 0.2rem;
}

.plan-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.plan-note {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .login-container {
    width: 95%;
  }
  
  .auth-form-container {
    padding: 1.5rem;
  }
  
  .role-selection {
    grid-template-columns: 1fr;
  }
  
  .plan-preview {
    grid-template-columns: 1fr;
  }
}
</style>