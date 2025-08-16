<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <!-- Temel Bilgiler -->
    <div class="mb-6">
      <h3 class="text-h6 mb-4">Rol Bilgileri</h3>
      <v-text-field
        v-model="formData.name"
        label="Rol Adı"
        :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
        variant="outlined"
        :disabled="loading || (role && role.isSystemRole)"
        class="mb-4"
        hint="Rolün amacını açıkça belirten bir isim kullanın"
        persistent-hint
        prepend-inner-icon="mdi-account-key"
      />
      <v-textarea
        v-model="formData.description"
        label="Açıklama (Opsiyonel)"
        :rules="[rules.maxLength(500)]"
        variant="outlined"
        :disabled="loading"
        rows="3"
        hint="Bu rolün ne için kullanılacağını açıklayın"
        persistent-hint
        prepend-inner-icon="mdi-text"
      />
    </div>
    <!-- İzin Atama -->
    <div>
      <h3 class="text-h6 mb-4">İzinler</h3>
      <div v-if="groupedPermissions && Object.keys(groupedPermissions).length">
        <v-expansion-panels variant="accordion" multiple>
          <v-expansion-panel
            v-for="(perms, resource) in groupedPermissions"
            :key="resource"
          >
            <v-expansion-panel-title>
              <v-icon class="me-2" color="primary">mdi-folder-key</v-icon>
              <span class="font-weight-medium">{{ resource }}</span>
              <span class="ml-2 text-caption text-grey">({{ perms.length }} izin)</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="d-flex align-center mb-3">
                <v-checkbox
                  :model-value="isResourceFullySelected(resource)"
                  :indeterminate="isResourcePartiallySelected(resource)"
                  @update:model-value="toggleResourcePermissions(resource, $event)"
                  color="primary"
                  hide-details
                />
                <span class="text-subtitle-2 font-weight-medium">
                  Tüm {{ resource }} izinlerini seç
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
                    color="primary"
                    hide-details
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
          Atanabilir izin yok
        </p>
      </div>
    </div>
    <!-- Oluştur Butonu -->
    <v-btn
      color="primary"
      class="mt-8 mb-2"
      size="large"
      block
      :loading="loading"
      type="submit"
      style="font-weight:600; letter-spacing:0.5px;"
    >
      Oluştur
    </v-btn>
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
  const validation = await form.value.validate()
  if (!validation.valid) return
  formData.permissionIds = formData.permissionIds.map(id => Number(id))
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