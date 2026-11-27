/**
 * Leave page title row with the signed-in identity and (demo only) view select.
 * Rendered inside LeavePageChrome on LeavePage.
 */

import { LeaveDemoViewSelect } from './LeaveDemoViewSelect'
import { SignedInAs } from './SignedInAs'
import type { LeaveViewer, LeaveViewerRole } from '../types/viewer'

type LeavePageHeaderProps = {
  viewer: LeaveViewer
  role: LeaveViewerRole
  onRoleChange: (role: LeaveViewerRole) => void
}

export function LeavePageHeader({ viewer, role, onRoleChange }: LeavePageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Leave Management</h1>
        <SignedInAs viewer={viewer} />
      </div>
      {viewer.source === 'demo' ? <LeaveDemoViewSelect value={role} onChange={onRoleChange} /> : null}
    </div>
  )
}
