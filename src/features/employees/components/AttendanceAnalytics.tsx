/**
 * GET /dashboard/analytics/attendance — period totals + daily series.
 */

import { useMemo, useState } from 'react'

import { DashboardLiveEmpty } from '@/features/dashboard/components/shared/DashboardLiveEmpty'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetAttendanceAnalyticsQuery } from '../api/employeeDashboardApi'
import type { DateRangePreset } from '../types/employeeDashboard.types'
import { attendanceAnalyticsHasChartData } from '../utils/attendanceAnalyticsEmpty'
import {
  dashboardPeriodRange,
  formatDashboardAxisLabel,
  formatDashboardDate,
} from '../utils/dashboardDateRange'
import { formatAttendanceAnalyticsSubtitle } from '../utils/formatAttendanceAnalyticsCaption'
import { AttendanceAnalyticsChart } from './AttendanceAnalyticsChart'
import { AttendanceAnalyticsPeriodSummary } from './AttendanceAnalyticsPeriodSummary'
import { AttendanceAnalyticsToolbar } from './AttendanceAnalyticsToolbar'

export type AttendanceAnalyticsProps = {
  /** When set with endDate, uses the Employee Overview page range (no local period preset). */
  startDate?: string
  endDate?: string
}

export function AttendanceAnalytics({ startDate, endDate }: AttendanceAnalyticsProps = {}) {
  const usePageRange = Boolean(startDate && endDate)
  const [period, setPeriod] = useState<Exclude<DateRangePreset, 'custom'>>('this-month')
  const [departmentId, setDepartmentId] = useState('all')

  const internalRange = useMemo(() => dashboardPeriodRange(period), [period])
  const range = usePageRange
    ? { startDate: startDate!, endDate: endDate! }
    : internalRange

  const departmentsQuery = useListDepartmentsQuery({
    isActive: true,
    limit: 100,
    page: 1,
  })
  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data?.items ?? []).map((dept) => ({
        id: dept.id,
        name: dept.name,
      })),
    [departmentsQuery.data?.items],
  )

  const queryArgs = useMemo(
    () => ({
      ...range,
      departmentId: departmentId === 'all' ? undefined : departmentId,
    }),
    [range, departmentId],
  )

  const { data, isLoading, isError, isFetching, error } =
    useGetAttendanceAnalyticsQuery(queryArgs)

  const chartData = useMemo(
    () =>
      (data?.series ?? []).map((point) => ({
        label: formatDashboardAxisLabel(point.date),
        present: point.present,
        absent: point.absent,
        onLeave: point.onLeave,
        late: point.late,
      })),
    [data?.series],
  )

  const hasChart = attendanceAnalyticsHasChartData(chartData, data?.empty)
  const subtitle = isLoading
    ? 'Loading period from server…'
  : data
      ? formatAttendanceAnalyticsSubtitle(data)
      : usePageRange
        ? `${formatDashboardDate(range.startDate)} – ${formatDashboardDate(range.endDate)}`
        : 'Daily status trends for the selected period'

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Attendance analytics</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <AttendanceAnalyticsToolbar
          showPeriodPresets={!usePageRange}
          period={period}
          onPeriodChange={setPeriod}
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
          departments={departmentOptions}
          departmentsLoading={departmentsQuery.isLoading}
        />
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load attendance analytics.')}
          </p>
        ) : (
          <>
            <AttendanceAnalyticsPeriodSummary summary={data?.summary} />
            {hasChart ? (
              <AttendanceAnalyticsChart
                chartData={chartData}
                isFetching={isFetching}
                yMaxHint={data?.eligibleEmployees}
              />
            ) : (
              <DashboardLiveEmpty
                title="No attendance statuses in this period"
                description="Punches or eligible employees may be missing for these dates. Try another period or link biometric devices."
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}