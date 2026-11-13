/**
 * Leave page title row with user initials avatar and demo view select.
 * Rendered inside LeavePageChrome on LeavePage.
 */

import { LeaveDemoViewSelect } from './LeaveDemoViewSelect'
import { RolePill } from './RolePill'
import type { LeaveViewer, LeaveViewerRole } from '../types/viewer'

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

type LeavePageHeaderProps = {
  viewer: LeaveViewer
  role: LeaveViewerRole
  onRoleChange: (role: LeaveViewerRole) => void
}

export function LeavePageHeader({ viewer, role, onRoleChange }: LeavePageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-hrms-navy">Leave Management</h1>
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
      <LeaveDemoViewSelect value={role} onChange={onRoleChange} />
    </div>
  )
}
