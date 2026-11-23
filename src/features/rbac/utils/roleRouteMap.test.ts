import { describe, expect, it } from 'vitest'

import {
  ROLE_LANDING_MAP,
  ROLE_ROUTE_MAP,
  getHighestPriorityRole,
  getRoleFromPathname,
  normalizeBackendRoleCode,
} from './roleRouteMap'

describe('workspace URL map', () => {
  it('maps production role codes to the new workspace prefixes', () => {
    expect(ROLE_ROUTE_MAP).toEqual({
      SUPER_ADMIN: '/superadmin',
      HR_ADMIN: '/hradmin',
      MANAGER: '/manager',
      EMPLOYEE: '/employee',
    })
    expect(ROLE_LANDING_MAP).toEqual({
      SUPER_ADMIN: '/superadmin/dashboard',
      HR_ADMIN: '/hradmin/dashboard',
      MANAGER: '/manager/dashboard',
      EMPLOYEE: '/employee/dashboard',
    })
  })
})

describe('normalizeBackendRoleCode', () => {
  it('passes through production role codes', () => {
    expect(normalizeBackendRoleCode('SUPER_ADMIN')).toBe('SUPER_ADMIN')
    expect(normalizeBackendRoleCode('HR_ADMIN')).toBe('HR_ADMIN')
    expect(normalizeBackendRoleCode('MANAGER')).toBe('MANAGER')
    expect(normalizeBackendRoleCode('EMPLOYEE')).toBe('EMPLOYEE')
  })

  it('normalizes legacy ADMIN → MANAGER for UI/workspace only', () => {
    expect(normalizeBackendRoleCode('ADMIN')).toBe('MANAGER')
    expect(normalizeBackendRoleCode('admin')).toBe('MANAGER')
  })

  it('normalizes legacy HR → HR_ADMIN for UI/workspace only', () => {
    expect(normalizeBackendRoleCode('HR')).toBe('HR_ADMIN')
    expect(normalizeBackendRoleCode('hr')).toBe('HR_ADMIN')
  })

  it('rejects unknown codes', () => {
    expect(normalizeBackendRoleCode('AUDITOR')).toBeNull()
    expect(normalizeBackendRoleCode('')).toBeNull()
    expect(normalizeBackendRoleCode(null)).toBeNull()
  })

  it('legacy aliases affect landing priority the same as production codes', () => {
    expect(getHighestPriorityRole('EMPLOYEE', ['ADMIN'])).toBe('MANAGER')
    expect(getHighestPriorityRole('EMPLOYEE', ['HR'])).toBe('HR_ADMIN')
    expect(getHighestPriorityRole('HR', ['ADMIN'])).toBe('HR_ADMIN')
  })
})

describe('getRoleFromPathname', () => {
  it('resolves new workspace prefixes', () => {
    expect(getRoleFromPathname('/superadmin/dashboard')).toBe('SUPER_ADMIN')
    expect(getRoleFromPathname('/hradmin/users')).toBe('HR_ADMIN')
    expect(getRoleFromPathname('/manager/recruitment/jobs')).toBe('MANAGER')
    expect(getRoleFromPathname('/employee/leave')).toBe('EMPLOYEE')
  })

  it('does not treat /hradmin as the legacy /hr prefix', () => {
    expect(getRoleFromPathname('/hradmin')).toBe('HR_ADMIN')
    expect(getRoleFromPathname('/hradmin/dashboard')).toBe('HR_ADMIN')
  })

  it('still recognizes legacy /admin and /hr prefixes for mid-redirect resolution', () => {
    expect(getRoleFromPathname('/admin/dashboard')).toBe('HR_ADMIN')
    expect(getRoleFromPathname('/hr/dashboard')).toBe('MANAGER')
  })
})
