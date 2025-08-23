<template>
    <!-- Breadcrumb -->
    <div class="mb-6">
      <BreadCrumb :items="[
        { text: 'Ana Sayfa', to: '/' },
        { text: 'Kullanıcılar' }
      ]" />
    </div>

  <BaseDataTable
      :items="users"
      :columns="tableColumns"
      title="Kullanıcılar"
      toolbar-icon="mdi-account"
      search-placeholder="Kullanıcı ara..."
      add-button-text="Yeni Kullanıcı Ekle"
      :loading="isLoading"
      loading-text="Kullanıcılar yükleniyor..."
      empty-title="Kullanıcı bulunamadı"
      empty-description="Henüz hiç kullanıcı tanımlanmamış."
      :show-add-button="true"
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
    >
    <!-- For FullName -->
 <template #cell-fullName="{ item, value }">
  <v-chip
    color="primary"
    variant="tonal"
    size="default"
    prepend-icon="mdi-account"
  >
    {{ value }}
    <span v-if="item.username" class="ml-1 opacity-75 text-xs">
      (@{{ item.username }})
    </span>
  </v-chip>
</template>

<!-- For Status -->
  <template #cell-status="{ item, value }">
  <v-chip
    :color="value == 1 ? 'success' : 'error'"
    size="small"
    variant="tonal"
  >
    {{ value == 1 ? 'Aktif' : 'Pasif' }}
  </v-chip>
</template>
  </BaseDataTable>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dateTimeFormatLong } from '~/utils/datesFormat.ts'
import BaseDataTable from '~/components/UI/BaseDataTable.vue'

// Page metadata
definePageMeta({
  title: 'Kullanıcılar',
  requiresAuth: true,
  permissions: ['users.read']
})

useHead({
  title: 'Kullanıcılar',
})
// Composables
const { getUsers } = useUsers()
const toast = useToast()

// Reactive data
const users = ref([])
const isLoading = ref(false)

// Table columns for BaseDataTable
const tableColumns = [
  { 
    label: 'Ad Soyad', 
    key: 'fullName',
    sortable: true,
    filterable: true,
    filterType: 'text',
    width: '300px'
  },
  { 
    label: 'E-posta', 
    key: 'email',
    sortable: true,
    filterable: true,
    filterType: 'text',
    width: '250px'
  },
  { 
    label: 'Durum', 
    key: 'status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '120px'
  },
  { 
    label: 'Son Giriş Tarihi', 
    key: 'lastLoginDate',
    sortable: true,
    filterable: false,
    width: '180px',
    formatter: dateTimeFormatLong
  },
]

// Methods
const loadUsers = async () => {
  try {
    isLoading.value = true
    const response = await getUsers()
    debugger
    // Handle different response formats
    if (Array.isArray(response)) {
      users.value = response
    } else if (response && response.data) {
      users.value = response.data.items || response.data
    } else {
      users.value = []
    }
  } catch (error) {
    console.error('Error loading users:', error)
    toast.error('Kullanıcılar yüklenirken hata oluştu')
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  loadUsers()
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
  await Promise.all([loadUsers()])
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}
</style> 