import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { $router } = useNuxtApp()
  
  // Create axios instance
  const api = axios.create({
    baseURL: config.public.apiBase,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = useCookie('access_token')
      if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        const refreshToken = useCookie('refresh_token')
        if (refreshToken.value) {
          try {
            await $router.push('/auth/login?expired=true')
          } catch (refreshError) {
            await $router.push('/auth/login')
          }
        } else {
          await $router.push('/auth/login')
        }
      }
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api
    }
  }
}) 