<template>
  <v-dialog
    v-model="dialogVisible"
    :max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ dialogTitle }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <v-row>
            <!-- First Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.firstName"
                label="Ad"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Ad gereklidir']"
                :disabled="mode === 'view'"
                required
              />
            </v-col>

            <!-- Last Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.lastName"
                label="Soyad"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Soyad gereklidir']"
                :disabled="mode === 'view'"
                required
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.email"
                label="E-posta"
                type="email"
                variant="outlined"
                density="compact"
                :rules="[
                  v => !!v || 'E-posta gereklidir',
                  v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta adresi girin'
                ]"
                :disabled="mode === 'view'"
                required
              />
            </v-col>

            <!-- Phone Number -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.phoneNumber"
                label="Telefon Numarası"
                variant="outlined"
                density="compact"
                :disabled="mode === 'view'"
                placeholder="+90 5XX XXX XX XX"
              />
            </v-col>

            <!-- Password (only for create mode) -->
            <v-col v-if="mode === 'create'" cols="12">
              <v-text-field
                v-model="formData.password"
                label="Şifre"
                type="password"
                variant="outlined"
                density="compact"
                :rules="[
                  v => !!v || 'Şifre gereklidir',
                  v => v.length >= 6 || 'Şifre en az 6 karakter olmalıdır'
                ]"
                required
              />
            </v-col>

            <!-- Status -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.status"
                :items="statusOptions"
                label="Durum"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Durum gereklidir']"
                :disabled="mode === 'view'"
                required
              />
            </v-col>

            <!-- Roles -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.roleIds"
                :items="roleOptions"
                label="Roller"
                variant="outlined"
                density="compact"
                multiple
                chips
                :disabled="mode === 'view'"
                :loading="loadingRoles"
              />
            </v-col>

            <!-- Email Confirmed -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.emailConfirmed"
                label="E-posta Doğrulandı"
                :disabled="mode === 'view'"
                color="success"
              />
            </v-col>

            <!-- Phone Confirmed -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.phoneConfirmed"
                label="Telefon Doğrulandı"
                :disabled="mode === 'view'"
                color="success"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDialog"
        >
          {{ mode === 'view' ? 'Kapat' : 'İptal' }}
        </v-btn>
        <v-btn
          v-if="mode !== 'view'"
          color="primary"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="saveUser"
        >
          {{ mode === 'create' ? 'Oluştur' : 'Güncelle' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit', 'view'].includes(value)
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'saved'])

// Composables
const { createUser, updateUser } = useUsers()
const { getRoles } = useRoles()


// Reactive data
const form = ref(null)
const isFormValid = ref(false)
const isLoading = ref(false)
const loadingRoles = ref(false)
const roles = ref([])

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  status: 1,
  roleIds: [],
  emailConfirmed: false,
  phoneConfirmed: false
})

// Status options
const statusOptions = [
  { title: 'Aktif', value: 1 },
  { title: 'Pasif', value: 2 },
  { title: 'Yasaklı', value: 3 },
  { title: 'Doğrulama Bekliyor', value: 4 }
]

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  switch (props.mode) {
    case 'create':
      return 'Yeni Kullanıcı Oluştur'
    case 'edit':
      return 'Kullanıcı Düzenle'
    case 'view':
      return 'Kullanıcı Detayları'
    default:
      return 'Kullanıcı'
  }
})

const roleOptions = computed(() => {
  return roles.value.map(role => ({
    title: role.name,
    value: role.id
  }))
})

// Methods
const loadRoles = async () => {
  try {
    loadingRoles.value = true
    const response = await getRoles()
    roles.value = response || []
  } catch (error) {
    console.error('Error loading roles:', error)
  } finally {
    loadingRoles.value = false
  }
}

const resetForm = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    status: 1,
    roleIds: [],
    emailConfirmed: false,
    phoneConfirmed: false
  }
  
  if (form.value) {
    form.value.reset()
  }
}

const populateForm = () => {
  if (props.user) {
    formData.value = {
      firstName: props.user.firstName || '',
      lastName: props.user.lastName || '',
      email: props.user.email || '',
      phoneNumber: props.user.phoneNumber || '',
      password: '',
      status: props.user.status || 1,
      roleIds: props.user.roles?.map(role => role.id) || [],
      emailConfirmed: props.user.emailConfirmed || false,
      phoneConfirmed: props.user.phoneConfirmed || false
    }
  }
}

const saveUser = async () => {
  if (!form.value?.validate()) return

  try {
    isLoading.value = true
    
    if (props.mode === 'create') {
      await createUser(formData.value)
    } else if (props.mode === 'edit') {
      await updateUser(props.user.id, formData.value)
    }
    
    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    isLoading.value = false
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// Watchers
watch(() => props.user, () => {
  if (props.user) {
    populateForm()
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.mode, () => {
  if (props.mode === 'create') {
    resetForm()
  }
})

// Lifecycle
onMounted(() => {
  loadRoles()
})
</script> 