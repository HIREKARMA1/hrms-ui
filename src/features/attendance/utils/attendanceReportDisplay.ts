import type { AttendanceStatus } from '../types/attendance'
import type { AttendanceDayRecord } from '../types/api/attendanceReport.types'

const STATUS_MAP: Record<string, AttendanceStatus> = {
  PRESENT: 'Present',
  LATE: 'Late',
  HALF_DAY: 'Half-Day',
  EARLY_LEAVE: 'Half-Day',
  ABSENT: 'Absent',
  ON_LEAVE: 'On Leave',
  HOLIDAY: 'Holiday',
  WEEKLY_OFF: 'Weekly Off',
}

export function mapApiAttendanceStatus(status?: string): AttendanceStatus {
  if (!status) return 'Absent'
  const key = status.trim().toUpperCase().replace(/\s+/g, '_')
  return STATUS_MAP[key] ?? 'Present'
}

export function formatMinutesAsDuration(minutes?: number): string {
  if (minutes === undefined || !Number.isFinite(minutes)) return '—'
  const total = Math.max(0, Math.round(minutes))
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

export function formatAttendanceDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00`)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return iso
}

export function formatAttendanceTime(value?: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return value
}

export function dayRowKey(day: AttendanceDayRecord, index: number): string {
  return `${day.date}-${day.status ?? 'row'}-${index}`
}