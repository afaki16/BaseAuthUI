<template>
  <div>
    <PageHeader
      :title="role?.name || 'Role Details'"
      description="View role information and assigned permissions"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn
          v-if="authStore.hasPermission('Roles.Update') && role && !role.isSystemRole"
          color="primary"
          prepend-icon="mdi-pencil"
          @click="$router.push(`/roles/${route.params.id}/edit`)"
        >
          Edit Role
        </v-btn>
        
        <v-btn
          v-if="authStore.hasPermission('Roles.Delete') && role && !role.isSystemRole"
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete"
          @click="deleteRole"
        >
          Delete Role
        </v-btn>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="text-center py-12">
      <LoadingSpinner text="Loading role details..." />
    </div>

    <div v-else-if="role">
      <v-row>
        <!-- Role Overview -->
        <v-col cols="12" md="4">
          <v-card class="mb-6">
            <v-card-text class="text-center pa-6">
              <v-avatar
                size="80"
                :color="role.isSystemRole ? 'warning' : 'primary'"
                class="mb-4"
              >
                <v-icon
                  color="white"
                  size="40"
                >
                  {{ role.isSystemRole ? 'mdi-shield-lock' : 'mdi-shield-edit' }}
                </v-icon>
              </v-avatar>
              
              <h2 class="text-h5 font-weight-bold mb-2">
                {{ role.name }}
              </h2>
              
              <v-chip
                :color="role.isSystemRole ? 'warning' : 'primary'"
                size="large"
                variant="tonal"
                class="mb-4"
              >
                <v-icon start size="16">
                  {{ role.isSystemRole ? 'mdi-lock' : 'mdi-pencil' }}
                </v-icon>
                {{ role.isSystemRole ? 'System Role' : 'Custom Role' }}
              </v-chip>
              
              <p v-if="role.description" class="text-body-1 text-grey-600 mb-4">
                {{ role.description }}
              </p>
              
              <div class="d-flex justify-center gap-4 text-center">
                <div>
                  <div class="text-h6 font-weight-bold text-success">
                    {{ assignedUsersCount }}
                  </div>
                  <div class="text-caption text-grey-600">Users</div>
                </div>
                
                <div>
                  <div class="text-h6 font-weight-bold text-info">
                    {{ resourceCount }}
                  </div>
                  <div class="text-caption text-grey-600">Resources</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- System Role Warning -->
          <v-alert
            v-if="role.isSystemRole"
            type="warning"
            variant="tonal"
            class="mb-6"
          >
            <v-alert-title>System Role</v-alert-title>
            This is a system role that cannot be modified or deleted. It's essential for system functionality.
          </v-alert>

          <!-- Quick Actions -->
          <v-card v-if="!role.isSystemRole">
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-if="authStore.hasPermission('Roles.Update')"
                  @click="duplicateRole"
                >
                  <template #prepend>
                    <v-icon color="info">mdi-content-copy</v-icon>
                  </template>
                  <v-list-item-title>Duplicate Role</v-list-item-title>
                </v-list-item>
                
                <v-list-item
                  v-if="authStore.hasPermission('Users.Read')"
                  @click="viewUsers"
                >
                  <template #prepend>
                    <v-icon color="primary">mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title>View Assigned Users</v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="exportRole">
                  <template #prepend>
                    <v-icon color="success">mdi-download</v-icon>
                  </template>
                  <v-list-item-title>Export Role</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Role Details -->
        <v-col cols="12" md="8">
          <!-- Basic Information -->
          <v-card class="mb-6">
            <v-card-title>Role Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Role Name</div>
                    <div class="text-body-1">{{ role.name }}</div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Role Type</div>
                    <div class="text-body-1">
                      {{ role.isSystemRole ? 'System Role' : 'Custom Role' }}
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Description</div>
                    <div class="text-body-1">
                      {{ role.description || 'No description provided' }}
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Created Date</div>
                    <div class="text-body-1">{{ formatDate(role.createdDate, 'long') }}</div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Role ID</div>
                    <div class="text-body-1 font-mono">{{ role.id }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Permissions -->
          <v-card class="mb-6">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-key</v-icon>
              Permissions ({{ role.permissions.length }})
              
              <v-spacer />
              
              <v-btn
                variant="text"
                size="small"
                @click="showAllPermissions = !showAllPermissions"
              >
                {{ showAllPermissions ? 'Collapse All' : 'Expand All' }}
              </v-btn>
            </v-card-title>
            
            <v-card-text>
              <div v-if="role.permissions.length">
                <v-expansion-panels 
                  v-model="expandedPanels"
                  variant="accordion" 
                  multiple
                >
                  <v-expansion-panel
                    v-for="(permissions, resource) in groupedPermissions"
                    :key="resource"
                    :value="resource"
                  >
                    <v-expansion-panel-title>
                      <div class="d-flex align-center">
                        <v-icon class="me-3" color="primary">
                          {{ getResourceIcon(resource) }}
                        </v-icon>
                        <div>
                          <div class="text-subtitle-1 font-weight-medium">
                            {{ resource }}
                          </div>
                          <div class="text-caption text-grey-600">
                            {{ permissions.length }} permissions
                          </div>
                        </div>
                      </div>
                    </v-expansion-panel-title>
                    
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col
                          v-for="permission in permissions"
                          :key="permission.id"
                          cols="12"
                          sm="6"
                          md="4"
                        >
                          <v-card variant="outlined" class="h-100">
                            <v-card-text class="pa-3">
                              <div class="d-flex align-center mb-2">
                                <v-chip
                                  :color="getPermissionTypeColor(permission.type)"
                                  size="x-small"
                                  variant="tonal"
                                >
                                  {{ getPermissionTypeText(permission.type) }}
                                </v-chip>
                              </div>
                              
                              <div class="text-body-2 font-weight-medium mb-1">
                                {{ permission.name }}
                              </div>
                              
                              <div class="text-caption text-grey-600">
                                {{ permission.description }}
                              </div>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
              
              <EmptyState
                v-else
                title="No Permissions"
                description="This role has no permissions assigned."
                icon="mdi-key-off"
                :action-text="authStore.hasPermission('Roles.Update') && !role.isSystemRole ? 'Edit Role' : undefined"
                @action="$router.push(`/roles/${role.id}/edit`)"
              />
            </v-card-text>
          </v-card>

          <!-- Assigned Users -->
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-account-group</v-icon>
              Assigned Users ({{ assignedUsers.length }})
              
              <v-spacer />
              
              <v-btn
                v-if="authStore.hasPermission('Users.Read')"
                variant="text"
                size="small"
                @click="viewUsers"
              >
                View All
              </v-btn>
            </v-card-title>
            
            <v-card-text>
              <div v-if="assignedUsers.length">
                <v-list>
                  <v-list-item
                    v-for="user in assignedUsers.slice(0, 5)"
                    :key="user.id"
                    :to="`/users/${user.id}`"
                  >
                    <template #prepend>
                      <v-avatar size="32">
                        <v-img
                          v-if="user.profileImageUrl"
                          :src="user.profileImageUrl"
                          :alt="user.fullName"
                        />
                        <span v-else class="text-caption">
                          {{ getUserInitials(user.firstName, user.lastName) }}
                        </span>
                      </v-avatar>
                    </template>

                    <v-list-item-title>{{ user.fullName }}</v-list-item-title>
                    <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>

                    <template #append>
                      <v-chip
                        :color="getUserStatusColor(user.status)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getUserStatusText(user.status) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
                
                <div v-if="assignedUsers.length > 5" class="text-center mt-4">
                  <v-btn
                    variant="outlined"
                    size="small"
                    @click="viewUsers"
                  >
                    View {{ assignedUsers.length - 5 }} more users
                  </v-btn>
                </div>
              </div>
              
              <EmptyState
                v-else
                title="No Users Assigned"
                description="No users are currently assigned to this role."
                icon="mdi-account-off"
                :action-text="authStore.hasPermission('Users.Read') ? 'View All Users' : undefined"
                action-to="/users"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <EmptyState
      v-else-if="!isLoading"
      title="Role Not Found"
      description="The role you're looking for doesn't exist or has been deleted."
      icon="mdi-shield-off"
      action-text="Back to Roles"
      action-to="/roles"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model="deleteDialog.show"
      type="error"
      title="Delete Role"
      :message="`Are you sure you want to delete the role '${role?.name}'? This will affect ${assignedUsersCount} users and cannot be undone.`"
      confirm-text="Delete Role"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Role, User, BreadcrumbItem } from '~/types'

// Meta
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'Roles.Read'
})

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const roles = useRoles()
const users = useUsers()
const { formatDate, getUserInitials, getUserStatusColor, getUserStatusText } = useUtils()
const toast = useToast()

// Reactive data
const role = ref<Role | null>(null)
const isLoading = ref(true)
const showAllPermissions = ref(false)
const expandedPanels = ref<string[]>([])

const deleteDialog = reactive({
  show: false,
  loading: false
})

// Computed
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Roles', to: '/roles' },
  { title: role.value?.name || 'Role Details', to: `/roles/${route.params.id}` }
])

const groupedPermissions = computed(() => {
  if (!role.value?.permissions) return {}
  
  return role.value.permissions.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, any[]>)
})

const assignedUsers = computed(() => {
  return usersStore.users.filter(user => 
    user.roles.some(userRole => userRole.id === role.value?.id)
  )
})

const assignedUsersCount = computed(() => assignedUsers.value.length)

const resourceCount = computed(() => {
  return Object.keys(groupedPermissions.value).length
})

// Methods
const getResourceIcon = (resource: string) => {
  const icons: Record<string, string> = {
    'Users': 'mdi-account-group',
    'Roles': 'mdi-shield-account',
    'Permissions': 'mdi-key',
    'Dashboard': 'mdi-view-dashboard',
    'Reports': 'mdi-chart-line',
    'System': 'mdi-cog'
  }
  return icons[resource] || 'mdi-folder'
}

const getPermissionTypeText = (type: number) => {
  const types = ['', 'Create', 'Read', 'Update', 'Delete', 'Manage']
  return types[type] || 'Unknown'
}

const getPermissionTypeColor = (type: number) => {
  const colors = ['', 'success', 'info', 'warning', 'error', 'purple']
  return colors[type] || 'grey'
}

const loadRole = async () => {
  try {
    isLoading.value = true
    const roleId = route.params.id as string
    role.value = await roles.getRoleById(roleId)
  } catch (error) {
    console.error('Failed to load role:', error)
    role.value = null
  } finally {
    isLoading.value = false
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

const deleteRole = () => {
  deleteDialog.show = true
}

const confirmDelete = async () => {
  if (!role.value) return

  try {
    deleteDialog.loading = true
    await roles.deleteRole(role.value.id)
    toast.success('Role deleted successfully')
    router.push('/roles')
  } catch (error) {
    console.error('Failed to delete role:', error)
  } finally {
    deleteDialog.loading = false
  }
}

const duplicateRole = () => {
  if (!role.value) return
  
  router.push({
    path: '/roles/create',
    query: { duplicate: role.value.id }
  })
}

const viewUsers = () => {
  router.push({
    path: '/users',
    query: { role: role.value?.id }
  })
}

const exportRole = () => {
  if (!role.value) return
  
  const exportData = {
    name: role.value.name,
    description: role.value.description,
    permissions: role.value.permissions.map(p => ({
      name: p.name,
      resource: p.resource,
      type: p.type
    }))
  }
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `role-${role.value.name.toLowerCase().replace(/\s+/g, '-')}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  toast.success('Role exported successfully')
}

// Watch for showAllPermissions changes
watch(showAllPermissions, (newValue) => {
  if (newValue) {
    expandedPanels.value = Object.keys(groupedPermissions.value)
  } else {
    expandedPanels.value = []
  }
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadRole(),
    loadUsers()
  ])
})

// SEO
useHead(() => ({
  title: `${role.value?.name || 'Role'} - JTWBaseAuth`,
  meta: [
    { name: 'description', content: `View details for ${role.value?.name || 'role'}` }
  ]
}))
</script>

<style scoped>
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}
</style> 