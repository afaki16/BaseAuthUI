<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Personal Information -->
      <v-col cols="12">
        <h3 class="text-h6 mb-4">Personal Information</h3>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.firstName"
          label="First Name"
          :rules="[rules.required, rules.minLength(2)]"
          variant="outlined"
          :disabled="loading"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.lastName"
          label="Last Name"
          :rules="[rules.required, rules.minLength(2)]"
          variant="outlined"
          :disabled="loading"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.email"
          label="Email Address"
          type="email"
          :rules="[rules.required, rules.email]"
          variant="outlined"
          :disabled="loading"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.phoneNumber"
          label="Phone Number (Optional)"
          type="tel"
          :rules="[rules.phone]"
          variant="outlined"
          :disabled="loading"
          hint="Format: +1234567890"
        />
      </v-col>

      <!-- Account Settings -->
      <v-col cols="12">
        <h3 class="text-h6 mb-4 mt-4">Account Settings</h3>
      </v-col>
      
      <v-col v-if="!user" cols="12" md="6">
        <v-text-field
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          :rules="[rules.required, rules.password]"
          variant="outlined"
          :disabled="loading"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
        />
      </v-col>
      
      <v-col cols="12" :md="user ? 12 : 6">
        <v-select
          v-model="formData.status"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          :disabled="loading"
        />
      </v-col>

      <!-- Role Assignment -->
      <v-col cols="12">
        <h3 class="text-h6 mb-4 mt-4">Role Assignment</h3>
      </v-col>
      
      <v-col cols="12">
        <v-select
          v-model="formData.roleIds"
          :items="roleOptions"
          label="Roles"
          variant="outlined"
          multiple
          chips
          closable-chips
          :disabled="loading"
          hint="Select one or more roles for this user"
          persistent-hint
        >
          <template #chip="{ props, item }">
            <v-chip
              v-bind="props"
              :color="getRoleColor(item.raw)"
              size="small"
            >
              {{ item.title }}
            </v-chip>
          </template>
        </v-select>
      </v-col>

      <!-- Profile Image -->
      <v-col v-if="user" cols="12">
        <h3 class="text-h6 mb-4 mt-4">Profile Image</h3>
      </v-col>
      
      <v-col v-if="user" cols="12">
        <v-text-field
          v-model="formData.profileImageUrl"
          label="Profile Image URL (Optional)"
          variant="outlined"
          :disabled="loading"
          hint="Enter a URL for the user's profile image"
          persistent-hint
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import type { User, Role, CreateUserRequest, UpdateUserRequest } from '~/types'

// Props
const props = defineProps<{
  user?: User | null
  roles: Role[]
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  submit: [data: CreateUserRequest | UpdateUserRequest]
}>()

// Composables
const { validationRules: rules } = useValidators()

// Reactive data
const form = ref()
const isValid = ref(false)
const showPassword = ref(false)

const formData = reactive<CreateUserRequest & { profileImageUrl?: string }>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneNumber: '',
  status: 1, // Active
  roleIds: []
})

// Computed
const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 2 },
  { title: 'Banned', value: 3 },
  { title: 'Pending Verification', value: 4 }
]

const roleOptions = computed(() => {
  return props.roles.map(role => ({
    title: role.name,
    value: role.id,
    raw: role
  }))
})

// Methods
const getRoleColor = (role: Role) => {
  if (role.isSystemRole) return 'primary'
  return 'secondary'
}

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  emit('submit', formData)
}

const submit = () => {
  handleSubmit()
}

// Initialize form with user data if editing
watchEffect(() => {
  if (props.user) {
    Object.assign(formData, {
      firstName: props.user.firstName,
      lastName: props.user.lastName,
      email: props.user.email,
      phoneNumber: props.user.phoneNumber,
      status: props.user.status,
      profileImageUrl: props.user.profileImageUrl,
      roleIds: props.user.roles.map(role => role.id)
    })
  }
})

// Expose methods
defineExpose({
  submit
})
</script> 