<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
      
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-6">
            <div>
              <BreadCrumb :items="[
      { text: 'Ana Sayfa', to: '/' },
      { text: 'İzinler' }
    ]" />
            </div>
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
        </v-row>


        <!-- Permissions Table -->
        <v-row>
          <v-col cols="12">
            <DataTable
              :fields="tableHeaders"
              :items="filteredPermissions"
              :pageSize="itemsPerPage"
            />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import DataTable from '~/components/UI/DataTable.vue'
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
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Table headers
const tableHeaders = [
  { label: 'İzin Adı', value: 'name' },
  { label: 'Kaynak', value: 'resource' },
  { label: 'İşlem', value: 'action' },
  { label: 'Açıklama', value: 'description' }
]

// Computed properties
const filteredPermissions = computed(() => {
  let filtered = permissions.value

  // Apply search term filter
  if (searchTerm.value) {
    filtered = filtered.filter(permission => 
      permission.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      permission.displayName?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Apply resource filter
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

// Restore searchTerm, resourceFilter, hasActiveFilters, resetFilters, and their usages if they were removed
const searchTerm = ref('')
const resourceFilter = ref(null)

const hasActiveFilters = computed(() => {
  return searchTerm.value || resourceFilter.value
})

const resetFilters = () => {
  searchTerm.value = ''
  resourceFilter.value = null
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