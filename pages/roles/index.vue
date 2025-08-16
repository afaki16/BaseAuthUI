<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-6">
            <div>
              <h1 class="text-h4 font-weight-bold text-gray-900 mb-2">
                Roller
              </h1>
              <p class="text-body-1 text-gray-600">
                Sistem rollerini görüntüleyin ve yönetin
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="isLoading"
            >
              Yeni Rol
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="primary" class="mr-4">
                  mdi-shield-account
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ totalRoles }}</div>
                  <div class="text-body-2 text-grey">Toplam Rol</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="warning" class="mr-4">
                  mdi-shield-lock
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ systemRolesCount }}</div>
                  <div class="text-body-2 text-grey">Sistem Rolleri</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="success" class="mr-4">
                  mdi-shield-edit
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ customRolesCount }}</div>
                  <div class="text-body-2 text-grey">Özel Roller</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="info" class="mr-4">
                  mdi-account-group
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ totalPermissions }}</div>
                  <div class="text-body-2 text-grey">Toplam İzin</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search and Filters -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-6">
            <v-card-text>
              <v-row align="center" justify="space-between">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="searchTerm"
                    placeholder="Rol ara..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="handleSearch"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="typeFilter"
                    :items="typeOptions"
                    label="Rol Tipi"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="handleFilter"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="statusFilter"
                    :items="statusOptions"
                    label="Durum"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="handleFilter"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    variant="outlined"
                    @click="clearFilters"
                    :disabled="!hasActiveFilters"
                  >
                    Filtreleri Temizle
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Roles Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Rol Listesi</span>
              <div class="d-flex align-center gap-2">
                <v-chip
                  v-if="totalRoles > 0"
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  {{ totalRoles }} rol
                </v-chip>
                <v-btn
                  icon="mdi-refresh"
                  variant="text"
                  size="small"
                  @click="loadRoles"
                  :loading="isLoading"
                />
              </div>
            </v-card-title>

            <v-card-text class="pa-0">
              <!-- Loading State -->
              <div v-if="isLoading" class="d-flex justify-center align-center py-12">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                />
              </div>

              <!-- Empty State -->
              <div v-else-if="roles.length === 0" class="text-center py-12">
                <v-icon
                  icon="mdi-shield-off"
                  size="64"
                  color="grey"
                  class="mb-4"
                />
                <h3 class="text-h6 text-grey-darken-1 mb-2">
                  Rol Bulunamadı
                </h3>
                <p class="text-body-2 text-grey mb-4">
                  Arama kriterlerinize uygun rol bulunamadı.
                </p>
                <v-btn
                  color="primary"
                  @click="openCreateDialog"
                >
                  Yeni Rol Ekle
                </v-btn>
              </div>

              <!-- Roles Table -->
              <div v-else>
                <v-data-table
                  :headers="tableHeaders"
                  :items="roles"
                  :loading="isLoading"
                  :items-per-page="itemsPerPage"
                  :page="currentPage"
                  :total-items="totalRoles"
                  class="elevation-0"
                  @update:page="handlePageChange"
                  @update:items-per-page="handleItemsPerPageChange"
                >
                  <!-- Role Name and Icon -->
                  <template #item.name="{ item }">
                    <div class="d-flex align-center">
                      <v-avatar size="40" class="mr-3" color="primary" variant="tonal">
                        <v-icon size="20" color="primary">
                          mdi-shield-account
                        </v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium text-body-1">
                          {{ item.name }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ item.description || 'Açıklama yok' }}
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Type -->
                  <template #item.type="{ item }">
                    <v-chip
                      :color="item.isSystemRole ? 'warning' : 'success'"
                      :text="item.isSystemRole ? 'Sistem' : 'Özel'"
                      size="small"
                      variant="flat"
                    />
                  </template>

                  <!-- Permissions -->
                  <template #item.permissions="{ item }">
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip
                        v-for="permission in item.permissions.slice(0, 2)"
                        :key="permission.id"
                        size="x-small"
                        variant="outlined"
                        color="primary"
                      >
                        {{ permission.name }}
                      </v-chip>
                      <v-chip
                        v-if="item.permissions.length > 2"
                        size="x-small"
                        variant="outlined"
                        color="grey"
                      >
                        +{{ item.permissions.length - 2 }}
                      </v-chip>
                    </div>
                  </template>

                  <!-- Created Date -->
                  <template #item.createdDate="{ item }">
                    <div class="text-body-2 text-grey">
                      {{ formatDate(item.createdDate) }}
                    </div>
                  </template>

                  <!-- Actions -->
                  <template #item.actions="{ item }">
                    <div class="d-flex gap-1">
                      <v-btn
                        icon="mdi-eye"
                        size="small"
                        variant="text"
                        color="primary"
                        @click="viewRole(item)"
                        title="Görüntüle"
                      />
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        color="warning"
                        @click="editRole(item)"
                        title="Düzenle"
                      />
                      <v-btn
                        v-if="!item.isSystemRole"
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click="deleteRole(item)"
                        title="Sil"
                      />
                    </div>
                  </template>
                </v-data-table>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create Role Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="700">
      <v-card>
        <v-card-title class="font-weight-bold">Yeni Rol Oluştur</v-card-title>
        <v-card-text>
          <RoleForm
            :permissions="permissions"
            :loading="isLoading"
            @submit="handleCreateRole"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showCreateDialog = false">İptal</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Rolü Sil
        </v-card-title>
        <v-card-text>
          <p class="text-body-1">
            Bu rolü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showDeleteDialog = false"
          >
            İptal
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RoleForm from '~/components/Roles/RoleForm.vue'

// Page metadata
definePageMeta({
  title: 'Roller',
  requiresAuth: true,
  permissions: ['roles.read']
})

// Composables
const { getRoles, deleteRole: deleteRoleApi } = useRoles()
const { getPermissions } = usePermissions()
const toast = useToast()

// Reactive data
const roles = ref([])
const permissions = ref([])
const isLoading = ref(false)
const isDeleting = ref(false)
const searchTerm = ref('')
const typeFilter = ref(null)
const statusFilter = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalRoles = ref(0)

// Dialog states
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const roleToDelete = ref(null)

// Table headers
const tableHeaders = [
  { 
    title: 'Rol Adı', 
    key: 'name', 
    sortable: true, 
    width: '300px',
    align: 'start'
  },
  { 
    title: 'Tip', 
    key: 'type', 
    sortable: true, 
    width: '120px',
    align: 'center'
  },
  { 
    title: 'İzinler', 
    key: 'permissions', 
    sortable: false, 
    width: '250px',
    align: 'start'
  },
  { 
    title: 'Oluşturulma Tarihi', 
    key: 'createdDate', 
    sortable: true, 
    width: '150px',
    align: 'start'
  },
  { 
    title: 'İşlemler', 
    key: 'actions', 
    sortable: false, 
    width: '120px', 
    align: 'center'
  }
]

// Filter options
const typeOptions = [
  { title: 'Sistem', value: 'system' },
  { title: 'Özel', value: 'custom' }
]

const statusOptions = [
  { title: 'Aktif', value: true },
  { title: 'Pasif', value: false }
]

// Computed properties
const hasActiveFilters = computed(() => {
  return searchTerm.value || typeFilter.value !== null || statusFilter.value !== null
})

const totalPermissions = computed(() => {
  return permissions.value.length
})

const systemRolesCount = computed(() => {
  return roles.value.filter(role => role.isSystemRole).length
})

const customRolesCount = computed(() => {
  return roles.value.filter(role => !role.isSystemRole).length
})

// Methods
const loadRoles = async () => {
  try {
    isLoading.value = true
    const response = await getRoles()
    
    // Handle different response formats
    if (Array.isArray(response)) {
      roles.value = response
      totalRoles.value = response.length
    } else if (response && response.data) {
      roles.value = response.data.items || response.data
      totalRoles.value = response.data.total || response.data.length
    } else {
      roles.value = []
      totalRoles.value = 0
    }
  } catch (error) {
    console.error('Error loading roles:', error)
    toast.error('Roller yüklenirken hata oluştu')
    roles.value = []
    totalRoles.value = 0
  } finally {
    isLoading.value = false
  }
}

const loadPermissions = async () => {
  try {
    const response = await getPermissions()
    permissions.value = response || []
  } catch (error) {
    console.error('Error loading permissions:', error)
    permissions.value = []
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadRoles()
}

const handleFilter = () => {
  currentPage.value = 1
  loadRoles()
}

const clearFilters = () => {
  searchTerm.value = ''
  typeFilter.value = null
  statusFilter.value = null
  currentPage.value = 1
  loadRoles()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadRoles()
}

const handleItemsPerPageChange = (itemsPerPage) => {
  currentPage.value = 1
  loadRoles()
}

const openCreateDialog = () => {
  showCreateDialog.value = true
}

const handleCreateRole = async (roleData) => {
  try {
    isLoading.value = true
    await roles.createRole(roleData)
    toast.success('Rol başarıyla oluşturuldu!')
    showCreateDialog.value = false
    await loadRoles()
  } catch (error) {
    toast.error('Rol oluşturulurken hata oluştu')
  } finally {
    isLoading.value = false
  }
}

const viewRole = (role) => {
  console.log('View role:', role)
  toast.info('Rol görüntüleme özelliği yakında eklenecek')
}

const editRole = (role) => {
  console.log('Edit role:', role)
  toast.info('Rol düzenleme özelliği yakında eklenecek')
}

const deleteRole = (role) => {
  roleToDelete.value = role
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!roleToDelete.value) return

  try {
    isDeleting.value = true
    await deleteRoleApi(roleToDelete.value.id)
    await loadRoles()
    toast.success('Rol başarıyla silindi')
  } catch (error) {
    console.error('Error deleting role:', error)
    toast.error('Rol silinirken hata oluştu')
  } finally {
    isDeleting.value = false
    roleToDelete.value = null
    showDeleteDialog.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Load initial data
onMounted(async () => {
  await Promise.all([loadRoles(), loadPermissions()])
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.v-data-table :deep(.v-data-table-header) {
  background-color: #f8f9fa;
}

.v-data-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: #374151;
}

.v-data-table :deep(.v-data-table__td) {
  border-bottom: 1px solid #e5e7eb;
}

.v-data-table :deep(.v-data-table__tr:hover) {
  background-color: #f9fafb;
}
</style> 