/** Query for `GET /leave-encashments` (findAll). */
export type LeaveEncashmentListQuery = {
  page?: number
  limit?: number
  employeeId?: string
  status?: string
}

export type ApiEncashmentRequestItem = {
  id: string
  employeeId?: string
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
  days?: number
  requestedDays?: number
  totalDays?: number
  status?: string
  appliedOn?: string
  appliedAt?: string
  createdAt?: string
  approvedOn?: string
  approvedAt?: string
}

export type LeaveEncashmentListData = {
  items: ApiEncashmentRequestItem[]
  total?: number
  page?: number
  limit?: number
}

export type HrEncashmentRequestRow = {
  id: string
  employeeId: string
  employeeDisplayName?: string
  leaveTypeCode: string
  days: number
  appliedOn: string
  status: string
  approvedOn?: string
}