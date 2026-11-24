/** Row from `GET /leave-policies/accrual` (listAccrual). */
export type ApiLeaveAccrualPolicyItem = {
  id: string
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  accrualMethod?: string
  method?: string
  frequency?: string
  daysPerMonth?: number
  monthlyDays?: number
  accrualDays?: number
  daysWorkedPerAccrualDay?: number
  enabled?: boolean
  isActive?: boolean
  effectiveFrom?: string
  effectiveTo?: string | null
}

export type LeaveAccrualPoliciesData = {
  items: ApiLeaveAccrualPolicyItem[]
}

/** Display model for Accruals tab table. */
export type AccrualPolicyTableRow = {
  id: string
  leaveTypeCode: string
  leaveTypeName: string
  method: string
  rateDetail: string
  active: boolean
}