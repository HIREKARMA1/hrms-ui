/** Row from `GET /leave-approval/history/{leaveRequestId}`. */
export type ApiApprovalHistoryItem = {
  id?: string
  leaveRequestId?: string
  action?: string
  status?: string
  kind?: string
  step?: string
  at?: string
  actedAt?: string
  createdAt?: string
  actorId?: string
  actorName?: string
  approverName?: string
  approver?: {
    id?: string
    name?: string
    fullName?: string
  }
  level?: string
  approvalLevel?: string
  comment?: string
  remarks?: string
}

export type LeaveApprovalHistoryData = {
  items: ApiApprovalHistoryItem[]
}