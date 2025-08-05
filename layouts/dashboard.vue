<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="appStore.sidebarCollapsed && !isMobile"
      :temporary="isMobile"
      :permanent="!isMobile"
      class="sidebar"
      color="white"
      elevation="1"
      width="280"
      rail-width="72"
    >
      <!-- Logo Section -->
      <div class="sidebar-logo pa-4">
        <div class="d-flex align-center">
          <v-avatar
            :size="appStore.sidebarCollapsed && !isMobile ? 32 : 40"
            color="primary"
            class="me-3"
          >
            <v-icon color="white" :size="appStore.sidebarCollapsed && !isMobile ? 20 : 24">
              mdi-shield-lock
            </v-icon>
          </v-avatar>
          
          <div v-if="!appStore.sidebarCollapsed || isMobile" class="flex-grow-1">
            <h3 class="text-h6 font-weight-bold text-primary">
              JTWBaseAuth
            </h3>
            <p class="text-caption text-grey-600 mb-0">
              v{{ config.public.appVersion }}
            </p>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Navigation Menu -->
      <v-list nav class="pa-2">
        <template v-for="item in filteredNavigation" :key="item.title">
          <!-- Single Item -->
          <v-list-item
            v-if="!item.children"
            :to="item.to"
            :value="item.title"
            color="primary"
            class="mb-1"
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
              />
            </template>

            <v-list-item
              v-for="child in item.children"
              :key="child.title"
              :to="child.to"
              :value="child.title"
              color="primary"
              class="ms-4 mb-1"
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
          <v-btn
            v-if="!appStore.sidebarCollapsed || isMobile"
            variant="outlined"
            color="primary"
            size="small"
            block
            @click="handleLogout"
          >
            <v-icon start size="18">mdi-logout</v-icon>
            Sign Out
          </v-btn>
          
          <v-btn
            v-else
            variant="text"
            color="primary"
            size="small"
            icon
            @click="handleLogout"
          >
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar
      :order="-1"
      color="white"
      elevation="1"
      height="72"
      class="app-header"
    >
      <!-- Menu Toggle -->
      <v-btn
        icon
        variant="text"
        @click="toggleSidebar"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <!-- Breadcrumbs -->
      <v-breadcrumbs
        v-if="appStore.breadcrumbs.length && !isMobile"
        :items="appStore.breadcrumbs"
        class="pa-0 ms-4"
      >
        <template #prepend>
          <v-icon size="18">mdi-home</v-icon>
        </template>
        
        <template #divider>
          <v-icon size="16">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>

      <v-spacer />

      <!-- Theme Toggle -->
      <v-btn
        icon
        variant="text"
        @click="toggleTheme"
      >
        <v-icon>
          {{ appStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
        </v-icon>
      </v-btn>

      <!-- Notifications -->
      <v-btn
        icon
        variant="text"
        class="me-2"
      >
        <v-badge
          color="error"
          content="3"
          offset-x="2"
          offset-y="2"
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <!-- User Menu -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="text-none"
          >
            <v-avatar size="32" class="me-2">
              <v-img
                v-if="authStore.user?.profileImageUrl"
                :src="authStore.user.profileImageUrl"
                :alt="authStore.userFullName"
              />
              <span v-else class="text-white text-subtitle-2">
                {{ authStore.userInitials }}
              </span>
            </v-avatar>
            
            <div v-if="!isMobile" class="text-left">
              <div class="text-body-2 font-weight-medium">
                {{ authStore.userFullName }}
              </div>
              <div class="text-caption text-grey-600">
                {{ authStore.user?.email }}
              </div>
            </div>
            
            <v-icon class="ms-2">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list min-width="200">
          <v-list-item @click="$router.push('/profile')">
            <template #prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>

          <v-list-item @click="$router.push('/settings')">
            <template #prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>

          <v-divider />

          <v-list-item @click="handleLogout">
            <template #prepend>
              <v-icon color="error">mdi-logout</v-icon>
            </template>
            <v-list-item-title>Sign Out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>

    <!-- Loading Overlay -->
    <v-overlay
      v-if="appStore.loading"
      model-value
      persistent
      class="align-center justify-center"
    >
      <div class="d-flex flex-column align-center">
        <v-progress-circular
          size="60"
          width="4"
          color="white"
          indeterminate
        />
        <p class="text-white mt-3">Loading...</p>
      </div>
    </v-overlay>
  </v-app>
</template>

<script setup lang="ts">
// Composables
const appStore = useAppStore()
const authStore = useAuthStore()
const auth = useAuth()
const { toggleTheme } = useTheme()
const config = useRuntimeConfig()
const { navigationItems, filterNavigationByPermissions } = useNavigation()

// Reactive data
const drawer = ref(true)

// Computed


const filteredNavigation = computed(() => {
  return filterNavigationByPermissions(
    navigationItems,
    authStore.hasPermission,
    authStore.hasRole
  )
})

// Methods
const toggleSidebar = () => {
  if (isMobile.value) {
    drawer.value = !drawer.value
  } else {
    appStore.toggleSidebar()
  }
}

const handleLogout = async () => {
  try {
    await auth.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Watch for mobile changes
watch(isMobile, (newVal) => {
  if (newVal) {
    drawer.value = false
  } else {
    drawer.value = true
  }
}, { immediate: true })

// Initialize app
onMounted(() => {
  appStore.initializeApp()
})
</script>

<style scoped>
.sidebar {
  border-right: 1px solid rgb(var(--v-theme-surface-variant));
}

.sidebar-logo {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.sidebar-footer {
  border-top: 1px solid rgb(var(--v-theme-surface-variant));
}

.main-content {
  background-color: rgb(var(--v-theme-background));
}

.app-header {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}
</style> 