export type ManagedPermissionRole = {
  id: string
  code: string
  name: string
}

export type ManagedPermission = {
  id: string
  code: string
  module: string
  description: string | null
  roleCount: number
  relatedRoles: ManagedPermissionRole[]
  createdAt: string
  updatedAt: string
}

export type PermissionModuleFilter = 'all' | string
