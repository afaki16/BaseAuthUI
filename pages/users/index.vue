<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="users.length < 11"
      :items="users"
      :loading="isLoading"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon color="medium-emphasis" icon="mdi-account-multiple" size="x-small" start></v-icon>
            Kullanıcılar
          </v-toolbar-title>
          <v-btn
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Yeni Kullanıcı"
            border
            @click="openCreateDialog"
            :loading="isLoading"
          ></v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.fullName="{ value }">
        <v-chip :text="value" border="thin opacity-25" prepend-icon="mdi-account" label />
      </template>

      <template v-slot:item.role="{ item }">
        <v-chip v-if="item.roles && item.roles.length" :text="item.roles[0].name" border label size="small" color="primary" />
        <span v-else>-</span>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" :text="getStatusText(item.status)" size="small" variant="flat" />
      </template>

      <template v-slot:item.email="{ value }">
        <span>{{ value }}</span>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon color="medium-emphasis" icon="mdi-pencil" size="small" @click="editUser(item)"></v-icon>
          <v-icon color="medium-emphasis" icon="mdi-delete" size="small" @click="deleteUser(item)"></v-icon>
        </div>
      </template>

      <template v-slot:no-data>
        <v-btn
          prepend-icon="mdi-backup-restore"
          rounded="lg"
          text="Yenile"
          variant="text"
          border
          @click="loadUsers"
        ></v-btn>
      </template>
    </v-data-table>

    <!-- Dialog ve diğer kodlar aynı kalacak -->
    <v-dialog v-model="showUserDialog" max-width="500">
      <v-card>
        <v-card-title>{{ isEditing ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı' }}</v-card-title>
        <v-card-text>
          <v-form ref="userFormRef" @submit.prevent="saveUser">
            <v-text-field v-model="userForm.fullName" label="Ad Soyad" :rules="[v => !!v || 'Zorunlu alan']" required />
            <v-text-field v-model="userForm.email" label="E-posta" :rules="[v => !!v || 'Zorunlu alan']" required type="email" />
            <v-select v-model="userForm.roleId" :items="roleOptions" label="Rol" item-title="title" item-value="value" :rules="[v => !!v || 'Zorunlu alan']" required />
            <v-text-field v-model="userForm.phoneNumber" label="Telefon" />
            <v-select v-model="userForm.status" :items="statusOptions" label="Durum" item-title="title" item-value="value" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showUserDialog = false">İptal</v-btn>
          <v-btn color="primary" :loading="isSaving" @click="saveUser">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
          <v-btn variant="outlined" @click="showDeleteDialog = false">İptal</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="isDeleting">Sil</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
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
const { getUsers, createUser, updateUser, deleteUser: deleteUserApi } = useUsers()
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
const showUserDialog = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const userFormRef = ref(null)
const userForm = ref({
  id: null,
  fullName: '',
  email: '',
  roleId: null,
  phoneNumber: '',
  status: 1
})

// Table headers
const headers = [
  { title: 'Ad Soyad', key: 'fullName' },
  { title: 'E-posta', key: 'email' },
  { title: 'Rol', key: 'role' },
  { title: 'Durum', key: 'status' },
  { title: 'İşlemler', key: 'actions', sortable: false }
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
  isEditing.value = false
  userForm.value = { id: null, fullName: '', email: '', roleId: null, phoneNumber: '', status: 1 }
  showUserDialog.value = true
}

const viewUser = (user) => {
  console.log('View user:', user)
  toast.info('Kullanıcı görüntüleme özelliği yakında eklenecek')
}

const editUser = (user) => {
  isEditing.value = true
  userForm.value = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roleId: user.roles && user.roles.length > 0 ? user.roles[0].id : null,
    phoneNumber: user.phoneNumber || '',
    status: user.status || 1
  }
  showUserDialog.value = true
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

const saveUser = async () => {
  if (!userForm.value.fullName || !userForm.value.email || !userForm.value.roleId) {
    toast.error('Lütfen zorunlu alanları doldurun')
    return
  }
  isSaving.value = true
  try {
    if (isEditing.value) {
      await updateUser({
        id: userForm.value.id,
        fullName: userForm.value.fullName,
        email: userForm.value.email,
        phoneNumber: userForm.value.phoneNumber,
        status: userForm.value.status,
        roleId: userForm.value.roleId
      })
      toast.success('Kullanıcı güncellendi')
    } else {
      await createUser({
        fullName: userForm.value.fullName,
        email: userForm.value.email,
        phoneNumber: userForm.value.phoneNumber,
        status: userForm.value.status,
        roleId: userForm.value.roleId
      })
      toast.success('Kullanıcı eklendi')
    }
    showUserDialog.value = false
    await loadUsers()
  } catch (error) {
    toast.error('Kullanıcı kaydedilirken hata oluştu')
  } finally {
    isSaving.value = false
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
</style> 