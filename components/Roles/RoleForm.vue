<template>
  <div class="role-form-container">
    <!-- Header -->
    <div class="form-header">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="32" color="primary">mdi-shield-account</v-icon>
        </div>
        <div class="header-text">
          <h2 class="title">{{ role ? 'Rol Düzenle' : 'Yeni Rol Oluştur' }}</h2>
          <p class="subtitle">Sistem rollerini ve izinlerini yönetin</p>
        </div>
      </div>
    </div>

    <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
      <div class="form-content">
        <!-- Rol Bilgileri Card -->
        <v-card class="info-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-information</v-icon>
            Rol Bilgileri
          </v-card-title>
          
          <v-card-text class="card-content">
            <div class="input-group">
              <v-text-field
                v-model="formData.name"
                label="Rol Adı"
                placeholder="Örn: Yönetici, Editör, Kullanıcı"
                :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
                variant="outlined"
                :disabled="loading || (role && role.isSystemRole)"
                prepend-inner-icon="mdi-account-key"
                color="primary"
                class="modern-input"
                hide-details="auto"
              />
              
              <v-textarea
                v-model="formData.description"
                label="Açıklama"
                placeholder="Bu rolün sorumluluklarını ve amacını açıklayın..."
                :rules="[rules.maxLength(500)]"
                variant="outlined"
                :disabled="loading"
                rows="3"
                auto-grow
                prepend-inner-icon="mdi-text-box"
                color="primary"
                class="modern-input"
                hide-details="auto"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- İzinler Card -->
        <v-card class="permissions-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-key-variant</v-icon>
            İzinler
            <v-chip 
              v-if="formData.permissionIds.length" 
              size="small" 
              color="primary" 
              variant="tonal"
              class="ml-auto"
            >
              {{ formData.permissionIds.length }} seçili
            </v-chip>
          </v-card-title>

          <v-card-text class="permissions-content">
            <div v-if="groupedPermissions && Object.keys(groupedPermissions).length" class="permissions-tree">
              <!-- Search Bar -->
              <div class="search-container">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="İzinlerde ara..."
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
                  @click="selectAllPermissions"
                  :disabled="loading"
                  prepend-icon="mdi-check-all"
                >
                  Tümünü Seç
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="clearAllPermissions"
                  :disabled="loading"
                  prepend-icon="mdi-close-box"
                >
                  Temizle
                </v-btn>
              </div>

              <!-- Permissions Tree -->
              <div class="permissions-list">
                <div
                  v-for="(perms, resource) in filteredPermissions"
                  :key="resource"
                  class="permission-group"
                >
                  <!-- Resource Header -->
                  <div 
                    class="resource-header"
                    @click="toggleResource(resource)"
                  >
                    <div class="resource-content">
                      <v-checkbox
                        :model-value="isResourceFullySelected(resource)"
                        :indeterminate="isResourcePartiallySelected(resource)"
                        @update:model-value="toggleResourcePermissions(resource, $event)"
                        @click.stop
                        color="primary"
                        hide-details
                        class="resource-checkbox"
                      />
                      
                      <div class="resource-info">
                        <div class="resource-icon">
                          <v-icon :icon="getResourceIcon(resource)" size="20" />
                        </div>
                        <div class="resource-details">
                          <span class="resource-name">{{ formatResourceName(resource) }}</span>
                          <span class="resource-count">{{ perms.length }} izin</span>
                        </div>
                      </div>

                      <v-icon 
                        class="expand-icon"
                        :class="{ 'expanded': expandedResources.includes(resource) }"
                      >
                        mdi-chevron-down
                      </v-icon>
                    </div>
                  </div>

                  <!-- Permissions List -->
                  <v-expand-transition>
                    <div 
                      v-show="expandedResources.includes(resource)"
                      class="permissions-container"
                    >
                      <div class="permissions-grid">
                        <div
                          v-for="permission in perms"
                          :key="permission.id"
                          class="permission-item"
                        >
                          <v-checkbox
                            v-model="formData.permissionIds"
                            :value="permission.id"
                            :disabled="loading"
                            color="primary"
                            hide-details
                            class="permission-checkbox"
                          />
                          
                          <div class="permission-info">
                            <span class="permission-name">{{ permission.name }}</span>
                            <span v-if="permission.description" class="permission-desc">
                              {{ permission.description }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-expand-transition>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">
                <v-icon size="64" color="grey-400">mdi-key-off</v-icon>
              </div>
              <h3 class="empty-title">İzin Bulunamadı</h3>
              <p class="empty-text">Atanabilir izin bulunmuyor</p>
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
          {{ role ? 'Güncelle' : 'Oluştur' }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '~/types'

// Props
const props = defineProps<{
  role?: Role | null
  permissions: Permission[]
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  submit: [data: CreateRoleRequest | UpdateRoleRequest]
  cancel: []
  'update:selected-permissions': [permissionIds: string[]]
}>()

// Composables
const { validationRules: rules } = useValidators()

// Reactive data
const form = ref()
const isValid = ref(false)
const expandedResources = ref<string[]>([])
const searchQuery = ref('')

const formData = reactive<CreateRoleRequest>({
  name: '',
  description: '',
  permissionIds: []
})

// Computed
const groupedPermissions = computed(() => {
  return props.permissions.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)
})

const filteredPermissions = computed(() => {
  if (!searchQuery.value) return groupedPermissions.value
  
  const filtered: Record<string, Permission[]> = {}
  Object.entries(groupedPermissions.value).forEach(([resource, permissions]) => {
    const matchingPermissions = permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      resource.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    if (matchingPermissions.length > 0) {
      filtered[resource] = matchingPermissions
    }
  })
  return filtered
})

// Methods
const isResourceFullySelected = (resource: string) => {
  const resourcePermissions = groupedPermissions.value[resource] || []
  return resourcePermissions.length > 0 && 
    resourcePermissions.every(p => formData.permissionIds.includes(p.id))
}

const isResourcePartiallySelected = (resource: string) => {
  const resourcePermissions = groupedPermissions.value[resource] || []
  const selectedCount = resourcePermissions.filter(p => 
    formData.permissionIds.includes(p.id)
  ).length
  
  return selectedCount > 0 && selectedCount < resourcePermissions.length
}

const toggleResource = (resource: string) => {
  const index = expandedResources.value.indexOf(resource)
  if (index > -1) {
    expandedResources.value.splice(index, 1)
  } else {
    expandedResources.value.push(resource)
  }
}

const toggleResourcePermissions = (resource: string, selected: boolean) => {
  const resourcePermissions = groupedPermissions.value[resource] || []
  
  if (selected) {
    resourcePermissions.forEach(permission => {
      if (!formData.permissionIds.includes(permission.id)) {
        formData.permissionIds.push(permission.id)
      }
    })
  } else {
    formData.permissionIds = formData.permissionIds.filter(id =>
      !resourcePermissions.some(p => p.id === id)
    )
  }
}

const selectAllPermissions = () => {
  formData.permissionIds = props.permissions.map(p => p.id)
}

const clearAllPermissions = () => {
  formData.permissionIds = []
}

const getResourceIcon = (resource: string) => {
  const iconMap: Record<string, string> = {
    'users': 'mdi-account-group',
    'roles': 'mdi-shield-account',
    'permissions': 'mdi-key-variant',
    'settings': 'mdi-cog',
    'dashboard': 'mdi-view-dashboard',
    'reports': 'mdi-chart-line',
    'files': 'mdi-file-multiple',
    'system': 'mdi-server'
  }
  return iconMap[resource.toLowerCase()] || 'mdi-folder'
}

const formatResourceName = (resource: string) => {
  const nameMap: Record<string, string> = {
    'users': 'Kullanıcılar',
    'roles': 'Roller',
    'permissions': 'İzinler',
    'settings': 'Ayarlar',
    'dashboard': 'Dashboard',
    'reports': 'Raporlar',
    'files': 'Dosyalar',
    'system': 'Sistem'
  }
  return nameMap[resource.toLowerCase()] || resource
}

const handleSubmit = async () => {
  const validation = await form.value.validate()
  if (!validation.valid) return
  
  const submitData = {
    ...formData,
    permissionIds: formData.permissionIds.map(id => Number(id))
  }
  
  emit('submit', submitData)
}

const submit = () => {
  handleSubmit()
}

// Watch for permission changes
watch(() => formData.permissionIds, (newIds) => {
  emit('update:selected-permissions', newIds)
}, { deep: true })

// Initialize form with role data if editing
watchEffect(() => {
  if (props.role) {
    Object.assign(formData, {
      name: props.role.name,
      description: props.role.description || '',
      permissionIds: props.role.permissions.map(p => p.id)
    })
  }
})

// Auto-expand first resource
onMounted(() => {
  if (Object.keys(groupedPermissions.value).length > 0) {
    expandedResources.value = [Object.keys(groupedPermissions.value)[0]]
  }
})

// Expose methods
defineExpose({
  submit
})
</script>

<style scoped>
.role-form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.form-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin: 4px 0 0 0;
}

/* Form Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

/* Cards */
.info-card, .permissions-card {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  overflow: hidden;
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

/* Modern Input Styling */
:deep(.modern-input .v-field) {
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.modern-input .v-field--focused) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Permissions */
.permissions-content {
  padding: 0 !important;
}

.permissions-tree {
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

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Permission Group */
.permission-group {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.resource-header {
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
}

.resource-header:hover {
  background: #f8fafc;
}

.resource-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
}

.resource-checkbox {
  margin: 0;
}

.resource-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%);
  color: #6366f1;
}

.resource-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.resource-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.resource-count {
  font-size: 0.75rem;
  color: #64748b;
}

.expand-icon {
  color: #94a3b8;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* Permissions Container */
.permissions-container {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 20px;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.permission-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.permission-checkbox {
  margin: 0;
  flex-shrink: 0;
}

.permission-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.permission-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.permission-desc {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
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
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.cancel-btn, .submit-btn {
  min-width: 120px;
  border-radius: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px;
}

.submit-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .role-form-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .cancel-btn, .submit-btn {
    width: 100%;
  }
}
</style>