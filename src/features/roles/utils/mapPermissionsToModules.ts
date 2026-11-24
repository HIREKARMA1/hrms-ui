import type { PermissionResponse } from '../api/rolesApi.types'
import type { PermissionModule } from '../types/roleManagement.types'

const MODULE_ICON_BY_KEY: Record<
  string,
  PermissionModule['iconName']
> = {
  users: 'users',
  employees: 'users',
  departments: 'users',
  onboarding: 'users',
  leaves: 'calendar',
  leave_types: 'calendar',
  leave_policies: 'calendar',
  leave_encashments: 'wallet',
  leave_approval: 'calendar',
  employee_leave_policies: 'calendar',
  holidays: 'calendar',
  calendar: 'calendar',
  payroll: 'wallet',
  attendance: 'clock',
  biometric: 'clock',
  recruitment: 'briefcase',
  leads: 'briefcase',
  lead_sources: 'briefcase',
  lead_categories: 'briefcase',
  roles: 'shield',
  permissions: 'shield',
}

function titleCaseModule(moduleKey: string) {
  return moduleKey
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function permissionLabel(permission: PermissionResponse) {
  if (permission.description?.trim()) return permission.description.trim()
  return permission.code
    .split(':')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Groups API permissions into accordion modules for the Role Management UI. */
export function mapPermissionsToModules(
  permissions: PermissionResponse[],
): PermissionModule[] {
  const byModule = new Map<string, PermissionResponse[]>()

  for (const permission of permissions) {
    const key = permission.module || 'general'
    const list = byModule.get(key) ?? []
    list.push(permission)
    byModule.set(key, list)
  }

  return [...byModule.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([moduleKey, items]) => ({
      id: moduleKey,
      label: titleCaseModule(moduleKey),
      iconName: MODULE_ICON_BY_KEY[moduleKey] ?? 'shield',
      permissions: items
        .slice()
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((permission) => ({
          id: permission.id,
          label: permissionLabel(permission),
        })),
    }))
}
