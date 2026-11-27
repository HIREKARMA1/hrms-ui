/**
 * Subtitles and helper copy for GET /dashboard/analytics/attendance.
 */

import type { AttendanceAnalyticsData } from '../api/employeeDashboardApi.types'
import { formatDashboardDate } from './dashboardDateRange'

export function formatAttendanceAnalyticsSubtitle(data: AttendanceAnalyticsData | undefined): string {
  if (!data?.startDate || !data?.endDate) {
    return 'Daily status trends for the selected period'
  }
  const from = formatDashboardDate(data.startDate)
  const to = formatDashboardDate(data.endDate)
  const tz = data.timezone?.trim() ? ` · ${data.timezone}` : ''
  const dept =
    data.departmentId != null && data.departmentId !== ''
      ? ' · filtered by department'
      : ''
  return `${from} – ${to}${tz}${dept}`
}
