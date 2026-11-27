/** Human label for dashboard summary keys from the API (e.g. PaidLeaveAvailable). */
export function formatDashboardSummaryLabel(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return 'Summary'
  return trimmed
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatLeaveDaysCount(days: number): string {
  const n = Math.max(0, Math.round(days))
  return n === 1 ? '1 day' : `${n} days`
}

/** Primary line for apply dropdown and balance UI. */
export function formatLeaveTypeBalanceOptionLabel(name: string, available: number): string {
  const label = name.trim() || 'Leave'
  return `${label} — ${formatLeaveDaysCount(available)} available`
}