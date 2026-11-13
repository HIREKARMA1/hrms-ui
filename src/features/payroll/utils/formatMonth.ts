/**
 * Formats YYYY-MM values as "Nov 2026" for tables and labels.
 * Used for payout month, incentive month, and tab month pills.
 */

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  if (!year || !month) {
    return yearMonth
  }
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}
