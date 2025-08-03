<template>
  <div class="auth-container">
    <v-card class="auth-card" elevation="8" style="max-width: 500px;">
      <v-card-title class="text-center mb-4">
        <div class="d-flex flex-column align-center">
          <v-icon size="48" color="primary" class="mb-2">mdi-account-plus</v-icon>
          <h2 class="text-h4 font-weight-bold text-primary">Create Account</h2>
          <p class="text-subtitle-1 text-grey-600 mt-2">Join us today</p>
        </div>
      </v-card-title>

      <v-card-text>
        <v-form ref="registerForm" v-model="isFormValid" @submit.prevent="handleRegister">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="form.firstName"
                label="First Name"
                prepend-inner-icon="mdi-account"
                :rules="[validationRules.required, validationRules.minLength(2)]"
                variant="outlined"
                autofocus
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.lastName"
                label="Last Name"
                :rules="[validationRules.required, validationRules.minLength(2)]"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.email"
            label="Email Address"
            type="email"
            prepend-inner-icon="mdi-email"
            :rules="[validationRules.required, validationRules.email]"
            variant="outlined"
            class="mb-3"
          />

          <v-text-field
            v-model="form.phoneNumber"
            label="Phone Number (Optional)"
            type="tel"
            prepend-inner-icon="mdi-phone"
            :rules="[validationRules.phone]"
            variant="outlined"
            class="mb-3"
            hint="Format: +1234567890"
          />

          <v-text-field
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[validationRules.password]"
            variant="outlined"
            class="mb-3"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirm Password"
            prepend-inner-icon="mdi-lock-check"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[validationRules.required, validationRules.confirmPassword(form.password)]"
            variant="outlined"
            class="mb-3"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />

          <!-- Password strength indicator -->
          <div class="mb-4">
            <div class="d-flex align-center mb-2">
              <span class="text-caption text-grey-600">Password Strength:</span>
              <v-spacer />
              <span class="text-caption" :class="passwordStrengthColor">
                {{ passwordStrengthText }}
              </span>
            </div>
            <v-progress-linear
              :model-value="passwordStrength"
              :color="passwordStrengthColor"
              height="4"
              rounded
            />
          </div>

          <!-- Terms and conditions -->
          <v-checkbox
            v-model="acceptTerms"
            :rules="[v => !!v || 'You must accept the terms and conditions']"
            density="compact"
            class="mb-4"
          >
            <template #label>
              <span class="text-body-2">
                I agree to the 
                <a href="/terms" target="_blank" class="text-primary">Terms of Service</a>
                and 
                <a href="/privacy" target="_blank" class="text-primary">Privacy Policy</a>
              </span>
            </template>
          </v-checkbox>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="authStore.isLoading"
            :disabled="!isFormValid || !acceptTerms"
            class="mb-4"
          >
            Create Account
          </v-btn>
        </v-form>

        <v-divider class="my-4" />

        <div class="text-center">
          <p class="text-body-2 text-grey-600 mb-2">
            Already have an account?
          </p>
          <v-btn
            variant="outlined"
            color="primary"
            @click="$router.push('/auth/login')"
          >
            Sign In
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
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

// SEO
useHead({
  title: 'Create Account - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Create your JTWBaseAuth account' }
  ]
})
</script> 