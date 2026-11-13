/**
 * Demo role switcher with compact select and Demo tag (not a production feature).
 * Bound to useLeaveViewer on LeavePage.
 */

import { cn } from '@/lib/utils'

import { USER_ROLE_DISPLAY_NAMES, type UserRole } from '../constants/userRoles'
import { LEAVE_FILTER_SELECT, LEAVE_MOTION } from './shared/leaveUi'

type LeaveDemoViewSelectProps = {
  value: UserRole
  onChange: (role: UserRole) => void
}

const ORDER: UserRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']

export function LeaveDemoViewSelect({ value, onChange }: LeaveDemoViewSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-hrms-muted-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hrms-text-secondary">
        Demo
      </span>
      <label htmlFor="leave-demo-view" className="sr-only">
        Demo view
      </label>
      <select
        id="leave-demo-view"
        value={value}
        onChange={(event) => onChange(event.target.value as UserRole)}
        className={cn('h-9 min-w-[9.5rem] text-xs', LEAVE_FILTER_SELECT, LEAVE_MOTION)}
        title="Switch demo persona for UI preview only"
      >
        {ORDER.map((role) => (
          <option key={role} value={role}>
            {USER_ROLE_DISPLAY_NAMES[role]}
          </option>
        ))}
      </select>
    </div>
  )
}
