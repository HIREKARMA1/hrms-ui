import type {
  AttendanceMyReportForDateQuery,
  AttendanceMyReportQuery,
  AttendanceReportByEmployeeCodeForDateQuery,
  AttendanceReportByEmployeeCodeQuery,
  AttendanceReportByEmployeeIdForDateQuery,
  AttendanceReportByEmployeeIdQuery,
} from '../types/api/attendanceReport.types'
import {
  useGetAttendanceReportByEmployeeCodeForDateQuery,
  useGetAttendanceReportByEmployeeCodeQuery,
  useGetAttendanceReportByEmployeeIdForDateQuery,
  useGetAttendanceReportByEmployeeIdQuery,
  useGetMyAttendanceReportForDateQuery,
  useGetMyAttendanceReportQuery,
} from '../api/attendanceReportApi'
import { useAttendancePermissions } from './useAttendancePermissions'

export function useMyAttendanceReport(
  query: AttendanceMyReportQuery = {},
  options?: { skip?: boolean },
) {
  const skip = options?.skip ?? false
  return useGetMyAttendanceReportQuery(query, { skip })
}

export function useMyAttendanceReportForDate(
  query: AttendanceMyReportForDateQuery,
  options?: { skip?: boolean },
) {
  const skip = (options?.skip ?? false) || !query.date
  return useGetMyAttendanceReportForDateQuery(query, { skip })
}

export function useAttendanceReportByEmployeeId(
  query: AttendanceReportByEmployeeIdQuery,
  options?: { skip?: boolean },
) {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const skip = (options?.skip ?? false) || !canViewEmployeeReports || !query.employeeId
  return useGetAttendanceReportByEmployeeIdQuery(query, { skip })
}

export function useAttendanceReportByEmployeeIdForDate(
  query: AttendanceReportByEmployeeIdForDateQuery,
  options?: { skip?: boolean },
) {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const skip =
    (options?.skip ?? false) || !canViewEmployeeReports || !query.employeeId || !query.date
  return useGetAttendanceReportByEmployeeIdForDateQuery(query, { skip })
}

export function useAttendanceReportByEmployeeCode(
  query: AttendanceReportByEmployeeCodeQuery,
  options?: { skip?: boolean },
) {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const skip = (options?.skip ?? false) || !canViewEmployeeReports || !query.employeeCode
  return useGetAttendanceReportByEmployeeCodeQuery(query, { skip })
}

export function useAttendanceReportByEmployeeCodeForDate(
  query: AttendanceReportByEmployeeCodeForDateQuery,
  options?: { skip?: boolean },
) {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const skip =
    (options?.skip ?? false) || !canViewEmployeeReports || !query.employeeCode || !query.date
  return useGetAttendanceReportByEmployeeCodeForDateQuery(query, { skip })
}