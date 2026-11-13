/**
 * Consistent leave UI date formatting (08 Nov 2026).
 * Used across leave tables, sheets, and calendar agenda.
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
  const parsed = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }
  return displayFormatter.format(parsed)
}
