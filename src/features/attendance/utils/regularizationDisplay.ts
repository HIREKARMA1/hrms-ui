/**
 * Display helpers for attendance regularization list rows.
 */

import type { AttendanceRegularizationRecord } from '../types/api/attendanceRegularization.types'

export function formatRegularizationEmployeePrimary(
  record: Pick<
    AttendanceRegularizationRecord,
    'employeeName' | 'employeeCode' | 'employeeId'
  >,
): string {
  const name = record.employeeName?.trim()
  if (name) return name
  const code = record.employeeCode?.trim()
  if (code) return code
  const id = record.employeeId?.trim()
  if (id) return id
  return 'Employee'
}

export function formatRegularizationEmployeeSecondary(
  record: Pick<
    AttendanceRegularizationRecord,
    'employeeName' | 'employeeCode' | 'employeeId'
  >,
): string | null {
  const code = record.employeeCode?.trim()
  const id = record.employeeId?.trim()
  const hasName = Boolean(record.employeeName?.trim())
  const parts: string[] = []

  if (hasName) {
    if (code) parts.push(code)
    if (id && id !== code) parts.push(id)
  } else if (code) {
    if (id && id !== code) parts.push(id)
  } else if (id) {
    parts.push(id)
  }

  if (parts.length === 0) return null

  const line = parts.join(' · ')
  const primary = formatRegularizationEmployeePrimary(record)
  if (line === primary) return null
  return line
}

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