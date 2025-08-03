<template>
  <v-navigation-drawer
    v-model="isOpen"
    :rail="isCollapsed && !isMobile"
    :temporary="isMobile"
    :permanent="!isMobile"
    color="white"
    elevation="2"
    width="280"
    rail-width="72"
    class="app-sidebar"
  >
    <!-- Logo Section -->
    <div class="sidebar-header pa-4">
      <div class="d-flex align-center">
        <v-avatar
          :size="isCollapsed && !isMobile ? 32 : 40"
          color="primary"
          class="me-3"
        >
          <v-icon color="white" :size="isCollapsed && !isMobile ? 20 : 24">
            mdi-shield-lock
          </v-icon>
        </v-avatar>
        
        <div v-if="!isCollapsed || isMobile" class="flex-grow-1">
          <h3 class="text-h6 font-weight-bold text-primary mb-0">
            JTWBaseAuth
          </h3>
          <p class="text-caption text-grey-600 mb-0">
            Authentication System
          </p>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- User Info (when not collapsed) -->
    <div v-if="(!isCollapsed || isMobile) && authStore.user" class="sidebar-user pa-4">
      <div class="d-flex align-center">
        <v-avatar size="40" class="me-3">
          <v-img
            v-if="authStore.user.profileImageUrl"
            :src="authStore.user.profileImageUrl"
            :alt="authStore.userFullName"
          />
          <span v-else class="text-white font-weight-medium">
            {{ authStore.userInitials }}
          </span>
        </v-avatar>
        
        <div class="flex-grow-1 text-truncate">
          <p class="text-body-2 font-weight-medium mb-0 text-truncate">
            {{ authStore.userFullName }}
          </p>
          <p class="text-caption text-grey-600 mb-0 text-truncate">
            {{ authStore.user.email }}
          </p>
        </div>
      </div>
    </div>

    <v-divider v-if="!isCollapsed || isMobile" />

    <!-- Navigation Menu -->
    <v-list nav class="pa-2 flex-grow-1">
      <template v-for="item in filteredNavigation" :key="item.title">
        <!-- Single Item -->
        <v-list-item
          v-if="!item.children"
          :to="item.to"
          :value="item.title"
          color="primary"
          class="mb-1 navigation-item"
          rounded="lg"
        >
          <template #prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          
          <template v-if="item.badge" #append>
            <v-chip
              :color="item.color || 'primary'"
              size="x-small"
              variant="flat"
            >
              {{ item.badge }}
            </v-chip>
          </template>
        </v-list-item>

        <!-- Group with Children -->
        <v-list-group
          v-else
          :value="item.title"
          class="mb-1"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="item.title"
              :prepend-icon="item.icon"
              color="primary"
              rounded="lg"
              class="navigation-item"
            />
          </template>

          <v-list-item
            v-for="child in item.children"
            :key="child.title"
            :to="child.to"
            :value="child.title"
            color="primary"
            class="ms-4 mb-1 navigation-item"
            rounded="lg"
          >
            <template #prepend>
              <v-icon size="20">{{ child.icon }}</v-icon>
            </template>
            
            <v-list-item-title>{{ child.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>

    <!-- Sidebar Footer -->
    <template #append>
      <div class="sidebar-footer pa-4">
        <!-- Collapse toggle (desktop only) -->
        <v-btn
          v-if="!isMobile"
          variant="text"
          color="grey"
          size="small"
          :icon="isCollapsed"
          class="mb-2"
          block
          @click="$emit('toggle-collapse')"
        >
          <v-icon>
            {{ isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
          </v-icon>
          <span v-if="!isCollapsed" class="ms-2">Collapse</span>
        </v-btn>

        <!-- Sign out button -->
        <v-btn
          v-if="!isCollapsed || isMobile"
          variant="outlined"
          color="error"
          size="small"
          block
          @click="$emit('logout')"
        >
          <v-icon start size="18">mdi-logout</v-icon>
          Sign Out
        </v-btn>
        
        <v-btn
          v-else
          variant="text"
          color="error"
          size="small"
          icon
          @click="$emit('logout')"
        >
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  modelValue: boolean
  isCollapsed: boolean
  navigation: any[]
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'toggle-collapse': []
  logout: []
}>()

// Composables
const authStore = useAuthStore()
const { isMobile } = useDisplay()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredNavigation = computed(() => props.navigation)
</script>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgb(var(--v-theme-surface-variant));
}

.sidebar-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.sidebar-user {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.sidebar-footer {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.navigation-item {
  transition: all 0.2s ease-in-out;
}

.navigation-item:hover {
  transform: translateX(2px);
}

.v-list-group__items {
  background-color: rgba(var(--v-theme-primary), 0.02);
}
</style> 