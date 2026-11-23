/** Query params for `GET /leaves` (Swagger). */
export type LeaveListQuery = {
  page?: number
  limit?: number
  employeeId?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  leaveTypeId?: string
}

export type ApiLeaveDayPortion = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'

export type ApiLeaveRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

/** Single row from the leave list API (tolerant of nested leaveType). */
export type ApiLeaveRequestItem = {
  id: string
  employeeId: string
  employee?: {
    id?: string
    employeeCode?: string
    code?: string
    firstName?: string
    lastName?: string
    fullName?: string
  }
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  startDate: string
  endDate: string
  dayPortion?: ApiLeaveDayPortion
  status: ApiLeaveRequestStatus | string
  reason?: string | null
  totalDays?: number
  paidDays?: number
  lwpDays?: number
  createdAt?: string
  appliedAt?: string
  updatedAt?: string
}

export type LeaveListData = {
  items: ApiLeaveRequestItem[]
  total: number
  page: number
  limit: number
  totalPages?: number
}