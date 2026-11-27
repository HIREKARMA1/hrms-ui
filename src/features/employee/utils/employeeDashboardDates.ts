import { isoDateLocal } from '@/features/biometric/utils/biometricAttendanceDates'

/** First day of the current calendar month through today (inclusive). */
export function currentMonthAttendanceRange(): { fromDate: string; toDate: string } {
  const to = new Date()
  const from = new Date(to.getFullYear(), to.getMonth(), 1)
  return { fromDate: isoDateLocal(from), toDate: isoDateLocal(to) }
}

export function currentCalendarYear(): number {
  return new Date().getFullYear()
}