import type { BackendRoleCode, PermissionCode } from '../types/roles'
import type { FeatureAccessKey } from '../types/features'

/**
 * Adapter boundary between UI feature keys and backend permission codes.
 * Replace MockPermissionAdapter with an API-backed implementation later.
 */
export type PermissionAdapter = {
  /**
   * Returns opaque backend permission codes, or null if not loaded yet.
   */
  getPermissions: () => PermissionCode[] | null
  /**
   * Optional mapping from UI feature key → backend permission code.
   * Empty until backend contracts are confirmed.
   */
  getBackendPermissionForFeature: (
    feature: FeatureAccessKey,
  ) => PermissionCode | null
  /**
   * Temporary UI policy used only when backend permissions are unavailable.
   * Not a substitute for server-side authorization.
   */
  canAccessFeatureByRole: (
    feature: FeatureAccessKey,
    roleCode: BackendRoleCode,
  ) => boolean
}

const ROLE_FEATURE_MATRIX: Record<BackendRoleCode, FeatureAccessKey[]> = {
  SUPER_ADMIN: [
    'employee.overview',
    'employee.stats',
    'employee.birthdays',
    'employee.anniversaries',
    'employee.newJoiners',
    'employee.noticePeriod',
    'employee.departmentDistribution',
    'employee.attendanceAnalytics',
    'employee.leaveAnalytics',
    'employee.attrition',
    'employee.payrollOverview',
    'employee.directory',
    'employee.manage',
    'attendance.overview',
    'attendance.daily',
    'attendance.checkIn',
    'attendance.corrections',
    'attendance.corrections.approve',
    'attendance.regularization',
    'attendance.overtime',
    'attendance.weeklyOff',
    'attendance.holidays',
    'attendance.reports',
    'attendance.settings',
    'attendance.settings.advanced',
    'module.users',
    'module.roles',
    'module.permissions',
    'module.audit',
    'module.systemSettings',
    'recruitment.overview',
    'recruitment.jobs',
    'recruitment.jobDescriptions',
    'recruitment.candidates',
    'recruitment.pipeline',
    'recruitment.interviews',
    'recruitment.feedback',
    'recruitment.offers',
    'recruitment.analytics',
    'recruitment.manage',
  ],
  HR_ADMIN: [
    'employee.overview',
    'employee.stats',
    'employee.birthdays',
    'employee.anniversaries',
    'employee.newJoiners',
    'employee.noticePeriod',
    'employee.departmentDistribution',
    'employee.attendanceAnalytics',
    'employee.leaveAnalytics',
    'employee.attrition',
    'employee.payrollOverview',
    'employee.directory',
    'employee.manage',
    'attendance.overview',
    'attendance.daily',
    'attendance.checkIn',
    'attendance.corrections',
    'attendance.corrections.approve',
    'attendance.regularization',
    'attendance.overtime',
    'attendance.weeklyOff',
    'attendance.holidays',
    'attendance.reports',
    'attendance.settings',
    'module.users',
    'recruitment.overview',
    'recruitment.jobs',
    'recruitment.jobDescriptions',
    'recruitment.candidates',
    'recruitment.pipeline',
    'recruitment.interviews',
    'recruitment.feedback',
    'recruitment.offers',
    'recruitment.analytics',
    'recruitment.manage',
  ],
  MANAGER: [
    'dashboard.hr',
    'employee.overview',
    'employee.stats',
    'employee.birthdays',
    'employee.anniversaries',
    'employee.newJoiners',
    'employee.noticePeriod',
    'employee.departmentDistribution',
    'employee.attendanceAnalytics',
    'employee.leaveAnalytics',
    'employee.directory',
    'employee.manage',
    'attendance.overview',
    'attendance.daily',
    'attendance.checkIn',
    'attendance.corrections',
    'attendance.corrections.approve',
    'attendance.regularization',
    'attendance.overtime',
    'attendance.weeklyOff',
    'attendance.holidays',
    'attendance.reports',
    'attendance.settings',
    'recruitment.overview',
    'recruitment.jobs',
    'recruitment.jobDescriptions',
    'recruitment.candidates',
    'recruitment.pipeline',
    'recruitment.interviews',
    'recruitment.feedback',
    'recruitment.offers',
    'recruitment.analytics',
    'recruitment.manage',
  ],
  EMPLOYEE: [
    'attendance.checkIn',
    'attendance.corrections',
    'attendance.regularization',
    'attendance.reports',
    'attendance.holidays',
  ],
}

/**
 * Mock adapter for UI development.
 * Clearly separated from real API permissions.
 */
export class MockPermissionAdapter implements PermissionAdapter {
  private readonly permissions: PermissionCode[] | null

  constructor(permissions: PermissionCode[] | null = null) {
    this.permissions = permissions
  }

  getPermissions() {
    return this.permissions
  }

  getBackendPermissionForFeature(_feature: FeatureAccessKey) {
    // No confirmed backend permission codes in this repo yet.
    return null
  }

  canAccessFeatureByRole(feature: FeatureAccessKey, roleCode: BackendRoleCode) {
    return ROLE_FEATURE_MATRIX[roleCode]?.includes(feature) ?? false
  }
}

let activeAdapter: PermissionAdapter = new MockPermissionAdapter(null)

export function setPermissionAdapter(adapter: PermissionAdapter) {
  activeAdapter = adapter
}

export function getPermissionAdapter() {
  return activeAdapter
}

export function canAccessFeature(
  feature: FeatureAccessKey,
  roleCode: BackendRoleCode,
  permissions: PermissionCode[] | null | undefined = activeAdapter.getPermissions(),
): boolean {
  const mapped = activeAdapter.getBackendPermissionForFeature(feature)
  if (mapped && permissions != null) {
    return permissions.includes(mapped)
  }
  // Fallback UI policy until backend permission codes are provided.
  return activeAdapter.canAccessFeatureByRole(feature, roleCode)
}
