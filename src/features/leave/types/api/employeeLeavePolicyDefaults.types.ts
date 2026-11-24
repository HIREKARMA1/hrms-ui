/** Row from `GET /employee-leave-policies/defaults` (listDefaults). */
export type ApiEmployeeLeavePolicyDefaultItem = {
  id?: string
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveTypeName?: string
  code?: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  annualEntitlement?: number
  monthlyAccrualAmount?: number
  grantMode?: string
  enabled?: boolean
  isActive?: boolean
}

export type EmployeeLeavePolicyDefaultsData = {
  items: ApiEmployeeLeavePolicyDefaultItem[]
}

/** Display model for Leave Settings → General (live defaults table). */
export type EmployeeLeavePolicyDefaultTableRow = {
  id: string
  leaveTypeCode: string
  leaveTypeName: string
  grantMode: string
  entitlementDetail: string
  active: boolean
}