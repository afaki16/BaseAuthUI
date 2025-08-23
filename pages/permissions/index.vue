<template>
  <div class="permissions-page">
    <!-- Breadcrumb -->
    <div class="mb-6">
      <BreadCrumb :items="[
        { text: 'Ana Sayfa', to: '/' },
        { text: 'İzinler' }
      ]" />
    </div>

    <BaseDataTable
      :items="permissions"
      :columns="tableColumns"
      title="İzinler"
      description="Tüm izinlerin listesi ve detayları"
      toolbar-icon="mdi-key-variant"
      search-placeholder="İzin ara..."
      add-button-text="Yeni İzin Ekle"
      :loading="isLoading"
      loading-text="İzinler yükleniyor..."
      empty-title="İzin bulunamadı"
      empty-description="Henüz hiç izin tanımlanmamış."
      :show-add-button="true"
      :show-export-button="false"
      :show-advanced-filters="true"
      :show-actions="true"
      :show-view-button="true"
      :show-edit-button="false"
      :show-delete-button="false"
      :show-pagination="true"
      :items-per-page="10"
      @add="createPermission"
      @view="viewPermission"
      @edit="editPermission"
      @delete="deletePermission"
      @search="handleSearch"
      @sort="handleSort"
      @filter="handleFilter"
    >
      <!-- Custom cell renderers -->
      <template #cell-name="{ item, value }">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span class="font-medium text-gray-900">{{ value }}</span>
        </div>
      </template>

      <template #cell-resource="{ item, value }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {{ value }}
        </span>
      </template>

      <template #cell-action="{ item, value }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getActionColorClass(value)">
          {{ value }}
        </span>
      </template>

      <template #cell-description="{ item, value }">
        <span class="text-sm text-gray-600">
          {{ value || 'Açıklama yok' }}
        </span>
      </template>
    </BaseDataTable>
  </div>
</template>

<script setup>
import BaseDataTable from '~/components/UI/BaseDataTable.vue'

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

// Table columns for BaseDataTable
const tableColumns = [
  { 
    key: 'name',
    label: 'İzin Adı', 
    sortable: true,
    filterable: true,
    filterType: 'text'
  },
  { 
    key: 'resource',
    label: 'Kaynak', 
    sortable: true,
    filterable: true,
    filterType: 'select'
  },
  { 
    key: 'action',
    label: 'İşlem', 
    sortable: true,
    filterable: true,
    filterType: 'select'
  },
  { 
    key: 'description',
    label: 'Açıklama',
    sortable: false,
    filterable: true,
    filterType: 'text'
  }
]

// Computed properties
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

const getActionColorClass = (action) => {
  const colorClasses = {
    'create': 'bg-green-100 text-green-800',
    'read': 'bg-blue-100 text-blue-800',
    'update': 'bg-yellow-100 text-yellow-800',
    'delete': 'bg-red-100 text-red-800',
    'list': 'bg-purple-100 text-purple-800',
    'export': 'bg-gray-100 text-gray-800'
  }
  return colorClasses[action?.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const handleSearch = (query) => {
  console.log('Search query:', query)
  // Additional search logic can be implemented here
}

const handleSort = (sortData) => {
  console.log('Sort data:', sortData)
  // Additional sort logic can be implemented here
}

const handleFilter = (filters) => {
  console.log('Filter data:', filters)
  // Additional filter logic can be implemented here
}

const createPermission = () => {
  toast.info('İzin oluşturma özelliği yakında eklenecek')
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
.permissions-page {
  @apply p-6;
}
-indigo { @apply bg-indigo-100 text-indigo-800; }
.action-purple { @apply bg-purple-100 text-purple-800; }
.action-orange { @apply bg-orange-100 text-orange-800; }
.action-pink { @apply bg-pink-100 text-pink-800; }
.action-gray { @apply bg-gray-100 text-gray-800; }

/* Description Cell */
.description-cell {
  @apply max-w-xs;
}

.description-text {
  @apply text-sm text-gray-600 truncate;
}

/* Status Cell */
.status-cell {
  @apply flex justify-center;
}

.status-indicator {
  @apply inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium;
}

.status-dot {
  @apply w-2 h-2 rounded-full;
}

/* Status Colors */
.status-active {
  @apply bg-green-100 text-green-800;
}
.status-active .status-dot {
  @apply bg-green-500;
}

.status-inactive {
  @apply bg-gray-100 text-gray-800;
}
.status-inactive .status-dot {
  @apply bg-gray-500;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-800;
}
.status-pending .status-dot {
  @apply bg-yellow-500;
}

.status-deprecated {
  @apply bg-red-100 text-red-800;
}
.status-deprecated .status-dot {
  @apply bg-red-500;
}

.status-unknown {
  @apply bg-gray-100 text-gray-600;
}
.status-unknown .status-dot {
  @apply bg-gray-400;
}

/* Date Cell */
.date-cell {
  @apply flex flex-col text-center;
}

.date-text {
  @apply text-sm font-medium text-gray-900;
}

.time-text {
  @apply text-xs text-gray-500;
}

/* Custom Actions */
.custom-actions {
  @apply flex items-center justify-center gap-1;
}

.action-button {
  @apply p-2 rounded-lg transition-colors;
}

.action-button svg {
  @apply w-4 h-4;
}

.view-btn {
  @apply text-blue-600 hover:bg-blue-50;
}

.edit-btn {
  @apply text-yellow-600 hover:bg-yellow-50;
}

.delete-btn {
  @apply text-red-600 hover:bg-red-50;
}

.system-btn {
  @apply text-gray-400 bg-gray-50 cursor-not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .permission-name-cell {
    @apply flex-col items-start gap-2;
  }
  
  .resource-badge,
  .action-badge {
    @apply px-2 py-0.5;
  }
  
  .custom-actions {
    @apply flex-col gap-0.5;
  }
}
</style>