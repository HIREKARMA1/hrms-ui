/**
 * Types for overtime, bonus runs, and incentives in Variable Pay.
 * Used by services, utils, and Variable Pay tab components.
 */

export type ItemApprovalStatus = 'Pending approval' | 'Approved' | 'Rejected'

export type BonusRunStatus = 'Draft' | 'Approved' | 'Paid'

export type BonusRunType = 'Statutory' | 'Festival' | 'Performance' | 'Other'

export type OvertimeRateBase = 'Basic' | 'Gross'

export type OvertimeEntry = {
  id: string
  employeeId: string
  payrollMonth: string
  hours: number
  ratePerHour: number
  amount: number
  source: 'Manual'
  note?: string
  status: ItemApprovalStatus
  rejectionReason?: string
}

export type IncentiveType =
  | 'Sales commission'
  | 'Target incentive'
  | 'Referral'
  | 'Other'

export type IncentiveEntry = {
  id: string
  employeeId: string
  payrollMonth: string
  incentiveType: IncentiveType
  amount: number
  note?: string
  status: ItemApprovalStatus
  rejectionReason?: string
}

export type BonusRunLine = {
  employeeId: string
  included: boolean
  amount: number
  eligibleMonths?: number
}

export type BonusRun = {
  id: string
  bonusType: BonusRunType
  periodLabel: string
  payoutMonth: string
  status: BonusRunStatus
  lines: BonusRunLine[]
  createdAt: string
}

export type VariablePayTotals = {
  overtime: number
  bonus: number
  incentive: number
  total: number
}

export type VariablePayKind = 'overtime' | 'bonus' | 'incentive'
