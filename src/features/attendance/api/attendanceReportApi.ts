/**
 * RTK Query: processed attendance reports (`AttendanceReportController`).
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AttendanceMyReportForDateQuery,
  AttendanceMyReportQuery,
  AttendanceReportByEmployeeCodeForDateQuery,
  AttendanceReportByEmployeeCodeQuery,
  AttendanceReportByEmployeeIdForDateQuery,
  AttendanceReportByEmployeeIdQuery,
} from '../types/api/attendanceReport.types'
import { normalizeAttendanceReport } from '../utils/normalizeAttendanceReport'
import {
  buildAttendanceReportParams,
  buildAttendanceReportSourceParams,
} from '../utils/attendanceReportParams'

const ATTENDANCE_REPORT_TAG = { type: 'Attendance' as const, id: 'ATTENDANCE_REPORT' }

export const attendanceReportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyAttendanceReport: build.query<
      ReturnType<typeof normalizeAttendanceReport>,
      AttendanceMyReportQuery | void
    >({
      query: (arg) => ({
        url: '/attendance/me',
        params: buildAttendanceReportParams(arg ?? {}),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceReport(unwrapData(response)),
      providesTags: [ATTENDANCE_REPORT_TAG],
    }),
    getMyAttendanceReportForDate: build.query<
      ReturnType<typeof normalizeAttendanceReport>,
      AttendanceMyReportForDateQuery
    >({
      query: ({ date, source }) => ({
        url: `/attendance/me/date/${encodeURIComponent(date)}`,
        params: buildAttendanceReportSourceParams(source),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceReport(unwrapData(response)),
      providesTags: [ATTENDANCE_REPORT_TAG],
    }),
    getAttendanceReportByEmployeeId: build.query<
      ReturnType<typeof normalizeAttendanceReport>,
      AttendanceReportByEmployeeIdQuery
    >({
      query: ({ employeeId, ...range }) => ({
        url: `/attendance/employees/${encodeURIComponent(employeeId)}`,
        params: buildAttendanceReportParams(range),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceReport(unwrapData(response)),
      providesTags: (_r, _e, arg) => [
        ATTENDANCE_REPORT_TAG,
        { type: 'Attendance', id: `ATTENDANCE_REPORT-${arg.employeeId}` },
      ],
    }),
    getAttendanceReportByEmployeeIdForDate: build.query<
      ReturnType<typeof normalizeAttendanceReport>,
      AttendanceReportByEmployeeIdForDateQuery
    >({
      query: ({ employeeId, date, source }) => ({
        url: `/attendance/employees/${encodeURIComponent(employeeId)}/date/${encodeURIComponent(date)}`,
        params: buildAttendanceReportSourceParams(source),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceReport(unwrapData(response)),
      providesTags: (_r, _e, arg) => [
        ATTENDANCE_REPORT_TAG,
        { type: 'Attendance', id: `ATTENDANCE_REPORT-${arg.employeeId}` },
      ],
    }),
    getAttendanceReportByEmployeeCode: build.query<
      ReturnType<typeof normalizeAttendanceReport>,
      AttendanceReportByEmployeeCodeQuery
    >({
      query: ({ employeeCode, ...range }) => ({
        url: `/attendance/employees/by-code/${encodeURIComponent(employeeCode)}`,
        params: buildAttendanceReportParams(range),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceReport(unwrapData(response)),
      providesTags: (_r, _e, arg) => [
        ATTENDANCE_REPORT_TAG,
        { type: 'Attendance', id: `ATTENDANCE_REPORT-CODE-${arg.employeeCode}` },
      ],
    }),
    getAttendanceReportByEmployeeCodeForDate: build.query<
      ReturnType<typeof normalizeAttendanceReport>,
      AttendanceReportByEmployeeCodeForDateQuery
    >({
      query: ({ employeeCode, date, source }) => ({
        url: `/attendance/employees/by-code/${encodeURIComponent(employeeCode)}/date/${encodeURIComponent(date)}`,
        params: buildAttendanceReportSourceParams(source),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceReport(unwrapData(response)),
      providesTags: (_r, _e, arg) => [
        ATTENDANCE_REPORT_TAG,
        { type: 'Attendance', id: `ATTENDANCE_REPORT-CODE-${arg.employeeCode}` },
      ],
    }),
  }),
})

export const {
  useGetMyAttendanceReportQuery,
  useGetMyAttendanceReportForDateQuery,
  useGetAttendanceReportByEmployeeIdQuery,
  useGetAttendanceReportByEmployeeIdForDateQuery,
  useGetAttendanceReportByEmployeeCodeQuery,
  useGetAttendanceReportByEmployeeCodeForDateQuery,
  useLazyGetAttendanceReportByEmployeeCodeQuery,
} = attendanceReportApi