/**
 * Weekday helpers for calendar shading and leave settings weekly offs.
 */

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export function weekdayNameFromIso(iso: string): string {
  const day = new Date(`${iso}T12:00:00`).getDay()
  return WEEKDAY_NAMES[day] ?? '—'
}

export function isWeeklyOffDay(iso: string, weeklyOffDays: number[]): boolean {
  return weeklyOffDays.includes(new Date(`${iso}T12:00:00`).getDay())
}
