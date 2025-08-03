<template>
  <div>
    <PageHeader
      title="Create User"
      description="Add a new user to the system"
      :breadcrumbs="breadcrumbs"
    />

    <v-row>
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title>User Information</v-card-title>
          <v-card-text>
            <UserForm
              ref="userForm"
              :loading="isLoading"
              :roles="rolesStore.roles"
              @submit="handleSubmit"
            />
          </v-card-text>
          
          <v-card-actions class="pa-6 pt-0">
            <v-btn
              variant="outlined"
              @click="$router.push('/users')"
            >
              Cancel
            </v-btn>
            
            <v-spacer />
            
            <v-btn
              color="primary"
              :loading="isLoading"
              @click="userForm?.submit()"
            >
              Create User
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title>Guidelines</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon color="info" size="16">mdi-information</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Users will receive a welcome email with login instructions
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning" size="16">mdi-shield</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Assign appropriate roles based on user responsibilities
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="success" size="16">mdi-check</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Strong passwords are enforced automatically
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { CreateUserRequest, BreadcrumbItem } from '~/types'

// Meta
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'Users.Create'
})

// Composables
const rolesStore = useRolesStore()
const users = useUsers()
const router = useRouter()

// Reactive data
const userForm = ref()
const isLoading = ref(false)

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Users', to: '/users' },
  { title: 'Create User', to: '/users/create' }
]

// Methods
const handleSubmit = async (userData: CreateUserRequest) => {
  try {
    isLoading.value = true
    await users.createUser(userData)
    router.push('/users')
  } catch (error) {
    console.error('Failed to create user:', error)
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

// Lifecycle
onMounted(() => {
  loadRoles()
})

// SEO
useHead({
  title: 'Create User - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Add a new user to the system' }
  ]
})
</script> 