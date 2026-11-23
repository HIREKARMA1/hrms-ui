/**
 * Display helpers for attendance regularization list rows.
 */
import type { AttendanceRegularizationType } from '../constants/attendanceApiAccess'
import { REGULARIZATION_TYPE_OPTIONS } from '../constants/regularizationUi'

export function formatRegularizationType(type?: string | null): string {
  if (!type) return '—'
  const match = REGULARIZATION_TYPE_OPTIONS.find((option) => option.value === type)
  return match?.label ?? type.replace(/_/g, ' ')
}

export function formatRegularizationDates(dates: string[]): string {
  if (!dates.length) return '—'
  return dates.join(', ')
}

export function formatRegularizationCreatedAt(value?: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function regularizationStatusLabel(revokedAt?: string | null): string {
  return revokedAt ? 'Revoked' : 'Active'
}

export function isAttendanceRegularizationType(value: string): value is AttendanceRegularizationType {
  return value === 'LATE_ARRIVAL' || value === 'TEA_BREAK_EXCEEDED'
}