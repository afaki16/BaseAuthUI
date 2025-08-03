import { defineStore } from 'pinia'
import type { Permission, PermissionState } from '~/types'

export const usePermissionsStore = defineStore('permissions', {
  state: (): PermissionState => ({
    permissions: [],
    isLoading: false
  }),

  getters: {
    groupedPermissions: (state) => {
      return state.permissions.reduce((groups, permission) => {
        const resource = permission.resource
        if (!groups[resource]) {
          groups[resource] = []
        }
        groups[resource].push(permission)
        return groups
      }, {} as Record<string, Permission[]>)
    },
    
    getPermissionById: (state) => (id: string) => {
      return state.permissions.find(permission => permission.id === id)
    },
    
    getPermissionsByResource: (state) => (resource: string) => {
      return state.permissions.filter(permission => permission.resource === resource)
    }
  },

  actions: {
    setPermissions(permissions: Permission[]) {
      this.permissions = permissions
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    clearPermissions() {
      this.permissions = []
    }
  }
}) 