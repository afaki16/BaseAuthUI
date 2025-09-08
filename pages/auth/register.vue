<template>
  <div class="register-container" :style="{ background: themeGradients?.register || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
    <!-- 3D Background with rotating images -->
    <div class="background-container">
      <div 
        v-for="(image, index) in backgroundImages" 
        :key="index"
        :class="['background-image', { active: currentImageIndex === index }]"
        :style="{ backgroundImage: `url(${image})` }"
      />
      <div 
        class="background-overlay"
        :style="{ background: registerConfig?.overlay?.color || 'rgba(0, 0, 0, 0.4)' }"
      ></div>
    </div>

    <!-- 3D Register Card -->
    <div class="register-card-container">
      <div 
        class="register-card"
        :style="{
          background: registerConfig?.card?.background || 'rgba(255, 255, 255, 0.1)',
          backdropFilter: registerConfig?.card?.backdropFilter || 'blur(20px)',
          borderRadius: registerConfig?.card?.borderRadius || '20px',
          border: registerConfig?.card?.border || '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: registerConfig?.card?.shadow || '0 25px 45px rgba(0, 0, 0, 0.2)'
        }"
      >
        <div class="card-content">
          <div class="logo-section">
            <div class="logo-icon">
              <v-icon size="64" color="white">mdi-account-plus</v-icon>
            </div>
            <h1 class="welcome-text">{{ registerConfig?.texts?.welcome || 'Create Account' }}</h1>
            <p class="subtitle-text">{{ registerConfig?.texts?.subtitle || 'Join us today and get started' }}</p>
          </div>

          <v-form ref="registerForm" v-model="isFormValid" @submit.prevent="handleRegister">
            <div class="input-row">
              <div class="input-group">
                <v-text-field
                  v-model="form.firstName"
                  :label="registerConfig?.texts?.firstNameLabel || 'First Name'"
                  prepend-inner-icon="mdi-account"
                  :rules="[validationRules.required, validationRules.minLength(2)]"
                  variant="outlined"
                  autofocus
                  bg-color="rgba(255, 255, 255, 0.1)"
                  color="white"
                  hide-details="auto"
                />
              </div>
              <div class="input-group">
                <v-text-field
                  v-model="form.lastName"
                  :label="registerConfig?.texts?.lastNameLabel || 'Last Name'"
                  :rules="[validationRules.required, validationRules.minLength(2)]"
                  variant="outlined"
                  bg-color="rgba(255, 255, 255, 0.1)"
                  color="white"
                  hide-details="auto"
                />
              </div>
            </div>

            <div class="input-group">
              <v-text-field
                v-model="form.email"
                :label="registerConfig?.texts?.emailLabel || 'Email Address'"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="[validationRules.required, validationRules.email]"
                variant="outlined"
                class="mb-4"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="white"
                hide-details="auto"
              />
            </div>

            <div class="input-group">
              <v-text-field
                v-model="form.phoneNumber"
                :label="registerConfig?.texts?.phoneLabel || 'Phone Number (Optional)'"
                type="tel"
                prepend-inner-icon="mdi-phone"
                :rules="[validationRules.phone]"
                variant="outlined"
                class="mb-4"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="white"
                hide-details="auto"
                hint="Format: +1234567890"
              />
            </div>

            <div class="input-group">
              <v-text-field
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :label="registerConfig?.texts?.passwordLabel || 'Password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[validationRules.password]"
                variant="outlined"
                class="mb-4"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="white"
                hide-details="auto"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <div class="input-group">
              <v-text-field
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :label="registerConfig?.texts?.confirmPasswordLabel || 'Confirm Password'"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[validationRules.required, validationRules.confirmPassword(form.password)]"
                variant="outlined"
                class="mb-4"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="white"
                hide-details="auto"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              />
            </div>

            <!-- Password strength indicator -->
            <div class="password-strength mb-4">
              <div class="strength-header">
                <span class="strength-label">{{ registerConfig?.texts?.passwordStrength || 'Password Strength' }}:</span>
                <span class="strength-text" :class="passwordStrengthColor">
                  {{ passwordStrengthText }}
                </span>
              </div>
              <v-progress-linear
                :model-value="passwordStrength"
                :color="passwordStrengthColor"
                height="4"
                rounded
                class="strength-bar"
              />
            </div>

            <!-- Terms and conditions -->
            <div class="terms-section mb-4">
              <v-checkbox
                v-model="acceptTerms"
                :rules="[v => !!v || 'You must accept the terms and conditions']"
                density="compact"
                color="white"
                hide-details
              >
                <template #label>
                  <span class="terms-text">
                    {{ registerConfig?.texts?.agreeTo || 'I agree to the' }}
                    <a href="/terms" target="_blank" class="terms-link">{{ registerConfig?.texts?.terms || 'Terms of Service' }}</a>
                    {{ registerConfig?.texts?.and || 'and' }}
                    <a href="/privacy" target="_blank" class="terms-link">{{ registerConfig?.texts?.privacy || 'Privacy Policy' }}</a>
                  </span>
                </template>
              </v-checkbox>
            </div>

            <v-btn
              type="submit"
              color="white"
              size="large"
              block
              :loading="authStore.isLoading"
              :disabled="!isFormValid || !acceptTerms"
              class="register-btn mb-4"
              elevation="8"
            >
              <span class="btn-text">{{ registerConfig?.texts?.createAccount || 'Create Account' }}</span>
            </v-btn>
          </v-form>

          <div class="divider-section">
            <div class="divider-line"></div>
            <span class="divider-text">{{ registerConfig?.texts?.divider || 'or' }}</span>
            <div class="divider-line"></div>
          </div>

          <div class="login-section">
            <p class="login-text">
              {{ registerConfig?.texts?.alreadyHaveAccount || 'Already have an account?' }}
            </p>
            <v-btn
              variant="outlined"
              color="white"
              @click="$router.push('/')"
              class="login-btn"
            >
              {{ registerConfig?.texts?.signIn || 'Sign In' }}
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
import type { RegisterRequest } from '~/types'

// Meta
definePageMeta({
  layout: false,
  middleware: 'guest'
})

// Composables
const authStore = useAuthStore()
const auth = useAuth()
const { validationRules } = useValidators()

// Reactive data
const registerForm = ref()
const isFormValid = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)
const currentImageIndex = ref(0)

// App data
const { loadAppData, getBackgroundImages, getRegisterConfig, getThemeGradients } = useAppData()

// Background images from data.json
const backgroundImages = computed(() => getBackgroundImages.value || [])
const registerConfig = computed(() => getRegisterConfig.value)
const themeGradients = computed(() => getThemeGradients.value)

const form = reactive<RegisterRequest>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: ''
})

// Password strength computation
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return 0
  
  let strength = 0
  
  // Length check
  if (password.length >= 8) strength += 25
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/\d/.test(password)) strength += 15
  if (/[^A-Za-z0-9]/.test(password)) strength += 10
  
  return Math.min(strength, 100)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 25) return 'Weak'
  if (strength < 50) return 'Fair'
  if (strength < 75) return 'Good'
  return 'Strong'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength < 25) return 'error'
  if (strength < 50) return 'warning'
  if (strength < 75) return 'info'
  return 'success'
})

// Methods
const handleRegister = async () => {
  if (!isFormValid.value || !acceptTerms.value) return

  try {
    await auth.register(form)
  } catch (error) {
    console.error('Registration failed:', error)
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
onMounted(async () => {
  // Load app data
  await loadAppData()

  // Start background image rotation
  imageInterval = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % backgroundImages.value.length
  }, registerConfig.value?.rotationInterval || 3000)
})

onUnmounted(() => {
  if (imageInterval) {
    clearInterval(imageInterval)
  }
})

// SEO
useHead({
  title: 'Create Account - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Create your JTWBaseAuth account' }
  ]
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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

.register-card-container {
  position: relative;
  z-index: 10;
  perspective: 1000px;
}

.register-card {
  padding: 40px;
  width: 450px;
  max-width: 90vw;
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

.input-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.input-row .input-group {
  flex: 1;
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

.password-strength {
  text-align: left;
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.strength-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.strength-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.strength-bar {
  border-radius: 2px;
}

.terms-section {
  text-align: left;
}

.terms-section :deep(.v-checkbox) {
  color: white;
}

.terms-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  line-height: 1.4;
}

.terms-link {
  color: white;
  text-decoration: underline;
  font-weight: 600;
}

.terms-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.register-btn {
  border-radius: 12px !important;
  height: 50px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
}

.register-btn:hover {
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

.login-section {
  text-align: center;
}

.login-text {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.login-btn {
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
}

.login-btn:hover {
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
  .register-card {
    width: 90%;
    max-width: 400px;
    padding: 30px 20px;
  }
  
  .welcome-text {
    font-size: 2rem;
  }

  .input-row {
    flex-direction: column;
    gap: 0;
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