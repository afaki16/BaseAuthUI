<template>
  <div>
    <PageHeader
      :title="`Edit ${user?.fullName || 'User'}`"
      description="Update user information and settings"
      :breadcrumbs="breadcrumbs"
    />

    <div v-if="isLoading" class="text-center py-12">
      <LoadingSpinner text="Loading user data..." />
    </div>

    <v-row v-else-if="user">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title>Edit User Information</v-card-title>
          <v-card-text>
            <UserForm
              ref="userForm"
              :user="user"
              :loading="isSaving"
              :roles="rolesStore.roles"
              @submit="handleSubmit"
            />
          </v-card-text>
          
          <v-card-actions class="pa-6 pt-0">
            <v-btn
              variant="outlined"
              @click="$router.push(`/users/${user.id}`)"
            >
              Cancel
            </v-btn>
            
            <v-spacer />
            
            <v-btn
              color="primary"
              :loading="isSaving"
              @click="userForm?.submit()"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="4">
        <!-- User Preview -->
        <v-card class="mb-6">
          <v-card-title>User Preview</v-card-title>
          <v-card-text class="text-center">
            <v-avatar size="80" class="mb-3">
              <v-img
                v-if="user.profileImageUrl"
                :src="user.profileImageUrl"
                :alt="user.fullName"
              />
              <span v-else class="text-h5">
                {{ getUserInitials(user.firstName, user.lastName) }}
              </span>
            </v-avatar>
            
            <h3 class="text-h6 mb-1">{{ user.fullName }}</h3>
            <p class="text-body-2 text-grey-600 mb-3">{{ user.email }}</p>
            
            <v-chip
              :color="getUserStatusColor(user.status)"
              size="small"
              variant="tonal"
            >
              {{ getUserStatusText(user.status) }}
            </v-chip>
          </v-card-text>
        </v-card>

        <!-- Change Log -->
        <v-card>
          <v-card-title>Important Notes</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning" size="16">mdi-alert</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Changes to roles will take effect immediately
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="info" size="16">mdi-information</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  User will be notified of significant changes
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="success" size="16">mdi-shield</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  All changes are logged for security
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error State -->
    <EmptyState
      v-else-if="!isLoading"
      title="User Not Found"
      description="The user you're trying to edit doesn't exist or has been deleted."
      icon="mdi-account-off"
      action-text="Back to Users"
      action-to="/users"
    />
  </div>
</template>

<script setup lang="ts">
import type { User, UpdateUserRequest, BreadcrumbItem } from '~/types'

// Meta
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'Users.Update'
})

// Composables
const route = useRoute()
const router = useRouter()
const rolesStore = useRolesStore()
const users = useUsers()
const { getUserInitials, getUserStatusColor, getUserStatusText } = useUtils()

// Reactive data
const userForm = ref()
const user = ref<User | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

// Computed
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Users', to: '/users' },
  { title: user.value?.fullName || 'User', to: `/users/${route.params.id}` },
  { title: 'Edit', to: `/users/${route.params.id}/edit` }
])

// Methods
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

const loadRoles = async () => {
  try {
    const rolesList = await useRoles().getRoles()
    rolesStore.setRoles(rolesList)
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const handleSubmit = async (userData: UpdateUserRequest) => {
  if (!user.value) return

  try {
    isSaving.value = true
    const updatedUser = await users.updateUser(user.value.id, userData)
    user.value = updatedUser
    router.push(`/users/${user.value.id}`)
  } catch (error) {
    console.error('Failed to update user:', error)
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadUser(),
    loadRoles()
  ])
})

// SEO
useHead(() => ({
  title: `Edit ${user.value?.fullName || 'User'} - JTWBaseAuth`,
  meta: [
    { name: 'description', content: `Edit details for ${user.value?.fullName || 'user'}` }
  ]
}))
</script> 