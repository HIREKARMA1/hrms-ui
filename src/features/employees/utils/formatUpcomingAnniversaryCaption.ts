import type {
  UpcomingAnniversariesData,
  UpcomingAnniversaryItem,
} from '../api/employeeDashboardApi.types'
import { formatDashboardDate } from './dashboardDateRange'

export function formatUpcomingAnniversariesSubtitle(
  data: UpcomingAnniversariesData | undefined,
): string {
  if (!data) return 'Work anniversary milestones in the selected window'
  const from = formatDashboardDate(data.date)
  const to = formatDashboardDate(data.windowEnd)
  const tz = data.timezone?.trim() ? ` · ${data.timezone}` : ''
  const total = data.pagination?.total ?? data.items.length
  return `${from} – ${to}${tz} · next ${data.days} days · ${total} anniversar${total === 1 ? 'y' : 'ies'}`
}

export function formatUpcomingAnniversaryBadge(item: UpcomingAnniversaryItem): string {
  const years = `${item.yearsOfService} yr${item.yearsOfService === 1 ? '' : 's'}`
  if (item.daysUntil === 0) return `Today · ${years}`
  const date = formatDashboardDate(item.upcomingAnniversary)
  const when =
    item.daysUntil === 1 ? `${date} · tomorrow` : `${date} · in ${item.daysUntil} days`
  return `${when} · ${years}`
}