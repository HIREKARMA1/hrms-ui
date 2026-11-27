/**
 * Read-only overtime rows from a single employee attendance report (same lookup as Daily Attendance).
 */
import { useCallback, useMemo, useState } from 'react'

import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'

import { formatMinutesAsDuration } from '../utils/attendanceReportDisplay'
import type { AttendanceReportResult } from '../types/api/attendanceReport.types'
import {
  flattenOvertimeFromAttendanceReport,
  type OvertimeDayRow,
  type OvertimeEmployeeMeta,
} from '../utils/flattenOvertimeFromAttendanceReport'
import { useAttendancePermissions } from './useAttendancePermissions'
import { useAttendanceReportRangeState } from './useAttendanceReportRangeState'
import { useHrAttendanceReportActive } from './useHrAttendanceReportActive'

function employeeDisplayName(record: EmployeeRecord): string {
  return [record.profile.firstName, record.profile.lastName].filter(Boolean).join(' ').trim()
}

function metaFromReport(
  data: AttendanceReportResult,
  fallback?: OvertimeEmployeeMeta | null,
): OvertimeEmployeeMeta {
  const code =
    data.employeeCode?.trim() ||
    data.employee?.employeeCode?.trim() ||
    fallback?.employeeCode ||
    ''
  return {
    employeeName:
      data.employee?.fullName?.trim() ||
      fallback?.employeeName ||
      code ||
      'Employee',
    employeeCode: code,
    department: fallback?.department?.trim() || '—',
  }
}

function sortOvertimeRows(rows: OvertimeDayRow[]): OvertimeDayRow[] {
  return [...rows].sort((a, b) => b.date.localeCompare(a.date))
}

export function useOvertimeManagementData() {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const { range, setRange, source, setSource, rangeError, singleDay } =
    useAttendanceReportRangeState()
  const { active, lookupReady, submitLookup } = useHrAttendanceReportActive(
    range,
    source,
    rangeError,
    singleDay,
  )

  const [rosterMeta, setRosterMeta] = useState<OvertimeEmployeeMeta | null>(null)

  const rows = useMemo(() => {
    if (!lookupReady || !active.data) return []
    const meta = metaFromReport(active.data, rosterMeta)
    return sortOvertimeRows(flattenOvertimeFromAttendanceReport(active.data, meta))
  }, [active.data, lookupReady, rosterMeta])

  const summary = useMemo(() => {
    const employeeCodes = new Set(rows.map((row) => row.employeeCode))
    const totalOvertimeMinutes = rows.reduce((sum, row) => sum + row.overtimeMinutes, 0)
    const reportOt = active.data?.summary?.totalOvertimeMinutes
    const minutes =
      typeof reportOt === 'number' && Number.isFinite(reportOt) && rows.length > 0
        ? reportOt
        : totalOvertimeMinutes
    return {
      employeeCount: employeeCodes.size,
      totalOvertime: formatMinutesAsDuration(minutes),
      dayCount: rows.length,
      totalOvertimeMinutes: minutes,
    }
  }, [active.data?.summary?.totalOvertimeMinutes, rows])

  const onRosterSelect = useCallback((record: EmployeeRecord) => {
    const code = record.profile.employeeCode?.trim() || record.profile.employeeId?.trim() || ''
    setRosterMeta({
      employeeName: employeeDisplayName(record) || code,
      employeeCode: code,
      department: record.profile.department?.trim() || '—',
    })
  }, [])

  const showResult = lookupReady && !active.isError && !rangeError && Boolean(active.data)
  const isLoading = lookupReady && active.isFetching && !active.data

  return {
    canViewEmployeeReports,
    range,
    setRange,
    source,
    setSource,
    rangeError,
    singleDay,
    active,
    lookupReady,
    submitLookup,
    onRosterSelect,
    rows,
    summary,
    showResult,
    isLoading,
    isFetching: active.isFetching,
  }
}