/**
 * Payroll title row with the signed-in identity (shared with the Leave viewer)
 * and, for demo viewers only, the role switcher.
 */

import { LeaveDemoViewSelect } from '@/features/leave/components/LeaveDemoViewSelect'
import { SignedInAs } from '@/features/leave/components/SignedInAs'
import type { UserRole } from '@/features/leave/constants/userRoles'
import { isHrAdminExperience } from '@/features/leave/constants/userRoles'
import type { LeaveViewer } from '@/features/leave/types/viewer'

import { PayrollHrToolbar } from './PayrollHrToolbar'
import { PayrollMonthField } from './PayrollMonthField'

type PayrollPageHeaderProps = {
  viewer: LeaveViewer
  role: UserRole
  onRoleChange: (role: UserRole) => void
}

export function PayrollPageHeader({ viewer, role, onRoleChange }: PayrollPageHeaderProps) {
  const hrView = isHrAdminExperience(role)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 text-2xl font-bold leading-tight tracking-tight text-navy">Payroll Management</h1>
        <SignedInAs viewer={viewer} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {viewer.source === 'demo' ? <LeaveDemoViewSelect value={role} onChange={onRoleChange} /> : null}
        {hrView ? <PayrollHrToolbar /> : <PayrollMonthField />}
      </div>
    </div>
  )
}
