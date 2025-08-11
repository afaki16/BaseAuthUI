<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
  <div>
          <h1 class="text-2xl font-bold text-gray-900">Rol Yönetimi</h1>
          <p class="text-gray-600 mt-1">Sistem genelinde kullanıcı rollerini ve izinlerini yönetin</p>
        </div>
        <button
          @click="$router.push('/roles/create')"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Icon name="mdi:shield-plus" class="w-5 h-5" />
          <span>Yeni Rol Ekle</span>
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer" @click="filterByType(null)">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="mdi:shield-account" class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ rolesStore.roles.length }}</div>
            <div class="text-sm font-medium text-gray-500">Toplam Rol</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer" @click="filterByType('system')">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="mdi:shield-lock" class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ systemRolesCount }}</div>
            <div class="text-sm font-medium text-gray-500">Sistem Rolleri</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer" @click="filterByType('custom')">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="mdi:shield-edit" class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ customRolesCount }}</div>
            <div class="text-sm font-medium text-gray-500">Özel Roller</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="mdi:account-group" class="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ totalActiveUsers }}</div>
            <div class="text-sm font-medium text-gray-500">Aktif Kullanıcılar</div>
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
              placeholder="Rolleri ara..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rol Tipi</label>
          <select
              v-model="typeFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tümü</option>
            <option value="system">Sistem</option>
            <option value="custom">Özel</option>
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

    <!-- Roles Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Roller</h3>
            </div>
            
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol Adı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tip
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı Sayısı
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
            <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Icon name="mdi:shield-account" class="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                    <div class="text-sm text-gray-500">{{ role.displayName }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ role.description || 'Açıklama yok' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    role.type === 'system' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  ]"
                >
                  {{ role.type === 'system' ? 'Sistem' : 'Özel' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ role.userCount || 0 }} kullanıcı
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    role.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ role.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="viewRole(role)"
                    class="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                  >
                    <Icon name="mdi:eye" class="w-4 h-4" />
                  </button>
                  <button
                    @click="editRole(role)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded"
                  >
                    <Icon name="mdi:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    v-if="role.type !== 'system'"
                    @click="deleteRole(role)"
                    class="text-red-600 hover:text-red-900 p-1 rounded"
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
      <div v-if="filteredRoles.length === 0" class="text-center py-12">
        <Icon name="mdi:shield-off" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Rol bulunamadı</h3>
        <p class="text-gray-500">Arama kriterlerinize uygun rol bulunmuyor.</p>
            </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useHead({
  title: 'Rol Yönetimi - DentBook',
  meta: [
    { name: 'description', content: 'DentBook sisteminde rol ve yetki yönetimi' }
  ]
})

// Composables
const rolesStore = useRolesStore()
const authStore = useAuthStore()

// Reactive data
const searchTerm = ref('')
const typeFilter = ref('')

// Computed
const filteredRoles = computed(() => {
  let roles = rolesStore.roles

  if (searchTerm.value) {
    roles = roles.filter(role => 
      role.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      role.displayName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (typeFilter.value) {
    roles = roles.filter(role => role.type === typeFilter.value)
  }

  return roles
})

const systemRolesCount = computed(() => 
  rolesStore.roles.filter(role => role.type === 'system').length
)

const customRolesCount = computed(() => 
  rolesStore.roles.filter(role => role.type === 'custom').length
)

const totalActiveUsers = computed(() => 
  rolesStore.roles.reduce((total, role) => total + (role.userCount || 0), 0)
)

// Methods
const filterByType = (type) => {
  typeFilter.value = type || ''
}

const resetFilters = () => {
  searchTerm.value = ''
  typeFilter.value = ''
}

const viewRole = (role) => {
  $router.push(`/roles/${role.id}`)
}

const editRole = (role) => {
  $router.push(`/roles/${role.id}/edit`)
}

const deleteRole = async (role) => {
  if (confirm(`${role.name} rolünü silmek istediğinizden emin misiniz?`)) {
    try {
      await rolesStore.deleteRole(role.id)
      // Success message
  } catch (error) {
      console.error('Rol silinirken hata oluştu:', error)
    }
  }
}

// Load roles on mount
onMounted(() => {
  rolesStore.fetchRoles()
})
</script>

<style scoped>
.role-card {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.system-role {
  border-left: 4px solid rgb(var(--v-theme-warning));
}
</style> 