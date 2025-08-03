<template>
  <div>
    <PageHeader
      title="Role Management"
      description="Manage user roles and permissions across the system"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn
          v-if="authStore.hasPermission('Roles.Create')"
          color="primary"
          prepend-icon="mdi-shield-plus"
          @click="$router.push('/roles/create')"
        >
          Create Role
        </v-btn>
      </template>
    </PageHeader>

    <!-- Role Categories -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Total Roles"
          :value="rolesStore.roles.length"
          icon="mdi-shield-account"
          color="primary"
          @click="filterByType(null)"
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="System Roles"
          :value="systemRolesCount"
          icon="mdi-shield-lock"
          color="warning"
          @click="filterByType('system')"
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Custom Roles"
          :value="customRolesCount"
          icon="mdi-shield-edit"
          color="info"
          @click="filterByType('custom')"
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Active Users"
          :value="totalActiveUsers"
          icon="mdi-account-group"
          color="success"
        />
      </v-col>
    </v-row>

    <!-- Filters & Search -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchTerm"
              label="Search roles..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="typeFilter"
              :items="typeOptions"
              label="Role Type"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-btn
              variant="outlined"
              block
              @click="resetFilters"
            >
              Reset Filters
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Roles Grid -->
    <v-row>
      <v-col
        v-for="role in filteredRoles"
        :key="role.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="role-card h-100"
          :class="{ 'system-role': role.isSystemRole }"
          @click="viewRole(role)"
        >
          <v-card-title class="d-flex align-center">
            <v-icon
              :color="role.isSystemRole ? 'warning' : 'primary'"
              size="24"
              class="me-3"
            >
              {{ role.isSystemRole ? 'mdi-shield-lock' : 'mdi-shield-edit' }}
            </v-icon>
            
            <div class="flex-grow-1">
              <div class="text-h6">{{ role.name }}</div>
              <v-chip
                :color="role.isSystemRole ? 'warning' : 'primary'"
                size="x-small"
                variant="tonal"
              >
                {{ role.isSystemRole ? 'System' : 'Custom' }}
              </v-chip>
            </div>
            
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="text"
                  @click.stop
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              
              <v-list>
                <v-list-item @click="viewRole(role)">
                  <template #prepend>
                    <v-icon>mdi-eye</v-icon>
                  </template>
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
                
                <v-list-item
                  v-if="authStore.hasPermission('Roles.Update') && !role.isSystemRole"
                  @click="editRole(role)"
                >
                  <template #prepend>
                    <v-icon>mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title>Edit Role</v-list-item-title>
                </v-list-item>
                
                <v-list-item
                  v-if="authStore.hasPermission('Roles.Delete') && !role.isSystemRole"
                  @click="deleteRole(role)"
                >
                  <template #prepend>
                    <v-icon color="error">mdi-delete</v-icon>
                  </template>
                  <v-list-item-title>Delete Role</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-title>

          <v-card-text>
            <p class="text-body-2 text-grey-600 mb-4">
              {{ role.description || 'No description provided' }}
            </p>
            
            <!-- Permission Summary -->
            <div class="mb-4">
              <div class="d-flex align-center mb-2">
                <v-icon size="16" class="me-2">mdi-key</v-icon>
                <span class="text-caption font-weight-medium">
                  Permissions ({{ role.permissions.length }})
                </span>
              </div>
              
              <div class="d-flex gap-1 flex-wrap">
                <v-chip
                  v-for="permission in role.permissions.slice(0, 3)"
                  :key="permission.id"
                  size="x-small"
                  variant="outlined"
                  color="info"
                >
                  {{ permission.resource }}
                </v-chip>
                
                <v-chip
                  v-if="role.permissions.length > 3"
                  size="x-small"
                  variant="tonal"
                  color="grey"
                >
                  +{{ role.permissions.length - 3 }} more
                </v-chip>
              </div>
            </div>
            
            <!-- Users with this role -->
            <div class="d-flex align-center">
              <v-icon size="16" class="me-2">mdi-account-group</v-icon>
              <span class="text-caption">
                {{ getUserCount(role.id) }} users assigned
              </span>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              size="small"
              variant="text"
              @click.stop="viewRole(role)"
            >
              View Details
            </v-btn>
            
            <v-spacer />
            
            <v-btn
              v-if="authStore.hasPermission('Roles.Update') && !role.isSystemRole"
              size="small"
              variant="outlined"
              color="primary"
              @click.stop="editRole(role)"
            >
              Edit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <EmptyState
      v-if="filteredRoles.length === 0 && !rolesStore.isLoading"
      title="No Roles Found"
      description="No roles match your current filters. Try adjusting your search criteria."
      icon="mdi-shield-search"
      action-text="Create Role"
      :action-to="authStore.hasPermission('Roles.Create') ? '/roles/create' : undefined"
    />

    <!-- Loading State -->
    <div v-if="rolesStore.isLoading" class="text-center py-12">
      <LoadingSpinner text="Loading roles..." />
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model="deleteDialog.show"
      type="error"
      title="Delete Role"
      :message="`Are you sure you want to delete the role '${deleteDialog.role?.name}'? This action cannot be undone and will affect all users assigned to this role.`"
      confirm-text="Delete Role"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Role, BreadcrumbItem } from '~/types'

// Meta
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'Roles.Read'
})

// Composables
const authStore = useAuthStore()
const rolesStore = useRolesStore()
const usersStore = useUsersStore()
const roles = useRoles()
const users = useUsers()
const router = useRouter()

// Reactive data
const searchTerm = ref('')
const typeFilter = ref<string | null>(null)

const deleteDialog = reactive({
  show: false,
  role: null as Role | null,
  loading: false
})

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Roles', to: '/roles' }
]

// Computed
const typeOptions = [
  { title: 'System Roles', value: 'system' },
  { title: 'Custom Roles', value: 'custom' }
]

const systemRolesCount = computed(() => 
  rolesStore.roles.filter(role => role.isSystemRole).length
)

const customRolesCount = computed(() => 
  rolesStore.roles.filter(role => !role.isSystemRole).length
)

const totalActiveUsers = computed(() => 
  usersStore.users.filter(user => user.status === 1).length
)

const filteredRoles = computed(() => {
  let filtered = rolesStore.roles

  // Search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(role =>
      role.name.toLowerCase().includes(search) ||
      role.description?.toLowerCase().includes(search)
    )
  }

  // Type filter
  if (typeFilter.value) {
    if (typeFilter.value === 'system') {
      filtered = filtered.filter(role => role.isSystemRole)
    } else if (typeFilter.value === 'custom') {
      filtered = filtered.filter(role => !role.isSystemRole)
    }
  }

  return filtered
})

// Methods
const loadRoles = async () => {
  try {
    rolesStore.setLoading(true)
    const rolesList = await roles.getRoles()
    rolesStore.setRoles(rolesList)
  } catch (error) {
    console.error('Failed to load roles:', error)
  } finally {
    rolesStore.setLoading(false)
  }
}

const loadUsers = async () => {
  try {
    const usersList = await users.getUsers(1, 100)
    usersStore.setUsers(usersList)
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const resetFilters = () => {
  searchTerm.value = ''
  typeFilter.value = null
}

const filterByType = (type: string | null) => {
  typeFilter.value = type
}

const getUserCount = (roleId: string) => {
  return usersStore.users.filter(user => 
    user.roles.some(role => role.id === roleId)
  ).length
}

const viewRole = (role: Role) => {
  router.push(`/roles/${role.id}`)
}

const editRole = (role: Role) => {
  router.push(`/roles/${role.id}/edit`)
}

const deleteRole = (role: Role) => {
  deleteDialog.role = role
  deleteDialog.show = true
}

const confirmDelete = async () => {
  if (!deleteDialog.role) return

  try {
    deleteDialog.loading = true
    await roles.deleteRole(deleteDialog.role.id)
    rolesStore.removeRole(deleteDialog.role.id)
    deleteDialog.show = false
  } catch (error) {
    console.error('Failed to delete role:', error)
  } finally {
    deleteDialog.loading = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadRoles(),
    loadUsers()
  ])
})

// SEO
useHead({
  title: 'Roles - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Manage user roles and permissions across the system' }
  ]
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