<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="$emit('submit', formData)">
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="formData.firstName"
          label="First Name"
          prepend-inner-icon="mdi-account"
          :rules="[rules.required, rules.minLength(2)]"
          variant="outlined"
          :disabled="loading"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="formData.lastName"
          label="Last Name"
          :rules="[rules.required, rules.minLength(2)]"
          variant="outlined"
          :disabled="loading"
        />
      </v-col>
    </v-row>

    <v-text-field
      v-model="formData.email"
      label="Email Address"
      type="email"
      prepend-inner-icon="mdi-email"
      :rules="[rules.required, rules.email]"
      variant="outlined"
      class="mb-3"
      :disabled="loading"
    />

    <v-text-field
      v-model="formData.phoneNumber"
      label="Phone Number (Optional)"
      type="tel"
      prepend-inner-icon="mdi-phone"
      :rules="[rules.phone]"
      variant="outlined"
      class="mb-3"
      :disabled="loading"
      hint="Format: +1234567890"
    />

    <v-text-field
      v-model="formData.password"
      :type="showPassword ? 'text' : 'password'"
      label="Password"
      prepend-inner-icon="mdi-lock"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      :rules="[rules.password]"
      variant="outlined"
      class="mb-3"
      :disabled="loading"
      @click:append-inner="showPassword = !showPassword"
    />

    <v-text-field
      v-model="formData.confirmPassword"
      :type="showConfirmPassword ? 'text' : 'password'"
      label="Confirm Password"
      prepend-inner-icon="mdi-lock-check"
      :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
      :rules="[rules.required, rules.confirmPassword(formData.password)]"
      variant="outlined"
      class="mb-3"
      :disabled="loading"
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

    <slot name="terms" />

    <v-btn
      type="submit"
      color="primary"
      size="large"
      block
      :loading="loading"
      :disabled="!isValid"
    >
      <slot name="submit-text">Create Account</slot>
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import type { RegisterRequest } from '~/types'

// Props & Emits
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: RegisterRequest]
}>()

// Composables
const { validationRules: rules } = useValidators()

// Reactive data
const form = ref()
const isValid = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive<RegisterRequest>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: ''
})

// Password strength computation
const passwordStrength = computed(() => {
  const password = formData.password
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
const validate = () => {
  return form.value?.validate()
}

const reset = () => {
  form.value?.reset()
  Object.assign(formData, {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  })
}

// Expose methods
defineExpose({
  validate,
  reset,
  formData
})
</script> 