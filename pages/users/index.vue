<template>
  <div>
    <PageHeader
      title="User Management"
      description="Manage system users, roles, and permissions"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn
          v-if="authStore.hasPermission('Users.Create')"
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="$router.push('/users/create')"
        >
          Add User
        </v-btn>
      </template>
    </PageHeader>

    <!-- Filters & Search -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchTerm"
              label="Search users..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @input="debouncedSearch"
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="loadUsers"
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="roleFilter"
              :items="roleOptions"
              label="Role"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="loadUsers"
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-btn
              variant="outlined"
              block
              @click="resetFilters"
            >
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Users Table -->
    <ResponsiveTable
      title="Users"
      icon="mdi-account-group"
      :headers="tableHeaders"
      :items="filteredUsers"
      :loading="usersStore.isLoading"
      :items-per-page="itemsPerPage"
      :search="searchTerm"
      :mobile-visible-fields="['fullName', 'email', 'status']"
      @update:items-per-page="itemsPerPage = $event"
    >
      <template #title-actions>
        <v-btn
          variant="text"
          size="small"
          icon
          @click="loadUsers"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </template>

      <!-- Avatar Column -->
      <template #item.avatar="{ item }">
        <v-avatar size="32">
          <v-img
            v-if="item.profileImageUrl"
            :src="item.profileImageUrl"
            :alt="item.fullName"
          />
          <span v-else class="text-caption font-weight-medium">
            {{ getUserInitials(item.firstName, item.lastName) }}
          </span>
        </v-avatar>
      </template>

      <!-- Full Name Column -->
      <template #item.fullName="{ item }">
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ item.fullName }}
          </div>
          <div class="text-caption text-grey-600">
            ID: {{ item.id.substring(0, 8) }}...
          </div>
        </div>
      </template>

      <!-- Email Column -->
      <template #item.email="{ item }">
        <div class="d-flex align-center">
          <span>{{ item.email }}</span>
          <v-icon
            v-if="item.emailConfirmed"
            color="success"
            size="16"
            class="ms-2"
          >
            mdi-check-circle
          </v-icon>
        </div>
      </template>

      <!-- Status Column -->
      <template #item.status="{ item }">
        <v-chip
          :color="getUserStatusColor(item.status)"
          size="small"
          variant="tonal"
        >
          {{ getUserStatusText(item.status) }}
        </v-chip>
      </template>

      <!-- Roles Column -->
      <template #item.roles="{ item }">
        <div class="d-flex gap-1 flex-wrap">
          <v-chip
            v-for="role in item.roles"
            :key="role.id"
            size="x-small"
            color="primary"
            variant="outlined"
          >
            {{ role.name }}
          </v-chip>
        </div>
      </template>

      <!-- Created Date Column -->
      <template #item.createdDate="{ item }">
        <div>
          <div class="text-body-2">
            {{ formatDate(item.createdDate) }}
          </div>
          <div class="text-caption text-grey-600">
            {{ formatDate(item.createdDate, 'datetime') }}
          </div>
        </div>
      </template>

      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-1">
          <v-btn
            v-if="authStore.hasPermission('Users.Read')"
            icon
            size="small"
            variant="text"
            @click="viewUser(item)"
          >
            <v-icon size="18">mdi-eye</v-icon>
            <v-tooltip activator="parent">View Details</v-tooltip>
          </v-btn>
          
          <v-btn
            v-if="authStore.hasPermission('Users.Update')"
            icon
            size="small"
            variant="text"
            @click="editUser(item)"
          >
            <v-icon size="18">mdi-pencil</v-icon>
            <v-tooltip activator="parent">Edit User</v-tooltip>
          </v-btn>
          
          <v-btn
            v-if="authStore.hasPermission('Users.Delete') && !item.roles.some(r => r.name === 'SuperAdmin')"
            icon
            size="small"
            variant="text"
            color="error"
            @click="deleteUser(item)"
          >
            <v-icon size="18">mdi-delete</v-icon>
            <v-tooltip activator="parent">Delete User</v-tooltip>
          </v-btn>
        </div>
      </template>

      <!-- Mobile Item Template -->
      <template #mobile-item="{ item }">
        <div class="d-flex align-center mb-3">
          <v-avatar size="40" class="me-3">
            <v-img
              v-if="item.profileImageUrl"
              :src="item.profileImageUrl"
              :alt="item.fullName"
            />
            <span v-else class="text-caption font-weight-medium">
              {{ getUserInitials(item.firstName, item.lastName) }}
            </span>
          </v-avatar>
          
          <div class="flex-grow-1">
            <div class="text-body-2 font-weight-medium">
              {{ item.fullName }}
            </div>
            <div class="text-caption text-grey-600">
              {{ item.email }}
            </div>
          </div>
          
          <v-chip
            :color="getUserStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getUserStatusText(item.status) }}
          </v-chip>
        </div>
        
        <div class="d-flex gap-1 flex-wrap mb-3">
          <v-chip
            v-for="role in item.roles"
            :key="role.id"
            size="x-small"
            color="primary"
            variant="outlined"
          >
            {{ role.name }}
          </v-chip>
        </div>
      </template>

      <!-- Mobile Actions -->
      <template #item.actions="{ item }" #mobile-actions="{ item }">
        <v-btn
          v-if="authStore.hasPermission('Users.Read')"
          size="small"
          variant="outlined"
          @click="viewUser(item)"
        >
          <v-icon start size="16">mdi-eye</v-icon>
          View
        </v-btn>
        
        <v-btn
          v-if="authStore.hasPermission('Users.Update')"
          size="small"
          variant="outlined"
          color="primary"
          @click="editUser(item)"
        >
          <v-icon start size="16">mdi-pencil</v-icon>
          Edit
        </v-btn>
        
        <v-btn
          v-if="authStore.hasPermission('Users.Delete') && !item.roles.some(r => r.name === 'SuperAdmin')"
          size="small"
          variant="outlined"
          color="error"
          @click="deleteUser(item)"
        >
          <v-icon start size="16">mdi-delete</v-icon>
          Delete
        </v-btn>
      </template>
    </ResponsiveTable>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model="deleteDialog.show"
      type="error"
      title="Delete User"
      :message="`Are you sure you want to delete ${deleteDialog.user?.fullName}? This action cannot be undone.`"
      confirm-text="Delete"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { User, BreadcrumbItem, TableHeader } from '~/types'

// Meta
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'Users.Read'
})

// Composables
const authStore = useAuthStore()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()
const users = useUsers()
const { getUserInitials, getUserStatusColor, getUserStatusText, formatDate, debounce } = useUtils()
const router = useRouter()

// Reactive data
const searchTerm = ref('')
const statusFilter = ref(null)
const roleFilter = ref(null)
const itemsPerPage = ref(10)

const deleteDialog = reactive({
  show: false,
  user: null as User | null,
  loading: false
})

// Table configuration
const tableHeaders: TableHeader[] = [
  { title: '', key: 'avatar', sortable: false, width: 60 },
  { title: 'Name', key: 'fullName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Roles', key: 'roles', sortable: false },
  { title: 'Created', key: 'createdDate', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: 120 }
]

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Users', to: '/users' }
]

// Computed
const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 2 },
  { title: 'Banned', value: 3 },
  { title: 'Pending Verification', value: 4 }
]

const roleOptions = computed(() => {
  return rolesStore.roles.map(role => ({
    title: role.name,
    value: role.id
  }))
})

const filteredUsers = computed(() => {
  let filtered = usersStore.users

  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => 
      user.roles.some(role => role.id === roleFilter.value)
    )
  }

  return filtered
})

// Methods
const loadUsers = async () => {
  try {
    usersStore.setLoading(true)
    const usersList = await users.getUsers(1, 100, searchTerm.value)
    usersStore.setUsers(usersList)
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    usersStore.setLoading(false)
  }
}

const loadRoles = async () => {
  try {
    const rolesList = await useRoles().getRoles()
    rolesStore.setRoles(rolesList)
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const debouncedSearch = debounce(() => {
  loadUsers()
}, 500)

const resetFilters = () => {
  searchTerm.value = ''
  statusFilter.value = null
  roleFilter.value = null
  loadUsers()
}

const viewUser = (user: User) => {
  router.push(`/users/${user.id}`)
}

const editUser = (user: User) => {
  router.push(`/users/${user.id}/edit`)
}

const deleteUser = (user: User) => {
  deleteDialog.user = user
  deleteDialog.show = true
}

const confirmDelete = async () => {
  if (!deleteDialog.user) return

  try {
    deleteDialog.loading = true
    await users.deleteUser(deleteDialog.user.id)
    usersStore.removeUser(deleteDialog.user.id)
    deleteDialog.show = false
  } catch (error) {
    console.error('Failed to delete user:', error)
  } finally {
    deleteDialog.loading = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadRoles()
  ])
})

// SEO
useHead({
  title: 'Users - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Manage system users, roles, and permissions' }
  ]
})
</script> 