/**
 * Payroll title row with demo role switcher (shared with Leave demo viewer).
 */

import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'

import { LeaveDemoViewSelect } from '@/features/leave/components/LeaveDemoViewSelect'
import { RolePill } from '@/features/leave/components/RolePill'
import type { UserRole } from '@/features/leave/constants/userRoles'
import { isHrAdminExperience } from '@/features/leave/constants/userRoles'
import type { LeaveViewer } from '@/features/leave/types/viewer'

import { PayrollHrToolbar } from './PayrollHrToolbar'
import { PayrollMonthField } from './PayrollMonthField'

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

type PayrollPageHeaderProps = {
  viewer: LeaveViewer
  role: UserRole
  onRoleChange: (role: UserRole) => void
}

export function PayrollPageHeader({ viewer, role, onRoleChange }: PayrollPageHeaderProps) {
  const rbac = useOptionalRbacSession()
  const hrView = isHrAdminExperience(role)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 text-2xl font-bold leading-tight tracking-tight text-hrms-navy">Payroll Management</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-hrms-text-secondary">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-hrms-lavender text-xs font-semibold text-hrms-primary"
            aria-hidden
          >
            {initialsFromName(viewer.displayName)}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            Signed in as <span className="font-medium text-hrms-navy">{viewer.displayName}</span>
            <RolePill role={viewer.role} />
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {rbac ? null : <LeaveDemoViewSelect value={role} onChange={onRoleChange} />}
        {hrView ? <PayrollHrToolbar /> : <PayrollMonthField />}
      </div>
    </div>
  )
}
