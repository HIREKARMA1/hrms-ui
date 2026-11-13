/**
 * Full and final settlement models for the Final Settlement tab.
 * Used by settlement services, utils, and detail panel UI.
 */

export type SettlementStatus =
  | 'Draft'
  | 'Pending approval'
  | 'Approved'
  | 'Paid'
  | 'Rejected'

export type SettlementLine = {
  id: string
  label: string
  amount: number
  caption?: string
  manual?: boolean
  infoOnly?: boolean
}

export type SettlementTimelineEntry = {
  stage: 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Rejected'
  actor: string
  date: string
  note?: string
}

export type FinalSettlement = {
  id: string
  employeeId: string
  resignationDate: string
  lastWorkingDay: string
  noticePeriodDaysRequired: number
  noticeDaysServed: number
  status: SettlementStatus
  earningsLines: SettlementLine[]
  deductionLines: SettlementLine[]
  tds: number
  totalEarnings: number
  totalDeductions: number
  netPayable: number
  timeline: SettlementTimelineEntry[]
  rejectionReason?: string
}
