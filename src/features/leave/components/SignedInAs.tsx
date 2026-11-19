/**
 * "Signed in as" row shared by the Leave and Payroll page headers.
 */

import { getUserInitials } from '@/features/auth/utils/authUser'

import type { LeaveViewer } from '../types/viewer'
import { RolePill } from './RolePill'

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function SignedInAs({ viewer }: { viewer: LeaveViewer }) {
  const initials = viewer.email
    ? getUserInitials({ email: viewer.email })
    : initialsFromName(viewer.displayName)

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-hrms-text-secondary">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-hrms-lavender text-xs font-semibold text-hrms-primary"
        aria-hidden
      >
        {initials}
      </span>
      <span className="flex flex-wrap items-center gap-2">
        {viewer.source === 'demo' ? 'Demo view as' : 'Signed in as'}{' '}
        <span className="font-medium text-hrms-navy">{viewer.displayName}</span>
        <RolePill role={viewer.role} />
      </span>
    </div>
  )
}
