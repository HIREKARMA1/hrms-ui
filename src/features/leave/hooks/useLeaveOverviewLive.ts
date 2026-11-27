import { useCallback, useMemo } from 'react'

import {
  useGetEmployeesByDepartmentQuery,
  useGetLeaveAnalyticsQuery,
  useGetOnLeaveTodayQuery,
} from '@/features/employees/api/employeeDashboardApi'
import { useEmployeeSummary } from '@/features/employees/hooks/useEmployeeSummary'
import { getApiErrorMessage } from '@/services/api/errors'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { useGetLeaveCalendarQuery } from '../api/leaveApi'
import { useGetHolidaysQuery } from '../api/holidaysApi'
import { leaveTypeIdToCodeMap } from '../utils/overviewFromLeaveCalendar'
import {
  countUpcomingLeaveStartsFromCalendar,
  holidaysInRange,
  overviewCalendarWindowBounds,
} from '../utils/overviewFromLeaveCalendar'
import type { LeaveSnapshot } from '../services/leaveService'
import {
  leaveDonutFromAnalytics,
  leaveTrendMonthsFromAnalytics,
} from '../utils/mapLeaveAnalyticsToOverview'
import { departmentAvailabilityFromDashboard } from '../utils/overviewDeptFromDashboard'
import { overviewRangeBounds, type OverviewChartRange } from '../utils/overviewRange'
import { isTeamCoverageConfigured } from '../utils/overviewTeamCoverage'
import { countUpcomingLeave7Days } from '../utils/leaveHrMetrics'
import { resolveOutlook14Live } from '../utils/overviewOutlook14FromCalendar'
import { listWhosAwayFromCalendar } from '../utils/overviewWhosAwayFromCalendar'
import type { WhosAwayWindow } from '../utils/overviewWhosAway'
import { leaveTodayIso } from '../utils/leaveToday'

const ON_LEAVE_PAGE_SIZE = 100

export type LeaveOverviewLiveStats = {
  onLeaveToday: number
  upcoming: number
  pending: number
  active: number
  onLeaveSubtitle: string
  upcomingSubtitle: string
  pendingSubtitle: string
  activeSubtitle: string
}

export function useLeaveOverviewLive(options: {
  enabled: boolean
  range: OverviewChartRange
  snapshot: LeaveSnapshot | null
}) {
  const { enabled, range, snapshot } = options
  const { canAccess } = useOptionalFeatureAccess()
  const canStats = canAccess('employee.stats')
  const canLeaveAnalytics = canAccess('employee.leaveAnalytics')

  const { from, to } = useMemo(() => overviewRangeBounds(range), [range])
  const yearBounds = useMemo(() => overviewRangeBounds('this_year'), [])

  const summary = useEmployeeSummary()
  const analytics = useGetLeaveAnalyticsQuery(
    { startDate: from, endDate: to },
    { skip: !enabled || !canLeaveAnalytics },
  )
  const yearAnalytics = useGetLeaveAnalyticsQuery(
    { startDate: yearBounds.from, endDate: yearBounds.to },
    { skip: !enabled || !canLeaveAnalytics },
  )
  const onLeaveToday = useGetOnLeaveTodayQuery(
    { page: 1, limit: ON_LEAVE_PAGE_SIZE },
    { skip: !enabled || !canLeaveAnalytics },
  )
  const byDepartment = useGetEmployeesByDepartmentQuery(
    { employmentStatus: 'ACTIVE' },
    { skip: !enabled || !canStats },
  )

  const canCalendar = canAccess('leave.calendar')
  const orgWideCalendar =
    enabled && canCalendar && Boolean(snapshot?.api?.access.orgWideRequests)
  const calendarWindow = useMemo(() => overviewCalendarWindowBounds(leaveTodayIso()), [])
  const leaveTypes = snapshot?.api?.leaveTypes ?? []

  const leaveCalendar = useGetLeaveCalendarQuery(
    { startDate: calendarWindow.startDate, endDate: calendarWindow.endDate },
    { skip: !orgWideCalendar },
  )

  const canHolidays = canAccess('calendar.holidays') || canAccess('attendance.holidays')
  const holidayYear = Number(calendarWindow.startDate.slice(0, 4))
  const holidays = useGetHolidaysQuery({ year: holidayYear }, { skip: !enabled || !canHolidays })

  const calendarItems = leaveCalendar.data?.items ?? []
  const typeCodeById = useMemo(() => leaveTypeIdToCodeMap(leaveTypes), [leaveTypes])
  const departmentByEmployeeId = useMemo(
    () => new Map(snapshot?.employees.map((employee) => [employee.id, employee.department]) ?? []),
    [snapshot?.employees],
  )
  const holidaysByDate = useMemo(
    () =>
      holidaysInRange(holidays.data?.items ?? [], calendarWindow.startDate, calendarWindow.outlookEnd),
    [calendarWindow.outlookEnd, calendarWindow.startDate, holidays.data?.items],
  )

  const trend = useMemo(
    () => leaveTrendMonthsFromAnalytics(analytics.data, from, to),
    [analytics.data, from, to],
  )
  const donut = useMemo(() => leaveDonutFromAnalytics(analytics.data), [analytics.data])

  const coverageLimit = snapshot
    ? isTeamCoverageConfigured(snapshot.settings.teamCoverage.maxSameDepartmentPerDay)
      ? snapshot.settings.teamCoverage.maxSameDepartmentPerDay
      : null
    : null

  const deptRows = useMemo(
    () =>
      departmentAvailabilityFromDashboard(
        byDepartment.data,
        onLeaveToday.data?.items ?? [],
        coverageLimit,
      ),
    [byDepartment.data, coverageLimit, onLeaveToday.data?.items],
  )

  const stats: LeaveOverviewLiveStats | null = useMemo(() => {
    if (!enabled) return null
    const active = summary.summary?.activeEmployees
    const probation = summary.summary?.probationEmployees ?? 0
    const onLeave = onLeaveToday.data?.pagination.total
    const pending = yearAnalytics.isError
      ? undefined
      : yearAnalytics.data?.summary.pending
    const upcoming =
      orgWideCalendar && leaveCalendar.data
        ? countUpcomingLeaveStartsFromCalendar(calendarItems)
        : snapshot
          ? countUpcomingLeave7Days(snapshot)
          : undefined

    if (active === undefined && onLeave === undefined && pending === undefined) return null

    return {
      onLeaveToday: onLeave ?? 0,
      upcoming: upcoming ?? 0,
      pending: pending ?? 0,
      active: active ?? 0,
      onLeaveSubtitle: active ? `of ${active} active` : 'from leave dashboard',
      upcomingSubtitle: 'starting in the next 7 days',
      pendingSubtitle: yearAnalytics.isError
        ? 'leave year counts unavailable'
        : pending === 0
          ? 'none in this leave year'
          : `${pending ?? 0} overlapping this leave year`,
      activeSubtitle: `${probation} on probation`,
    }
  }, [
    enabled,
    onLeaveToday.data?.pagination.total,
    calendarItems,
    leaveCalendar.data,
    orgWideCalendar,
    snapshot,
    summary.summary?.activeEmployees,
    summary.summary?.probationEmployees,
    yearAnalytics.data?.summary.pending,
    yearAnalytics.isError,
  ])

  const chartsLoading = canLeaveAnalytics && (analytics.isLoading || !analytics.data)
  const chartsError = analytics.isError
    ? getApiErrorMessage(analytics.error, 'Could not load leave analytics.')
    : null

  const statsLoading =
    (canLeaveAnalytics && onLeaveToday.isLoading) ||
    (canStats && summary.isLoading) ||
    (orgWideCalendar && leaveCalendar.isLoading && !leaveCalendar.data)

  const statsError = (() => {
    if (canStats && summary.isError) {
      return getApiErrorMessage(summary.error, 'Could not load workforce summary.')
    }
    if (canLeaveAnalytics && onLeaveToday.isError) {
      return getApiErrorMessage(onLeaveToday.error, 'Could not load who is on leave today.')
    }
    return null
  })()

  const deptLoading =
    (canStats && byDepartment.isLoading) || (canLeaveAnalytics && onLeaveToday.isLoading)
  const deptError = (() => {
    if (canStats && byDepartment.isError) {
      return getApiErrorMessage(byDepartment.error, 'Could not load departments.')
    }
    if (canLeaveAnalytics && onLeaveToday.isError) {
      return getApiErrorMessage(onLeaveToday.error, 'Could not load on-leave list.')
    }
    return null
  })()

  const refetchCharts = analytics.refetch
  const refetchDept = useCallback(async () => {
    await Promise.allSettled([
      byDepartment.refetch(),
      onLeaveToday.refetch(),
    ])
  }, [byDepartment, onLeaveToday])

  const refetchStats = useCallback(async () => {
    await Promise.allSettled([
      summary.refetch(),
      onLeaveToday.refetch(),
      yearAnalytics.refetch(),
    ])
  }, [onLeaveToday, summary, yearAnalytics])

  const outlook14Cells = useMemo(() => {
    if (!orgWideCalendar || !snapshot || leaveCalendar.isLoading) return null
    if (leaveCalendar.isError) return null
    if (!leaveCalendar.data) return null
    return resolveOutlook14Live(snapshot, calendarItems, holidaysByDate)
  }, [
    calendarItems,
    holidaysByDate,
    leaveCalendar.data,
    leaveCalendar.isError,
    leaveCalendar.isLoading,
    orgWideCalendar,
    snapshot,
  ])

  const whosAwayFromCalendar = useCallback(
    (window: WhosAwayWindow) => {
      if (!orgWideCalendar || !leaveCalendar.data) return undefined
      return listWhosAwayFromCalendar(calendarItems, window, {
        typeCodeById,
        departmentByEmployeeId,
      })
    },
    [calendarItems, departmentByEmployeeId, leaveCalendar.data, orgWideCalendar, typeCodeById],
  )

  const outlookLoading = orgWideCalendar && leaveCalendar.isLoading
  const outlookError = leaveCalendar.isError
    ? getApiErrorMessage(leaveCalendar.error, 'Could not load leave calendar.')
    : null

  const calendarWindowLoading =
    orgWideCalendar && leaveCalendar.isLoading && !leaveCalendar.data
  const calendarWindowError = outlookError

  const active = enabled && (canStats || canLeaveAnalytics)

  return {
    active,
    canLeaveAnalytics,
    canStats,
    stats,
    statsLoading: active && statsLoading,
    statsError,
    refetchStats,
    trend,
    donut,
    chartsLoading: active && chartsLoading,
    chartsError,
    refetchCharts,
    deptRows,
    coverageLimit,
    deptLoading: active && deptLoading,
    deptError,
    refetchDept,
    onLeaveTodayItems: onLeaveToday.data?.items ?? [],
    onLeaveTodayLoading: canLeaveAnalytics && onLeaveToday.isLoading,
    onLeaveTodayError: onLeaveToday.isError
      ? getApiErrorMessage(onLeaveToday.error, 'Could not load on-leave list.')
      : null,
    refetchOnLeaveToday: onLeaveToday.refetch,
    orgWideCalendar,
    outlook14Cells,
    outlookLoading,
    outlookError,
    refetchOutlook: leaveCalendar.refetch,
    calendarItems,
    typeCodeById,
    holidaysByDate,
    whosAwayFromCalendar,
    calendarWindowLoading,
    calendarWindowError,
    refetchCalendarWindow: leaveCalendar.refetch,
  }
}