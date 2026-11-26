import type { ApiEmployeeLeaveBalanceRow } from './leaveBalance.types'

/** Query for `GET /employee-leave-policies/hr-overview`. */
export type EmployeeLeavePolicyHrOverviewQuery = {
  page?: number
  limit?: number
  year?: number
  departmentId?: string
  search?: string
}

/** Row from hr-overview (tolerant of nested employee and balances). */
export type ApiEmployeeLeavePolicyHrOverviewItem = {
  id?: string
  employeeId?: string
  employeeName?: string
  employeeCode?: string
  departmentId?: string
  department?: string | { id?: string; name?: string; title?: string }
  departmentName?: string
  employee?: {
    id?: string
    employeeCode?: string
    code?: string
    firstName?: string
    lastName?: string
    fullName?: string
    department?: string | { id?: string; name?: string; title?: string }
    departmentName?: string
  }
  balances?: ApiEmployeeLeaveBalanceRow[]
  leaveBalances?: ApiEmployeeLeaveBalanceRow[]
  balanceByType?: Record<string, number>
}

export type EmployeeLeavePolicyHrOverviewData = {
  items: ApiEmployeeLeavePolicyHrOverviewItem[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

/** Table row for HR Balances live section. */
export type HrOverviewBalanceTableRow = {
  employeeId: string
  employeeName: string
  employeeCode?: string
  departmentName: string
  /** leave type code (uppercase) → available balance */
  balancesByCode: Record<string, number>
}