<template>
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
      toolbar-icon="mdi-key-variant"
      search-placeholder="İzin ara..."
      :loading="isLoading"
      loading-text="İzinler yükleniyor..."
      empty-title="İzin bulunamadı"
      empty-description="Henüz hiç izin tanımlanmamış."
      :show-add-button="false"
      :show-advanced-filters="true"
      :show-actions="false"
      :show-pagination="true"
      :items-per-page="10"
      @search="handleSearch"
    >
      <!-- Custom cell renderers -->
      <template #cell-resource="{ item, value }">
        <div class="resource-cell">
          <div class="resource-badge" :class="getResourceColorClass(value)">
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
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseDataTable from '~/components/UI/BaseDataTable.vue'

// Page metadata - Önemli !!!
definePageMeta({
  title: 'İzin Yönetimi',
  requiresAuth: true,
  permissions: ['permissions.read']
})

useHead({
  title: 'İzin Yönetimi',
})

// Composables
const { getPermissions } = usePermissions()
const toast = useToast()

// Reactive data
const permissions = ref([])
const isLoading = ref(false)


console.log('fakı',permissions)

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
    width: '300px'
  },
  { 
    key: 'action',
    label: 'İşlem', 
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '300px'
  },
  { 
    key: 'description',
    label: 'Açıklama',
    sortable: false,
    filterable: true,
    filterType: 'text',
    width: '300px'
  }
]

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



// Load initial data
onMounted(async () => {
  await loadPermissions()
})

</script>

<style scoped>

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