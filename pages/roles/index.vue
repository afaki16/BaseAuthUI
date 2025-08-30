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
      loading-text="Roller yükleniyor..."
      empty-title="Roller bulunamadı"
      empty-description="Henüz hiç rol tanımlanmamış."
      :show-add-button="true"
      :show-advanced-filters="true"
      :show-actions="true"
      :show-view-button="true"
      :show-edit-button="true"
      :show-delete-button="true"
      :show-pagination="true"
      :items-per-page="10"
      @add="openCreateDialog"
      @view="openViewDialog"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
      @search="handleSearch"
    >
       <!-- For RoleName -->
    <template #cell-name="{ value }">
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
  <template #cell-isSystemRole="{ value }">
  <v-chip
    :color="value == true ? 'warning' : 'success '"
    size="small"
    variant="tonal"
  >
    {{ value == true ? 'Sistem' : 'Özel' }}
  </v-chip>
</template>

     </BaseDataTable>

    <!-- Create/Edit Role Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="700">
      <v-card>
        <v-card-text>
          <RoleForm
            :role="selectedRole"
            :permissions="permissions"
            :loading="isLoading"
            @submit="handleSubmitRole"
            @cancel="closeCreateDialog"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Rolü Sil"
      :message="`'${roleToDelete?.name}' rolünü silmek istediğinizden emin misiniz?`"
      type="error"
      confirm-text="Sil"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="closeDeleteDialog"
    />
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RoleForm from '~/components/Roles/RoleForm.vue'
import BaseDataTable from '~/components/UI/BaseDataTable.vue'
import ConfirmDialog from '~/components/UI/ConfirmDialog.vue'

//#region Page Metadata
definePageMeta({
  title: 'Roller',
  requiresAuth: true,
  permissions: ['roles.read']
})

useHead({
  title: 'Roller',
})
//#endregion

//#region DataTable Header
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
//#endregion

//#region Composables
const { getRoles, createRole, updateRole, deleteRole } = useRoles()
const { getPermissions } = usePermissions()
//#endregion

//#region Reactive Data
const roles = ref([])
const permissions = ref([])
const isLoading = ref(false)
const isDeleting = ref(false)

// Dialog states
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedRole = ref(null)
const roleToDelete = ref(null)
const isEditMode = ref(false)
//#endregion

//#region Methods
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
    console.error('Error loading roles:', error)
  } finally {
    isLoading.value = false
  }
}

const loadPermissions = async () => {
  try {
    const response = await getPermissions()
    permissions.value = response || []
  } catch (error) {
    console.error('Error loading permissions:', error)
    permissions.value = []
  }
}

const handleSearch = () => {
  loadRoles()
}
//#endregion

//#region Dialog Operations
const openCreateDialog = () => {
  selectedRole.value = null
  isEditMode.value = false
  showCreateDialog.value = true
}

const openViewDialog = (item) => {
  selectedRole.value = { ...item }
  isEditMode.value = false
  showCreateDialog.value = true
}

const openEditDialog = (item) => {
  selectedRole.value = { ...item }
  isEditMode.value = true
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  selectedRole.value = null
  isEditMode.value = false
}

const openDeleteDialog = (item) => {
  roleToDelete.value = item
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  roleToDelete.value = null
}
//#endregion

//#region CRUD Operations
const handleSubmitRole = async (roleData) => {
  try {
    isLoading.value = true
    
    if (isEditMode.value && selectedRole.value) {
      // Update existing role
      await updateRole(selectedRole.value.id, roleData)
    } else {
      // Create new role
      await createRole(roleData)
    }
    
    closeCreateDialog()
    await loadRoles()
  } catch (error) {
    console.error('Error submitting role:', error)
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = async () => {
  if (!roleToDelete.value) return
  
  try {
    isDeleting.value = true
    await deleteRole(roleToDelete.value.id)
    await loadRoles()
    closeDeleteDialog()
  } catch (error) {
    console.error('Error deleting role:', error)
  } finally {
    isDeleting.value = false
  }
}
//#endregion

//#region Lifecycle
// Load initial data
onMounted(async () => {
  await Promise.all([loadRoles(), loadPermissions()])
})
//#endregion
</script>