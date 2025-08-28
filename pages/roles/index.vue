<template>
  <!-- Breadcrumb -->
    <div class="mb-6">
      <BreadCrumb :items="[
        { text: 'Ana Sayfa', to: '/' },
        { text: 'Roller' }
      ]" />
    </div>

     <!-- DataTable -->
     <BaseDataTable
      :items="roles"
      :columns="tableColumns"
      title="Roller"
      toolbar-icon="mdi-shield-account"
      search-placeholder="Rol ara..."
      add-button-text="Yeni Rol Ekle"
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
      @view="openCreateDialog"
      @edit="openCreateDialog"
      @delete="openDeleteDialog"
      @search="handleSearch"
    >
       <!-- For RoleName -->
    <template #cell-name="{ item, value }">
  <v-chip
    color="primary"
    variant="tonal"
    size="default"
    prepend-icon="mdi-shield-account"
  >
    {{ value }}
  </v-chip>
</template>

    <!-- For isSystemRole -->
  <template #cell-isSystemRole="{ item, value }">
  <v-chip
    :color="value == true ? 'warning' : 'info'"
    size="small"
    variant="tonal"
  >
    {{ value == true ? 'Sistem' : 'Özel' }}
  </v-chip>
</template>

     </BaseDataTable>

    <!-- Create Role Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="700">
      <v-card>
        <v-card-text>
          <RoleForm
            :permissions="permissions"
            :loading="isLoading"
            @submit="handleCreateRole"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
   
     <ConfirmDialog
  v-model="showDeleteDialog"
  title="İşlemi Onayla"
  message="Bu işlemi gerçekleştirmek istediğinizden emin misiniz?"
  @confirm="confirmDelete"
/>
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RoleForm from '~/components/Roles/RoleForm.vue'
import BaseDataTable from '~/components/UI/BaseDataTable.vue'

// Page metadata
definePageMeta({
  title: 'Roller',
  requiresAuth: true,
  permissions: ['roles.read']
})

useHead({
  title: 'Roller',
})

//DataTable Header
const tableColumns = [
  
  { 
    label: 'Rol Adı', 
    key: 'name', 
    sortable: true,
    filterable: true, 
    filterType: 'text',
    width: '300px',
  },
  { 
    label: 'Rol Tipi', 
    key: 'isSystemRole',
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '300px'
  },
   { 
    label: 'Rol Açıklaması', 
    key: 'description',
    sortable: true,
    filterable: false,
    width: '300px'
  }
]

// Composables
const { getRoles, deleteRole: deleteRoleApi } = useRoles()
const { getPermissions } = usePermissions()
const toast = useToast()

// Reactive data
const roles = ref([])
const permissions = ref([])
const isLoading = ref(false)
const isDeleting = ref(false)

// Dialog states
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const roleToDelete = ref(null)


// Methods
const loadRoles = async () => {
  try {
    isLoading.value = true
    const response = await getRoles()
    // Handle different response formats
    if (Array.isArray(response)) {
      roles.value = response
    } else if (response && response.data) {
      roles.value = response.data.items || response.data
    } else {
      roles.value = []
    }
  } catch (error) {
    toast.error('Roller yüklenirken hata oluştu')
  } finally {
    isLoading.value = false
  }
}

const loadPermissions = async () => {
  try {
    const response = await getPermissions()
    permissions.value = response || []
  } catch (error) {
    permissions.value = []
  }
}

const handleSearch = () => {
  loadRoles()
}

const openCreateDialog = () => {
  showCreateDialog.value = true
}

const openDeleteDialog = () => {
  showDeleteDialog.value = true
}


const handleCreateRole = async (roleData) => {
  try {
    isLoading.value = true
    await roles.createRole(roleData)
    toast.success('Rol başarıyla oluşturuldu!')
    showCreateDialog.value = false
    await loadRoles()
  } catch (error) {
    toast.error('Rol oluşturulurken hata oluştu')
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = async () => {
  if (!roleToDelete.value) return

  try {
    isDeleting.value = true
    await deleteRoleApi(roleToDelete.value.id)
    await loadRoles()
    toast.success('Rol başarıyla silindi')
  } catch (error) {
    console.error('Error deleting role:', error)
    toast.error('Rol silinirken hata oluştu')
  } finally {
    isDeleting.value = false
    roleToDelete.value = null
    showDeleteDialog.value = false
  }
}

// Load initial data
onMounted(async () => {
  await Promise.all([loadRoles(), loadPermissions()])
})
</script>
