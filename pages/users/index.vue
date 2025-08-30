Sana roleForm u attım ve roles/index.vue kısmını attım düzenle kısmında yine roleForm u açıcam ama verilerin dolu gelmesi lazım, sil kısmında ise id yi göndererek silme işlemi yapmak isterim ve bunları uygun #region kısımlarına ekledim farkındaysan sen de ekle

İki dosyadaki kodları analiz ederek edit ve delete işlemleri için gerekli düzenlemeleri yapacağım.
roles/index.vue - Updated
Code 

Ayrıca RoleForm'da bir küçük düzenleme gerekiyor. Edit modunda formData'nın doğru şekilde doldurulması için permission ID'lerin string olarak tutulması gerekiyor:
RoleForm.vue - Updated Script Section
Code 
Yapılan Değişiklikler:
roles/index.vue:

    #region yapısı eklendi ve kodlar uygun bölümlere ayrıldı
    Edit işlevi eklendi:
        openEditDialog(item) metodu
        selectedRole ve isEditMode reactive değişkenleri
        updateRole composable'ı eklendi
    Delete işlevi geliştirildi:
        confirmDelete() metodu ID ile silme işlemi yapıyor
        closeDeleteDialog() metodu eklendi
        Loading state'i eklendi
    Dialog yönetimi iyileştirildi:
        View, edit ve create için ayrı metodlar
        Form'a @cancel event'i eklendi

RoleForm.vue için gerekli değişiklik:

    watchEffect kısmında permission ID'lerin string olarak tutulması (checkbox v-model uyumluluğu için)
    Edit modunda form verilerinin doğru şekilde doldurulması
    Form reset işlemi eklendi

Kullanım:

    Yeni rol ekle: Create dialog'u açılır, boş form gösterilir
    Rol düzenle: Edit dialog'u açılır, mevcut verilerle form doldurulur
    Rol görüntüle: View dialog'u açılır, veriler görüntülenir
    Rol sil: Onay dialog'u açılır, onaylanırsa ID ile silme işlemi yapılır

Bu yapı ile CRUD işlemlerin tamamı #region'lar halinde düzenli bir şekilde organize edilmiştir.

RoleForm.vue son değişliklerden sonra yeniden yazar mısın bana
RoleForm.vue - Complete Updated
Code 

İşte RoleForm.vue'nun güncellenmiş hali. Temel değişiklikler:
Önemli Değişiklikler:
1. Permission ID Yönetimi:
javascript

// Checkbox'lar için String kullan
:value="String(permission.id)"

// Submit sırasında Number'a çevir
permissionIds: formData.permissionIds.map(id => Number(id))

2. Form Reset/Init Mantığı:
javascript

watchEffect(() => {
  if (props.role) {
    // Edit mode - verileri doldur
    Object.assign(formData, {
      name: props.role.name,
      description: props.role.description || '',
      permissionIds: props.role.permissions?.map(p => String(p.id)) || []
    })
  } else {
    // Create mode - formu temizle
    Object.assign(formData, {
      name: '',
      description: '',
      permissionIds: []
    })
  }
})

3. Resource Permission Methodları Güncellendi:
javascript

// String ID kontrolü
const isResourceFullySelected = (resource: string) => {
  return resourcePermissions.every(p => formData.permissionIds.includes(String(p.id)))
}

// Toggle işleminde String ID kullan
const toggleResourcePermissions = (resource: string, selected: boolean) => {
  if (selected) {
    resourcePermissions.forEach(permission => {
      const permissionId = String(permission.id)
      if (!formData.permissionIds.includes(permissionId)) {
        formData.permissionIds.push(permissionId)
      }
    })
  }
}

4. Select/Clear All Methodları:
javascript

const selectAllPermissions = () => {
  formData.permissionIds = props.permissions.map(p => String(p.id))
}

const clearAllPermissions = () => {
  formData.permissionIds = []
}

Bu güncellenmiş RoleForm artık:

    ✅ Edit modunda mevcut verileri doğru şekilde yükler
    ✅ Create modunda temiz form gösterir
    ✅ Permission ID'lerini checkbox'lar için string olarak tutar
    ✅ Submit sırasında number'a çevirir
    ✅ Sistem rolleri için düzenleme kısıtlaması var
    ✅ Tüm permission işlemleri doğru çalışır

benzer şekilde user içinde yapar mısın,
users/index.vue - Updated
Code 

Ayrıca UserForm'da da benzer düzenlemeler gerekiyor. Edit modunda form verilerinin doğru şekilde doldurulması için:
UserForm.vue - Updated Script Section
Code 

Ve ayrıca UserForm template'inde checkbox value'larını da String olarak güncellemen gerekiyor:
UserForm.vue - Template Fix for Role Checkboxes
Code 
Yapılan Değişiklikler:
users/index.vue:

    #region yapısı eklendi ve kodlar uygun bölümlere ayrıldı
    Edit işlevi eklendi:
        openEditDialog(item) metodu
        selectedUser ve isEditMode reactive değişkenleri
        updateUser composable'ı eklendi
    Delete işlevi geliştirildi:
        confirmDelete() metodu ID ile silme işlemi yapıyor
        closeDeleteDialog() metodu eklendi
        Loading state'i eklendi
        ConfirmDialog component'i eklendi
    Dialog yönetimi iyileştirildi:
        View, edit ve create için ayrı metodlar
        Form'a @cancel event'i eklendi
    Kaldırılan gereksiz metodlar:
        viewPermission, editPermission, deletePermission metodları kaldırıldı
        Doğru metodlarla değiştirildi

UserForm.vue için gerekli değişiklikler:

    watchEffect güncellemesi: Role ID'lerin string olarak tutulması (checkbox v-model uyumluluğu için)
    **Form r


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
      @view="openViewDialog"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
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

  <!-- Create/Edit User Dialog -->
  <v-dialog v-model="showCreateDialog" max-width="800" scrollable>
    <v-card class="dialog-card">
      <UserForm
        :user="selectedUser"
        :roles="roles"
        :loading="isLoading"
        @submit="handleSubmitUser"
        @cancel="closeCreateDialog"
      />
    </v-card>
  </v-dialog>

  <!-- Confirm Delete Dialog -->
  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Kullanıcıyı Sil"
    :message="`'${userToDelete?.firstName} ${userToDelete?.lastName}' kullanıcısını silmek istediğinizden emin misiniz?`"
    type="error"
    confirm-text="Sil"
    :loading="isDeleting"
    @confirm="confirmDelete"
    @cancel="closeDeleteDialog"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dateTimeFormatLong } from '~/utils/datesFormat.ts'
import BaseDataTable from '~/components/UI/BaseDataTable.vue'
import UserForm from '~/components/Users/UserForm.vue'
import ConfirmDialog from '~/components/UI/ConfirmDialog.vue'

//#region Page Metadata
definePageMeta({
  title: 'Kullanıcılar',
  requiresAuth: true,
  permissions: ['users.read']
})

useHead({
  title: 'Kullanıcılar',
})
//#endregion

//#region DataTable Header
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
//#endregion

//#region Composables
const { getUsers, createUser, updateUser, deleteUser } = useUsers()
const { getRoles } = useRoles()
//#endregion

//#region Reactive Data
const roles = ref([]) 
const users = ref([])
const isLoading = ref(false)
const isDeleting = ref(false)

// Dialog states
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref(null)
const userToDelete = ref(null)
const isEditMode = ref(false)
//#endregion

//#region Methods
const loadRoles = async () => {
  try {
    const response = await getRoles()
    roles.value = response || []
  } catch (error) {
    console.error('Error loading roles:', error)
    roles.value = []
  }
}

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
//#endregion

//#region Dialog Operations
const openCreateDialog = () => {
  selectedUser.value = null
  isEditMode.value = false
  showCreateDialog.value = true
}

const openViewDialog = (item) => {
  selectedUser.value = { ...item }
  isEditMode.value = false
  showCreateDialog.value = true
}

const openEditDialog = (item) => {
  selectedUser.value = { ...item }
  isEditMode.value = true
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  selectedUser.value = null
  isEditMode.value = false
}

const openDeleteDialog = (item) => {
  userToDelete.value = item
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  userToDelete.value = null
}
//#endregion

//#region CRUD Operations
const handleSubmitUser = async (userData) => {
  try {
    isLoading.value = true
    
    if (isEditMode.value && selectedUser.value) {
      // Update existing user
      await updateUser(selectedUser.value.id, userData)
    } else {
      // Create new user
      await createUser(userData)
    }
    
    closeCreateDialog()
    await loadUsers()
  } catch (error) {
    console.error('Error submitting user:', error)
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  
  try {
    isDeleting.value = true
    await deleteUser(userToDelete.value.id)
    await loadUsers()
    closeDeleteDialog()
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isDeleting.value = false
  }
}
//#endregion

//#region Lifecycle
// Load initial data
onMounted(async () => {
  await Promise.all([loadUsers(), loadRoles()])
})
//#endregion
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.dialog-card {
  max-height: 90vh;
  overflow: hidden;
}
</style>
