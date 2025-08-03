<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="$emit('submit', formData)">
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
      v-model="formData.password"
      :type="showPassword ? 'text' : 'password'"
      label="Password"
      prepend-inner-icon="mdi-lock"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      :rules="[rules.required]"
      variant="outlined"
      class="mb-3"
      :disabled="loading"
      @click:append-inner="showPassword = !showPassword"
    />

    <div class="d-flex justify-space-between align-center mb-4">
      <v-checkbox
        v-model="formData.rememberMe"
        label="Remember me"
        density="compact"
        hide-details
        :disabled="loading"
      />
      
      <slot name="forgot-password" />
    </div>

    <v-btn
      type="submit"
      color="primary"
      size="large"
      block
      :loading="loading"
      :disabled="!isValid"
    >
      <slot name="submit-text">Sign In</slot>
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import type { LoginRequest } from '~/types'

// Props & Emits
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: LoginRequest]
}>()

// Composables
const { validationRules: rules } = useValidators()

// Reactive data
const form = ref()
const isValid = ref(false)
const showPassword = ref(false)

const formData = reactive<LoginRequest>({
  email: '',
  password: '',
  rememberMe: false
})

// Methods
const validate = () => {
  return form.value?.validate()
}

const reset = () => {
  form.value?.reset()
  Object.assign(formData, {
    email: '',
    password: '',
    rememberMe: false
  })
}

// Expose methods
defineExpose({
  validate,
  reset,
  formData
})
</script> 