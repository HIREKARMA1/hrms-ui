/**
 * Notice period day calculations from resignation and last working day.
 * Used by the Final Settlement exit details form.
 */

export function noticeDaysServedBetween(resignationDate: string, lastWorkingDay: string): number {
  const start = parseIsoDate(resignationDate)
  const end = parseIsoDate(lastWorkingDay)
  if (!start || !end || end < start) {
    return 0
  }
  const ms = end.getTime() - start.getTime()
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)) + 1)
}

/** Last working day plus required notice period (calendar days) for F&F payout date display. */
export function finalSettlementDay(lastWorkingDay: string, noticePeriodDaysRequired: number): string {
  const base = parseIsoDate(lastWorkingDay)
  if (!base) {
    return lastWorkingDay
  }
  const result = new Date(base)
  result.setDate(result.getDate() + noticePeriodDaysRequired)
  return toIsoDate(result)
}

export function validateExitDates(resignationDate: string, lastWorkingDay: string): string | null {
  const start = parseIsoDate(resignationDate)
  const end = parseIsoDate(lastWorkingDay)
  if (!start || !end) {
    return 'Enter valid dates.'
  }
  if (end < start) {
    return 'Last working day must be on or after the resignation date.'
  }
  return null
}

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(`${value}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
