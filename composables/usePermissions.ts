import type { Permission } from '~/types'

export const usePermissions = () => {
  const api = useApi()

  const getPermissions = async () => {
    try {
      const response = await api.get<Permission[]>('/permissions')
      return response.data || []
    } catch (error) {
      console.error('Get permissions error:', error)
      throw error
    }
  }

  const groupPermissionsByResource = (permissions: Permission[]) => {
    return permissions.reduce((groups, permission) => {
      const resource = permission.resource
      if (!groups[resource]) {
        groups[resource] = []
      }
      groups[resource].push(permission)
      return groups
    }, {} as Record<string, Permission[]>)
  }

  return {
    getPermissions,
    groupPermissionsByResource
  }
} 