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
  /** IN / OUT (or other direction label from the device). */
  direction?: string | null
  deviceCode?: string | null
  deviceUserId?: string | null
  source?: BiometricAttendanceSource | string
  /** Raw TimeWatch punch type code (e.g. "0" / "1"). */
  rawPunchType?: string | null
  /** How the punch was verified (Face, Finger, Card, …). */
  verifyMode?: string | null
}

export type BiometricAttendanceDay = {
  date: string
  firstIn?: string | null
  lastOut?: string | null
  firstPunch?: string | null
  lastPunch?: string | null
  punchCount: number
  workedMinutes: number
}

export type BiometricAttendanceDevice = {
  id?: string
  deviceCode?: string
  deviceName?: string | null
  isActive?: boolean
}

export type BiometricEmployeeAttendance = {
  employeeId?: string
  employeeCode?: string
  employeeName?: string | null
  fromDate: string
  toDate: string
  timezone?: string | null
  source: BiometricAttendanceSource | string
  truncated?: boolean
  device?: BiometricAttendanceDevice | null
  punches: BiometricPunch[]
  days: BiometricAttendanceDay[]
}
