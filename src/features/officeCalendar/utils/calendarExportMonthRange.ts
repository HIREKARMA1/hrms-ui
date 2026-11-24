/**
 * Inclusive YYYY-MM-DD range for the visible schedule month (export query).
 */
import { toDateKey } from './formatOfficeCalendarDate'

export function calendarExportMonthRange(month: Date): { from: string; to: string } {
  const from = toDateKey(new Date(month.getFullYear(), month.getMonth(), 1))
  const to = toDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0))
  return { from, to }
}