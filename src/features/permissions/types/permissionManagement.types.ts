export type ManagedPermission = {
  id: string
  code: string
  module: string
  description: string | null
  roleCount: number
  createdAt: string
  updatedAt: string
}

export type PermissionModuleFilter = 'all' | string
