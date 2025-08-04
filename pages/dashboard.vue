<template>
  <div>
    <!-- Page Header -->
    <PageHeader
      title="Dashboard"
      subtitle="Welcome to your dashboard"
      :breadcrumbs="breadcrumbs"
    />

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Total Users"
          :value="stats.totalUsers"
          icon="mdi-account-group"
          color="primary"
          :change="12"
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Active Users"
          :value="stats.activeUsers"
          icon="mdi-account-check"
          color="success"
          :change="8"
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Total Roles"
          :value="stats.totalRoles"
          icon="mdi-shield-account"
          color="info"
          :change="5"
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Total Permissions"
          :value="stats.totalPermissions"
          icon="mdi-key"
          color="warning"
          :change="15"
        />
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h3 class="text-h5 mb-4">Quick Actions</h3>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card class="quick-action-card h-100" @click="$router.push('/users/create')">
              <v-card-title class="d-flex align-center">
                <v-icon color="primary" class="me-2">mdi-account-plus</v-icon>
                Add User
              </v-card-title>
              <v-card-text>
                <p class="text-body-2 text-grey-600">Create a new user account</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card class="quick-action-card h-100" @click="$router.push('/roles/create')">
              <v-card-title class="d-flex align-center">
                <v-icon color="success" class="me-2">mdi-shield-plus</v-icon>
                Create Role
              </v-card-title>
              <v-card-text>
                <p class="text-body-2 text-grey-600">Define a new role</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card class="quick-action-card h-100" @click="$router.push('/users')">
              <v-card-title class="d-flex align-center">
                <v-icon color="info" class="me-2">mdi-account-group</v-icon>
                View Users
              </v-card-title>
              <v-card-text>
                <p class="text-body-2 text-grey-600">Manage user accounts</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card class="quick-action-card h-100" @click="$router.push('/roles')">
              <v-card-title class="d-flex align-center">
                <v-icon color="warning" class="me-2">mdi-shield-cog</v-icon>
                Manage Roles
              </v-card-title>
              <v-card-text>
                <p class="text-body-2 text-grey-600">Configure roles and permissions</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-clock-outline</v-icon>
            Recent Activity
          </v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :prepend-avatar="activity.avatar"
                :title="activity.title"
                :subtitle="activity.description"
              >
                <template #append>
                  <span class="text-caption text-grey-500">
                    {{ activity.time }}
                  </span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-line</v-icon>
            System Status
          </v-card-title>
          
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-icon color="success" class="me-2">mdi-check-circle</v-icon>
              <span>API Server: Online</span>
            </div>
            
            <div class="d-flex align-center mb-3">
              <v-icon color="success" class="me-2">mdi-check-circle</v-icon>
              <span>Database: Connected</span>
            </div>
            
            <div class="d-flex align-center mb-3">
              <v-icon color="success" class="me-2">mdi-check-circle</v-icon>
              <span>Authentication: Active</span>
            </div>
            
            <div class="d-flex align-center">
              <v-icon color="success" class="me-2">mdi-check-circle</v-icon>
              <span>File Storage: Ready</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Logout Button (Additional) -->
    <v-row class="mt-6">
      <v-col cols="12" class="text-center">
        <v-btn
          color="error"
          variant="outlined"
          size="large"
          prepend-icon="mdi-logout"
          @click="handleLogout"
          :loading="authStore.isLoading"
        >
          Sign Out
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Composables
const authStore = useAuthStore()
const auth = useAuth()

// Reactive data
const stats = reactive({
  totalUsers: 1250,
  activeUsers: 892,
  totalRoles: 12,
  totalPermissions: 48
})

const recentActivities = ref([
  {
    id: 1,
    title: 'New user registered',
    description: 'john.doe@example.com joined the system',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    time: '2 minutes ago'
  },
  {
    id: 2,
    title: 'Role updated',
    description: 'Admin role permissions modified',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    time: '15 minutes ago'
  },
  {
    id: 3,
    title: 'User login',
    description: 'jane.smith@example.com logged in',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    time: '1 hour ago'
  },
  {
    id: 4,
    title: 'Permission added',
    description: 'New permission "manage_reports" created',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    time: '2 hours ago'
  }
])

const breadcrumbs = ref([
  { title: 'Home', to: '/dashboard' },
  { title: 'Dashboard', disabled: true }
])

// Methods
const handleLogout = async () => {
  try {
    await auth.logout()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// SEO
useHead({
  title: 'Dashboard - JTWBaseAuth',
  meta: [
    { name: 'description', content: 'JTWBaseAuth Dashboard - Manage your authentication system' }
  ]
})
</script>

<style scoped>
.quick-action-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.h-100 {
  height: 100%;
}
</style> 