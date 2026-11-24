/**
 * RTK Query: TimeWatch biometric devices, punch sync, read-only employee attendance.
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  BiometricAttendanceByEmployeeCodeQuery,
  BiometricAttendanceByEmployeeIdQuery,
} from '../types/api/biometricAttendance.types'
import type {
  BiometricDeviceListQuery,
  RegisterBiometricDeviceRequest,
  UpdateBiometricDeviceRequest,
} from '../types/api/biometricDevices.types'
import type { BiometricSyncRequest } from '../types/api/biometricSync.types'
import { normalizeBiometricAttendance } from '../utils/normalizeBiometricAttendance'
import {
  normalizeBiometricDevice,
  normalizeBiometricDeviceList,
} from '../utils/normalizeBiometricDevice'
import {
  normalizeBiometricConnectionTest,
  normalizeBiometricSyncResult,
} from '../utils/normalizeBiometricSync'
import { normalizeTimeWatchDeviceList } from '../utils/normalizeTimeWatchDevices'

const BIOMETRIC_DEVICES_TAG = { type: 'Attendance' as const, id: 'BIOMETRIC_DEVICES' }

export const biometricApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listBiometricDevices: build.query<
      ReturnType<typeof normalizeBiometricDeviceList>,
      BiometricDeviceListQuery | void
    >({
      query: (arg) => ({
        url: '/attendance/biometric/devices',
        params: {
          page: arg?.page ?? 1,
          limit: arg?.limit ?? 20,
          ...(arg?.isActive !== undefined ? { isActive: arg.isActive } : {}),
          ...(arg?.q ? { q: arg.q } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricDeviceList(unwrapData(response)),
      providesTags: [BIOMETRIC_DEVICES_TAG],
    }),
    registerBiometricDevice: build.mutation<
      ReturnType<typeof normalizeBiometricDevice>,
      RegisterBiometricDeviceRequest
    >({
      query: (body) => ({
        url: '/attendance/biometric/devices',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricDevice(unwrapData(response)),
      invalidatesTags: [BIOMETRIC_DEVICES_TAG],
    }),
    updateBiometricDevice: build.mutation<
      ReturnType<typeof normalizeBiometricDevice>,
      { id: string; body: UpdateBiometricDeviceRequest }
    >({
      query: ({ id, body }) => ({
        url: `/attendance/biometric/devices/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricDevice(unwrapData(response)),
      invalidatesTags: [BIOMETRIC_DEVICES_TAG],
    }),
    deleteBiometricDevice: build.mutation<
      ReturnType<typeof normalizeBiometricDevice>,
      string
    >({
      query: (id) => ({
        url: `/attendance/biometric/devices/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricDevice(unwrapData(response)),
      invalidatesTags: [BIOMETRIC_DEVICES_TAG],
    }),
    listTimeWatchDevices: build.query<ReturnType<typeof normalizeTimeWatchDeviceList>, void>({
      query: () => '/attendance/biometric/devices/timewatch',
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeTimeWatchDeviceList(unwrapData(response)),
    }),
    biometricConnectionTest: build.query<
      ReturnType<typeof normalizeBiometricConnectionTest>,
      void
    >({
      query: () => '/attendance/biometric/connection-test',
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricConnectionTest(unwrapData(response)),
    }),
    syncBiometricPunches: build.mutation<
      ReturnType<typeof normalizeBiometricSyncResult>,
      BiometricSyncRequest | void
    >({
      query: (body) => ({
        url: '/attendance/biometric/sync',
        method: 'POST',
        body: body ?? {},
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricSyncResult(unwrapData(response)),
      invalidatesTags: [BIOMETRIC_DEVICES_TAG, { type: 'Attendance', id: 'BIOMETRIC_ATTENDANCE' }],
    }),
    getBiometricAttendanceByEmployeeId: build.query<
      ReturnType<typeof normalizeBiometricAttendance>,
      BiometricAttendanceByEmployeeIdQuery
    >({
      query: ({ employeeId, fromDate, toDate, source }) => ({
        url: `/attendance/biometric/employees/${encodeURIComponent(employeeId)}/attendance`,
        params: { fromDate, toDate, ...(source ? { source } : {}) },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricAttendance(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'Attendance', id: `BIOMETRIC_ATTENDANCE-${arg.employeeId}` },
      ],
    }),
    getBiometricAttendanceByEmployeeCode: build.query<
      ReturnType<typeof normalizeBiometricAttendance>,
      BiometricAttendanceByEmployeeCodeQuery
    >({
      query: ({ employeeCode, fromDate, toDate, source }) => ({
        url: `/attendance/biometric/employees/by-code/${encodeURIComponent(employeeCode)}/attendance`,
        params: { fromDate, toDate, ...(source ? { source } : {}) },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeBiometricAttendance(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'Attendance', id: `BIOMETRIC_ATTENDANCE-CODE-${arg.employeeCode}` },
      ],
    }),
  }),
})

export const {
  useListBiometricDevicesQuery,
  useRegisterBiometricDeviceMutation,
  useUpdateBiometricDeviceMutation,
  useDeleteBiometricDeviceMutation,
  useListTimeWatchDevicesQuery,
  useBiometricConnectionTestQuery,
  useSyncBiometricPunchesMutation,
  useGetBiometricAttendanceByEmployeeIdQuery,
  useGetBiometricAttendanceByEmployeeCodeQuery,
  useLazyListBiometricDevicesQuery,
  useLazyBiometricConnectionTestQuery,
  useLazyGetBiometricAttendanceByEmployeeIdQuery,
} = biometricApi