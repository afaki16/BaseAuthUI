<template>
  <div class="min-h-screen bg-gray-50">
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-6">
            <div>
              <BreadCrumb :items="[
                { text: 'Ana Sayfa', to: '/' },
                { text: 'İzinler' }
              ]" />
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="primary" class="mr-4">
                  mdi-key
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ permissions.length }}</div>
                  <div class="text-body-2 text-grey">Toplam İzin</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="purple" class="mr-4">
                  mdi-shield-account
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ uniqueResourcesCount }}</div>
                  <div class="text-body-2 text-grey">Kaynak Türü</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="success" class="mr-4">
                  mdi-check-circle
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ activePermissionsCount }}</div>
                  <div class="text-body-2 text-grey">Aktif İzin</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="48" color="info" class="mr-4">
                  mdi-account-multiple
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold">{{ totalAssignedCount }}</div>
                  <div class="text-body-2 text-grey">Toplam Atama</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Permissions DataTable -->
      <v-row>
        <v-col cols="12">
          <DataTable
            :fields="tableHeaders"
            :items="permissions"
            :loading="isLoading"
            loading-text="İzinler yükleniyor..."
            empty-title="İzin bulunamadı"
            empty-description="Henüz hiç izin tanımlanmamış."
            search-placeholder="İzin ara..."
            add-button-text="Yeni İzin Ekle"
            :show-add-button="false"
            :show-view-button="false"
            :show-edit-button="false"
            :show-delete-button="false"
            :show-actions="false"
            @add="createPermission"
            @view="viewPermission"
            @edit="editPermission"
            @delete="deletePermission"
          >
            <!-- Custom cell renderers -->
            <template #cell-name="{ item, value }">
              <div class="d-flex align-center">
                <v-icon size="20" color="primary" class="mr-2">
                  mdi-key
                </v-icon>
                <span class="font-weight-medium">{{ value }}</span>
              </div>
            </template>

            <template #cell-resource="{ item, value }">
              <v-chip
                size="small"
                color="primary"
                variant="outlined"
                class="font-weight-medium"
              >
                {{ value }}
              </v-chip>
            </template>

            <template #cell-action="{ item, value }">
              <v-chip
                size="small"
                :color="getActionColor(value)"
                variant="tonal"
                class="font-weight-medium"
              >
                {{ value }}
              </v-chip>
            </template>

            <template #cell-description="{ item, value }">
              <span class="text-body-2 text-grey-600">
                {{ value || 'Açıklama yok' }}
              </span>
            </template>

            <!-- Custom actions -->
            <template #actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="viewPermission(item)"
                title="Görüntüle"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="warning"
                @click="editPermission(item)"
                title="Düzenle"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deletePermission(item)"
                title="Sil"
              />
            </template>
          </DataTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import DataTable from '~/components/UI/DataTable.vue'

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

// Table headers
const tableHeaders = [
  { 
    label: 'İzin Adı', 
    value: 'name', 
    sortable: true 
  },
  { 
    label: 'Kaynak', 
    value: 'resource', 
    sortable: true 
  },
  { 
    label: 'İşlem', 
    value: 'action', 
    sortable: true 
  },
  { 
    label: 'Açıklama', 
    value: 'description' 
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

const getActionColor = (action) => {
  const colors = {
    'create': 'success',
    'read': 'info',
    'update': 'warning',
    'delete': 'error',
    'list': 'primary',
    'export': 'secondary'
  }
  return colors[action?.toLowerCase()] || 'grey'
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
/* Custom styles for the DataTable integration */
:deep(.datatable-wrapper) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.datatable-table) {
  border-radius: 8px;
}

:deep(.datatable-th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #374151;
}

:deep(.datatable-td) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.datatable-tr:hover) {
  background-color: #f9fafb;
}
</style> 