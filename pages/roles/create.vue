<template>
  <div>
    <v-breadcrumbs class="mb-4" :items="breadcrumbs">
      <template #prepend>
        <v-icon size="18" class="mr-1">mdi-home</v-icon>
      </template>
      <template #item="{ item, index }">
        <v-breadcrumbs-item
          :to="item.to"
          :disabled="index === breadcrumbs.length - 1"
        >
          <template v-if="index === 0">
            <v-icon size="18" class="mr-1">mdi-home</v-icon>
            {{ item.title }}
          </template>
          <template v-else-if="index === 1">
            <v-icon size="18" class="mr-1">mdi-shield-account</v-icon>
            {{ item.title }}
          </template>
          <template v-else>
            {{ item.title }}
          </template>
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title>Role Information</v-card-title>
          <v-card-text>
            <RoleForm
              ref="roleForm"
              :loading="isLoading"
              :permissions="permissionsStore.permissions"
              @submit="handleSubmit"
            />
          </v-card-text>
          
          <v-card-actions class="pa-6 pt-0">
            <v-btn
              variant="outlined"
              @click="$router.push('/roles')"
            >
              Cancel
            </v-btn>
            
            <v-spacer />
            
            <v-btn
              color="primary"
              :loading="isLoading"
              @click="roleForm?.submit()"
            >
              Create Role
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="4">
        <!-- Permission Preview -->
        <v-card class="mb-6">
          <v-card-title>Permission Preview</v-card-title>
          <v-card-text>
            <div v-if="selectedPermissions.length">
              <div
                v-for="(perms, resource) in groupedSelectedPermissions"
                :key="resource"
                class="mb-3"
              >
                <div class="text-subtitle-2 font-weight-medium mb-2">
                  {{ resource }}
                </div>
                <div class="d-flex gap-1 flex-wrap">
                  <v-chip
                    v-for="permission in perms"
                    :key="permission.id"
                    size="x-small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ getPermissionTypeText(permission.type) }}
                  </v-chip>
                </div>
              </div>
            </div>
            <p v-else class="text-body-2 text-grey-600">
              No permissions selected
            </p>
          </v-card-text>
        </v-card>

        <!-- Guidelines -->
        <v-card>
          <v-card-title>Best Practices</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon color="info" size="16">mdi-lightbulb</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Use descriptive role names that clearly indicate purpose
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning" size="16">mdi-shield</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Follow the principle of least privilege
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="success" size="16">mdi-check</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Group related permissions together logically
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="error" size="16">mdi-alert</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Review and audit role permissions regularly
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
import type { CreateRoleRequest, BreadcrumbItem, Permission } from '~/types'

// Meta
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'Roles.Create'
})

// Composables
const permissionsStore = usePermissionsStore()
const roles = useRoles()
const router = useRouter()

// Reactive data
const roleForm = ref()
const isLoading = ref(false)
const selectedPermissions = ref<Permission[]>([])

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Roles', to: '/roles' },
  { title: 'Create Role', to: '/roles/create' }
]

// Computed
const groupedSelectedPermissions = computed(() => {
  return selectedPermissions.value.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)
})

// Methods
const getPermissionTypeText = (type: number) => {
  const types = ['', 'Create', 'Read', 'Update', 'Delete', 'Manage']
  return types[type] || 'Unknown'
}

const handleSubmit = async (roleData: CreateRoleRequest) => {
  try {
    isLoading.value = true
    await roles.createRole(roleData)
    router.push('/roles')
  } catch (error) {
    console.error('Failed to create role:', error)
  } finally {
    isLoading.value = false
  }
}

const loadPermissions = async () => {
  try {
    const permissionsList = await usePermissions().getPermissions()
    permissionsStore.setPermissions(permissionsList)
  } catch (error) {
    console.error('Failed to load permissions:', error)
  }
}

// Watch for permission changes from form
const updateSelectedPermissions = (permissionIds: string[]) => {
  selectedPermissions.value = permissionsStore.permissions.filter(p => 
    permissionIds.includes(p.id)
  )
}

// Lifecycle
onMounted(() => {
  loadPermissions()
})

// SEO
useHead({
  title: 'Create Role - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'Create a new role with specific permissions' }
  ]
})
</script> 