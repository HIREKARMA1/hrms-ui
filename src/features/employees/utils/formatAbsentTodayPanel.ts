/** Copy when GET /dashboard/attendance/absent-today reports a non-working day. */
export function formatAbsentNonWorkingDayMessage(nonWorkingDay: unknown): string {
  if (!nonWorkingDay || typeof nonWorkingDay !== 'object') {
    return 'Today is not a working day in the application calendar; absent employees are not listed.'
  }
  const day = nonWorkingDay as { type?: string; description?: string }
  const label =
    day.type === 'HOLIDAY'
      ? 'Company holiday'
      : day.type === 'WEEKLY_OFF'
        ? 'Weekly off'
        : 'Non-working day'
  const detail = day.description?.trim() ? ` — ${day.description.trim()}` : ''
  return `${label}${detail}. Nobody is marked absent for today.`
}