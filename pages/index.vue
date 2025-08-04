<template>
  <div>
    <!-- Loading indicator while redirecting -->
    <div class="loading-container">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-4 text-grey-600">Yönlendiriliyor...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  layout: false
})

// Redirect to login page
onMounted(() => {
  // Small delay to show loading indicator
  setTimeout(() => {
    navigateTo('/auth/login')
  }, 500)
})

// SEO
useHead({
  title: 'JTWBaseAuth - Giriş',
  meta: [
    { 
      name: 'description', 
      content: 'JTWBaseAuth sistemine giriş yapın' 
    }
  ]
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style> 