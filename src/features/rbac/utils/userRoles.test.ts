import { describe, expect, it } from 'vitest'

import type { AuthUser } from '@/features/auth/types/auth.types'
import { getLandingRouteForUserRole } from '@/features/auth/utils/landingRoute'

import { canAccessFeature } from '../services/permissionAdapter'
import type { BackendRoleCode } from '../types/roles'
import { ROLE_LANDING_MAP, ROLE_PRIORITY, getHighestPriorityRole } from './roleRouteMap'
import {
  getHeldRoleCodes,
  getPrimaryRoleCode,
  getUserLandingRoute,
  userHoldsRole,
} from './userRoles'

const LANDING = {
  SUPER_ADMIN: '/superadmin/dashboard',
  HR_ADMIN: '/admin/dashboard',
  MANAGER: '/hr/dashboard',
  EMPLOYEE: '/employee/dashboard',
} as const

/** Shaped like the backend: `roles` sorted alphabetically, legacy `role` separate. */
function makeUser(
  role: string,
  roles: string[],
  permissions: string[] = [],
): AuthUser {
  return {
    id: 'u-1',
    email: 'user@hrms.test',
    role,
    roles: [...roles].sort(),
    permissions,
    isActive: true,
  }
}

const ALL = ROLE_PRIORITY as readonly BackendRoleCode[]

describe('role priority', () => {
  it('is SUPER_ADMIN > HR_ADMIN > MANAGER > EMPLOYEE', () => {
    expect([...ROLE_PRIORITY]).toEqual([
      'SUPER_ADMIN',
      'HR_ADMIN',
      'MANAGER',
      'EMPLOYEE',
    ])
  })

  it('keeps landing routes unchanged', () => {
    expect(ROLE_LANDING_MAP).toEqual(LANDING)
  })
})

describe('landing workspace for specific multi-role users', () => {
  it('EMPLOYEE (legacy) + [EMPLOYEE, HR_ADMIN] lands on HR_ADMIN', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'HR_ADMIN'])
    expect(getPrimaryRoleCode(user)).toBe('HR_ADMIN')
    expect(getUserLandingRoute(user)).toBe('/admin/dashboard')
    expect(getLandingRouteForUserRole(user.role, user.roles)).toBe('/admin/dashboard')
  })

  it('EMPLOYEE (legacy) + [HR_ADMIN] only lands on HR_ADMIN', () => {
    const user = makeUser('EMPLOYEE', ['HR_ADMIN'])
    expect(getUserLandingRoute(user)).toBe('/admin/dashboard')
  })

  it('EMPLOYEE (legacy) + [EMPLOYEE, MANAGER] lands on MANAGER', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'MANAGER'])
    expect(getUserLandingRoute(user)).toBe('/hr/dashboard')
  })

  it('HR_ADMIN + MANAGER lands on HR_ADMIN', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'HR_ADMIN', 'MANAGER'])
    expect(getUserLandingRoute(user)).toBe('/admin/dashboard')
  })

  it('anything + SUPER_ADMIN lands on SUPER_ADMIN', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'HR_ADMIN', 'SUPER_ADMIN'])
    expect(getUserLandingRoute(user)).toBe('/superadmin/dashboard')
  })

  it('uses the legacy role when it outranks the dynamic roles', () => {
    const user = makeUser('SUPER_ADMIN', ['EMPLOYEE'])
    expect(getUserLandingRoute(user)).toBe('/superadmin/dashboard')
  })

  it('works when only the legacy role is held (no assignments)', () => {
    expect(getUserLandingRoute(makeUser('MANAGER', []))).toBe('/hr/dashboard')
  })

  it('single-role users keep their own landing', () => {
    for (const role of ALL) {
      expect(getUserLandingRoute(makeUser(role, [role]))).toBe(LANDING[role])
    }
  })

  it('ignores unsupported roles but still lands on a supported one', () => {
    expect(getUserLandingRoute(makeUser('EMPLOYEE', ['AUDITOR', 'MANAGER']))).toBe(
      '/hr/dashboard',
    )
    expect(getUserLandingRoute(makeUser('AUDITOR', ['AUDITOR']))).toBeNull()
    expect(getUserLandingRoute(makeUser('AUDITOR', ['AUDITOR', 'EMPLOYEE']))).toBe(
      '/employee/dashboard',
    )
  })

  it('returns null with no supported role', () => {
    expect(getLandingRouteForUserRole('AUDITOR')).toBeNull()
    expect(getHighestPriorityRole(undefined, [])).toBeNull()
  })

  it('tolerates malformed roles', () => {
    expect(
      getLandingRouteForUserRole('EMPLOYEE', null as unknown as string[]),
    ).toBe('/employee/dashboard')
    expect(
      getLandingRouteForUserRole('EMPLOYEE', 42 as unknown as string[]),
    ).toBe('/employee/dashboard')
  })

  it('single-argument form still works for one role code', () => {
    for (const role of ALL) {
      expect(getLandingRouteForUserRole(role)).toBe(LANDING[role])
    }
  })
})

describe('landing workspace for every role combination', () => {
  const subsets: BackendRoleCode[][] = []
  for (let mask = 1; mask < 1 << ALL.length; mask++) {
    subsets.push(ALL.filter((_, i) => mask & (1 << i)))
  }

  it('covers all 15 non-empty combinations', () => {
    expect(subsets).toHaveLength(15)
  })

  for (const subset of subsets) {
    for (const legacy of ALL) {
      it(`legacy ${legacy} + roles [${subset.join(', ')}] lands on the highest held role`, () => {
        const user = makeUser(legacy, subset)
        const held = new Set<string>([legacy, ...subset])
        const best = ALL.find((code) => held.has(code)) as BackendRoleCode
        expect(getPrimaryRoleCode(user)).toBe(best)
        expect(getUserLandingRoute(user)).toBe(LANDING[best])
      })
    }

    it(`roles [${subset.join(', ')}] do not depend on array order`, () => {
      const forward = { ...makeUser('EMPLOYEE', subset), roles: [...subset] }
      const reversed = { ...makeUser('EMPLOYEE', subset), roles: [...subset].reverse() }
      expect(getUserLandingRoute(forward)).toBe(getUserLandingRoute(reversed))
      expect(getHeldRoleCodes(forward)).toEqual(getHeldRoleCodes(reversed))
    })
  }
})

describe('workspace authorization is unchanged by priority', () => {
  it('EMPLOYEE + HR_ADMIN may enter exactly those two workspaces', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'HR_ADMIN'])
    expect(userHoldsRole(user, 'HR_ADMIN')).toBe(true)
    expect(userHoldsRole(user, 'EMPLOYEE')).toBe(true)
    expect(userHoldsRole(user, 'MANAGER')).toBe(false)
    expect(userHoldsRole(user, 'SUPER_ADMIN')).toBe(false)
    expect(getHeldRoleCodes(user)).toEqual(['HR_ADMIN', 'EMPLOYEE'])
  })

  it('a user holds a workspace iff the role is in role or roles', () => {
    for (const role of ALL) {
      for (const dynamic of ALL) {
        const user = makeUser(role, [dynamic])
        for (const workspace of ALL) {
          expect(userHoldsRole(user, workspace)).toBe(
            workspace === role || workspace === dynamic,
          )
        }
      }
    }
  })

  it('a higher landing priority never grants a higher workspace', () => {
    for (const role of ALL) {
      const user = makeUser(role, [role])
      for (const higher of ALL.slice(0, ALL.indexOf(role))) {
        expect(userHoldsRole(user, higher)).toBe(false)
      }
    }
  })
})

describe('permissions are not granted by priority', () => {
  it('HR_ADMIN landing with limited permissions still denies unmapped-by-permission features', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'HR_ADMIN'], ['leaves:read'])
    const workspace = getPrimaryRoleCode(user) as BackendRoleCode
    expect(workspace).toBe('HR_ADMIN')
    expect(canAccessFeature('employee.overview', workspace, user.permissions)).toBe(false)
    expect(canAccessFeature('module.users', workspace, user.permissions)).toBe(false)
    expect(canAccessFeature('employee.registration.edit', workspace, user.permissions)).toBe(false)
  })

  it('empty permissions deny every backend-mapped feature for the highest role', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'SUPER_ADMIN'], [])
    expect(getPrimaryRoleCode(user)).toBe('SUPER_ADMIN')
    for (const feature of [
      'module.users',
      'module.roles',
      'module.permissions',
      'employee.overview',
      'employee.registration.edit',
      'employee.manage',
      'employee.organization.edit',
      'attendance.holidays',
      'leads.overview',
    ] as const) {
      expect(canAccessFeature(feature, 'SUPER_ADMIN', user.permissions)).toBe(false)
      expect(canAccessFeature(feature, 'SUPER_ADMIN', null)).toBe(false)
    }
  })

  it('a backend permission grants its feature regardless of the landing role', () => {
    const user = makeUser('EMPLOYEE', ['EMPLOYEE', 'HR_ADMIN'], ['employees:read'])
    expect(canAccessFeature('employee.overview', 'HR_ADMIN', user.permissions)).toBe(true)
    expect(canAccessFeature('employee.overview', 'EMPLOYEE', user.permissions)).toBe(true)
  })
})
