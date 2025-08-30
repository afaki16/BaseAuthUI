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
      @add="openCreateDialog"
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

<!-- Create User Dialog -->
<v-dialog v-model="showCreateDialog" max-width="800" scrollable>
  <v-card class="dialog-card">
    <UserForm
      :roles="roles"
      :loading="isLoading"
      @submit="handleCreateUser"
      @cancel="showCreateDialog = false"
    />
  </v-card>
</v-dialog>


</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dateTimeFormatLong } from '~/utils/datesFormat.ts'
import BaseDataTable from '~/components/UI/BaseDataTable.vue'
import UserForm from '~/components/Users/UserForm.vue'

// Page metadata
definePageMeta({
  title: 'Kullanıcılar',
  requiresAuth: true,
  permissions: ['users.read']
})

useHead({
  title: 'Kullanıcılar',
})

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

// Composables
const { getUsers, createUser } = useUsers()
const { getRoles } = useRoles()

// Reactive data
const roles = ref([]) 
const users = ref([])
const isLoading = ref(false)

// Dialog states
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const roleToDelete = ref(null)


const loadRoles = async () => {
  try {
    const response = await getRoles()
    roles.value = response || []
    console.log('Alperen',roles.value);
  } catch (error) {
    roles.value = []
  }
}

// Methods
const loadUsers = async () => {
  try {
    isLoading.value = true
    const response = await getUsers()
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
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  loadUsers()
}
const openCreateDialog = () => {
  showCreateDialog.value = true
}

const viewPermission = (permission) => {
  console.log('View permission:', permission)
}

const editPermission = (permission) => {
  console.log('Edit permission:', permission)
}

const deletePermission = async (permission) => {
  if (confirm(`${permission.name} iznini silmek istediğinizden emin misiniz?`)) {
    try {
      // await deletePermissionApi(permission.id)
      console.log('Permission deleted:', permission.name)
    } catch (error) {
      console.error('Error deleting permission:', error)
    }
  }
}

const handleCreateUser = async (userData) => {
  try {
    isLoading.value = true
    await createUser(userData)
    showCreateDialog.value = false
    await loadUsers()
  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    isLoading.value = false
  }
}


// Load initial data
onMounted(async () => {
  await Promise.all([loadUsers(),loadRoles()])
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}
</style> 