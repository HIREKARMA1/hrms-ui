import type { OnLeaveTodayItem } from '../api/employeeDashboardApi.types'
import { formatDashboardDate } from './dashboardDateRange'

export function formatOnLeaveDayPortion(
  portion: OnLeaveTodayItem['dayPortion'] | undefined,
): string {
  switch (portion) {
    case 'FIRST_HALF':
      return 'First half'
    case 'SECOND_HALF':
      return 'Second half'
    case 'FULL_DAY':
      return 'Full day'
    default:
      return '—'
  }
}

export function formatOnLeaveRequestDates(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDashboardDate(startDate)
  return `${formatDashboardDate(startDate)} – ${formatDashboardDate(endDate)}`
}