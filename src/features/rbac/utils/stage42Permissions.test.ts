import { describe, expect, it } from 'vitest'

import { LEAVE_TAB_FEATURES, leaveTabFeature } from '@/features/leave/constants/leaveTabFeatures'
import { isOfficeCalendarHolidayTab } from '@/features/officeCalendar/utils/officeCalendarTabFeatures'

import { ROLE_UI_CONFIG } from '../config/roleNavigation'
import { FEATURE_PERMISSION_MAP, canAccessFeature } from '../services/permissionAdapter'
import type { FeatureAccessKey } from '../types/features'
import type { BackendRoleCode, RoleNavChild, RoleNavItem } from '../types/roles'
import { filterNavigation } from './filterNavigation'

/** The 14 permissions the production EMPLOYEE role actually holds. */
const EMPLOYEE_PERMISSIONS = [
  'leaves:create',
  'leaves:read',
  'leaves:cancel',
  'leave_types:read',
  'holidays:read',
  'leave_encashments:create',
  'leave_encashments:read',
  'leave_encashments:cancel',
  'employee_leave_policies:read',
  'leads:create',
  'leads:read',
  'leads:update',
  'leads:notes',
  'leads:analytics',
]

/** Codes seeded by hrms-server/prisma/seed.ts that this stage maps. */
const SEEDED_CODES = new Set([
  'departments:manage',
  'employee_leave_policies:adjust', // Stage 4.4
  'employee_leave_policies:read',
  'employees:create',
  'employees:delete', // Stage 4.4
  'employees:sync_device', // Stage 4.6
  'employees:read',
  'employees:update',
  'holidays:create',
  'holidays:delete',
  'holidays:read',
  'holidays:update',
  'leads:analytics',
  'leads:assign',
  'leads:create',
  'leads:delete',
  'leads:notes',
  'leads:read',
  'leads:update',
  'leave_encashments:approve',
  'leave_encashments:cancel',
  'leave_encashments:create',
  'leave_encashments:read',
  'leave_encashments:reject',
  'leave_policies:read',
  'leave_policies:run',
  'leave_types:read',
  'leave_types:update', // Stage 4.4
  'leaves:approve',
  'leaves:cancel',
  'leaves:create',
  'leaves:create_on_behalf',
  'leaves:read',
  'permissions:read',
  'roles:read',
  'users:read',
])

const ALL_ROLES: BackendRoleCode[] = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']

function can(feature: FeatureAccessKey, permissions: string[] | null, role: BackendRoleCode = 'EMPLOYEE') {
  return canAccessFeature(feature, role, permissions)
}

function without(permissions: string[], code: string) {
  return permissions.filter((item) => item !== code)
}

describe('FEATURE_PERMISSION_MAP', () => {
  it('only uses permission codes that exist in the backend seed', () => {
    for (const [feature, code] of Object.entries(FEATURE_PERMISSION_MAP)) {
      expect(SEEDED_CODES.has(code as string), `${feature} -> ${code}`).toBe(true)
    }
  })

  it('maps each Stage 4.2 feature to its most specific code', () => {
    expect(FEATURE_PERMISSION_MAP['leave.create']).toBe('leaves:create')
    expect(FEATURE_PERMISSION_MAP['leave.createOnBehalf']).toBe('leaves:create_on_behalf')
    expect(FEATURE_PERMISSION_MAP['leave.cancel']).toBe('leaves:cancel')
    expect(FEATURE_PERMISSION_MAP['leave.approve']).toBe('leaves:approve')
    expect(FEATURE_PERMISSION_MAP['leave.approvals']).toBe('leaves:approve')
    expect(FEATURE_PERMISSION_MAP['leave.overview']).toBe('leaves:read')
    expect(FEATURE_PERMISSION_MAP['leave.calendar']).toBe('leaves:read')
    expect(FEATURE_PERMISSION_MAP['leave.types']).toBe('leave_types:read')
    expect(FEATURE_PERMISSION_MAP['leave.balances']).toBe('employee_leave_policies:read')
    expect(FEATURE_PERMISSION_MAP['leave.encashments.view']).toBe('leave_encashments:read')
    expect(FEATURE_PERMISSION_MAP['leave.encashments.create']).toBe('leave_encashments:create')
    expect(FEATURE_PERMISSION_MAP['leave.encashments.cancel']).toBe('leave_encashments:cancel')
    expect(FEATURE_PERMISSION_MAP['leads.create']).toBe('leads:create')
    expect(FEATURE_PERMISSION_MAP['leads.update']).toBe('leads:update')
    expect(FEATURE_PERMISSION_MAP['leads.delete']).toBe('leads:delete')
    expect(FEATURE_PERMISSION_MAP['leads.assign']).toBe('leads:assign')
    expect(FEATURE_PERMISSION_MAP['leads.notes']).toBe('leads:notes')
    expect(FEATURE_PERMISSION_MAP['leads.analytics']).toBe('leads:analytics')
    expect(FEATURE_PERMISSION_MAP['holidays.create']).toBe('holidays:create')
    expect(FEATURE_PERMISSION_MAP['holidays.update']).toBe('holidays:update')
    expect(FEATURE_PERMISSION_MAP['holidays.delete']).toBe('holidays:delete')
    expect(FEATURE_PERMISSION_MAP['attendance.holidays']).toBe('holidays:read')
    expect(FEATURE_PERMISSION_MAP['calendar.holidays']).toBe('holidays:read')
  })
})

describe('production Employee (14 permissions)', () => {
  const p = EMPLOYEE_PERMISSIONS

  it('has exactly 14 permissions', () => {
    expect(p).toHaveLength(14)
  })

  it.each<FeatureAccessKey>([
    'leave.overview',
    'leave.myLeave',
    'leave.requests',
    'leave.calendar',
    'leave.types',
    'leave.balances',
    'leave.create',
    'leave.cancel',
    'leave.encashments.view',
    'leave.encashments.create',
    'leave.encashments.cancel',
    'leads.overview',
    'leads.my',
    'leads.create',
    'leads.update',
    'leads.notes',
    'leads.analytics',
    'attendance.holidays',
    'calendar.holidays',
  ])('can access %s', (feature) => {
    expect(can(feature, p)).toBe(true)
  })

  it.each<FeatureAccessKey>([
    'leave.approvals',
    'leave.approve',
    'leave.createOnBehalf',
    'leave.accruals',
    'leave.accruals.run',
    'leave.encashments.approve',
    'leave.encashments.reject',
    'leads.delete',
    'leads.assign',
    'holidays.create',
    'holidays.update',
    'holidays.delete',
    'module.users',
    'module.roles',
  ])('cannot access %s', (feature) => {
    expect(can(feature, p)).toBe(false)
  })

  it('never sees Approvals or Leave Settings-only admin actions in the sidebar they lack codes for', () => {
    const nav = filterNavigation(ROLE_UI_CONFIG.EMPLOYEE.navigation, 'EMPLOYEE', p)
    const leave = nav.find((item) => item.title === 'Leave Management')
    const titles = (leave?.children ?? []).map((child) => child.title)
    expect(titles).toContain('My Leave')
    expect(titles).not.toContain('Approvals')
  })
})

describe('missing individual codes', () => {
  it('without leaves:create the user can read leave but not create', () => {
    const perms = without(EMPLOYEE_PERMISSIONS, 'leaves:create')
    expect(can('leave.create', perms)).toBe(false)
    expect(can('leave.myLeave', perms)).toBe(true)
    expect(can('leave.cancel', perms)).toBe(true)
  })

  it('without leaves:approve the user cannot approve even holding leaves:read', () => {
    const perms = [...EMPLOYEE_PERMISSIONS, 'leaves:create_on_behalf']
    expect(perms).not.toContain('leaves:approve')
    expect(can('leave.approve', perms, 'MANAGER')).toBe(false)
    expect(can('leave.approvals', perms, 'MANAGER')).toBe(false)
    expect(can('leave.overview', perms, 'MANAGER')).toBe(true)
    expect(can('leave.createOnBehalf', perms, 'MANAGER')).toBe(true)
  })

  it('leaves:read alone grants neither cancel, approve nor create', () => {
    const perms = ['leaves:read']
    expect(can('leave.overview', perms)).toBe(true)
    expect(can('leave.cancel', perms)).toBe(false)
    expect(can('leave.approve', perms)).toBe(false)
    expect(can('leave.create', perms)).toBe(false)
  })

  it('leads:read without leads:create allows viewing but not creating', () => {
    const perms = ['leads:read']
    expect(can('leads.overview', perms)).toBe(true)
    expect(can('leads.my', perms)).toBe(true)
    expect(can('leads.create', perms)).toBe(false)
    expect(can('leads.update', perms)).toBe(false)
    expect(can('leads.delete', perms)).toBe(false)
    expect(can('leads.assign', perms)).toBe(false)
    expect(can('leads.notes', perms)).toBe(false)
    expect(can('leads.analytics', perms)).toBe(false)
  })

  it('holidays:read without holidays:create allows viewing but not adding', () => {
    const perms = ['holidays:read']
    expect(can('attendance.holidays', perms)).toBe(true)
    expect(can('calendar.holidays', perms)).toBe(true)
    expect(can('holidays.create', perms)).toBe(false)
    expect(can('holidays.update', perms)).toBe(false)
    expect(can('holidays.delete', perms)).toBe(false)
  })

  it('holidays:create does not imply holidays:update or delete', () => {
    const perms = ['holidays:read', 'holidays:create']
    expect(can('holidays.create', perms)).toBe(true)
    expect(can('holidays.update', perms)).toBe(false)
    expect(can('holidays.delete', perms)).toBe(false)
  })

  it('encashment approve / reject need their own codes, not leaves:approve', () => {
    const perms = ['leaves:approve', 'leave_encashments:read']
    expect(can('leave.encashments.view', perms)).toBe(true)
    expect(can('leave.encashments.approve', perms)).toBe(false)
    expect(can('leave.encashments.reject', perms)).toBe(false)
  })
})

describe('empty / missing permissions', () => {
  const mappedFeatures = Object.keys(FEATURE_PERMISSION_MAP) as FeatureAccessKey[]

  it.each(ALL_ROLES)('denies every mapped feature for %s with an empty array', (role) => {
    for (const feature of mappedFeatures) {
      expect(can(feature, [], role), `${role} ${feature}`).toBe(false)
    }
  })

  it.each(ALL_ROLES)('denies every mapped feature for %s with null permissions', (role) => {
    for (const feature of mappedFeatures) {
      expect(can(feature, null, role), `${role} ${feature}`).toBe(false)
    }
  })

  it('hides every mapped sidebar entry for an empty permission list', () => {
    for (const role of ALL_ROLES) {
      const nav = filterNavigation(ROLE_UI_CONFIG[role].navigation, role, [])
      for (const item of nav) {
        if (item.feature) expect(FEATURE_PERMISSION_MAP[item.feature]).toBeUndefined()
        for (const child of item.children ?? []) {
          if (child.feature) expect(FEATURE_PERMISSION_MAP[child.feature]).toBeUndefined()
        }
      }
    }
  })
})

describe('multiple roles', () => {
  const MANAGER_EXTRA = ['leaves:approve', 'leaves:create_on_behalf', 'leads:delete', 'leads:assign']

  it('permission-mapped access does not depend on which role workspace is active', () => {
    for (const feature of Object.keys(FEATURE_PERMISSION_MAP) as FeatureAccessKey[]) {
      const results = ALL_ROLES.map((role) => can(feature, EMPLOYEE_PERMISSIONS, role))
      expect(new Set(results).size, feature).toBe(1)
    }
  })

  it('uses the union of permissions across held roles', () => {
    const union = [...new Set([...EMPLOYEE_PERMISSIONS, ...MANAGER_EXTRA])]
    expect(can('leave.approve', union)).toBe(true)
    expect(can('leave.approvals', union)).toBe(true)
    expect(can('leads.delete', union)).toBe(true)
    expect(can('leads.assign', union)).toBe(true)
    // still lacks codes neither role provided
    expect(can('holidays.create', union)).toBe(false)
  })
})

function navChildrenOf(role: BackendRoleCode, title: string): RoleNavChild[] {
  const item = ROLE_UI_CONFIG[role].navigation.find((entry: RoleNavItem) => entry.title === title)
  return item?.children ?? []
}

describe('sidebar visibility vs direct URL', () => {
  const PERMISSION_SETS: Record<string, string[]> = {
    employee: EMPLOYEE_PERMISSIONS,
    empty: [],
    readOnly: ['leaves:read', 'leave_types:read', 'holidays:read', 'leads:read'],
    approver: [...EMPLOYEE_PERMISSIONS, 'leaves:approve', 'employee_leave_policies:read'],
  }

  it('every Leave sidebar child carries the same feature the Leave page guards its tab with', () => {
    for (const role of ALL_ROLES) {
      for (const child of navChildrenOf(role, 'Leave Management')) {
        if (child.isSectionLabel) continue
        expect(child.feature, `${role} ${child.title}`).toBe(
          leaveTabFeature(child.title as never),
        )
      }
    }
  })

  it('guards against vacuous checks: Leave and Office Calendar children exist for every role', () => {
    for (const role of ALL_ROLES) {
      expect(navChildrenOf(role, 'Leave Management').length, `${role} leave`).toBeGreaterThan(0)
      expect(navChildrenOf(role, 'Office Calendar').length, `${role} calendar`).toBeGreaterThan(0)
    }
    const managerApprovals = navChildrenOf('MANAGER', 'Leave Management').find(
      (child) => child.title === 'Approvals',
    )
    expect(managerApprovals?.feature).toBe('leave.approvals')
  })

  it('Leave tabs without a confirmed backend code stay role-only', () => {
    expect(LEAVE_TAB_FEATURES.Audit).toBeUndefined()
    expect(LEAVE_TAB_FEATURES.Access).toBeUndefined()
  })

  it('a sidebar child is visible exactly when canAccessFeature allows its feature', () => {
    for (const role of ALL_ROLES) {
      for (const [name, perms] of Object.entries(PERMISSION_SETS)) {
        const nav = filterNavigation(ROLE_UI_CONFIG[role].navigation, role, perms)
        for (const item of ROLE_UI_CONFIG[role].navigation) {
          for (const child of item.children ?? []) {
            if (!child.feature) continue
            const visibleParent = nav.find((entry) => entry.title === item.title)
            const visible = visibleParent?.children?.some((c) => c.path === child.path) ?? false
            const parentAllowed = !item.feature || canAccessFeature(item.feature, role, perms)
            expect(
              visible,
              `${role}/${name}: ${item.title} > ${child.title}`,
            ).toBe(parentAllowed && canAccessFeature(child.feature, role, perms))
          }
        }
      }
    }
  })

  it('Approvals tab is hidden without leaves:approve and its direct URL is denied too', () => {
    const perms = EMPLOYEE_PERMISSIONS
    const tabFeature = leaveTabFeature('Approvals')
    expect(tabFeature).toBe('leave.approvals')
    expect(can(tabFeature!, perms)).toBe(false)
    const nav = filterNavigation(ROLE_UI_CONFIG.MANAGER.navigation, 'MANAGER', perms)
    const titles = (nav.find((item) => item.title === 'Leave Management')?.children ?? []).map((c) => c.title)
    expect(titles).not.toContain('Approvals')
    expect(titles).toContain('My Leave')
  })

  it('Office Calendar holiday tabs are hidden and denied without holidays:read', () => {
    expect(isOfficeCalendarHolidayTab('Holidays')).toBe(true)
    expect(isOfficeCalendarHolidayTab('Holiday Management')).toBe(true)
    expect(isOfficeCalendarHolidayTab('Events')).toBe(false)

    for (const role of ALL_ROLES) {
      const children = navChildrenOf(role, 'Office Calendar')
      const holidayChildren = children.filter((c) => isOfficeCalendarHolidayTab(c.title))
      for (const child of holidayChildren) {
        expect(child.feature, `${role} ${child.title}`).toBe('calendar.holidays')
      }
      const withoutHolidays = filterNavigation(
        ROLE_UI_CONFIG[role].navigation,
        role,
        without(EMPLOYEE_PERMISSIONS, 'holidays:read'),
      )
      const visible = (withoutHolidays.find((i) => i.title === 'Office Calendar')?.children ?? []).map(
        (c) => c.title,
      )
      for (const child of holidayChildren) expect(visible).not.toContain(child.title)
      expect(can('calendar.holidays', without(EMPLOYEE_PERMISSIONS, 'holidays:read'), role)).toBe(false)
    }
  })
})
