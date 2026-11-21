import { BIOMETRIC_ATTENDANCE_MAX_RANGE_DAYS } from '../constants/biometricApiAccess'

export function isoDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function defaultBiometricAttendanceRange(): { fromDate: string; toDate: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 6)
  return { fromDate: isoDateLocal(from), toDate: isoDateLocal(to) }
}

export function validateBiometricDateRange(fromDate: string, toDate: string): string | null {
  if (!fromDate || !toDate) return 'Choose a from and to date.'
  if (toDate < fromDate) return 'To date must be on or after from date.'
  const from = new Date(`${fromDate}T00:00:00`)
  const to = new Date(`${toDate}T00:00:00`)
  const spanDays = Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1
  if (spanDays > BIOMETRIC_ATTENDANCE_MAX_RANGE_DAYS) {
    return `Date range cannot exceed ${BIOMETRIC_ATTENDANCE_MAX_RANGE_DAYS} days.`
  }
  return null
}