<template>
  <div>
    <PageHeader
      :title="user?.fullName || 'User Details'"
      description="View and manage user information"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn
          v-if="authStore.hasPermission('Users.Update')"
          color="primary"
          prepend-icon="mdi-pencil"
          @click="$router.push(`/users/${route.params.id}/edit`)"
        >
          Edit User
        </v-btn>
        
        <v-btn
          v-if="authStore.hasPermission('Users.Delete') && !user?.roles.some(r => r.name === 'SuperAdmin')"
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete"
          @click="deleteUser"
        >
          Delete User
        </v-btn>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="text-center py-12">
      <LoadingSpinner text="Loading user details..." />
    </div>

    <div v-else-if="user">
      <v-row>
        <!-- User Info Card -->
        <v-col cols="12" md="4">
          <v-card class="mb-6">
            <v-card-text class="text-center pa-6">
              <v-avatar size="120" class="mb-4">
                <v-img
                  v-if="user.profileImageUrl"
                  :src="user.profileImageUrl"
                  :alt="user.fullName"
                />
                <span v-else class="text-h3 font-weight-light">
                  {{ getUserInitials(user.firstName, user.lastName) }}
                </span>
              </v-avatar>
              
              <h2 class="text-h5 font-weight-bold mb-2">
                {{ user.fullName }}
              </h2>
              
              <p class="text-body-1 text-grey-600 mb-4">
                {{ user.email }}
              </p>
              
              <v-chip
                :color="getUserStatusColor(user.status)"
                size="large"
                variant="tonal"
                class="mb-4"
              >
                <v-icon start size="16">
                  {{ getStatusIcon(user.status) }}
                </v-icon>
                {{ getUserStatusText(user.status) }}
              </v-chip>
              
              <div class="d-flex justify-center gap-2">
                <v-btn
                  v-if="user.emailConfirmed"
                  icon
                  size="small"
                  color="success"
                >
                  <v-icon>mdi-email-check</v-icon>
                  <v-tooltip activator="parent">Email Verified</v-tooltip>
                </v-btn>
                
                <v-btn
                  v-if="user.phoneConfirmed"
                  icon
                  size="small"
                  color="success"
                >
                  <v-icon>mdi-phone-check</v-icon>
                  <v-tooltip activator="parent">Phone Verified</v-tooltip>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card>
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-if="authStore.hasPermission('Users.Update')"
                  @click="resetPassword"
                >
                  <template #prepend>
                    <v-icon color="warning">mdi-key-variant</v-icon>
                  </template>
                  <v-list-item-title>Reset Password</v-list-item-title>
                </v-list-item>
                
                <v-list-item
                  v-if="authStore.hasPermission('Users.Update')"
                  @click="toggleStatus"
                >
                  <template #prepend>
                    <v-icon :color="user.status === 1 ? 'error' : 'success'">
                      {{ user.status === 1 ? 'mdi-account-off' : 'mdi-account-check' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ user.status === 1 ? 'Deactivate' : 'Activate' }} User
                  </v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="sendWelcomeEmail">
                  <template #prepend>
                    <v-icon color="info">mdi-email-send</v-icon>
                  </template>
                  <v-list-item-title>Send Welcome Email</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Details & Roles -->
        <v-col cols="12" md="8">
          <!-- User Details -->
          <v-card class="mb-6">
            <v-card-title>User Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">First Name</div>
                    <div class="text-body-1">{{ user.firstName }}</div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Last Name</div>
                    <div class="text-body-1">{{ user.lastName }}</div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Email Address</div>
                    <div class="text-body-1 d-flex align-center">
                      {{ user.email }}
                      <v-icon
                        v-if="user.emailConfirmed"
                        color="success"
                        size="16"
                        class="ms-2"
                      >
                        mdi-check-circle
                      </v-icon>
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Phone Number</div>
                    <div class="text-body-1">
                      {{ user.phoneNumber || 'Not provided' }}
                      <v-icon
                        v-if="user.phoneNumber && user.phoneConfirmed"
                        color="success"
                        size="16"
                        class="ms-2"
                      >
                        mdi-check-circle
                      </v-icon>
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Created Date</div>
                    <div class="text-body-1">{{ formatDate(user.createdDate, 'long') }}</div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">Last Login</div>
                    <div class="text-body-1">
                      {{ user.lastLoginDate ? formatDate(user.lastLoginDate, 'datetime') : 'Never' }}
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12">
                  <div class="mb-4">
                    <div class="text-caption text-grey-600 mb-1">User ID</div>
                    <div class="text-body-1 font-mono">{{ user.id }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Roles & Permissions -->
          <v-card class="mb-6">
            <v-card-title>Roles & Permissions</v-card-title>
            <v-card-text>
              <div class="mb-6">
                <h4 class="text-subtitle-1 mb-3">Assigned Roles</h4>
                <div v-if="user.roles.length" class="d-flex gap-2 flex-wrap">
                  <v-chip
                    v-for="role in user.roles"
                    :key="role.id"
                    :color="role.isSystemRole ? 'primary' : 'secondary'"
                    variant="tonal"
                    size="large"
                  >
                    <v-icon start size="16">
                      {{ role.isSystemRole ? 'mdi-shield' : 'mdi-account-group' }}
                    </v-icon>
                    {{ role.name }}
                  </v-chip>
                </div>
                <div v-else>
                  <p class="text-body-2 text-grey-600">No roles assigned</p>
                </div>
              </div>
              
              <div>
                <h4 class="text-subtitle-1 mb-3">Effective Permissions</h4>
                <div v-if="user.permissions.length">
                  <v-expansion-panels variant="accordion">
                    <v-expansion-panel
                      v-for="(permissions, resource) in groupedPermissions"
                      :key="resource"
                      :title="resource"
                    >
                      <v-expansion-panel-text>
                        <div class="d-flex gap-1 flex-wrap">
                          <v-chip
                            v-for="permission in permissions"
                            :key="permission.id"
                            size="small"
                            variant="outlined"
                            color="info"
                          >
                            {{ permission.name }}
                          </v-chip>
                        </div>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
                <div v-else>
                  <p class="text-body-2 text-grey-600">No permissions assigned</p>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Activity Log -->
          <v-card>
            <v-card-title>Recent Activity</v-card-title>
            <v-card-text>
              <v-timeline density="compact" side="end">
                <v-timeline-item
                  dot-color="success"
                  size="small"
                >
                  <div class="d-flex justify-space-between">
                    <div>
                      <div class="text-body-2 font-weight-medium">Account Created</div>
                      <div class="text-caption text-grey-600">User account was created</div>
                    </div>
                    <div class="text-caption text-grey-600">
                      {{ formatDate(user.createdDate, 'datetime') }}
                    </div>
                  </div>
                </v-timeline-item>
                
                <v-timeline-item
                  v-if="user.lastLoginDate"
                  dot-color="info"
                  size="small"
                >
                  <div class="d-flex justify-space-between">
                    <div>
                      <div class="text-body-2 font-weight-medium">Last Login</div>
                      <div class="text-caption text-grey-600">User signed in</div>
                    </div>
                    <div class="text-caption text-grey-600">
                      {{ formatDate(user.lastLoginDate, 'datetime') }}
                    </div>
                  </div>
                </v-timeline-item>
                
                <v-timeline-item
                  v-if="user.emailConfirmed"
                  dot-color="success"
                  size="small"
                >
                  <div class="d-flex justify-space-between">
                    <div>
                      <div class="text-body-2 font-weight-medium">Email Verified</div>
                      <div class="text-caption text-grey-600">Email address confirmed</div>
                    </div>
                    <div class="text-caption text-grey-600">
                      {{ formatDate(user.createdDate, 'datetime') }}
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <EmptyState
      v-else-if="!isLoading"
      title="User Not Found"
      description="The user you're looking for doesn't exist or has been deleted."
      icon="mdi-account-off"
      action-text="Back to Users"
      action-to="/users"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model="deleteDialog.show"
      type="error"
      title="Delete User"
      :message="`Are you sure you want to delete ${user?.fullName}? This action cannot be undone.`"
      confirm-text="Delete"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { User, BreadcrumbItem } from '~/types'

// Meta
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'Users.Read'
})

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const users = useUsers()
const { getUserInitials, getUserStatusColor, getUserStatusText, formatDate } = useUtils()
const toast = useToast()

// Reactive data
const user = ref<User | null>(null)
const isLoading = ref(true)

const deleteDialog = reactive({
  show: false,
  loading: false
})

// Computed
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Users', to: '/users' },
  { title: user.value?.fullName || 'User Details', to: `/users/${route.params.id}` }
])

const groupedPermissions = computed(() => {
  if (!user.value?.permissions) return {}
  
  return user.value.permissions.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, any[]>)
})

// Methods
const getStatusIcon = (status: number) => {
  switch (status) {
    case 1: return 'mdi-check-circle'
    case 2: return 'mdi-pause-circle'
    case 3: return 'mdi-cancel'
    case 4: return 'mdi-clock-outline'
    default: return 'mdi-help-circle'
  }
}

const loadUser = async () => {
  try {
    isLoading.value = true
    const userId = route.params.id as string
    user.value = await users.getUserById(userId)
  } catch (error) {
    console.error('Failed to load user:', error)
    user.value = null
  } finally {
    isLoading.value = false
  }
}

const deleteUser = () => {
  deleteDialog.show = true
}

const confirmDelete = async () => {
  if (!user.value) return

  try {
    deleteDialog.loading = true
    await users.deleteUser(user.value.id)
    toast.success('User deleted successfully')
    router.push('/users')
  } catch (error) {
    console.error('Failed to delete user:', error)
  } finally {
    deleteDialog.loading = false
  }
}

const resetPassword = () => {
  // Implement password reset logic
  toast.info('Password reset functionality coming soon')
}

const toggleStatus = () => {
  // Implement status toggle logic
  toast.info('Status toggle functionality coming soon')
}

const sendWelcomeEmail = () => {
  // Implement welcome email logic
  toast.info('Welcome email sent!')
}

// Lifecycle
onMounted(() => {
  loadUser()
})

// SEO
useHead(() => ({
  title: `${user.value?.fullName || 'User'} - JTWBaseAuth`,
  meta: [
    { name: 'description', content: `View details for ${user.value?.fullName || 'user'}` }
  ]
}))
</script>

<style scoped>
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}
</style> 