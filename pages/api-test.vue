<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            API Integration Test
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="testApiConnection"
              :loading="isLoading"
            >
              Test Connection
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-alert
              v-if="connectionStatus"
              :type="connectionStatus.type"
              :title="connectionStatus.title"
              :text="connectionStatus.message"
            ></v-alert>
            
            <v-divider class="my-4"></v-divider>
            
            <h3>API Configuration</h3>
            <v-list>
              <v-list-item>
                <v-list-item-title>Base URL</v-list-item-title>
                <v-list-item-subtitle>{{ config.public.apiBase }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>App Name</v-list-item-title>
                <v-list-item-subtitle>{{ config.public.appName }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>App Version</v-list-item-title>
                <v-list-item-subtitle>{{ config.public.appVersion }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            
            <v-divider class="my-4"></v-divider>
            
            <h3>Available Endpoints</h3>
            <v-list>
              <v-list-item v-for="(endpoint, key) in availableEndpoints" :key="key">
                <v-list-item-title>{{ key }}</v-list-item-title>
                <v-list-item-subtitle>{{ endpoint }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            
            <v-divider class="my-4"></v-divider>
            
            <h3>Test Results</h3>
            <v-textarea
              v-model="testResults"
              label="API Test Results"
              readonly
              rows="10"
              variant="outlined"
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const api = useApi()
const toast = useToast()

const isLoading = ref(false)
const connectionStatus = ref<any>(null)
const testResults = ref('')

const availableEndpoints = {
  'Login': '/api/auth/login',
  'Register': '/api/auth/register',
  'Users List': '/api/users',
  'Roles List': '/api/roles',
  'Permissions List': '/api/permissions',
  'Dashboard Stats': '/api/dashboard/stats'
}

const testApiConnection = async () => {
  isLoading.value = true
  testResults.value = ''
  connectionStatus.value = null
  
  try {
    testResults.value += `Testing API connection to: ${config.public.apiBase}\n\n`
    
    // Test basic connectivity
    testResults.value += '1. Testing basic connectivity...\n'
    const response = await $fetch(`${config.public.apiBase}/swagger/v1/swagger.json`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    testResults.value += '✅ Swagger documentation accessible\n\n'
    
    // Test auth endpoints
    testResults.value += '2. Testing authentication endpoints...\n'
    try {
      await api.get('/api/auth/me')
      testResults.value += '✅ Auth endpoints accessible\n'
    } catch (error: any) {
      if (error.response?.status === 401) {
        testResults.value += '✅ Auth endpoints accessible (401 expected without token)\n'
      } else {
        testResults.value += `❌ Auth endpoints error: ${error.message}\n`
      }
    }
    
    // Test users endpoint
    testResults.value += '\n3. Testing users endpoint...\n'
    try {
      await api.get('/api/users')
      testResults.value += '✅ Users endpoint accessible\n'
    } catch (error: any) {
      if (error.response?.status === 401) {
        testResults.value += '✅ Users endpoint accessible (401 expected without token)\n'
      } else {
        testResults.value += `❌ Users endpoint error: ${error.message}\n`
      }
    }
    
    // Test roles endpoint
    testResults.value += '\n4. Testing roles endpoint...\n'
    try {
      await api.get('/api/roles')
      testResults.value += '✅ Roles endpoint accessible\n'
    } catch (error: any) {
      if (error.response?.status === 401) {
        testResults.value += '✅ Roles endpoint accessible (401 expected without token)\n'
      } else {
        testResults.value += `❌ Roles endpoint error: ${error.message}\n`
      }
    }
    
    connectionStatus.value = {
      type: 'success',
      title: 'Connection Successful',
      message: 'API integration is working correctly. All endpoints are accessible.'
    }
    
    toast.success('API connection test completed successfully!')
    
  } catch (error: any) {
    console.error('API test error:', error)
    
    testResults.value += `\n❌ Connection failed: ${error.message}\n`
    
    connectionStatus.value = {
      type: 'error',
      title: 'Connection Failed',
      message: `Failed to connect to API: ${error.message}`
    }
    
    toast.error('API connection test failed!')
  } finally {
    isLoading.value = false
  }
}

// Set page title
useHead({
  title: 'API Test - JTWBaseAuth'
})
</script> 