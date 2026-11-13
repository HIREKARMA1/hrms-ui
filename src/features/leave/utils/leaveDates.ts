/**
 * Shared calendar arithmetic for leave counting and year boundaries.
 * Used by countLeaveDays, accrual, and calendar navigation.
 */

export function parseIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`)
}

export function isoFromDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(iso: string, days: number): string {
  const date = parseIso(iso)
  date.setDate(date.getDate() + days)
  return isoFromDate(date)
}

export function daysBetweenInclusive(from: string, to: string): string[] {
  const out: string[] = []
  let cursor = from
  while (cursor <= to) {
    out.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return out
}

export function yearMonthFromIso(iso: string): string {
  return iso.slice(0, 7)
}
