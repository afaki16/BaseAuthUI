<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon 
          :color="iconColor" 
          class="me-3"
          size="28"
        >
          {{ icon }}
        </v-icon>
        {{ title }}
      </v-card-title>

      <v-card-text>
        <p class="text-body-1">{{ message }}</p>
        
        <v-alert
          v-if="type === 'error'"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          This action cannot be undone.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        
        <v-btn
          variant="text"
          :disabled="loading"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </v-btn>
        
        <v-btn
          :color="confirmColor"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
// Props
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error' | 'success'
  maxWidth?: string | number
  persistent?: boolean
  loading?: boolean
}>(), {
  title: 'Confirm Action',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'info',
  maxWidth: 400,
  persistent: false,
  loading: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

// Computed
const icon = computed(() => {
  switch (props.type) {
    case 'warning': return 'mdi-alert'
    case 'error': return 'mdi-alert-circle'
    case 'success': return 'mdi-check-circle'
    default: return 'mdi-help-circle'
  }
})

const iconColor = computed(() => {
  switch (props.type) {
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'success': return 'success'
    default: return 'info'
  }
})

const confirmColor = computed(() => {
  switch (props.type) {
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'success': return 'success'
    default: return 'primary'
  }
})
</script> 