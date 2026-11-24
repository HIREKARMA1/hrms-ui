import type { AttendanceRegularizationType } from '../../constants/attendanceApiAccess'

export type AttendanceRegularizationListQuery = {
  employeeId?: string
  fromDate?: string
  toDate?: string
  type?: AttendanceRegularizationType
  includeRevoked?: boolean
  page?: number
  limit?: number
}

export type CreateAttendanceRegularizationRequest = {
  type: AttendanceRegularizationType
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
  type?: AttendanceRegularizationType | string
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