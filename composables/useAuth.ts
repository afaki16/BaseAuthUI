import type { LoginRequest, RegisterRequest, LoginResponse, User } from '~/types'

export const useAuth = () => {
  const api = useApi()
  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const login = async (credentials: LoginRequest) => {
    try {
      authStore.setLoading(true)
      const response = await api.post<LoginResponse>('/auth/login', credentials)
      
      if (response.success && response.data) {
        await authStore.setAuth(response.data)
        toast.success('Login successful!')
        await router.push('/dashboard')
        return response.data
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
      const response = await api.post<User>('/auth/register', userData)
      
      if (response.success) {
        toast.success('Registration successful! Please login.')
        await router.push('/auth/login')
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
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authStore.clearAuth()
      toast.success('Logged out successfully')
      await router.push('/auth/login')
    }
  }

  const refreshToken = async () => {
    try {
      const accessToken = authStore.accessToken
      const refreshToken = authStore.refreshToken
      
      if (!refreshToken || !accessToken) {
        throw new Error('No tokens available')
      }

      const response = await api.post<LoginResponse>('/auth/refresh-token', {
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
      await router.push('/auth/login?expired=true')
      throw error
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await api.get<User>('/auth/me')
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