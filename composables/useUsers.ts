import type { User, CreateUserRequest, UpdateUserRequest } from '~/types'

export const useUsers = () => {
  const api = useApi()
  const toast = useToast()

  const getUsers = async (page = 1, pageSize = 10, searchTerm = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { searchTerm })
      })
      
      const response = await api.get<User[]>(`/users?${params}`)
      return response.data || []
    } catch (error) {
      console.error('Get users error:', error)
      throw error
    }
  }

  const getUserById = async (id: string) => {
    try {
      const response = await api.get<User>(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  }

  const createUser = async (userData: CreateUserRequest) => {
    try {
      const response = await api.post<User>('/users', userData)
      if (response.success) {
        toast.success('User created successfully!')
        return response.data
      }
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }

  const updateUser = async (id: string, userData: UpdateUserRequest) => {
    try {
      const response = await api.put<User>(`/users/${id}`, userData)
      if (response.success) {
        toast.success('User updated successfully!')
        return response.data
      }
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted successfully!')
      return true
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
  }
} 