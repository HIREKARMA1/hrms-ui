/**
 * Display helpers for attendance regularization list rows.
 */

export function formatRegularizationTypeLabel(type: string): string {
  const trimmed = type.trim()
  if (!trimmed) return ''
  return trimmed
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatRegularizationType(type?: string | null): string {
  if (!type) return '—'
  return formatRegularizationTypeLabel(type) || type
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

export { isAttendanceRegularizationPostType as isAttendanceRegularizationType } from '../constants/attendanceRegularizationPostTypes'