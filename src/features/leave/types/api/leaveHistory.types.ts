/** Query for `GET /leaves/history/{employeeId}`. */
export type LeaveHistoryQuery = {
  employeeId: string
  year?: number
  leaveTypeId?: string
  page?: number
  limit?: number
}

export type ApiLeaveHistoryRow = {
  id: string
  employeeId?: string
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  entryType?: string
  transactionType?: string
  kind?: string
  type?: string
  days?: number
  quantity?: number
  balanceAfter?: number
  runningBalance?: number
  balance?: number
  effectiveDate?: string
  date?: string
  createdAt?: string
  reason?: string | null
  notes?: string | null
  createdBy?: string | null
  performedBy?: string | null
  actorName?: string | null
}

export type LeaveHistoryData = {
  items: ApiLeaveHistoryRow[]
  total?: number
  page?: number
  limit?: number
}