<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">İzin Yönetimi</h1>
          <p class="text-gray-600 mt-1">Sistem genelinde kullanıcı izinlerini yönetin</p>
        </div>
        <button
          @click="$router.push('/permissions/create')"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Icon name="mdi:key-plus" class="w-5 h-5" />
          <span>Yeni İzin Ekle</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="permissionsStore.isLoading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
          <Icon name="mdi:loading" class="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">İzinler yükleniyor...</h3>
        <p class="text-gray-500">Lütfen bekleyin</p>
      </div>
    </div>

    <!-- Content when not loading -->
    <div v-else>
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="mdi:key" class="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ permissionsStore.permissions.length }}</div>
              <div class="text-sm font-medium text-gray-500">Toplam İzin</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="mdi:check-circle" class="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ activePermissionsCount }}</div>
              <div class="text-sm font-medium text-gray-500">Aktif İzinler</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="mdi:shield-account" class="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ uniqueResourcesCount }}</div>
              <div class="text-sm font-medium text-gray-500">Kaynak Türü</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon name="mdi:account-group" class="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalAssignedCount }}</div>
              <div class="text-sm font-medium text-gray-500">Atanmış İzinler</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Arama</label>
            <div class="relative">
              <Icon name="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="İzinleri ara..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kaynak</label>
            <select
              v-model="resourceFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tümü</option>
              <option v-for="resource in uniqueResources" :key="resource" :value="resource">
                {{ resource }}
              </option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      <!-- Permissions Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">İzinler</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İzin Adı
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kaynak
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="permission in filteredPermissions" :key="permission.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="mdi:key" class="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ permission.name }}</div>
                      <div class="text-sm text-gray-500">{{ permission.displayName || permission.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ permission.resource }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {{ permission.action || permission.type || 'N/A' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ permission.description || 'Açıklama yok' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      permission.isActive !== false
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ permission.isActive !== false ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewPermission(permission)"
                      class="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                      title="Görüntüle"
                    >
                      <Icon name="mdi:eye" class="w-4 h-4" />
                    </button>
                    <button
                      @click="editPermission(permission)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Düzenle"
                    >
                      <Icon name="mdi:pencil" class="w-4 h-4" />
                    </button>
                    <button
                      @click="deletePermission(permission)"
                      class="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Sil"
                    >
                      <Icon name="mdi:delete" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredPermissions.length === 0 && !permissionsStore.isLoading" class="text-center py-12">
          <Icon name="mdi:key-off" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">İzin bulunamadı</h3>
          <p class="text-gray-500">Arama kriterlerinize uygun izin bulunmuyor.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useHead({
  title: 'İzin Yönetimi - DentBook',
  meta: [
    { name: 'description', content: 'DentBook sisteminde izin ve yetki yönetimi' }
  ]
})

// Composables
const permissionsStore = usePermissionsStore()

// Reactive data
const searchTerm = ref('')
const resourceFilter = ref('')

// Computed
const filteredPermissions = computed(() => {
  let permissions = permissionsStore.permissions

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    permissions = permissions.filter(permission => 
      permission.name.toLowerCase().includes(search) ||
      (permission.displayName && permission.displayName.toLowerCase().includes(search)) ||
      (permission.description && permission.description.toLowerCase().includes(search)) ||
      permission.resource.toLowerCase().includes(search) ||
      (permission.action && permission.action.toLowerCase().includes(search)) ||
      (permission.type && permission.type.toString().toLowerCase().includes(search))
    )
  }

  if (resourceFilter.value) {
    permissions = permissions.filter(permission => permission.resource === resourceFilter.value)
  }

  return permissions
})

const activePermissionsCount = computed(() => 
  permissionsStore.permissions.filter(permission => permission.isActive !== false).length
)

const uniqueResources = computed(() => 
  [...new Set(permissionsStore.permissions.map(permission => permission.resource))]
)

const uniqueResourcesCount = computed(() => uniqueResources.value.length)

const totalAssignedCount = computed(() => 
  permissionsStore.permissions.reduce((total, permission) => total + (permission.assignedCount || 0), 0)
)

// Methods
const resetFilters = () => {
  searchTerm.value = ''
  resourceFilter.value = ''
}

const viewPermission = (permission) => {
  $router.push(`/permissions/${permission.id}`)
}

const editPermission = (permission) => {
  $router.push(`/permissions/${permission.id}/edit`)
}

const deletePermission = async (permission) => {
  if (confirm(`${permission.name} iznini silmek istediğinizden emin misiniz?`)) {
    try {
      await permissionsStore.deletePermission(permission.id)
      alert(`${permission.name} izni başarıyla silindi`)
    } catch (error) {
      console.error('İzin silinirken hata oluştu:', error)
      alert('İzin silinirken bir hata oluştu')
    }
  }
}

// Load permissions on mount
onMounted(async () => {
  try {
    await permissionsStore.fetchPermissions()
  } catch (error) {
    console.error('İzinler yüklenirken hata oluştu:', error)
    
    // API bağlantı hatası kontrolü
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      alert('API sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.')
    } else if (error.response?.status === 404) {
      alert('API endpoint bulunamadı. Lütfen API URL\'ini kontrol edin.')
    } else if (error.response?.status === 401) {
      alert('Yetkilendirme hatası. Lütfen tekrar giriş yapın.')
    } else {
      alert(`İzinler yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`)
    }
  }
})
</script> 