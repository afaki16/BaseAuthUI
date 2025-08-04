import type { LoginRequest, RegisterRequest, LoginResponse, User } from '~/types'
import { API_ENDPOINTS } from '~/utils/apiEndpoints'
import { useToast } from './useToast'
import { useRouter } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useApi } from './useApi'

export const useAuth = () => {
  const api = useApi()
  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const login = async (credentials: LoginRequest) => {
    try {
      authStore.setLoading(true)
      const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
      
      console.log('Login Response:', response)
      
      // Farklı response formatlarını destekle
      let loginData = null
      
      if (response.success && response.data) {
        // Standart format
        loginData = response.data
      } else if (response.accessToken) {
        // Direkt response format
        loginData = response
      } else if (response.data && response.data.accessToken) {
        // Nested data format
        loginData = response.data
      }
      
      if (loginData && loginData.accessToken) {
        await authStore.setAuth(loginData)
        toast.success('Login successful!')
        await router.push('/dashboard')
        return loginData
      } else {
        throw new Error('Invalid login response format')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      authStore.setLoading(true)
      const response = await api.post<User>(API_ENDPOINTS.AUTH.REGISTER, userData)
      
      if (response.success) {
        toast.success('Registration successful! Please login.')
        await router.push('/')
        return response.data
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const refreshToken = authStore.refreshToken
      if (refreshToken) {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authStore.clearAuth()
      toast.success('Logged out successfully')
      await router.push('/')
    }
  }

  const refreshToken = async () => {
    try {
      const accessToken = authStore.accessToken
      const refreshToken = authStore.refreshToken
      
      if (!refreshToken || !accessToken) {
        throw new Error('No tokens available')
      }

      const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        accessToken,
        refreshToken
      })

      if (response.success && response.data) {
        await authStore.setAuth(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      authStore.clearAuth()
      await router.push('/?expired=true')
      throw error
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await api.get<User>(API_ENDPOINTS.AUTH.ME)
      if (response.success && response.data) {
        authStore.setUser(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    return authStore.permissions.includes(permission)
  }

  const hasRole = (role: string): boolean => {
    return authStore.roles.includes(role)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  return {
    login,
    register,
    logout,
    refreshToken,
    getCurrentUser,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  }
} 