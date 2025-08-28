<template>
  <div class="user-form-container">
    <PageHeader
      :title="user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'"
      subtitle="Sistem kullanıcılarını ve rollerini yönetin"
      icon="mdi-account-plus"
    />
      
    <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
      <div class="form-content">
        <!-- Kişisel Bilgiler Card -->
        <v-card class="info-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-account</v-icon>
            Kişisel Bilgiler
          </v-card-title>
          
          <v-card-text class="card-content">
            <div class="input-group">
              <div class="input-row">
                <v-text-field
                  v-model="formData.firstName"
                  label="Ad"
                  placeholder="Adınızı giriniz"
                  :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
                  variant="outlined"
                  :disabled="loading"
                  prepend-inner-icon="mdi-account"
                  color="primary"
                  class="modern-input"
                  hide-details="auto"
                />
                
                <v-text-field
                  v-model="formData.lastName"
                  label="Soyad"
                  placeholder="Soyadınızı giriniz"
                  :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
                  variant="outlined"
                  :disabled="loading"
                  prepend-inner-icon="mdi-account"
                  color="primary"
                  class="modern-input"
                  hide-details="auto"
                />
              </div>
              
              <v-text-field
                v-model="formData.email"
                label="E-posta"
                placeholder="ornek@email.com"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                :disabled="loading || (user && user.email)"
                prepend-inner-icon="mdi-email"
                color="primary"
                class="modern-input"
                hide-details="auto"
                type="email"
              />
              
              <v-text-field
                v-model="formData.phoneNumber"
                label="Telefon Numarası"
                placeholder="5xxxxxxxxx"
                :rules="[rules.required, rules.phoneNumber]"
                variant="outlined"
                :disabled="loading"
                prepend-inner-icon="mdi-phone"
                color="primary"
                class="modern-input"
                hide-details="auto"
                type="tel"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Şifre Bilgileri Card (Sadece yeni kullanıcı oluştururken) -->
        <v-card v-if="!user" class="password-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-lock</v-icon>
            Şifre Bilgileri
          </v-card-title>
          
          <v-card-text class="card-content">
            <div class="input-group">
              <v-text-field
                v-model="formData.password"
                label="Şifre"
                placeholder="En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter"
                :rules="[rules.required, rules.password]"
                variant="outlined"
                :disabled="loading"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                color="primary"
                class="modern-input"
                hide-details="auto"
              />
              
              <v-text-field
                v-model="formData.confirmPassword"
                label="Şifre Tekrar"
                placeholder="Şifreyi tekrar giriniz"
                :rules="[rules.required, rules.confirmPassword(formData.password)]"
                variant="outlined"
                :disabled="loading"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                color="primary"
                class="modern-input"
                hide-details="auto"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Kullanıcı Durumu Card -->
        <v-card class="status-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-account-check</v-icon>
            Kullanıcı Durumu
          </v-card-title>
          
          <v-card-text class="card-content">
            <v-switch
              v-model="formData.status"
              :true-value="1"
              :false-value="0"
              label="Kullanıcı Aktif"
              color="primary"
              :disabled="loading"
              hide-details
              class="status-switch"
            >
              <template #label>
                <div class="status-label">
                  <span class="status-text">Kullanıcı Durumu</span>
                  <v-chip
                    :color="formData.status === 1 ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                  >
                    {{ formData.status === 1 ? 'Aktif' : 'Pasif' }}
                  </v-chip>
                </div>
              </template>
            </v-switch>
            <p class="status-description">
              {{ formData.status === 1 
                  ? 'Kullanıcı sisteme giriş yapabilir ve tüm yetkilerini kullanabilir.' 
                  : 'Kullanıcı sisteme giriş yapamaz ve hesabı devre dışıdır.' 
              }}
            </p>
          </v-card-text>
        </v-card>

        <!-- Roller Card -->
        <v-card class="roles-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-shield-account</v-icon>
            Roller
            <v-chip 
              v-if="formData.roleIds.length" 
              size="small" 
              color="primary" 
              variant="tonal"
              class="ml-auto"
            >
              {{ formData.roleIds.length }} seçili
            </v-chip>
          </v-card-title>

          <v-card-text class="roles-content">
            <div v-if="roles && roles.length" class="roles-list">
              <!-- Search Bar -->
              <div class="search-container">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Rollerde ara..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  class="search-input"
                />
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="selectAllRoles"
                  :disabled="loading"
                  prepend-icon="mdi-check-all"
                >
                  Tümünü Seç
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="clearAllRoles"
                  :disabled="loading"
                  prepend-icon="mdi-close-box"
                >
                  Temizle
                </v-btn>
              </div>

              <!-- Roles List -->
              <div class="roles-grid">
                <div
                  v-for="role in filteredRoles"
                  :key="role.id"
                  class="role-item"
                  :class="{ 'selected': formData.roleIds.includes(role.id) }"
                >
                  <v-checkbox
                    v-model="formData.roleIds"
                    :value="role.id"
                    :disabled="loading"
                    color="primary"
                    hide-details
                    class="role-checkbox"
                  />
                  <div class="role-info">
                    <div class="role-header">
                      <h4 class="role-name">{{ role.name }}</h4>
                      <v-chip
                        v-if="role.isSystemRole"
                        size="x-small"
                        color="orange"
                        variant="tonal"
                      >
                        Sistem
                      </v-chip>
                    </div>
                    <p v-if="role.description" class="role-description">
                      {{ role.description }}
                    </p>
                    <div v-if="role.permissions && role.permissions.length" class="role-permissions">
                      <v-chip
                        v-for="permission in role.permissions.slice(0, 3)"
                        :key="permission.id"
                        size="x-small"
                        variant="outlined"
                        class="permission-chip"
                      >
                        {{ permission.name }}
                      </v-chip>
                      <v-chip
                        v-if="role.permissions.length > 3"
                        size="x-small"
                        variant="outlined"
                        class="permission-chip more-permissions"
                      >
                        +{{ role.permissions.length - 3 }} daha
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">
                <v-icon size="64" color="grey-400">mdi-shield-off</v-icon>
              </div>
              <h3 class="empty-title">Rol Bulunamadı</h3>
              <p class="empty-text">Atanabilir rol bulunmuyor</p>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <v-btn
          variant="outlined"
          size="large"
          @click="$emit('cancel')"
          :disabled="loading"
          class="cancel-btn"
        >
          İptal
        </v-btn>
        
        <v-btn
          color="primary"
          size="large"
          :loading="loading"
          type="submit"
          class="submit-btn"
          prepend-icon="mdi-check"
        >
          {{ user ? 'Güncelle' : 'Oluştur' }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import type { User, Role, CreateUserRequest, UpdateUserRequest } from '~/types'
import PageHeader from '~/components/UI/PageHeader.vue'

// Props
const props = defineProps<{
  user?: User | null
  roles: Role[]
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  submit: [data: CreateUserRequest | UpdateUserRequest]
  cancel: []
  'update:selected-roles': [roleIds: string[]]
}>()

// Composables
const { validationRules: rules } = useValidators()

// Reactive data
const form = ref()
const isValid = ref(false)
const searchQuery = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive<CreateUserRequest>({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  status: 1, // Varsayılan olarak aktif
  roleIds: []
})

// Computed
const filteredRoles = computed(() => {
  if (!searchQuery.value) return props.roles
  
  return props.roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// Methods
const selectAllRoles = () => {
  formData.roleIds = props.roles.map(r => r.id)
}

const clearAllRoles = () => {
  formData.roleIds = []
}

const handleSubmit = async () => {
  const validation = await form.value.validate()
  if (!validation.valid) return
  
  // API için sadece gerekli alanları gönder
  const submitData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    status: formData.status,
    roleIds: formData.roleIds.map(id => Number(id))
  }
  
  // Yeni kullanıcı oluştururken şifre ekle
  if (!props.user) {
    submitData.password = formData.password
  }
  
  emit('submit', submitData)
}

const submit = () => {
  handleSubmit()
}

// Watch for role changes
watch(() => formData.roleIds, (newIds) => {
  emit('update:selected-roles', newIds)
}, { deep: true })

// Initialize form with user data if editing
watchEffect(() => {
  if (props.user) {
    Object.assign(formData, {
      firstName: props.user.firstName,
      lastName: props.user.lastName,
      email: props.user.email,
      phoneNumber: props.user.phoneNumber || '',
      status: props.user.status ?? 1,
      roleIds: props.user.roles?.map(r => r.id) || [],
      password: '',
      confirmPassword: ''
    })
  }
})

// Expose methods
defineExpose({
  submit
})
</script>

<style scoped>
/* Container */
.user-form-container {
  padding-top: 8px;
  border-radius: 20px;
  margin: 16px;
  background: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

/* Form Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

/* Cards */
.info-card, 
.password-card, 
.status-card, 
.roles-card {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  overflow: hidden;
}

.info-card :deep(.v-card),
.password-card :deep(.v-card),
.status-card :deep(.v-card),
.roles-card :deep(.v-card) {
  border-radius: 16px !important;
}

.card-title {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 20px 24px !important;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #1e293b;
  border-radius: 16px !important;
}

.title-icon {
  color: #3b82f6;
}

.card-content {
  padding: 24px !important;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Modern Input Styling */
:deep(.modern-input .v-field) {
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.modern-input .v-field--focused) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Status Card */
.status-switch {
  margin-bottom: 12px;
}

.status-switch :deep(.v-switch__track) {
  opacity: 1 !important;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-text {
  font-weight: 500;
  color: #1e293b;
}

.status-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Roles */
.roles-content {
  padding: 0 !important;
}

.roles-list {
  padding: 24px;
}

.search-container {
  margin-bottom: 20px;
}

.search-input :deep(.v-field) {
  border-radius: 12px;
  background: #f8fafc;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.role-item {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  background: white;
}

.role-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.role-item.selected {
  border-color: #3b82f6;
  background: #f0f7ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.role-checkbox {
  margin: 0 !important;
  flex-shrink: 0;
}

.role-checkbox :deep(.v-selection-control) {
  min-height: auto !important;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.role-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.role-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.role-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-chip {
  font-size: 0.75rem !important;
}

.more-permissions {
  color: #64748b !important;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 24px;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.empty-text {
  color: #64748b;
  margin: 0;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  margin: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #e2e8f0;
  bottom: 0;
  z-index: 10;
}

.cancel-btn, .submit-btn {
  min-width: 120px;
}

.submit-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .user-form-container {
    padding: 4px 12px 0 12px;
  }
  
  .form-content {
    gap: 16px;
  }
  
  .card-title {
    padding: 16px 20px !important;
  }
  
  .card-content {
    padding: 20px !important;
  }
  
  .input-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    padding: 16px 20px;
  }
  
  .cancel-btn, .submit-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 640px) {
  .user-form-container {
    padding: 4px 8px 0 8px;
  }
  
  .role-item {
    padding: 12px;
  }
  
  .role-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .permission-chip {
    font-size: 0.7rem !important;
  }
}
</style>