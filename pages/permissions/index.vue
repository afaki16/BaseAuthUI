<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-6">
            <div>
              <h1 class="text-h4 font-weight-bold text-gray-900 mb-2">
                İzin Yönetimi
              </h1>
              <p class="text-body-1 text-gray-600">
                Sistem genelinde kullanıcı izinlerini yönetin
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-key-plus"
              @click="$router.push('/permissions/create')"
            >
              Yeni İzin Ekle
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-center align-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>

      <!-- Content when not loading -->
      <div v-else>
        <!-- Statistics Cards -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon size="48" color="primary" class="mr-4">
                    mdi-key
                  </v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ permissions.length }}</div>
                    <div class="text-body-2 text-grey">Toplam İzin</div>
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
                    mdi-check-circle
                  </v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ activePermissionsCount }}</div>
                    <div class="text-body-2 text-grey">Aktif İzinler</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon size="48" color="purple" class="mr-4">
                    mdi-shield-account
                  </v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ uniqueResourcesCount }}</div>
                    <div class="text-body-2 text-grey">Kaynak Türü</div>
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
                    mdi-account-group
                  </v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ totalAssignedCount }}</div>
                    <div class="text-body-2 text-grey">Atanmış İzinler</div>
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
                      placeholder="İzinleri ara..."
                      prepend-inner-icon="mdi-magnify"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="resourceFilter"
                      :items="uniqueResources"
                      label="Kaynak"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-btn
                      variant="outlined"
                      @click="resetFilters"
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

        <!-- Permissions Table -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title class="d-flex align-center justify-space-between">
                <span>İzinler</span>
                <div class="d-flex align-center gap-2">
                  <v-chip
                    v-if="permissions.length > 0"
                    color="primary"
                    variant="outlined"
                    size="small"
                  >
                    {{ permissions.length }} izin
                  </v-chip>
                  <v-btn
                    icon="mdi-refresh"
                    variant="text"
                    size="small"
                    @click="loadPermissions"
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
                <div v-else-if="filteredPermissions.length === 0" class="text-center py-12">
                  <v-icon
                    icon="mdi-key-off"
                    size="64"
                    color="grey"
                    class="mb-4"
                  />
                  <h3 class="text-h6 text-grey-darken-1 mb-2">
                    İzin Bulunamadı
                  </h3>
                  <p class="text-body-2 text-grey mb-4">
                    Arama kriterlerinize uygun izin bulunamadı.
                  </p>
                  <v-btn
                    color="primary"
                    @click="resetFilters"
                  >
                    Filtreleri Temizle
                  </v-btn>
                </div>

                <!-- Permissions Table -->
                <div v-else>
                  <v-data-table
                    :headers="tableHeaders"
                    :items="filteredPermissions"
                    :loading="isLoading"
                    :items-per-page="itemsPerPage"
                    :page="currentPage"
                    :total-items="filteredPermissions.length"
                    class="elevation-0"
                    @update:page="handlePageChange"
                    @update:items-per-page="handleItemsPerPageChange"
                  >
                    <!-- Permission Name and Icon -->
                    <template #item.name="{ item }">
                      <div class="d-flex align-center">
                        <v-avatar size="40" class="mr-3" color="primary" variant="tonal">
                          <v-icon size="20" color="primary">
                            mdi-key
                          </v-icon>
                        </v-avatar>
                        <div>
                          <div class="font-weight-medium text-body-1">
                            {{ item.name }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ item.displayName || item.name }}
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Resource -->
                    <template #item.resource="{ item }">
                      <v-chip
                        color="primary"
                        variant="outlined"
                        size="small"
                      >
                        {{ item.resource }}
                      </v-chip>
                    </template>

                    <!-- Action/Type -->
                    <template #item.action="{ item }">
                      <v-chip
                        color="success"
                        variant="outlined"
                        size="small"
                      >
                        {{ item.action || item.type || 'N/A' }}
                      </v-chip>
                    </template>

                    <!-- Description -->
                    <template #item.description="{ item }">
                      <div class="text-body-2 text-grey">
                        {{ item.description || 'Açıklama yok' }}
                      </div>
                    </template>

                    <!-- Status -->
                    <template #item.isActive="{ item }">
                      <v-chip
                        :color="item.isActive !== false ? 'success' : 'error'"
                        :text="item.isActive !== false ? 'Aktif' : 'Pasif'"
                        size="small"
                        variant="flat"
                      />
                    </template>

                    <!-- Actions -->
                    <template #item.actions="{ item }">
                      <div class="d-flex gap-1">
                        <v-btn
                          icon="mdi-eye"
                          size="small"
                          variant="text"
                          color="primary"
                          @click="viewPermission(item)"
                          title="Görüntüle"
                        />
                        <v-btn
                          icon="mdi-pencil"
                          size="small"
                          variant="text"
                          color="warning"
                          @click="editPermission(item)"
                          title="Düzenle"
                        />
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                          @click="deletePermission(item)"
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
      </div>
    </v-container>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'İzin Yönetimi',
  requiresAuth: true,
  permissions: ['permissions.read']
})

// Composables
const { getPermissions } = usePermissions()
const toast = useToast()

// Reactive data
const permissions = ref([])
const isLoading = ref(false)
const searchTerm = ref('')
const resourceFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Table headers
const tableHeaders = [
  { 
    title: 'İzin Adı', 
    key: 'name', 
    sortable: true, 
    width: '300px',
    align: 'start'
  },
  { 
    title: 'Kaynak', 
    key: 'resource', 
    sortable: true, 
    width: '150px',
    align: 'start'
  },
  { 
    title: 'İşlem', 
    key: 'action', 
    sortable: true, 
    width: '120px',
    align: 'start'
  },
  { 
    title: 'Açıklama', 
    key: 'description', 
    sortable: false, 
    width: '250px',
    align: 'start'
  },
  { 
    title: 'Durum', 
    key: 'isActive', 
    sortable: true, 
    width: '100px',
    align: 'center'
  },
  { 
    title: 'İşlemler', 
    key: 'actions', 
    sortable: false, 
    width: '120px', 
    align: 'center'
  }
]

// Computed properties
const hasActiveFilters = computed(() => {
  return searchTerm.value || resourceFilter.value
})

const filteredPermissions = computed(() => {
  let filtered = permissions.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(permission => 
      permission.name.toLowerCase().includes(search) ||
      (permission.displayName && permission.displayName.toLowerCase().includes(search)) ||
      (permission.description && permission.description.toLowerCase().includes(search)) ||
      permission.resource.toLowerCase().includes(search) ||
      (permission.action && permission.action.toLowerCase().includes(search)) ||
      (permission.type && permission.type.toString().toLowerCase().includes(search))
    )
  }

  if (resourceFilter.value) {
    filtered = filtered.filter(permission => permission.resource === resourceFilter.value)
  }

  return filtered
})

const activePermissionsCount = computed(() => 
  permissions.value.filter(permission => permission.isActive !== false).length
)

const uniqueResources = computed(() => 
  [...new Set(permissions.value.map(permission => permission.resource))]
)

const uniqueResourcesCount = computed(() => uniqueResources.value.length)

const totalAssignedCount = computed(() => 
  permissions.value.reduce((total, permission) => total + (permission.assignedCount || 0), 0)
)

// Methods
const loadPermissions = async () => {
  try {
    isLoading.value = true
    const response = await getPermissions()
    
    // Handle different response formats
    if (Array.isArray(response)) {
      permissions.value = response
    } else if (response && response.data) {
      permissions.value = response.data.items || response.data
    } else {
      permissions.value = []
    }
  } catch (error) {
    console.error('Error loading permissions:', error)
    toast.error('İzinler yüklenirken hata oluştu')
    permissions.value = []
  } finally {
    isLoading.value = false
  }
}

const resetFilters = () => {
  searchTerm.value = ''
  resourceFilter.value = ''
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handleItemsPerPageChange = (itemsPerPage) => {
  currentPage.value = 1
}

const viewPermission = (permission) => {
  console.log('View permission:', permission)
  toast.info('İzin görüntüleme özelliği yakında eklenecek')
}

const editPermission = (permission) => {
  console.log('Edit permission:', permission)
  toast.info('İzin düzenleme özelliği yakında eklenecek')
}

const deletePermission = async (permission) => {
  if (confirm(`${permission.name} iznini silmek istediğinizden emin misiniz?`)) {
    try {
      // await deletePermissionApi(permission.id)
      await loadPermissions()
      toast.success('İzin başarıyla silindi')
    } catch (error) {
      console.error('Error deleting permission:', error)
      toast.error('İzin silinirken hata oluştu')
    }
  }
}

// Load initial data
onMounted(async () => {
  await loadPermissions()
})

// SEO
useHead({
  title: 'İzin Yönetimi - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Sistem genelinde kullanıcı izinlerini yönetin' }
  ]
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