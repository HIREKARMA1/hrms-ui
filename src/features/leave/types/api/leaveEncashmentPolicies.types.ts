/** Row from `GET /leave-encashments/policies` (listPolicies). */
export type ApiLeaveEncashmentPolicyItem = {
  id: string
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  minimumBalanceDays?: number
  minBalanceDays?: number
  minBalanceAfterEncashment?: number
  maximumDaysPerYear?: number
  maxDaysPerYear?: number
  maxEncashmentDaysPerYear?: number
  encashable?: boolean
  allowEncashment?: boolean
  enabled?: boolean
  isActive?: boolean
  effectiveFrom?: string
  effectiveTo?: string | null
}

export type LeaveEncashmentPoliciesData = {
  items: ApiLeaveEncashmentPolicyItem[]
}

export type EncashmentPolicyTableRow = {
  id: string
  leaveTypeCode: string
  leaveTypeName: string
  minBalance: string
  maxPerYear: string
  allowed: string
  active: boolean
}