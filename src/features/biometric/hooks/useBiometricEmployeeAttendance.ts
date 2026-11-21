import type {
  BiometricAttendanceByEmployeeCodeQuery,
  BiometricAttendanceByEmployeeIdQuery,
} from '../types/api/biometricAttendance.types'
import {
  useGetBiometricAttendanceByEmployeeCodeQuery,
  useGetBiometricAttendanceByEmployeeIdQuery,
} from '../api/biometricApi'
import { useBiometricPermissions } from './useBiometricPermissions'

export function useBiometricAttendanceByEmployeeId(
  query: BiometricAttendanceByEmployeeIdQuery,
  options?: { skip?: boolean },
) {
  const { canReadAttendance } = useBiometricPermissions()
  const skip = (options?.skip ?? false) || !canReadAttendance || !query.employeeId
  return useGetBiometricAttendanceByEmployeeIdQuery(query, { skip })
}

export function useBiometricAttendanceByEmployeeCode(
  query: BiometricAttendanceByEmployeeCodeQuery,
  options?: { skip?: boolean },
) {
  const { canReadAttendance } = useBiometricPermissions()
  const skip = (options?.skip ?? false) || !canReadAttendance || !query.employeeCode
  return useGetBiometricAttendanceByEmployeeCodeQuery(query, { skip })
}