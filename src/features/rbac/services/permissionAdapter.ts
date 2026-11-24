import type { BackendRoleCode, PermissionCode } from '../types/roles'
import type { FeatureAccessKey } from '../types/features'

/**
 * Adapter boundary between UI feature keys and backend permission codes.
 *
 * UI gating only - the backend (`@RequirePermission`) remains the source of
 * truth for authorization.
 */
export type PermissionAdapter = {
  /**
   * Returns opaque backend permission codes, or null if not loaded yet.
   */
  getPermissions: () => PermissionCode[] | null
  /** UI feature key → backend permission code, or null when the backend has none. */
  getBackendPermissionForFeature: (
    feature: FeatureAccessKey,
  ) => PermissionCode | null
  /**
   * Interim UI policy for features that have NO backend permission code yet.
   * `roleCode` must be a role the authenticated user actually holds.
   * Not a substitute for server-side authorization.
   */
  canAccessFeatureByRole: (
    feature: FeatureAccessKey,
    roleCode: BackendRoleCode,
  ) => boolean
}

/**
 * UI feature → backend permission code, taken from the server contract
 * (`hrms-server/prisma/seed.ts` PERMISSIONS + `@RequirePermission` on the
 * controllers). Mapped features are enforced strictly against
 * `AuthUser.permissions`: missing, null or empty permissions deny access.
 *
 * Features not listed here have no backend permission code yet and fall back
 * to ROLE_FEATURE_MATRIX (see below).
 */
export const FEATURE_PERMISSION_MAP: Partial<
  Record<FeatureAccessKey, PermissionCode>
> = {
  // GET /users, /roles, /permissions
  'module.users': 'users:read',
  // POST /users
  'users.create': 'users:create',
  // PATCH /users/:id
  'users.update': 'users:update',
  // PATCH /users/:id/deactivate
  'users.deactivate': 'users:deactivate',
  // POST /users/:id/roles, DELETE /users/:id/roles/:roleId
  'users.assignRoles': 'users:assign_roles',
  'module.roles': 'roles:read',
  // POST /roles
  'roles.create': 'roles:create',
  // PATCH /roles/:id
  'roles.update': 'roles:update',
  // DELETE /roles/:id
  'roles.delete': 'roles:delete',
  'module.permissions': 'permissions:read',
  // GET /employees, /employees/:id, /dashboard/*
  'employee.overview': 'employees:read',
  'employee.stats': 'employees:read',
  'employee.birthdays': 'employees:read',
  'employee.anniversaries': 'employees:read',
  'employee.newJoiners': 'employees:read',
  'employee.departmentDistribution': 'employees:read',
  'employee.attendanceAnalytics': 'employees:read',
  'employee.attrition': 'employees:read',
  'employee.workforceExtended': 'employees:read',
  'employee.leaveAnalytics': 'leaves:read',
  'employee.directory': 'employees:read',
  'employee.registration.view': 'employees:read',
  // POST /employees, PATCH /employees/:id
  'employee.registration.edit': 'employees:create',
  // POST /users (login for an onboarded employee)
  'employee.createLogin': 'users:create',
  'employee.manage': 'employees:update',
  // Organisation onboarding
  'onboarding.list': 'onboarding:read',
  'onboarding.create': 'onboarding:create',
  'onboarding.verify': 'onboarding:verify',
  // DELETE /employees/:id
  'employee.delete': 'employees:delete',
  // POST /employees/:id/sync-device (TimeWatch biometric device)
  'employee.syncDevice': 'employees:sync_device',
  // Department management
  'employee.organization.edit': 'departments:manage',
  // GET /holidays
  'attendance.holidays': 'holidays:read',
  'calendar.holidays': 'holidays:read',
  // GET /calendar/events
  'calendar.events': 'calendar:read',
  // POST /calendar/events
  'calendar.create': 'calendar:create',
  // PATCH /calendar/events/:id
  'calendar.update': 'calendar:update',
  // DELETE /calendar/events/:id
  'calendar.delete': 'calendar:delete',
  // GET /calendar/weekly-offs, GET …/dates
  'calendar.weeklyOff': 'calendar:read',
  // POST /calendar/weekly-offs
  'calendar.weeklyOff.configure': 'calendar:configure',
  // GET /leads
  'leads.overview': 'leads:read',
  'leads.my': 'leads:read',
  // POST /leads, PATCH /leads/:id (and /status, /priority), DELETE /leads/:id,
  // PATCH /leads/:id/assign, POST /leads/:id/notes, GET /leads/analytics
  'leads.create': 'leads:create',
  'leads.update': 'leads:update',
  'leads.delete': 'leads:delete',
  'leads.assign': 'leads:assign',
  'leads.notes': 'leads:notes',
  'leads.analytics': 'leads:analytics',
  // POST /holidays, PATCH /holidays/:id, DELETE /holidays/:id
  'holidays.create': 'holidays:create',
  'holidays.update': 'holidays:update',
  'holidays.delete': 'holidays:delete',
  'holidays.import': 'holidays:create',
  'holidays.notify': 'holidays:notify',
  // Leave module. Views: GET /leaves, /leaves/:id, /leaves/calendar,
  // /leaves/balance/:employeeId, /leaves/history/:employeeId
  'leave.overview': 'leaves:read',
  'leave.myLeave': 'leaves:read',
  'leave.requests': 'leaves:read',
  'leave.calendar': 'leaves:read',
  'leave.reports': 'leaves:read',
  // GET /leave-types
  'leave.types': 'leave_types:read',
  // GET /employee-leave-policies (employee leave policy / balances dashboard)
  'leave.balances': 'employee_leave_policies:read',
  // GET /leave-policies/accrual, POST /leave-policies/accrual/run
  'leave.accruals': 'leave_policies:read',
  'leave.accruals.run': 'leave_policies:run',
  // POST /leaves, /leaves/:id/cancel, /leaves/:id/approve|reject
  'leave.create': 'leaves:create',
  'leave.createOnBehalf': 'leaves:create_on_behalf',
  'leave.cancel': 'leaves:cancel',
  'leave.approvals': 'leaves:approve',
  'leave.approve': 'leaves:approve',
  // /leave-encashments
  'leave.encashments.view': 'leave_encashments:read',
  'leave.encashments.create': 'leave_encashments:create',
  'leave.encashments.cancel': 'leave_encashments:cancel',
  'leave.encashments.approve': 'leave_encashments:approve',
  'leave.encashments.reject': 'leave_encashments:reject',
  // POST /employee-leave-policies/adjustments (manual balance credit/debit)
  'leave.balances.adjust': 'employee_leave_policies:adjust',
  // PATCH /leave-types/:id (editing a leave type's rules / approval chain)
  'leave.types.update': 'leave_types:update',
  // GET /attendance/biometric/devices, devices/timewatch, connection-test
  'attendance.biometric.devices': 'biometric:manage_devices',
  // POST /attendance/biometric/devices, PATCH …/devices/{id}
  'attendance.biometric.configure': 'biometric:manage_devices',
  // POST /attendance/biometric/sync
  'attendance.biometric.sync': 'biometric:sync',
  // GET /attendance/biometric/employees/.../attendance
  'attendance.biometric.attendanceRead': 'biometric:read_attendance',
  // GET /attendance/employees/... and by-code reports
  'attendance.reports': 'biometric:read_attendance',
  // POST/GET/DELETE /attendance/.../regularizations
  'attendance.regularization': 'attendance:regularize',
}

/**
 * INTERIM FALLBACK - only for features with no backend permission code
 * (attendance except holidays, recruitment, documents, dashboards, audit,
 * system settings, employee analytics widgets, calendar event writes, lead team /
 * manage views). Approved as a temporary policy until the backend defines
 * codes for these modules. Always evaluated for a role the user really holds
 * (never one derived from the URL alone). Entries for mapped features are
 * ignored.
 */
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
    'employee.workforceExtended',
    'employee.registration.view',
    'employee.registration.edit',
    'employee.organization.view',
    'employee.organization.edit',
    'employee.documents.view',
    'employee.documents.edit',
    'onboarding.list',
    'onboarding.create',
    'onboarding.verify',
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
    'attendance.biometric.devices',
    'attendance.biometric.configure',
    'attendance.biometric.sync',
    'attendance.biometric.attendanceRead',
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
    'leads.overview',
    'leads.manage',
    'calendar.overview',
    'calendar.view',
    'calendar.holidays',
    'calendar.manage',
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
    'employee.workforceExtended',
    'employee.registration.view',
    'employee.registration.edit',
    'employee.organization.view',
    'employee.documents.view',
    'onboarding.list',
    'onboarding.create',
    'onboarding.verify',
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
    'attendance.biometric.devices',
    'attendance.biometric.configure',
    'attendance.biometric.sync',
    'attendance.biometric.attendanceRead',
    'module.users',
    'leads.overview',
    'leads.manage',
    'calendar.overview',
    'calendar.view',
    'calendar.holidays',
    'calendar.manage',
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
    'employee.workforceExtended',
    'employee.registration.view',
    'employee.registration.edit',
    'employee.organization.view',
    'employee.organization.edit',
    'employee.documents.view',
    'employee.documents.edit',
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
    'leads.overview',
    'leads.manage',
    'leads.my',
    'leads.team',
    'calendar.overview',
    'calendar.view',
    'calendar.holidays',
    // HR inbox for public contact-administrator requests; no backend code.
    'support.adminRequests',
  ],
  EMPLOYEE: [
    'attendance.checkIn',
    'attendance.my',
    'attendance.corrections',
    'attendance.regularization.my',
    'attendance.holidays',
    'leads.my',
    'calendar.view',
    'calendar.holidays',
    'employee.profile.own',
    'employee.documents.own',
  ],
}

/**
 * Default adapter: backend permission codes for mapped features, interim role
 * matrix only for features the backend has no code for.
 */
export class BackendPermissionAdapter implements PermissionAdapter {
  getPermissions() {
    // Permissions are always passed explicitly from the authenticated user.
    return null
  }

  getBackendPermissionForFeature(feature: FeatureAccessKey) {
    return FEATURE_PERMISSION_MAP[feature] ?? null
  }

  canAccessFeatureByRole(feature: FeatureAccessKey, roleCode: BackendRoleCode) {
    return ROLE_FEATURE_MATRIX[roleCode]?.includes(feature) ?? false
  }
}

/**
 * Mock adapter for isolated UI development/tests only (not used by the app).
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

  getBackendPermissionForFeature() {
    // No confirmed backend permission codes in this repo yet.
    return null
  }

  canAccessFeatureByRole(feature: FeatureAccessKey, roleCode: BackendRoleCode) {
    return ROLE_FEATURE_MATRIX[roleCode]?.includes(feature) ?? false
  }
}

let activeAdapter: PermissionAdapter = new BackendPermissionAdapter()

export function setPermissionAdapter(adapter: PermissionAdapter) {
  activeAdapter = adapter
}

export function getPermissionAdapter() {
  return activeAdapter
}

/**
 * Single source for feature checks (sidebar, RequireAccess, Feature, pages).
 * Backend permission codes take precedence; missing/null/empty = denied.
 */
export function canAccessFeature(
  feature: FeatureAccessKey,
  roleCode: BackendRoleCode,
  permissions: PermissionCode[] | null | undefined = activeAdapter.getPermissions(),
): boolean {
  const mapped = activeAdapter.getBackendPermissionForFeature(feature)
  if (mapped) {
    return permissions?.includes(mapped) ?? false
  }
  // Interim fallback: no backend permission code exists for this feature.
  return activeAdapter.canAccessFeatureByRole(feature, roleCode)
}
