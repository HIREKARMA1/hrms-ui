/** Query for `GET /employee-leave-policies` (list). */
export type EmployeeLeavePolicyListQuery = {
  page?: number
  limit?: number
  employeeId?: string
  leaveTypeId?: string
  year?: number
}

/** Row from list / assign API (read-only display). */
export type ApiEmployeeLeavePolicyItem = {
  id?: string
  employeeId?: string
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveTypeName?: string
  year?: number
  annualEntitlement?: number
  monthlyAccrualAmount?: number
  grantMode?: string
  effectiveFrom?: string
  effectiveTo?: string | null
  notes?: string | null
  isActive?: boolean
  useCompanyDefaults?: boolean
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
}

export type EmployeeLeavePolicyListData = {
  items: ApiEmployeeLeavePolicyItem[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

export type AssignedLeavePolicyTableRow = {
  id: string
  leaveTypeCode: string
  leaveTypeName: string
  grantMode: string
  entitlementDetail: string
  effectiveRange: string
  useCompanyDefaults: boolean
  active: boolean
}