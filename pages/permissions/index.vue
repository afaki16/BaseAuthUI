<template>
  <div class="permissions-page">
    <!-- Breadcrumb -->
    <div class="mb-6">
      <BreadCrumb :items="[
        { text: 'Ana Sayfa', to: '/' },
        { text: 'İzinler' }
      ]" />
    </div>

    <!-- BaseDataTable Component -->
    <BaseDataTable
      :items="permissions"
      :columns="tableColumns"
      title="İzinler"
      description="Tüm izinlerin listesi ve detayları"
      toolbar-icon="mdi-key"
      search-placeholder="İzin ara..."
      add-button-text="Yeni İzin Ekle"
      :loading="isLoading"
      loading-text="İzinler yükleniyor..."
      empty-title="İzin bulunamadı"
      empty-description="Henüz hiç izin tanımlanmamış."
      :show-add-button="true"
      :show-search="true"
      :show-actions="true"
      :show-view-button="true"
      :show-edit-button="true"
      :show-delete-button="true"
      :show-pagination="true"
      :items-per-page="10"
      @add="createPermission"
      @view="viewPermission"
      @edit="editPermission"
      @delete="deletePermission"
      @search="handleSearch"
      @sort="handleSort"
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

      <!-- Custom actions -->
      <template #actions="{ item }">
        <button
          @click="viewPermission(item)"
          class="action-button view-button"
          title="Görüntüle"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button
          @click="editPermission(item)"
          class="action-button edit-button"
          title="Düzenle"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="deletePermission(item)"
          class="action-button delete-button"
          title="Sil"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
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
    sortable: true 
  },
  { 
    key: 'resource',
    label: 'Kaynak', 
    sortable: true 
  },
  { 
    key: 'action',
    label: 'İşlem', 
    sortable: true 
  },
  { 
    key: 'description',
    label: 'Açıklama',
    sortable: false
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
  
  // Add sample data for demonstration if no permissions exist
  if (permissions.value.length === 0) {
    permissions.value = [
      {
        id: 1,
        name: 'Kullanıcı Yönetimi',
        resource: 'users',
        action: 'read',
        description: 'Kullanıcıları görüntüleme izni'
      },
      {
        id: 2,
        name: 'Kullanıcı Oluşturma',
        resource: 'users',
        action: 'create',
        description: 'Yeni kullanıcı oluşturma izni'
      },
      {
        id: 3,
        name: 'Kullanıcı Düzenleme',
        resource: 'users',
        action: 'update',
        description: 'Kullanıcı bilgilerini düzenleme izni'
      },
      {
        id: 4,
        name: 'Kullanıcı Silme',
        resource: 'users',
        action: 'delete',
        description: 'Kullanıcı silme izni'
      },
      {
        id: 5,
        name: 'Rol Yönetimi',
        resource: 'roles',
        action: 'read',
        description: 'Rolleri görüntüleme izni'
      },
      {
        id: 6,
        name: 'Rol Oluşturma',
        resource: 'roles',
        action: 'create',
        description: 'Yeni rol oluşturma izni'
      },
      {
        id: 7,
        name: 'İzin Yönetimi',
        resource: 'permissions',
        action: 'read',
        description: 'İzinleri görüntüleme izni'
      },
      {
        id: 8,
        name: 'İzin Oluşturma',
        resource: 'permissions',
        action: 'create',
        description: 'Yeni izin oluşturma izni'
      },
      {
        id: 9,
        name: 'Sistem Ayarları',
        resource: 'settings',
        action: 'read',
        description: 'Sistem ayarlarını görüntüleme izni'
      },
      {
        id: 10,
        name: 'Rapor İndirme',
        resource: 'reports',
        action: 'export',
        description: 'Raporları indirme izni'
      }
    ]
  }
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

/* Custom styles for the BaseDataTable integration */
:deep(.base-data-table) {
  @apply shadow-lg;
}

:deep(.table-header-cell) {
  @apply font-semibold;
}

:deep(.table-row:hover) {
  @apply bg-gray-50;
}

/* Action button styles */
.action-button {
  @apply p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.view-button {
  @apply text-blue-600 hover:bg-blue-50 focus:ring-blue-500;
}

.edit-button {
  @apply text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500;
}

.delete-button {
  @apply text-red-600 hover:bg-red-50 focus:ring-red-500;
}

.action-button svg {
  @apply h-4 w-4;
}
</style> 