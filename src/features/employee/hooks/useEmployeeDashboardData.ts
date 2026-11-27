import { useMemo } from 'react'

import { DEFAULT_ATTENDANCE_REPORT_SOURCE } from '@/features/attendance/constants/attendanceReportSourceOptions'
import { useGetMyAttendanceReportQuery } from '@/features/attendance/api/attendanceReportApi'
import { sortAttendanceReportDays } from '@/features/attendance/utils/sortAttendanceReportDays'
import { useGetHolidaysQuery } from '@/features/leave/api/holidaysApi'
import { LEAVE_MAX_LIMIT, useGetLeaveBalanceQuery, useGetLeaveHistoryQuery } from '@/features/leave/api/leaveApi'
import { mapApiHolidaysListToOfficeHolidays } from '@/features/leave/utils/mapApiHolidayToOfficeHoliday'
import { isLinkedLeaveViewer } from '@/features/leave/types/viewer'
import { useLeaveViewer } from '@/features/leave/hooks/useLeaveViewer'
import { useGetCalendarUpcomingQuery } from '@/features/officeCalendar/api/calendarReadsApi'
import { mapApiCalendarEventsListToOfficeEvents } from '@/features/officeCalendar/utils/mapApiCalendarEventToOfficeEvent'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'
import { leaveTodayIso } from '@/features/leave/utils/leaveToday'

import {
  buildAttendanceStatCards,
  buildHolidayStatCard,
  buildLeaveStatCards,
  mapAnnouncementRows,
  mapRecentAttendanceRows,
  mapRecentLeaveRows,
  mapUpcomingHolidayRows,
  type EmployeeDashboardStat,
} from '../utils/buildEmployeeDashboardView'
import { currentCalendarYear, currentMonthAttendanceRange } from '../utils/employeeDashboardDates'

const RECENT_DAYS = 7
const RECENT_ATTENDANCE_LIMIT = 5
const RECENT_LEAVE_LIMIT = 5
const UPCOMING_HOLIDAY_LIMIT = 5
const ANNOUNCEMENT_LIMIT = 5

export function useEmployeeDashboardData() {
  const { canAccess } = useOptionalFeatureAccess()
  const { viewer } = useLeaveViewer()
  const linked = isLinkedLeaveViewer(viewer)
  const todayIso = leaveTodayIso()
  const year = currentCalendarYear()
  const monthRange = useMemo(() => currentMonthAttendanceRange(), [])

  const canMyAttendance = canAccess('attendance.my')
  const canLeave = canAccess('leave.myLeave')
  const canHolidays = canAccess('attendance.holidays')
  const canAnnouncements = canAccess('calendar.view') || canAccess('calendar.events')

  const attendanceQuery = useGetMyAttendanceReportQuery(
    {
      fromDate: monthRange.fromDate,
      toDate: monthRange.toDate,
      source: DEFAULT_ATTENDANCE_REPORT_SOURCE,
    },
    { skip: !canMyAttendance },
  )

  const leaveEnabled = canLeave && linked && viewer.source === 'authenticated'
  const leaveBalance = useGetLeaveBalanceQuery(
    { employeeId: linked ? viewer.employeeId : '', year },
    { skip: !leaveEnabled },
  )
  const leaveHistory = useGetLeaveHistoryQuery(
    { employeeId: linked ? viewer.employeeId : '', page: 1, limit: LEAVE_MAX_LIMIT, year },
    { skip: !leaveEnabled },
  )

  const holidaysQuery = useGetHolidaysQuery({ year }, { skip: !canHolidays })
  const holidaysNextYear = useGetHolidaysQuery(
    { year: year + 1 },
    { skip: !canHolidays },
  )

  const calendarUpcoming = useGetCalendarUpcomingQuery(
    { days: 60, limit: 20, page: 1 },
    { skip: !canAnnouncements },
  )

  const sortedDays = useMemo(
    () => sortAttendanceReportDays(attendanceQuery.data?.days),
    [attendanceQuery.data?.days],
  )

  const recentRange = useMemo(() => {
    const to = todayIso
    const fromDate = new Date(`${to}T00:00:00`)
    fromDate.setDate(fromDate.getDate() - (RECENT_DAYS - 1))
    const from = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(
      fromDate.getDate(),
    ).padStart(2, '0')}`
    return sortedDays.filter((day) => day.date >= from && day.date <= to)
  }, [sortedDays, todayIso])

  const officeHolidays = useMemo(() => {
    const current = mapApiHolidaysListToOfficeHolidays(holidaysQuery.data?.items ?? [])
    const next = mapApiHolidaysListToOfficeHolidays(holidaysNextYear.data?.items ?? [])
    const byId = new Map<string, (typeof current)[number]>()
    for (const item of [...current, ...next]) {
      byId.set(item.id, item)
    }
    return [...byId.values()]
  }, [holidaysQuery.data?.items, holidaysNextYear.data?.items])

  const stats = useMemo(() => {
    const cards: EmployeeDashboardStat[] = []
    if (canMyAttendance) {
      cards.push(...buildAttendanceStatCards(attendanceQuery.data?.summary))
    }
    if (leaveEnabled) {
      cards.push(...buildLeaveStatCards(leaveBalance.data, leaveHistory.data?.items ?? []))
    }
    if (canHolidays) {
      cards.push(buildHolidayStatCard(officeHolidays, todayIso))
    }
    return cards
  }, [
    attendanceQuery.data?.summary,
    canHolidays,
    canMyAttendance,
    leaveBalance.data,
    leaveEnabled,
    leaveHistory.data?.items,
    officeHolidays,
    todayIso,
  ])

  const recentAttendance = useMemo(
    () => mapRecentAttendanceRows(recentRange, RECENT_ATTENDANCE_LIMIT),
    [recentRange],
  )

  const leaveRows = useMemo(
    () => mapRecentLeaveRows(leaveHistory.data?.items ?? [], RECENT_LEAVE_LIMIT),
    [leaveHistory.data?.items],
  )

  const holidayRows = useMemo(
    () => mapUpcomingHolidayRows(officeHolidays, todayIso, UPCOMING_HOLIDAY_LIMIT),
    [officeHolidays, todayIso],
  )

  const { upcomingCalendarEvents, calendarRawTypeById } = useMemo(() => {
    const rawItems = calendarUpcoming.data?.items ?? []
    const typeById = new Map<string, string>()
    for (const raw of rawItems) {
      const id = typeof raw.id === 'string' ? raw.id : ''
      if (!id) continue
      const rawType =
        typeof raw.type === 'string'
          ? raw.type
          : typeof raw.eventType === 'string'
            ? raw.eventType
            : ''
      if (rawType) typeById.set(id, rawType)
    }
    const events = mapApiCalendarEventsListToOfficeEvents(rawItems)
    return { upcomingCalendarEvents: events, calendarRawTypeById: typeById }
  }, [calendarUpcoming.data?.items])

  const announcements = useMemo(
    () => mapAnnouncementRows(upcomingCalendarEvents, calendarRawTypeById, ANNOUNCEMENT_LIMIT),
    [calendarRawTypeById, upcomingCalendarEvents],
  )

  const attendanceLoading = canMyAttendance && attendanceQuery.isFetching && !attendanceQuery.data
  const attendanceError =
    canMyAttendance && attendanceQuery.isError && !attendanceQuery.data
      ? getApiErrorMessage(attendanceQuery.error, 'Could not load your attendance.')
      : null

  const leaveLoading = leaveEnabled && (leaveBalance.isFetching || leaveHistory.isFetching) && !leaveHistory.data
  const leaveError =
    leaveEnabled && leaveHistory.isError && !leaveHistory.data
      ? getApiErrorMessage(leaveHistory.error, 'Could not load leave data.')
      : null

  const holidaysLoading =
    canHolidays && (holidaysQuery.isFetching || holidaysNextYear.isFetching) && !holidaysQuery.data
  const holidaysError =
    canHolidays && holidaysQuery.isError && !holidaysQuery.data
      ? getApiErrorMessage(holidaysQuery.error, 'Could not load holidays.')
      : null

  const announcementsLoading = canAnnouncements && calendarUpcoming.isFetching && !calendarUpcoming.data
  const announcementsError =
    canAnnouncements && calendarUpcoming.isError && !calendarUpcoming.data
      ? getApiErrorMessage(calendarUpcoming.error, 'Could not load announcements.')
      : null

  return {
    viewer,
    linked,
    canMyAttendance,
    canLeave,
    canHolidays,
    canAnnouncements,
    stats,
    recentAttendance,
    leaveRows,
    holidayRows,
    announcements,
    attendanceLoading,
    attendanceError,
    leaveLoading,
    leaveError,
    holidaysLoading,
    holidaysError,
    announcementsLoading,
    announcementsError,
    refetchAttendance: () => void attendanceQuery.refetch(),
    refetchLeave: () => {
      void leaveBalance.refetch()
      void leaveHistory.refetch()
    },
    refetchHolidays: () => {
      void holidaysQuery.refetch()
      void holidaysNextYear.refetch()
    },
    refetchAnnouncements: () => void calendarUpcoming.refetch(),
  }
}