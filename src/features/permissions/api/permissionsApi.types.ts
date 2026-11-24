/** Types aligned with hrms-server GET /permissions response mapper. */

export type PermissionResponse = {
  id: string
  code: string
  module: string
  description: string | null
  createdAt: string
  updatedAt: string
  roleCount: number
}

export type PermissionsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PermissionsListData = {
  items: PermissionResponse[]
  pagination: PermissionsPagination
}

export type ListPermissionsParams = {
  page?: number
  limit?: number
  search?: string
  module?: string
}
