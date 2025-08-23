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
      @filter="handleFilter"
    >
      <!-- Custom cell renderers -->
      <template #cell-name="{ item, value }">
        <div class="permission-name-cell">
          <div class="permission-icon">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
          </div>
          <div class="permission-info">
            <span class="permission-title">{{ value }}</span>
            <span v-if="item.code" class="permission-code">{{ item.code }}</span>
          </div>
        </div>
      </template>

      <template #cell-resource="{ item, value }">
        <div class="resource-cell">
          <div class="resource-badge" :class="getResourceColorClass(value)">
            <div class="resource-icon">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getResourceIconPath(value)" />
              </svg>
            </div>
            <span class="resource-name">{{ formatResourceName(value) }}</span>
          </div>
        </div>
      </template>

      <template #cell-action="{ item, value }">
        <div class="action-cell">
          <span class="action-badge" :class="getActionColorClass(value)">
            <svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActionIconPath(value)" />
            </svg>
            {{ formatActionName(value) }}
          </span>
        </div>
      </template>

      <template #cell-description="{ item, value }">
        <div class="description-cell">
          <p class="description-text" :title="value">
            {{ value || 'Açıklama bulunmuyor' }}
          </p>
        </div>
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
    filterType: 'text',
    width: '300px'
  },
  { 
    key: 'resource',
    label: 'Kaynak', 
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '180px'
  },
  { 
    key: 'action',
    label: 'İşlem', 
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '150px'
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

// Formatting methods
const formatResourceName = (resource) => {
  const resourceNames = {
    'users': 'Kullanıcılar',
    'roles': 'Roller',
    'permissions': 'İzinler',
    'settings': 'Ayarlar',
    'dashboard': 'Dashboard',
    'reports': 'Raporlar',
    'files': 'Dosyalar',
    'system': 'Sistem'
  }
  return resourceNames[resource?.toLowerCase()] || resource
}

const formatActionName = (action) => {
  const actionNames = {
    'create': 'Oluştur',
    'read': 'Oku',
    'update': 'Güncelle',
    'delete': 'Sil',
    'view': 'Görüntüle',
    'manage': 'Yönet',
    'export': 'Dışa Aktar',
    'import': 'İçe Aktar',
    'list': 'Listele'
  }
  return actionNames[action?.toLowerCase()] || action
}

// Style methods
const getResourceColorClass = (resource) => {
  const colorMap = {
    'users': 'resource-blue',
    'roles': 'resource-purple',
    'permissions': 'resource-green',
    'settings': 'resource-orange',
    'dashboard': 'resource-indigo',
    'reports': 'resource-pink',
    'files': 'resource-yellow',
    'system': 'resource-red'
  }
  return colorMap[resource?.toLowerCase()] || 'resource-gray'
}

const getActionColorClass = (action) => {
  const colorMap = {
    'create': 'action-green',
    'read': 'action-blue',
    'update': 'action-yellow',
    'delete': 'action-red',
    'view': 'action-indigo',
    'manage': 'action-purple',
    'export': 'action-orange',
    'import': 'action-pink',
    'list': 'action-purple'
  }
  return colorMap[action?.toLowerCase()] || 'action-gray'
}

const getResourceIconPath = (resource) => {
  const iconPaths = {
    'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    'roles': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'permissions': 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z',
    'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'dashboard': 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    'reports': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'files': 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6h-2V5H6v4H4V5z',
    'system': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
  }
  return iconPaths[resource?.toLowerCase()] || 'M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z'
}

const getActionIconPath = (action) => {
  const iconPaths = {
    'create': 'M12 4v16m8-8H4',
    'read': 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    'update': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    'delete': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    'view': 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    'manage': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'export': 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'import': 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10',
    'list': 'M4 6h16M4 10h16M4 14h16M4 18h16'
  }
  return iconPaths[action?.toLowerCase()] || 'M13 10V3L4 14h7v7l9-11h-7z'
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

/* Permission Name Cell */
.permission-name-cell {
  @apply flex items-center gap-3;
}

.permission-icon {
  @apply w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0;
}

.permission-icon .icon {
  @apply w-4 h-4 text-blue-600;
}

.permission-info {
  @apply flex flex-col;
}

.permission-title {
  @apply font-semibold text-gray-900 text-sm;
}

.permission-code {
  @apply text-xs text-gray-500 font-mono;
}

/* Resource Cell */
.resource-cell {
  @apply flex items-center;
}

.resource-badge {
  @apply inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium;
}

.resource-icon {
  @apply w-3 h-3;
}

.resource-icon .icon {
  @apply w-3 h-3;
}

/* Resource Colors */
.resource-blue { @apply bg-blue-100 text-blue-800; }
.resource-purple { @apply bg-purple-100 text-purple-800; }
.resource-green { @apply bg-green-100 text-green-800; }
.resource-orange { @apply bg-orange-100 text-orange-800; }
.resource-indigo { @apply bg-indigo-100 text-indigo-800; }
.resource-pink { @apply bg-pink-100 text-pink-800; }
.resource-yellow { @apply bg-yellow-100 text-yellow-800; }
.resource-red { @apply bg-red-100 text-red-800; }
.resource-gray { @apply bg-gray-100 text-gray-800; }

/* Action Cell */
.action-cell {
  @apply flex items-center;
}

.action-badge {
  @apply inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium;
}

.action-icon {
  @apply w-3 h-3;
}

/* Action Colors */
.action-green { @apply bg-green-100 text-green-800; }
.action-blue { @apply bg-blue-100 text-blue-800; }
.action-yellow { @apply bg-yellow-100 text-yellow-800; }
.action-red { @apply bg-red-100 text-red-800; }
.action-indigo { @apply bg-indigo-100 text-indigo-800; }
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

/* Responsive */
@media (max-width: 768px) {
  .permission-name-cell {
    @apply flex-col items-start gap-2;
  }
  
  .resource-badge,
  .action-badge {
    @apply px-2 py-0.5;
  }
}
</style>