import type { ApiEmployeeLeaveBalanceRow } from './leaveBalance.types'

/** Query for `GET /employee-leave-policies/{employeeId}/dashboard`. */
export type EmployeeLeavePolicyDashboardQuery = {
  employeeId: string
  year?: number
}

export type ApiDashboardCardItem = {
  id?: string
  label?: string
  title?: string
  name?: string
  value?: number | string
  amount?: number | string
  unit?: string
}

export type ApiEmployeeLeavePolicyDashboard = {
  year?: number
  employeeId?: string
  cards?: ApiDashboardCardItem[]
  summary?: Record<string, unknown>
  balances?: ApiEmployeeLeaveBalanceRow[]
  balanceByType?: Record<string, unknown>
  perTypeBreakdown?: ApiEmployeeLeaveBalanceRow[]
  leaveTypes?: ApiEmployeeLeaveBalanceRow[]
  accrualHistory?: unknown[]
  accrualTransactions?: unknown[]
  applications?: unknown[]
  leaveApplications?: unknown[]
  lopHistory?: unknown[]
  lossOfPayHistory?: unknown[]
}

/** Read-only view model for My Leave dashboard card. */
export type EmployeeLeaveDashboardSummaryCard = {
  id: string
  label: string
  value: string
}

export type EmployeeLeaveDashboardTypeRow = {
  id: string
  code: string
  name: string
  available: string
  used: string
  pending: string
}

export type EmployeeLeaveDashboardView = {
  year: number
  summaryCards: EmployeeLeaveDashboardSummaryCard[]
  typeRows: EmployeeLeaveDashboardTypeRow[]
  accrualCount: number
  applicationsCount: number
  lopCount: number
}