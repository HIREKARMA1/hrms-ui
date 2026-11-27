import type {
  UpcomingBirthdayItem,
  UpcomingBirthdaysData,
} from '../api/employeeDashboardApi.types'
import { formatDashboardDate } from './dashboardDateRange'

export function formatUpcomingBirthdaysSubtitle(data: UpcomingBirthdaysData | undefined): string {
  if (!data) return 'Employees celebrating in the selected window'
  const from = formatDashboardDate(data.date)
  const to = formatDashboardDate(data.windowEnd)
  const tz = data.timezone?.trim() ? ` · ${data.timezone}` : ''
  const total = data.pagination?.total ?? data.items.length
  return `${from} – ${to}${tz} · next ${data.days} days · ${total} birthday${total === 1 ? '' : 's'}`
}

export function formatUpcomingBirthdayBadge(item: UpcomingBirthdayItem): string {
  if (item.daysUntil === 0) return 'Today'
  const date = formatDashboardDate(item.upcomingBirthday)
  return item.daysUntil === 1 ? `${date} · tomorrow` : `${date} · in ${item.daysUntil} days`
}