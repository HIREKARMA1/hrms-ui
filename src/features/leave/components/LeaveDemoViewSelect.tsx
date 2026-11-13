/**
 * Demo view role switcher in the LeavePage title row until auth exists.
 * Bound to useLeaveViewer on LeavePage.
 */

import { Label } from '@/components/ui/label'

import type { LeaveViewerRole } from '../types/viewer'

type LeaveDemoViewSelectProps = {
  value: LeaveViewerRole
  onChange: (role: LeaveViewerRole) => void
}

export function LeaveDemoViewSelect({ value, onChange }: LeaveDemoViewSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="leave-demo-view" className="text-sm text-hrms-text-secondary">
        Demo view
      </Label>
      <select
        id="leave-demo-view"
        value={value}
        onChange={(event) => onChange(event.target.value as LeaveViewerRole)}
        className="h-9 rounded-xl border border-hrms-border bg-white px-2 text-sm"
      >
        <option value="Employee">Employee</option>
        <option value="Manager">Manager</option>
        <option value="HR">HR</option>
      </select>
    </div>
  )
}
