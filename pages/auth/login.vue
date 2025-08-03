<template>
  <div class="auth-container">
    <v-card class="auth-card" elevation="8">
      <v-card-title class="text-center mb-4">
        <div class="d-flex flex-column align-center">
          <v-icon size="48" color="primary" class="mb-2">mdi-shield-account</v-icon>
          <h2 class="text-h4 font-weight-bold text-primary">Welcome Back</h2>
          <p class="text-subtitle-1 text-grey-600 mt-2">Sign in to your account</p>
        </div>
      </v-card-title>

      <v-card-text>
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
          <v-text-field
            v-model="form.email"
            label="Email Address"
            type="email"
            prepend-inner-icon="mdi-email"
            :rules="[validationRules.required, validationRules.email]"
            variant="outlined"
            class="mb-3"
            autofocus
          />

          <v-text-field
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[validationRules.required]"
            variant="outlined"
            class="mb-3"
            @click:append-inner="showPassword = !showPassword"
          />

          <div class="d-flex justify-space-between align-center mb-4">
            <v-checkbox
              v-model="form.rememberMe"
              label="Remember me"
              density="compact"
              hide-details
            />
            
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="$router.push('/auth/forgot-password')"
            >
              Forgot password?
            </v-btn>
          </div>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="authStore.isLoading"
            :disabled="!isFormValid"
            class="mb-4"
          >
            Sign In
          </v-btn>
        </v-form>

        <v-divider class="my-4" />

        <div class="text-center">
          <p class="text-body-2 text-grey-600 mb-2">
            Don't have an account?
          </p>
          <v-btn
            variant="outlined"
            color="primary"
            @click="$router.push('/auth/register')"
          >
            Create Account
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
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

// Lifecycle
onMounted(() => {
  // Pre-fill email from registration if available
  const registeredEmail = route.query.email as string
  if (registeredEmail) {
    form.email = registeredEmail
  }
})

// SEO
useHead({
  title: 'Sign In - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Sign in to your JTWBaseAuth account' }
  ]
})
</script> 