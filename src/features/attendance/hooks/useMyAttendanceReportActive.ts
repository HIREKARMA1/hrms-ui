/**
 * Picks GET /attendance/me vs /me/date/{date} for the active range selection.
 */
import { useMemo } from 'react'

import { useMyAttendanceReport, useMyAttendanceReportForDate } from './useAttendanceReportQueries'
import { sortAttendanceReportDays } from '../utils/sortAttendanceReportDays'
import type { AttendanceReportSource } from '../constants/attendanceApiAccess'
import type { AttendanceReportRangeState } from './useAttendanceReportRangeState'

export function useMyAttendanceReportActive(
  range: AttendanceReportRangeState,
  source: AttendanceReportSource,
  rangeError: string | null,
  singleDay: boolean,
) {
  const rangeReport = useMyAttendanceReport(
    { fromDate: range.fromDate, toDate: range.toDate, source },
    { skip: singleDay || Boolean(rangeError) },
  )
  const dayReport = useMyAttendanceReportForDate(
    { date: range.fromDate, source },
    { skip: !singleDay || Boolean(rangeError) },
  )

  const active = singleDay ? dayReport : rangeReport
  const days = useMemo(() => sortAttendanceReportDays(active.data?.days), [active.data?.days])

  return { active, days }
}