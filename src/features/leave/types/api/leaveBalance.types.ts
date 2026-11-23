/** Query for `GET /leaves/balance/{employeeId}`. */
export type LeaveBalanceQuery = {
  employeeId: string
  year?: number
  leaveTypeId?: string
}

export type ApiEmployeeLeaveBalanceRow = {
  leaveTypeId: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  leaveTypeCode?: string
  year?: number
  entitled?: number
  carriedForward?: number
  available: number
  used?: number
  pending?: number
}

export type LeaveBalanceData = {
  items: ApiEmployeeLeaveBalanceRow[]
}