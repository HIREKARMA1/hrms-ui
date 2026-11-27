import type { RecentlyAddedData } from '../api/employeeDashboardApi.types'
import { formatDashboardDate } from './dashboardDateRange'

export function formatRecentlyAddedSubtitle(data: RecentlyAddedData | undefined): string {
  if (!data) {
    return 'Records created in the selected window (not the same as joining month)'
  }
  const from = formatDashboardDate(data.periodStart)
  const to = formatDashboardDate(data.periodEnd)
  const tz = data.timezone?.trim() ? ` · ${data.timezone}` : ''
  const total = data.pagination?.total ?? data.items.length
  const windowLabel = data.days === 1 ? 'today' : `last ${data.days} days`
  return `${from} – ${to}${tz} · ${windowLabel} · ${total} record${total === 1 ? '' : 's'} created`
}