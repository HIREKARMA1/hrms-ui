import type { AttendanceRegularizationPostType } from '../../constants/attendanceRegularizationPostTypes'

export type AttendanceRegularizationListQuery = {
  employeeId?: string
  fromDate?: string
  toDate?: string
  type?: AttendanceRegularizationPostType | string
  includeRevoked?: boolean
  page?: number
  limit?: number
}

export type CreateAttendanceRegularizationRequest = {
  /** Attendance report issue code for the selected date (e.g. OVERTIME, MISSED_OUT_PUNCH). */
  type: string
  dates: string[]
  reason: string
}

export type RevokeAttendanceRegularizationRequest = {
  reason: string
}

export type AttendanceRegularizationRecord = {
  id: string
  employeeId?: string
  employeeCode?: string
  employeeName?: string
  type?: AttendanceRegularizationPostType | string
  dates: string[]
  reason?: string
  createdAt?: string
  revokedAt?: string | null
  createdBy?: string
}

export type AttendanceRegularizationListResult = {
  items: AttendanceRegularizationRecord[]
  page: number
  limit: number
  total?: number
}

export type AttendanceRegularizationMutationResult = {
  items: AttendanceRegularizationRecord[]
}