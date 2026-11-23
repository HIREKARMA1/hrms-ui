/**
 * Small employment status pill for HR tables and employee names.
 */

import { cn } from '@/lib/utils'

import { EMPLOYMENT_STATUS_LABELS, type EmploymentStatus } from '../constants/employmentStatuses'

const TONE: Partial<Record<EmploymentStatus, string>> = {
  ACTIVE: 'bg-hrms-success/10 text-hrms-success',
  ON_LEAVE: 'bg-hrms-info/10 text-hrms-navy',
  PROBATION: 'bg-hrms-warning/15 text-hrms-warning',
  TERMINATED: 'bg-hrms-muted-bg text-hrms-text-secondary',
}

export function EmploymentStatusPill({ status }: { status: EmploymentStatus }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', TONE[status] ?? 'bg-hrms-muted-bg')}>
      {EMPLOYMENT_STATUS_LABELS[status]}
    </span>
  )
}
