<template>
  <div class="login-container">
    <!-- 3D Background with rotating images -->
    <div class="background-container">
      <div 
        v-for="(image, index) in backgroundImages" 
        :key="index"
        :class="['background-image', { active: currentImageIndex === index }]"
        :style="{ backgroundImage: `url(${image})` }"
      />
      <div class="background-overlay"></div>
    </div>

    <!-- 3D Login Card -->
    <div class="login-card-container">
      <div class="login-card">
        <div class="card-content">
          <div class="logo-section">
            <div class="logo-icon">
              <v-icon size="64" color="white">mdi-shield-account</v-icon>
            </div>
            <h1 class="welcome-text">Welcome Back</h1>
            <p class="subtitle-text">Sign in to your account</p>
          </div>

          <!-- Expired session alert -->
          <v-alert
            v-if="route.query.expired"
            type="warning"
            variant="tonal"
            class="mb-4"
            closable
          >
            Your session has expired. Please sign in again.
          </v-alert>

          <v-form ref="loginForm" v-model="isFormValid" @submit.prevent="handleLogin">
            <div class="input-group">
              <v-text-field
                v-model="form.email"
                label="Email Address"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="[validationRules.required, validationRules.email]"
                variant="outlined"
                class="mb-4"
                autofocus
                bg-color="rgba(255, 255, 255, 0.1)"
                color="white"
                hide-details="auto"
              />
            </div>

            <div class="input-group">
              <v-text-field
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[validationRules.required]"
                variant="outlined"
                class="mb-4"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="white"
                hide-details="auto"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <div class="options-row">
              <v-checkbox
                v-model="form.rememberMe"
                label="Remember me"
                density="compact"
                hide-details
                color="white"
              />
              
              <v-btn
                variant="text"
                color="white"
                size="small"
                @click="$router.push('/auth/forgot-password')"
              >
                Forgot password?
              </v-btn>
            </div>

            <v-btn
              type="submit"
              color="white"
              size="large"
              block
              :loading="authStore.isLoading"
              :disabled="!isFormValid"
              class="login-btn mb-4"
              elevation="8"
            >
              <span class="btn-text">Sign In</span>
            </v-btn>
          </v-form>

          <div class="divider-section">
            <div class="divider-line"></div>
            <span class="divider-text">or</span>
            <div class="divider-line"></div>
          </div>

          <div class="register-section">
            <p class="register-text">
              Don't have an account?
            </p>
            <v-btn
              variant="outlined"
              color="white"
              @click="$router.push('/auth/register')"
              class="register-btn"
            >
              Create Account
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating particles for 3D effect -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginRequest } from '~/types'

// Meta
definePageMeta({
  layout: false,
  middleware: 'guest'
})

// Composables
const route = useRoute()
const authStore = useAuthStore()
const auth = useAuth()
const { validationRules } = useValidators()

// Reactive data
const loginForm = ref()
const isFormValid = ref(false)
const showPassword = ref(false)
const currentImageIndex = ref(0)

// Background images (using high-quality placeholder images)
const backgroundImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2125&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
]

const form = reactive<LoginRequest>({
  email: '',
  password: '',
  rememberMe: false
})

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return

  try {
    await auth.login(form)
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const getParticleStyle = (index: number) => {
  const delay = index * 0.1
  const size = Math.random() * 4 + 2
  const x = Math.random() * 100
  const y = Math.random() * 100
  const duration = Math.random() * 3 + 2
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// Background image rotation
let imageInterval: NodeJS.Timeout

// Lifecycle
onMounted(() => {
  // Pre-fill email from registration if available
  const registeredEmail = route.query.email as string
  if (registeredEmail) {
    form.email = registeredEmail
  }

  // Start background image rotation
  imageInterval = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % backgroundImages.length
  }, 3000)
})

onUnmounted(() => {
  if (imageInterval) {
    clearInterval(imageInterval)
  }
})

// SEO
useHead({
  title: 'JTWBaseAuth - Authentication System',
  meta: [
    { name: 'description', content: 'Sign in to your JTWBaseAuth account' }
  ]
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.background-image.active {
  opacity: 1;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.login-card-container {
  position: relative;
  z-index: 10;
  perspective: 1000px;
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-content {
  text-align: center;
}

.logo-section {
  margin-bottom: 30px;
}

.logo-icon {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

.welcome-text {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 0;
}

.input-group {
  margin-bottom: 20px;
}

.input-group :deep(.v-field) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
}

.input-group :deep(.v-field__input) {
  color: white !important;
}

.input-group :deep(.v-field__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.input-group :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.options-row :deep(.v-checkbox) {
  color: white;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-radius: 12px !important;
  height: 50px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
}

.login-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
}

.btn-text {
  font-size: 1.1rem;
}

.divider-section {
  display: flex;
  align-items: center;
  margin: 30px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.divider-text {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 15px;
  font-size: 0.9rem;
}

.register-section {
  text-align: center;
}

.register-text {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.register-btn {
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
}

.register-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: white !important;
  transform: translateY(-2px) !important;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float-particle 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-particle {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    max-width: 350px;
    padding: 30px 20px;
  }
  
  .welcome-text {
    font-size: 2rem;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 