/**
 * RTK Query: attendance regularisation (`AttendanceRegularizationController`).
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AttendanceRegularizationListQuery,
  CreateAttendanceRegularizationRequest,
  RevokeAttendanceRegularizationRequest,
} from '../types/api/attendanceRegularization.types'
import {
  normalizeAttendanceRegularizationList,
  normalizeAttendanceRegularizationMutation,
} from '../utils/normalizeAttendanceRegularization'

const ATTENDANCE_REGULARIZATION_TAG = { type: 'Attendance' as const, id: 'ATTENDANCE_REGULARIZATION' }

export const attendanceRegularizationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAttendanceRegularizations: build.query<
      ReturnType<typeof normalizeAttendanceRegularizationList>,
      AttendanceRegularizationListQuery | void
    >({
      query: (arg) => ({
        url: '/attendance/regularizations',
        params: {
          page: arg?.page ?? 1,
          limit: arg?.limit ?? 20,
          ...(arg?.employeeId ? { employeeId: arg.employeeId } : {}),
          ...(arg?.fromDate ? { fromDate: arg.fromDate } : {}),
          ...(arg?.toDate ? { toDate: arg.toDate } : {}),
          ...(arg?.type ? { type: arg.type } : {}),
          ...(arg?.includeRevoked !== undefined
            ? { includeRevoked: String(arg.includeRevoked) }
            : {}),
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceRegularizationList(unwrapData(response)),
      providesTags: [ATTENDANCE_REGULARIZATION_TAG],
    }),
    createAttendanceRegularization: build.mutation<
      ReturnType<typeof normalizeAttendanceRegularizationMutation>,
      { employeeId: string; body: CreateAttendanceRegularizationRequest }
    >({
      query: ({ employeeId, body }) => ({
        url: `/attendance/employees/${encodeURIComponent(employeeId)}/regularizations`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceRegularizationMutation(unwrapData(response)),
      invalidatesTags: [ATTENDANCE_REGULARIZATION_TAG, { type: 'Attendance', id: 'ATTENDANCE_REPORT' }],
    }),
    revokeAttendanceRegularization: build.mutation<
      ReturnType<typeof normalizeAttendanceRegularizationMutation>,
      { id: string; body: RevokeAttendanceRegularizationRequest }
    >({
      query: ({ id, body }) => ({
        url: `/attendance/regularizations/${encodeURIComponent(id)}`,
        method: 'DELETE',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAttendanceRegularizationMutation(unwrapData(response)),
      invalidatesTags: [ATTENDANCE_REGULARIZATION_TAG, { type: 'Attendance', id: 'ATTENDANCE_REPORT' }],
    }),
  }),
})

export const {
  useListAttendanceRegularizationsQuery,
  useCreateAttendanceRegularizationMutation,
  useRevokeAttendanceRegularizationMutation,
  useLazyListAttendanceRegularizationsQuery,
} = attendanceRegularizationApi