/**
 * Mirrors the Prisma schema enums; keep in sync. Do not import generated Prisma files in the UI.
 */

export type UserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'

export const USER_ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  HR_ADMIN: 'HR Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

/** Super Admin will get extra pages for users, roles and audit later. */
export function isHrAdminExperience(role: UserRole): boolean {
  return role === 'HR_ADMIN' || role === 'SUPER_ADMIN'
}

export function isManagerExperience(role: UserRole): boolean {
  return role === 'MANAGER'
}

export function isEmployeeExperience(role: UserRole): boolean {
  return role === 'EMPLOYEE'
}

export function isSuperAdminExperience(role: UserRole): boolean {
  return role === 'SUPER_ADMIN'
}

/** HR Admin without Super Admin extras (Audit, Access, demo reset). */
export function isHrAdminOnlyExperience(role: UserRole): boolean {
  return role === 'HR_ADMIN'
}
