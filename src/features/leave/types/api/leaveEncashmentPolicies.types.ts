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
  /** Live API (`EncashmentPolicyResponse`). */
  ratePerDay?: number
  currency?: string
  minDays?: number
  maxDaysPerRequest?: number
  maxDaysPerYear?: number | null
  effectiveFrom?: string
  effectiveTo?: string | null
  /** Legacy / alternate response shapes. */
  minimumBalanceDays?: number
  minBalanceDays?: number
  minBalanceAfterEncashment?: number
  maximumDaysPerYear?: number
  maxEncashmentDaysPerYear?: number
  encashable?: boolean
  allowEncashment?: boolean
  enabled?: boolean
  isActive?: boolean
}

export type LeaveEncashmentPoliciesData = {
  items: ApiLeaveEncashmentPolicyItem[]
}

export type EncashmentPolicyTableRow = {
  id: string
  leaveTypeCode: string
  leaveTypeName: string
  ratePerDay: string
  minDays: string
  maxPerRequest: string
  maxPerYear: string
  effective: string
  active: boolean
}