import type { BiometricAttendanceSource } from '../../constants/biometricApiAccess'

export type BiometricAttendanceQuery = {
  fromDate: string
  toDate: string
  source?: BiometricAttendanceSource
}

export type BiometricAttendanceByEmployeeIdQuery = BiometricAttendanceQuery & {
  employeeId: string
}

export type BiometricAttendanceByEmployeeCodeQuery = BiometricAttendanceQuery & {
  employeeCode: string
}

export type BiometricPunch = {
  id?: string
  punchedAt: string
  direction?: string | null
  deviceCode?: string | null
  deviceUserId?: string | null
  source?: BiometricAttendanceSource | string
}

export type BiometricEmployeeAttendance = {
  employeeId?: string
  employeeCode?: string
  fromDate: string
  toDate: string
  source: BiometricAttendanceSource | string
  punches: BiometricPunch[]
}