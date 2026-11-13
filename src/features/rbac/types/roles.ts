import type { FeatureAccessKey } from './features'

/**
 * Backend role codes — do not rename these values.
 * Mapping to UI routes is configurable in roleRouteMap.ts.
 */
export type BackendRoleCode =
  | 'SUPER_ADMIN'
  | 'HR_ADMIN'
  | 'MANAGER'
  | 'EMPLOYEE'

export type RoleApiItem = {
  id: string
  code: BackendRoleCode | string
  name: string
  description: string
  isSystem: boolean
  isActive: boolean
  userCount: number
  permissionCount: number
}

export type RolesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type RolesApiData = {
  items: RoleApiItem[]
  pagination: RolesPagination
}

export type RolesApiResponse = {
  success: boolean
  message: string
  data: RolesApiData
}

/**
 * Permission keys are opaque strings from the backend.
 * Do not treat frontend-only keys as confirmed API contracts.
 */
export type PermissionCode = string

export type AuthSession = {
  userId: string
  displayName: string
  email: string
  roleCode: BackendRoleCode
  roleName: string
  /**
   * When null/undefined, permission checks fall back to role navigation.
   * When an array (including empty), UI gates use exact string membership.
   */
  permissions: PermissionCode[] | null
}

export type RoleNavChild = {
  title: string
  path: string
  /** Optional backend permission key; omitted until confirmed by API. */
  permission?: PermissionCode
  /** Frontend feature key for UI gating (not a backend code). */
  feature?: FeatureAccessKey
}

export type RoleNavItem = {
  title: string
  path: string
  iconName: string
  permission?: PermissionCode
  feature?: FeatureAccessKey
  children?: RoleNavChild[]
}

export type RoleUiConfig = {
  roleCode: BackendRoleCode
  routePrefix: string
  label: string
  navigation: RoleNavItem[]
}
