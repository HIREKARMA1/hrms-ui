/**
 * Consistent date formatting for payroll tables and detail panels.
 * Used across EmployeeTable and payment info tabs.
 */

const displayFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) {
    return '—'
  }
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }
  return displayFormatter.format(parsed)
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}
