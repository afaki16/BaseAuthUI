<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <!-- Basic Information -->
    <div class="mb-6">
      <h3 class="text-h6 mb-4">Basic Information</h3>
      
      <v-text-field
        v-model="formData.name"
        label="Role Name"
        :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
        variant="outlined"
        :disabled="loading || (role && role.isSystemRole)"
        class="mb-4"
        hint="Use a descriptive name that clearly indicates the role's purpose"
        persistent-hint
      />
      
      <v-textarea
        v-model="formData.description"
        label="Description (Optional)"
        :rules="[rules.maxLength(500)]"
        variant="outlined"
        :disabled="loading"
        rows="3"
        hint="Provide a clear description of what this role is intended for"
        persistent-hint
      />
    </div>

    <!-- Permission Assignment -->
    <div>
      <h3 class="text-h6 mb-4">Permission Assignment</h3>
      
      <div v-if="groupedPermissions && Object.keys(groupedPermissions).length">
        <v-expansion-panels variant="accordion" multiple>
          <v-expansion-panel
            v-for="(perms, resource) in groupedPermissions"
            :key="resource"
            :title="`${resource} (${perms.length})`"
          >
            <v-expansion-panel-text>
              <div class="d-flex align-center mb-3">
                <v-checkbox
                  :model-value="isResourceFullySelected(resource)"
                  :indeterminate="isResourcePartiallySelected(resource)"
                  @update:model-value="toggleResourcePermissions(resource, $event)"
                />
                <span class="text-subtitle-2 font-weight-medium">
                  Select All {{ resource }} Permissions
                </span>
              </div>
              
              <v-row>
                <v-col
                  v-for="permission in perms"
                  :key="permission.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-checkbox
                    v-model="formData.permissionIds"
                    :value="permission.id"
                    :disabled="loading"
                    density="compact"
                  >
                    <template #label>
                      <div>
                        <div class="text-body-2 font-weight-medium">
                          {{ permission.name }}
                        </div>
                        <div class="text-caption text-grey-600">
                          {{ permission.description }}
                        </div>
                      </div>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      
      <div v-else class="text-center py-8">
        <v-icon size="48" color="grey-400" class="mb-3">
          mdi-key-off
        </v-icon>
        <p class="text-body-1 text-grey-600">
          No permissions available to assign
        </p>
      </div>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '~/types'

// Props
const props = defineProps<{
  role?: Role | null
  permissions: Permission[]
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  submit: [data: CreateRoleRequest | UpdateRoleRequest]
  'update:selected-permissions': [permissionIds: string[]]
}>()

// Composables
const { validationRules: rules } = useValidators()

// Reactive data
const form = ref()
const isValid = ref(false)

const formData = reactive<CreateRoleRequest>({
  name: '',
  description: '',
  permissionIds: []
})

// Computed
const groupedPermissions = computed(() => {
  return props.permissions.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)
})

// Methods
const isResourceFullySelected = (resource: string) => {
  const resourcePermissions = groupedPermissions.value[resource] || []
  return resourcePermissions.length > 0 && 
    resourcePermissions.every(p => formData.permissionIds.includes(p.id))
}

const isResourcePartiallySelected = (resource: string) => {
  const resourcePermissions = groupedPermissions.value[resource] || []
  const selectedCount = resourcePermissions.filter(p => 
    formData.permissionIds.includes(p.id)
  ).length
  
  return selectedCount > 0 && selectedCount < resourcePermissions.length
}

const toggleResourcePermissions = (resource: string, selected: boolean) => {
  const resourcePermissions = groupedPermissions.value[resource] || []
  
  if (selected) {
    // Add all resource permissions
    resourcePermissions.forEach(permission => {
      if (!formData.permissionIds.includes(permission.id)) {
        formData.permissionIds.push(permission.id)
      }
    })
  } else {
    // Remove all resource permissions
    formData.permissionIds = formData.permissionIds.filter(id =>
      !resourcePermissions.some(p => p.id === id)
    )
  }
}

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  emit('submit', formData)
}

const submit = () => {
  handleSubmit()
}

// Watch for permission changes
watch(() => formData.permissionIds, (newIds) => {
  emit('update:selected-permissions', newIds)
}, { deep: true })

// Initialize form with role data if editing
watchEffect(() => {
  if (props.role) {
    Object.assign(formData, {
      name: props.role.name,
      description: props.role.description,
      permissionIds: props.role.permissions.map(p => p.id)
    })
  }
})

// Expose methods
defineExpose({
  submit
})
</script> 