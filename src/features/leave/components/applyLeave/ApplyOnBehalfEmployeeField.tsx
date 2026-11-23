/**
 * Compact employee picker for apply-on-behalf (left column).
 */

import type { LeaveEmployee } from '../../types/employee'
import { LeaveDialogField } from '../shared/LeaveDialogField'
import { LEAVE_DIALOG_SELECT } from '../shared/leaveUi'
import { ApplyLeaveSectionTitle } from './ApplyLeaveSectionTitle'

type Props = {
  options: LeaveEmployee[]
  value: string
  onChange: (employeeId: string) => void
  employee: LeaveEmployee
  submitterName?: string
}

export function ApplyOnBehalfEmployeeField({ options, value, onChange, employee, submitterName }: Props) {
  return (
    <section className="space-y-3">
      <ApplyLeaveSectionTitle>Employee</ApplyLeaveSectionTitle>
      <div className="flex items-center gap-3 rounded-xl border border-hrms-border bg-white p-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hrms-lavender text-sm font-semibold text-hrms-primary"
          aria-hidden
        >
          {initials(employee.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-hrms-navy">{employee.name}</p>
          <p className="truncate text-xs text-hrms-text-secondary">{employee.department}</p>
        </div>
      </div>
      <LeaveDialogField label="Change employee" htmlFor="apply-for-employee">
        <select
          id="apply-for-employee"
          className={LEAVE_DIALOG_SELECT}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.department}
            </option>
          ))}
        </select>
      </LeaveDialogField>
      {submitterName ? (
        <p className="text-xs text-hrms-text-secondary">
          This request will be recorded by <span className="font-medium text-hrms-navy">{submitterName}</span>.
        </p>
      ) : null}
    </section>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
