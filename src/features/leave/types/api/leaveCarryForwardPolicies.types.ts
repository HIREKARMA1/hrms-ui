/** Row from `GET /leave-policies/carry-forward` (listCarryForward). */
export type ApiLeaveCarryForwardPolicyItem = {
  id: string
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  carryForwardMode?: string
  mode?: string
  maxCarryForwardDays?: number
  carryForwardCapDays?: number
  capDays?: number
  maxDays?: number
  allowEncashment?: boolean
  encashable?: boolean
  enabled?: boolean
  isActive?: boolean
}

export type LeaveCarryForwardPoliciesData = {
  items: ApiLeaveCarryForwardPolicyItem[]
}

export type CarryForwardPolicyTableRow = {
  id: string
  leaveTypeCode: string
  leaveTypeName: string
  mode: string
  capDetail: string
  encashment: string
  active: boolean
}