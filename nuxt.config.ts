export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-07-26',
 
  // TypeScript configuration - geçici olarak kapatın
  typescript: {
    strict: false,
    typeCheck: false
  },
  
  // CSS Framework
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
    '~/assets/scss/main.scss'
  ],
  
  build: {
    transpile: ['vuetify']
  },
  
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts'
  ],
  
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
      'Material+Icons': true
    }
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'https://localhost:44333',
      appName: 'JTWBaseAuth',
      appVersion: '1.0.0'
    }
  },
  
  app: {
    head: {
      title: 'JTWBaseAuth - Authentication System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'A modern authentication system with role-based permissions' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  ssr: false,
  
  vite: {
    define: {
      'process.env.DEBUG': false
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables.scss" as *;'
        }
      }
    },
    // HMR overlay'i kapatın
    server: {
      hmr: {
        overlay: false
      }
    }
  },
  
  imports: {
    dirs: ['composables/**', 'stores/**', 'utils/**']
  }
})