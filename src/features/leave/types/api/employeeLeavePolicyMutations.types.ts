import type { BackendGrantMode } from '../../api/leaveApi.types'

/** POST /employee-leave-policies — assign or update per-employee entitlement. */
export type AssignEmployeeLeavePolicyBody = {
  employeeId: string
  leaveTypeId: string
  year: number
  useCompanyDefaults?: boolean
  grantMode?: BackendGrantMode
  annualEntitlement?: number
  monthlyAccrualAmount?: number
  effectiveFrom?: string
  effectiveTo?: string | null
  notes?: string
  isActive?: boolean
}

/** POST /employee-leave-policies/assign-defaults */
export type AssignEmployeeLeaveDefaultsBody = {
  employeeId: string
  year?: number
}