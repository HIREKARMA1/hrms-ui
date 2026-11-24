import { describe, expect, it } from 'vitest'

import type { AuthUser } from '@/features/auth/types/auth.types'

import { canAccessFeature } from '../services/permissionAdapter'
import { getRoleFromPathname } from './roleRouteMap'
import { getHeldRoleCodes, userHoldsRole } from './userRoles'
import { canSwitchWorkspaces, getAvailableWorkspaces } from './workspaces'

function makeUser(role: string, roles: string[], permissions: string[] = []): AuthUser {
  return {
    id: 'u-1',
    email: 'user@hrms.test',
    role,
    roles: [...roles].sort(),
    permissions,
    isActive: true,
  }
}

const EMPLOYEE_PERMISSIONS = [
  'leaves:create',
  'leaves:read',
  'holidays:read',
  'leads:read',
]

describe('getAvailableWorkspaces', () => {
  it('Employee-only user has a single workspace and no switcher', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE'])
    const list = getAvailableWorkspaces(user, 'EMPLOYEE')
    expect(list.map((w) => w.roleCode)).toEqual(['EMPLOYEE'])
    expect(canSwitchWorkspaces(list)).toBe(false)
  })

  it('user with empty roles array and legacy EMPLOYEE role has no switcher', () => {
    const list = getAvailableWorkspaces(makeUser('EMPLOYEE', []), 'EMPLOYEE')
    expect(canSwitchWorkspaces(list)).toBe(false)
  })

  it('EMPLOYEE + HR_ADMIN lists both, in priority order, regardless of API order', () => {
    const user = makeUser('EMPLOYEE', ['HR_ADMIN', 'EMPLOYEE'])
    const list = getAvailableWorkspaces(user, 'EMPLOYEE')
    expect(list.map((w) => w.roleCode)).toEqual(['HR_ADMIN', 'EMPLOYEE'])
    expect(canSwitchWorkspaces(list)).toBe(true)
  })

  it('maps each workspace to its landing route and UI label', () => {
    const user = makeUser('EMPLOYEE', ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'])
    const list = getAvailableWorkspaces(user, 'MANAGER')
    expect(list.map((w) => [w.roleCode, w.route, w.label])).toEqual([
      ['SUPER_ADMIN', '/superadmin/dashboard', 'Super Admin'],
      ['HR_ADMIN', '/hradmin/dashboard', 'HR Admin'],
      ['MANAGER', '/manager/dashboard', 'Manager'],
      ['EMPLOYEE', '/employee/dashboard', 'Employee'],
    ])
  })

  it('marks only the active workspace as current', () => {
    const user = makeUser('EMPLOYEE', ['MANAGER'])
    const list = getAvailableWorkspaces(user, 'MANAGER')
    expect(list.filter((w) => w.isCurrent).map((w) => w.roleCode)).toEqual(['MANAGER'])
  })

  it('never lists roles the user does not hold', () => {
    const user = makeUser('EMPLOYEE', ['MANAGER'])
    const codes = getAvailableWorkspaces(user, 'EMPLOYEE').map((w) => w.roleCode)
    expect(codes).not.toContain('SUPER_ADMIN')
    expect(codes).not.toContain('HR_ADMIN')
  })

  it('ignores unknown / unsupported role codes', () => {
    const user = makeUser('EMPLOYEE', ['AUDITOR', 'MANAGER'])
    expect(getAvailableWorkspaces(user, 'EMPLOYEE').map((w) => w.roleCode)).toEqual([
      'MANAGER',
      'EMPLOYEE',
    ])
  })

  it('has no workspace to show when the current role is unknown', () => {
    const list = getAvailableWorkspaces(makeUser('EMPLOYEE', ['MANAGER']), null)
    expect(list.some((w) => w.isCurrent)).toBe(false)
  })
})

describe('unauthorized workspace navigation and direct URL access', () => {
  // RoleLayout allows a workspace route only when userHoldsRole is true for
  // the role named by the URL prefix.
  function routeAllowed(user: AuthUser, pathname: string): boolean {
    const role = getRoleFromPathname(pathname)
    return role !== null && userHoldsRole(user, role)
  }

  it('Employee-only user is denied every other workspace URL', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE'])
    expect(routeAllowed(user, '/employee/leave/my-leave')).toBe(true)
    expect(routeAllowed(user, '/hradmin/dashboard')).toBe(false)
    expect(routeAllowed(user, '/manager/dashboard')).toBe(false)
    expect(routeAllowed(user, '/superadmin/dashboard')).toBe(false)
  })

  it('multi-role user is allowed exactly the held workspaces by direct URL', () => {
    const user = makeUser('EMPLOYEE', ['HR_ADMIN'])
    expect(routeAllowed(user, '/hradmin/dashboard')).toBe(true)
    expect(routeAllowed(user, '/employee/dashboard')).toBe(true)
    expect(routeAllowed(user, '/manager/dashboard')).toBe(false)
    expect(routeAllowed(user, '/superadmin/dashboard')).toBe(false)
  })

  it('legacy /admin and /hr prefixes still resolve to the same held roles', () => {
    const hrAdmin = makeUser('EMPLOYEE', ['HR_ADMIN'])
    const manager = makeUser('EMPLOYEE', ['MANAGER'])
    expect(routeAllowed(hrAdmin, '/admin/dashboard')).toBe(true)
    expect(routeAllowed(manager, '/hr/dashboard')).toBe(true)
    expect(routeAllowed(hrAdmin, '/hr/dashboard')).toBe(false)
    expect(routeAllowed(manager, '/admin/dashboard')).toBe(false)
  })

  it('every switcher target route is authorized for that user', () => {
    const users = [
      makeUser('EMPLOYEE', ['EMPLOYEE']),
      makeUser('EMPLOYEE', ['HR_ADMIN']),
      makeUser('EMPLOYEE', ['MANAGER', 'HR_ADMIN']),
      makeUser('EMPLOYEE', ['SUPER_ADMIN']),
    ]
    for (const user of users) {
      for (const item of getAvailableWorkspaces(user, null)) {
        expect(routeAllowed(user, item.route), `${user.roles.join(',')} -> ${item.route}`).toBe(true)
      }
    }
  })

  it('every non-listed workspace URL is denied', () => {
    const user = makeUser('EMPLOYEE', ['MANAGER'])
    const listed = new Set(getAvailableWorkspaces(user, null).map((w) => w.route))
    for (const route of [
      '/superadmin/dashboard',
      '/hradmin/dashboard',
      '/manager/dashboard',
      '/employee/dashboard',
    ]) {
      expect(routeAllowed(user, route), route).toBe(listed.has(route))
    }
  })
})

describe('switching grants no extra permissions', () => {
  it('permission-mapped features depend on user permissions, not the active workspace', () => {
    const user = makeUser('EMPLOYEE', ['HR_ADMIN'], EMPLOYEE_PERMISSIONS)
    const roles = getHeldRoleCodes(user)
    expect(roles).toEqual(['HR_ADMIN', 'EMPLOYEE'])
    for (const role of roles) {
      expect(canAccessFeature('leave.approve', role, user.permissions)).toBe(false)
      expect(canAccessFeature('leads.delete', role, user.permissions)).toBe(false)
      expect(canAccessFeature('holidays.create', role, user.permissions)).toBe(false)
      expect(canAccessFeature('leave.create', role, user.permissions)).toBe(true)
    }
  })

  it('a multi-role user with empty permissions is still denied mapped features in every workspace', () => {
    const user = makeUser('EMPLOYEE', ['HR_ADMIN', 'MANAGER'], [])
    for (const role of getHeldRoleCodes(user)) {
      expect(canAccessFeature('leave.create', role, user.permissions)).toBe(false)
      expect(canAccessFeature('leads.create', role, user.permissions)).toBe(false)
    }
  })
})
