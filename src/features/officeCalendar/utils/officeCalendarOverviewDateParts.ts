/**
 * Day/month parts for Overview date tiles (does not change display strings elsewhere).
 */

export function officeCalendarOverviewDayMonth(isoDate: string): { day: number; month: string } {
  const parsed = new Date(`${isoDate}T12:00:00`)
  return {
    day: parsed.getDate(),
    month: parsed.toLocaleDateString(undefined, { month: 'short' }),
  }
}