<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">API Test Sayfası</h1>
    
    <!-- Permissions API Test -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold mb-4">Permissions API Test</h2>
      
      <div class="space-y-4">
        <button
          @click="testPermissionsAPI"
          :disabled="isLoading"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          {{ isLoading ? 'Test ediliyor...' : 'Permissions API Test Et' }}
        </button>
        
        <div v-if="testResult" class="mt-4">
          <h3 class="font-medium mb-2">Test Sonucu:</h3>
          <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
        
        <div v-if="testError" class="mt-4">
          <h3 class="font-medium text-red-600 mb-2">Hata:</h3>
          <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p class="text-red-800">{{ testError }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isLoading = ref(false)
const testResult = ref(null)
const testError = ref(null)

const testPermissionsAPI = async () => {
  isLoading.value = true
  testResult.value = null
  testError.value = null
  
  try {
    const { $api } = useNuxtApp()
    
    console.log('API test başlatılıyor...')
    console.log('API Base URL:', $api.defaults.baseURL)
    
    const response = await $api.get('/Permissions?version=1.0')
    
    console.log('API Response:', response)
    
    testResult.value = {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    }
    
  } catch (error) {
    console.error('API Test Error:', error)
    
    testError.value = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    }
  } finally {
    isLoading.value = false
  }
}
</script> 