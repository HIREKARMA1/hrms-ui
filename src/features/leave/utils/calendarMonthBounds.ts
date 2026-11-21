import type { TeamLeaveCalendarQuery } from '../types/api/teamLeaveCalendar.types'

/** Inclusive ISO date range for a calendar month (`monthIndex` is 0-based). */
export function calendarMonthBounds(
  year: number,
  monthIndex: number,
): TeamLeaveCalendarQuery {
  const month = monthIndex + 1
  return { year, month }
}