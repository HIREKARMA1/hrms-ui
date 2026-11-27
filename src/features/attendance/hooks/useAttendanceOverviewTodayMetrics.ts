import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import {
  useGetAbsentTodayQuery,
  useGetAttendanceAnalyticsQuery,
  useGetLateArrivalsTodayQuery,
  useGetOnLeaveTodayQuery,
  useGetPresentTodayQuery,
} from '@/features/employees/api/employeeDashboardApi'
import { useEmployeeSummary } from '@/features/employees/hooks/useEmployeeSummary'
import { todayIsoDate } from '@/features/employees/utils/dashboardDateRange'

const COUNT_ARGS = { page: 1, limit: 1 } as const

/**
 * Live today counts for Attendance Overview (dashboard APIs).
 */
export function useAttendanceOverviewTodayMetrics() {
  const { canAccess } = useOptionalFeatureAccess()
  const canLeave = canAccess('employee.leaveAnalytics')

  const today = todayIsoDate()
  const summary = useEmployeeSummary()
  const presentQuery = useGetPresentTodayQuery(COUNT_ARGS)
  const absentQuery = useGetAbsentTodayQuery(COUNT_ARGS)
  const lateQuery = useGetLateArrivalsTodayQuery(COUNT_ARGS)
  const onLeaveQuery = useGetOnLeaveTodayQuery(COUNT_ARGS, { skip: !canLeave })
  const todayAnalyticsQuery = useGetAttendanceAnalyticsQuery({
    startDate: today,
    endDate: today,
  })

  const totalEmployees = summary.summary?.totalEmployees ?? 0
  const presentToday = presentQuery.data?.pagination.total ?? 0
  const absentToday = absentQuery.data?.pagination.total ?? 0
  const lateToday = lateQuery.data?.pagination.total ?? 0
  const onLeaveToday =
    canLeave && onLeaveQuery.data
      ? onLeaveQuery.data.pagination.total
      : (summary.summary?.onLeaveEmployees ?? 0)
  const halfDayToday = todayAnalyticsQuery.data?.summary.halfDay ?? 0

  const statsLoading =
    summary.isLoading ||
    presentQuery.isLoading ||
    absentQuery.isLoading ||
    lateQuery.isLoading ||
    (canLeave && onLeaveQuery.isLoading)

  const statsError =
    summary.isError ||
    presentQuery.isError ||
    absentQuery.isError ||
    lateQuery.isError ||
    (canLeave && onLeaveQuery.isError)

  return {
    totalEmployees,
    presentToday,
    absentToday,
    lateToday,
    onLeaveToday,
    halfDayToday,
    halfDayLoading: todayAnalyticsQuery.isLoading,
    halfDayError: todayAnalyticsQuery.isError,
    statsLoading,
    statsError,
    canLeave,
    summaryError: summary.error,
    presentError: presentQuery.error,
    absentError: absentQuery.error,
    lateError: lateQuery.error,
    onLeaveError: onLeaveQuery.error,
  }
}