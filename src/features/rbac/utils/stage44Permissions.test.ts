import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import appSource from '@/App.tsx?raw'
import sidebarSource from '@/components/layout/Sidebar.tsx?raw'
import type { AuthUser } from '@/features/auth/types/auth.types'

import { ROLE_UI_CONFIG } from '../config/roleNavigation'
import { createEmployeeCalendarModuleRoutes } from '../routes/calendarModuleRoutes'
import { createEmployeeLeadsModuleRoutes } from '../routes/leadsModuleRoutes'
import { createEmployeeLeavePayrollRoutes } from '../routes/leavePayrollModuleRoutes'
import { createOrgRoleModuleRoutes } from '../routes/roleModuleRoutes'
import { FEATURE_PERMISSION_MAP, canAccessFeature } from '../services/permissionAdapter'
import type { FeatureAccessKey } from '../types/features'
import type { BackendRoleCode, RoleNavItem } from '../types/roles'
import { filterNavigation } from './filterNavigation'
import { collectNavPaths, getModulePageAccess } from './navAccess'
import { getPrimaryRoleCode, getHeldRoleCodes } from './userRoles'
import { getWorkspaceModulePath } from './workspaces'

const ALL_ROLES: BackendRoleCode[] = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']

function makeUser(role: string, roles: string[], permissions: string[] = []): AuthUser {
  return { id: 'u-1', email: 'u@hrms.test', role, roles, permissions, isActive: true }
}

function can(feature: FeatureAccessKey, permissions: string[] | null, role: BackendRoleCode = 'EMPLOYEE') {
  return canAccessFeature(feature, role, permissions)
}

// ---------------------------------------------------------------------------
// Route table walker: path -> feature guarding it (null = no route-level guard)
// ---------------------------------------------------------------------------

type RouteGuard = { path: string; feature: FeatureAccessKey | null }

function guardOf(element: ReactNode): FeatureAccessKey | null {
  if (!isValidElement(element)) return null
  const props = element.props as { feature?: FeatureAccessKey; children?: ReactNode }
  if (props.feature) return props.feature
  return null
}

function collectRoutes(routes: ReactElement[]): RouteGuard[] {
  const out: RouteGuard[] = []
  for (const route of routes) {
    const props = route.props as { path?: string; element?: ReactNode }
    if (!props.path) continue
    out.push({ path: props.path, feature: guardOf(props.element) })
  }
  return out
}

const ORG_PREFIXES = ['superadmin', 'admin', 'hr'] as const

const ORG_ROUTES: RouteGuard[] = ORG_PREFIXES.flatMap((prefix) => collectRoutes(createOrgRoleModuleRoutes(prefix)))
const EMPLOYEE_ROUTES: RouteGuard[] = collectRoutes([
  ...createEmployeeLeavePayrollRoutes(),
  ...createEmployeeLeadsModuleRoutes(),
  ...createEmployeeCalendarModuleRoutes(),
])
const ALL_ROUTES = [...ORG_ROUTES, ...EMPLOYEE_ROUTES]

/** Leave/Payroll guard their sections per tab inside the page (LeavePage / PayrollPage). */
function isInPageGuarded(path: string) {
  return /\/(leave|payroll|payslips)(\/|$)/.test(path)
}

function flattenNav(items: RoleNavItem[]) {
  return items.flatMap((item) => [
    { path: item.path, feature: item.feature },
    ...(item.children ?? []).filter((c) => !c.isSectionLabel).map((c) => ({ path: c.path, feature: c.feature })),
  ])
}

describe('route table walker sanity', () => {
  it('actually finds guarded routes (so the checks below are not vacuous)', () => {
    expect(ORG_ROUTES.length).toBeGreaterThan(30)
    expect(ORG_ROUTES.filter((r) => r.feature).length).toBeGreaterThan(25)
    expect(EMPLOYEE_ROUTES.filter((r) => r.feature).length).toBeGreaterThan(3)
  })
})

describe('route-level protection coverage', () => {
  it('every route is feature-guarded, except Leave/Payroll which guard per tab in-page', () => {
    const unguarded = ALL_ROUTES.filter((r) => !r.feature).map((r) => r.path)
    expect(unguarded.length).toBeGreaterThan(0)
    for (const path of unguarded) {
      expect(isInPageGuarded(path), `unguarded route ${path}`).toBe(true)
    }
  })

  it('the HR support inbox is now feature-guarded (previously unguarded)', () => {
    const route = ORG_ROUTES.find((r) => r.path === '/hr/support/admin-requests')
    expect(route?.feature).toBe('support.adminRequests')
  })

  it('every route feature is reachable by at least one role (no dead guards)', () => {
    const features = new Set(ALL_ROUTES.flatMap((r) => (r.feature ? [r.feature] : [])))
    for (const feature of features) {
      const reachable =
        feature in FEATURE_PERMISSION_MAP ||
        ALL_ROLES.some((role) => canAccessFeature(feature, role, []))
      expect(reachable, feature).toBe(true)
    }
  })

  it('nav items and the routes they open require the same feature', () => {
    const byPath = new Map(ALL_ROUTES.map((r) => [r.path, r.feature]))
    let compared = 0
    for (const role of ALL_ROLES) {
      for (const entry of flattenNav(ROLE_UI_CONFIG[role].navigation)) {
        if (!byPath.has(entry.path)) continue
        const routeFeature = byPath.get(entry.path)
        if (!routeFeature || !entry.feature) continue
        compared += 1
        expect(entry.feature, `${role} ${entry.path}`).toBe(routeFeature)
      }
    }
    expect(compared).toBeGreaterThan(20)
  })

  it('mapped route features deny every role when permissions are missing, null or empty', () => {
    const mapped = [...new Set(ALL_ROUTES.flatMap((r) => (r.feature && r.feature in FEATURE_PERMISSION_MAP ? [r.feature] : [])))]
    expect(mapped.length).toBeGreaterThan(5)
    for (const feature of mapped) {
      for (const role of ALL_ROLES) {
        expect(can(feature, null, role), `${feature} ${role} null`).toBe(false)
        expect(can(feature, [], role), `${feature} ${role} empty`).toBe(false)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Employee management actions
// ---------------------------------------------------------------------------

describe('employee management action permissions', () => {
  it('maps edit to employees:update, delete to employees:delete and add to employees:create', () => {
    expect(FEATURE_PERMISSION_MAP['employee.manage']).toBe('employees:update')
    expect(FEATURE_PERMISSION_MAP['employee.delete']).toBe('employees:delete')
    expect(FEATURE_PERMISSION_MAP['employee.registration.edit']).toBe('employees:create')
    expect(FEATURE_PERMISSION_MAP['employee.createLogin']).toBe('users:create')
  })

  it('create alone no longer allows edit, archive or delete', () => {
    const perms = ['employees:read', 'employees:create']
    expect(can('employee.registration.edit', perms, 'HR_ADMIN')).toBe(true)
    expect(can('employee.manage', perms, 'HR_ADMIN')).toBe(false)
    expect(can('employee.delete', perms, 'HR_ADMIN')).toBe(false)
  })

  it('update alone allows edit/archive but not delete or create', () => {
    const perms = ['employees:read', 'employees:update']
    expect(can('employee.manage', perms, 'HR_ADMIN')).toBe(true)
    expect(can('employee.delete', perms, 'HR_ADMIN')).toBe(false)
    expect(can('employee.registration.edit', perms, 'HR_ADMIN')).toBe(false)
  })

  it('delete alone allows delete only', () => {
    const perms = ['employees:read', 'employees:delete']
    expect(can('employee.delete', perms, 'HR_ADMIN')).toBe(true)
    expect(can('employee.manage', perms, 'HR_ADMIN')).toBe(false)
  })

  it('the Manager role label alone grants no employee actions (no role fallback for mapped keys)', () => {
    expect(can('employee.manage', [], 'MANAGER')).toBe(false)
    expect(can('employee.delete', [], 'MANAGER')).toBe(false)
    expect(can('employee.manage', null, 'SUPER_ADMIN')).toBe(false)
    expect(can('employee.delete', [], 'SUPER_ADMIN')).toBe(false)
  })

  it('Employee (14 permissions) has none of the employee management actions', () => {
    const employee = ['leaves:create', 'leaves:read', 'holidays:read', 'leads:read']
    for (const feature of ['employee.manage', 'employee.delete', 'employee.registration.edit', 'employee.directory'] as const) {
      expect(can(feature, employee), feature).toBe(false)
    }
  })

  it('profile editing: own profile uses employee.profile.own, others require employee.manage', () => {
    // Employee: own profile editable via role fallback, others denied.
    expect(can('employee.profile.own', [], 'EMPLOYEE')).toBe(true)
    expect(can('employee.manage', ['employees:read'], 'EMPLOYEE')).toBe(false)
    expect(can('employee.manage', ['employees:update'], 'MANAGER')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Leave settings / balance actions
// ---------------------------------------------------------------------------

describe('leave balance and leave-type permissions', () => {
  it('maps to the verified backend codes', () => {
    expect(FEATURE_PERMISSION_MAP['leave.balances.adjust']).toBe('employee_leave_policies:adjust')
    expect(FEATURE_PERMISSION_MAP['leave.types.update']).toBe('leave_types:update')
  })

  it('read-only codes do not grant adjustment or leave-type edits', () => {
    const readOnly = ['leave_types:read', 'employee_leave_policies:read', 'leaves:read']
    expect(can('leave.balances.adjust', readOnly, 'HR_ADMIN')).toBe(false)
    expect(can('leave.types.update', readOnly, 'HR_ADMIN')).toBe(false)
  })

  it('each action needs exactly its own code', () => {
    expect(can('leave.balances.adjust', ['employee_leave_policies:adjust'], 'HR_ADMIN')).toBe(true)
    expect(can('leave.types.update', ['employee_leave_policies:adjust'], 'HR_ADMIN')).toBe(false)
    expect(can('leave.types.update', ['leave_types:update'], 'HR_ADMIN')).toBe(true)
    expect(can('leave.balances.adjust', ['leave_types:update'], 'HR_ADMIN')).toBe(false)
  })

  it('no role grants them without the permission (SUPER_ADMIN has no bypass)', () => {
    for (const role of ALL_ROLES) {
      expect(can('leave.balances.adjust', [], role), role).toBe(false)
      expect(can('leave.types.update', null, role), role).toBe(false)
    }
  })

  it('Leave Settings holiday actions reuse the verified holidays:* codes', () => {
    expect(can('holidays.create', ['holidays:read'], 'HR_ADMIN')).toBe(false)
    expect(can('holidays.update', ['holidays:read'], 'HR_ADMIN')).toBe(false)
    expect(can('holidays.delete', ['holidays:read'], 'HR_ADMIN')).toBe(false)
    expect(can('holidays.create', ['holidays:create'], 'HR_ADMIN')).toBe(true)
    expect(can('holidays.update', ['holidays:update'], 'HR_ADMIN')).toBe(true)
    expect(can('holidays.delete', ['holidays:delete'], 'HR_ADMIN')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Support admin requests (no backend code; role-only interim policy)
// ---------------------------------------------------------------------------

describe('support admin requests (documented backend gap)', () => {
  it('has no backend permission code and is not invented', () => {
    expect('support.adminRequests' in FEATURE_PERMISSION_MAP).toBe(false)
  })

  it('is allowed for Manager (HR) only, regardless of permissions', () => {
    expect(can('support.adminRequests', [], 'MANAGER')).toBe(true)
    expect(can('support.adminRequests', null, 'MANAGER')).toBe(true)
    expect(can('support.adminRequests', ['employees:read'], 'EMPLOYEE')).toBe(false)
    expect(can('support.adminRequests', [], 'EMPLOYEE')).toBe(false)
    expect(can('support.adminRequests', [], 'HR_ADMIN')).toBe(false)
    expect(can('support.adminRequests', [], 'SUPER_ADMIN')).toBe(false)
  })

  it('the HR sidebar entry carries the feature so sidebar and direct URL agree', () => {
    const entry = flattenNav(ROLE_UI_CONFIG.MANAGER.navigation).find((e) => e.path === '/hr/support/admin-requests')
    expect(entry?.feature).toBe('support.adminRequests')
    const visible = collectNavPaths(filterNavigation(ROLE_UI_CONFIG.MANAGER.navigation, 'MANAGER', []))
    expect(visible.has('/hr/support/admin-requests')).toBe(true)
  })

  it('a Manager who only holds the Employee role cannot see the entry', () => {
    const visible = collectNavPaths(filterNavigation(ROLE_UI_CONFIG.MANAGER.navigation, 'EMPLOYEE', []))
    expect(visible.has('/hr/support/admin-requests')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Placeholder module page (direct URL) access
// ---------------------------------------------------------------------------

describe('getModulePageAccess (RoleModulePage direct-URL rule)', () => {
  const nav = ROLE_UI_CONFIG.EMPLOYEE.navigation
  const empNav = filterNavigation(nav, 'EMPLOYEE', ['leaves:read'])

  it('denies a URL that is not in the role navigation at all', () => {
    expect(getModulePageAccess(nav, empNav, '/employee/does-not-exist')).toBe('unknown')
    expect(getModulePageAccess(nav, empNav, '/employee/payroll/secret')).toBe('unknown')
    expect(getModulePageAccess(nav, empNav, '/employee/employees/directory')).toBe('unknown')
  })

  it('denies a role-nav destination that is filtered out for this user', () => {
    const hr = ROLE_UI_CONFIG.MANAGER.navigation
    const filtered = filterNavigation(hr, 'MANAGER', [])
    const hiddenPath = flattenNav(hr).find((e) => e.path && !collectNavPaths(filtered).has(e.path))?.path
    expect(hiddenPath).toBeTruthy()
    expect(getModulePageAccess(hr, filtered, hiddenPath as string)).toBe('hidden')
  })

  it('allows a destination that is visible to the user', () => {
    const visible = [...collectNavPaths(empNav)]
    expect(visible.length).toBeGreaterThan(0)
    expect(getModulePageAccess(nav, empNav, visible[0])).toBe('allowed')
  })

  it('tolerates a trailing slash on a visible path but still denies unknown ones', () => {
    const visible = [...collectNavPaths(empNav)].find((p) => p.length > 1) as string
    expect(getModulePageAccess(nav, empNav, `${visible}/`)).toBe('allowed')
    expect(getModulePageAccess(nav, empNav, '/employee/zzz/')).toBe('unknown')
  })

  it('a path that belongs to another role workspace is unknown for this role', () => {
    expect(getModulePageAccess(nav, empNav, '/superadmin/users')).toBe('unknown')
    expect(getModulePageAccess(nav, empNav, '/admin/dashboard')).toBe('unknown')
  })

  it('ignores section labels as destinations', () => {
    const paths = collectNavPaths([
      { title: 'P', path: '/x', iconName: 'Home', children: [{ title: 'Label', path: '/x/label', isSectionLabel: true }] } as RoleNavItem,
    ])
    expect(paths.has('/x')).toBe(true)
    expect(paths.has('/x/label')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Sidebar visibility / fail-closed
// ---------------------------------------------------------------------------

describe('sidebar visibility', () => {
  it('Employee (14 permissions) sees no employee-management or org navigation', () => {
    const employeePerms = [
      'leaves:create', 'leaves:read', 'leaves:cancel', 'leave_types:read', 'holidays:read',
      'leave_encashments:create', 'leave_encashments:read', 'leave_encashments:cancel',
      'employee_leave_policies:read', 'leads:create', 'leads:read', 'leads:update', 'leads:notes', 'leads:analytics',
    ]
    const visible = collectNavPaths(filterNavigation(ROLE_UI_CONFIG.EMPLOYEE.navigation, 'EMPLOYEE', employeePerms))
    expect(visible.size).toBeGreaterThan(0)
    for (const path of visible) {
      expect(path.startsWith('/employee'), path).toBe(true)
      expect(path).not.toMatch(/\/employees\/(directory|add)/)
    }
  })

  it('employee management entries disappear when employees:read is missing', () => {
    const withPerm = collectNavPaths(filterNavigation(ROLE_UI_CONFIG.HR_ADMIN.navigation, 'HR_ADMIN', ['employees:read']))
    const without = collectNavPaths(filterNavigation(ROLE_UI_CONFIG.HR_ADMIN.navigation, 'HR_ADMIN', []))
    expect(withPerm.has('/admin/employees/directory')).toBe(true)
    expect(without.has('/admin/employees/directory')).toBe(false)
  })

  it('the Sidebar no longer falls back to a static role-agnostic menu without an RBAC session', () => {
    expect(sidebarSource).not.toContain('resolveNavigationItems')
    expect(sidebarSource).not.toContain('useLeaveViewer')
    expect(sidebarSource).toContain('rbac ? toSidebarNavItems(rbac.navigation) : []')
  })
})

// ---------------------------------------------------------------------------
// Legacy URL redirects and authentication behaviour
// ---------------------------------------------------------------------------

describe('getWorkspaceModulePath (legacy /leads redirect target)', () => {
  it('sends each single-role user to their own workspace, not a hardcoded admin one', () => {
    expect(getWorkspaceModulePath(makeUser('EMPLOYEE', ['EMPLOYEE']), 'leads')).toBe('/employee/leads')
    expect(getWorkspaceModulePath(makeUser('EMPLOYEE', ['MANAGER']), 'leads')).toBe('/hr/leads')
    expect(getWorkspaceModulePath(makeUser('EMPLOYEE', ['HR_ADMIN']), 'leads')).toBe('/admin/leads')
    expect(getWorkspaceModulePath(makeUser('SUPER_ADMIN', ['SUPER_ADMIN']), 'leads')).toBe('/superadmin/leads')
  })

  it('multi-role users go to the highest-priority workspace regardless of roles order', () => {
    expect(getWorkspaceModulePath(makeUser('EMPLOYEE', ['EMPLOYEE', 'MANAGER']), 'leads')).toBe('/hr/leads')
    expect(getWorkspaceModulePath(makeUser('EMPLOYEE', ['MANAGER', 'HR_ADMIN']), 'leads')).toBe('/admin/leads')
    expect(getWorkspaceModulePath(makeUser('EMPLOYEE', ['HR_ADMIN', 'MANAGER']), 'leads')).toBe('/admin/leads')
  })

  it('users with no supported role get no target (redirect falls back to login)', () => {
    expect(getWorkspaceModulePath(makeUser('GUEST', []), 'leads')).toBeNull()
    expect(getWorkspaceModulePath(makeUser('GUEST', ['AUDITOR']), 'leads')).toBeNull()
  })

  it('the redirect does not grant leads access: the destination feature guard still applies', () => {
    expect(can('leads.overview', [], 'EMPLOYEE')).toBe(false)
    expect(can('leads.overview', ['leads:read'], 'EMPLOYEE')).toBe(true)
  })

  it('App no longer hardcodes /admin/leads for legacy /leads', () => {
    expect(appSource).not.toContain('Navigate to="/admin/leads"')
    expect(appSource).toContain('<WorkspaceModuleRedirect section="leads" />')
  })
})

describe('authentication behaviour is unchanged', () => {
  it('held roles still union legacy role and roles array', () => {
    expect(getHeldRoleCodes(makeUser('EMPLOYEE', ['HR_ADMIN'])).sort()).toEqual(['EMPLOYEE', 'HR_ADMIN'])
    expect(getPrimaryRoleCode(makeUser('EMPLOYEE', ['HR_ADMIN', 'MANAGER']))).toBe('HR_ADMIN')
  })

  it('ROLE matrix fallback does not leak into mapped features for any role', () => {
    for (const role of ALL_ROLES) {
      expect(can('employee.manage', [], role)).toBe(false)
      expect(can('module.users', [], role)).toBe(false)
    }
  })
})
