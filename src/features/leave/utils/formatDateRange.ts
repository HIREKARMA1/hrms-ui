/**
 * Compact leave date ranges for Overview lists and activity copy.
 */

const partFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const shortMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })

function parts(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  return { month: date.getMonth(), year: date.getFullYear(), label: shortMonth.format(date), full: partFormatter.format(date) }
}

export function formatDateRange(from: string, to: string): string {
  if (from === to) return parts(from).full
  const start = parts(from)
  const end = parts(to)
  if (start.year === end.year && start.month === end.month) {
    return `${start.label}–${end.label} ${end.year}`
  }
  return `${start.label} – ${end.label} ${end.year}`
}

export function formatBackOnLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`)
  return `Back on ${date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`
}
