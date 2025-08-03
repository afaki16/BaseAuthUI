<template>
  <div class="landing-page">
    <v-container>
      <v-row justify="center" align="center" style="min-height: 100vh;">
        <v-col cols="12" md="8" lg="6" class="text-center">
          <div class="mb-8">
            <v-icon size="120" color="primary" class="mb-4">
              mdi-shield-lock
            </v-icon>
            <h1 class="text-h2 font-weight-bold text-primary mb-4">
              JTWBaseAuth
            </h1>
            <p class="text-h5 text-grey-700 mb-6">
              A modern authentication system with role-based permissions
            </p>
            <p class="text-body-1 text-grey-600 mb-8">
              Secure, scalable, and easy to integrate. Built with .NET Core, PostgreSQL, 
              Nuxt.js, and Vuetify for modern web applications.
            </p>
          </div>

          <div class="mb-8">
            <v-btn
              color="primary"
              size="x-large"
              class="me-4 mb-4"
              @click="$router.push('/auth/login')"
            >
              <v-icon start>mdi-login</v-icon>
              Sign In
            </v-btn>
            
            <v-btn
              variant="outlined"
              color="primary" 
              size="x-large"
              class="mb-4"
              @click="$router.push('/auth/register')"
            >
              <v-icon start>mdi-account-plus</v-icon>
              Get Started
            </v-btn>
          </div>

          <!-- Features -->
          <v-row class="mt-12">
            <v-col cols="12" sm="4" class="mb-4">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="text-center pa-6">
                  <v-icon size="48" color="primary" class="mb-3">
                    mdi-security
                  </v-icon>
                  <h3 class="text-h6 mb-2">Secure Authentication</h3>
                  <p class="text-body-2 text-grey-600">
                    JWT-based authentication with refresh tokens and secure password hashing
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="4" class="mb-4">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="text-center pa-6">
                  <v-icon size="48" color="primary" class="mb-3">
                    mdi-account-group
                  </v-icon>
                  <h3 class="text-h6 mb-2">Role Management</h3>
                  <p class="text-body-2 text-grey-600">
                    Flexible role-based access control with granular permissions
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="4" class="mb-4">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="text-center pa-6">
                  <v-icon size="48" color="primary" class="mb-3">
                    mdi-rocket-launch
                  </v-icon>
                  <h3 class="text-h6 mb-2">Ready to Deploy</h3>
                  <p class="text-body-2 text-grey-600">
                    Production-ready with Docker support and comprehensive documentation
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  layout: false
})

// SEO
useHead({
  title: 'JTWBaseAuth - Modern Authentication System',
  meta: [
    { 
      name: 'description', 
      content: 'A modern authentication system with role-based permissions. Built with .NET Core, PostgreSQL, Nuxt.js, and Vuetify.' 
    },
    { name: 'keywords', content: 'authentication, authorization, JWT, role-based, permissions, .NET Core, Nuxt.js, Vuetify' }
  ]
})
</script>

<style scoped>
.landing-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style> 