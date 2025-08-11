<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-6">
            <div>
              <h1 class="text-h4 font-weight-bold text-gray-900 mb-2">
                Kullanıcılar
              </h1>
              <p class="text-body-1 text-gray-600">
                Sistem kullanıcılarını görüntüleyin ve yönetin
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="isLoading"
            >
              Yeni Kullanıcı
            </v-btn>
          </div>
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
                    placeholder="Kullanıcı ara..."
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
                <v-col cols="12" md="3">
                  <v-select
                    v-model="roleFilter"
                    :items="roleOptions"
                    label="Rol"
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

      <!-- Users Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Kullanıcı Listesi</span>
              <div class="d-flex align-center gap-2">
                <v-chip
                  v-if="totalUsers > 0"
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  {{ totalUsers }} kullanıcı
                </v-chip>
                <v-btn
                  icon="mdi-refresh"
                  variant="text"
                  size="small"
                  @click="loadUsers"
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
              <div v-else-if="users.length === 0" class="text-center py-12">
                <v-icon
                  icon="mdi-account-group-outline"
                  size="64"
                  color="grey"
                  class="mb-4"
                />
                <h3 class="text-h6 text-grey-darken-1 mb-2">
                  Kullanıcı Bulunamadı
                </h3>
                <p class="text-body-2 text-grey mb-4">
                  Arama kriterlerinize uygun kullanıcı bulunamadı.
                </p>
                <v-btn
                  color="primary"
                  @click="openCreateDialog"
                >
                  Yeni Kullanıcı Ekle
                </v-btn>
              </div>

              <!-- Users Table -->
              <div v-else>
                <v-data-table
                  :headers="tableHeaders"
                  :items="users"
                  :loading="isLoading"
                  :items-per-page="itemsPerPage"
                  :page="currentPage"
                  :total-items="totalUsers"
                  class="elevation-0"
                  @update:page="handlePageChange"
                  @update:items-per-page="handleItemsPerPageChange"
                >
                  <!-- Avatar and User Info -->
                  <template #item.avatar="{ item }">
                    <div class="d-flex align-center">
                      <v-avatar size="40" class="mr-3">
                        <v-img
                          v-if="item.profileImageUrl"
                          :src="item.profileImageUrl"
                          :alt="item.fullName"
                        />
                        <v-icon v-else size="24" color="grey">
                          mdi-account
                        </v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium text-body-1">
                          {{ item.fullName }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ item.email }}
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Status -->
                  <template #item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      :text="getStatusText(item.status)"
                      size="small"
                      variant="flat"
                    />
                  </template>

                  <!-- Roles -->
                  <template #item.roles="{ item }">
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip
                        v-for="role in item.roles.slice(0, 2)"
                        :key="role.id"
                        size="x-small"
                        variant="outlined"
                        color="primary"
                      >
                        {{ role.name }}
                      </v-chip>
                      <v-chip
                        v-if="item.roles.length > 2"
                        size="x-small"
                        variant="outlined"
                        color="grey"
                      >
                        +{{ item.roles.length - 2 }}
                      </v-chip>
                    </div>
                  </template>

                  <!-- Phone Number -->
                  <template #item.phoneNumber="{ item }">
                    <span v-if="item.phoneNumber" class="text-body-2">
                      {{ item.phoneNumber }}
                    </span>
                    <span v-else class="text-caption text-grey">
                      Belirtilmemiş
                    </span>
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
                        @click="viewUser(item)"
                        title="Görüntüle"
                      />
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        color="warning"
                        @click="editUser(item)"
                        title="Düzenle"
                      />
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click="deleteUser(item)"
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

    <!-- Simple Create Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Yeni Kullanıcı</v-card-title>
        <v-card-text>
          <p>Kullanıcı oluşturma özelliği yakında eklenecek.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showCreateDialog = false"
          >
            Kapat
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Kullanıcıyı Sil
        </v-card-title>
        <v-card-text>
          <p class="text-body-1">
            Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

// Page metadata
definePageMeta({
  title: 'Kullanıcılar',
  requiresAuth: true,
  permissions: ['users.read']
})

// Composables
const { getUsers, deleteUser: deleteUserApi } = useUsers()
const { getRoles } = useRoles()
const toast = useToast()

// Reactive data
const users = ref([])
const isLoading = ref(false)
const isDeleting = ref(false)
const searchTerm = ref('')
const statusFilter = ref(null)
const roleFilter = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalUsers = ref(0)
const roles = ref([])

// Dialog states
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const userToDelete = ref(null)

// Table headers
const tableHeaders = [
  { 
    title: 'Kullanıcı', 
    key: 'avatar', 
    sortable: false, 
    width: '300px',
    align: 'start'
  },
  { 
    title: 'Durum', 
    key: 'status', 
    sortable: true, 
    width: '120px',
    align: 'center'
  },
  { 
    title: 'Roller', 
    key: 'roles', 
    sortable: false, 
    width: '200px',
    align: 'start'
  },
  { 
    title: 'Telefon', 
    key: 'phoneNumber', 
    sortable: false, 
    width: '150px',
    align: 'start'
  },
  { 
    title: 'Kayıt Tarihi', 
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

// Status options
const statusOptions = [
  { title: 'Aktif', value: 1 },
  { title: 'Pasif', value: 2 },
  { title: 'Yasaklı', value: 3 },
  { title: 'Doğrulama Bekliyor', value: 4 }
]

// Computed properties
const roleOptions = computed(() => {
  return roles.value.map(role => ({
    title: role.name,
    value: role.id
  }))
})

const hasActiveFilters = computed(() => {
  return searchTerm.value || statusFilter.value !== null || roleFilter.value
})

// Methods
const loadUsers = async () => {
  try {
    isLoading.value = true
    const response = await getUsers(currentPage.value, itemsPerPage.value, searchTerm.value)
    
    // Handle different response formats
    if (Array.isArray(response)) {
      users.value = response
      totalUsers.value = response.length
    } else if (response && response.data) {
      users.value = response.data.items || response.data
      totalUsers.value = response.data.total || response.data.length
    } else {
      users.value = []
      totalUsers.value = 0
    }
  } catch (error) {
    console.error('Error loading users:', error)
    toast.error('Kullanıcılar yüklenirken hata oluştu')
    users.value = []
    totalUsers.value = 0
  } finally {
    isLoading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await getRoles()
    roles.value = response || []
  } catch (error) {
    console.error('Error loading roles:', error)
    roles.value = []
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleFilter = () => {
  currentPage.value = 1
  loadUsers()
}

const clearFilters = () => {
  searchTerm.value = ''
  statusFilter.value = null
  roleFilter.value = null
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadUsers()
}

const handleItemsPerPageChange = (itemsPerPage) => {
  currentPage.value = 1
  loadUsers()
}

const openCreateDialog = () => {
  showCreateDialog.value = true
}

const viewUser = (user) => {
  console.log('View user:', user)
  toast.info('Kullanıcı görüntüleme özelliği yakında eklenecek')
}

const editUser = (user) => {
  console.log('Edit user:', user)
  toast.info('Kullanıcı düzenleme özelliği yakında eklenecek')
}

const deleteUser = (user) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return

  try {
    isDeleting.value = true
    await deleteUserApi(userToDelete.value.id)
    await loadUsers()
    toast.success('Kullanıcı başarıyla silindi')
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.error('Kullanıcı silinirken hata oluştu')
  } finally {
    isDeleting.value = false
    userToDelete.value = null
    showDeleteDialog.value = false
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'error'
    case 4:
      return 'info'
    default:
      return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 1:
      return 'Aktif'
    case 2:
      return 'Pasif'
    case 3:
      return 'Yasaklı'
    case 4:
      return 'Doğrulama Bekliyor'
    default:
      return 'Bilinmiyor'
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
  await Promise.all([loadUsers(), loadRoles()])
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