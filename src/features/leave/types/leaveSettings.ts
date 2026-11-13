/**
 * Company leave policy configuration including per-type rules and calendars.
 * Edited on Leave Settings tab; seeded from services/companyDefaults.ts.
 */

import type { Holiday } from './holiday'
import type { LeaveEarningModel } from './leaveEarningModel'

export type LeaveYearMode = 'jan_dec' | 'apr_mar'

export type SandwichRule = 'count' | 'exclude'

export type AccrualMethod = 'upfront' | 'monthly' | 'per_days_worked'

export type DayCounting = 'working' | 'calendar'

export type EligibleGender = 'All' | 'Female' | 'Male'

export type CarryForwardMode = 'none' | 'capped'

export type ApprovalChainMode = 'manager' | 'manager_hr' | 'hr'

export type CoverageMode = 'warn' | 'block'

export type LeaveTypePolicy = {
  code: string
  label: string
  enabled: boolean
  paid: boolean
  earningModel: LeaveEarningModel
  annualQuotaDays: number | null
  /** Maternity only: days per event from the third child onwards (sample in companyDefaults). */
  perEventDaysFromThirdChild: number | null
  accrualMethod: AccrualMethod
  daysWorkedPerAccrualDay: number | null
  qualifyingDays: number | null
  dayCounting: DayCounting
  halfDayAllowed: boolean
  maxConsecutiveDays: number | null
  minNoticeDays: number
  backdatingAllowedDays: number
  medicalCertificateAfterDays: number | null
  eligibleGender: EligibleGender
  minServiceMonths: number
  carryForward: CarryForwardMode
  carryForwardCapDays: number | null
  encashable: boolean
  allowLwpConversion: boolean
  compOffExpiryDays: number | null
  approvalChain: ApprovalChainMode
  managerOnlyUpToDays: number | null
}

export type EncashmentRules = {
  minimumBalanceDays: number
  maximumDaysPerYear: number
}

export type TeamCoverageRules = {
  maxSameDepartmentPerDay: number
  mode: CoverageMode
}

export type EscalationRules = {
  daysPendingBeforeEscalation: number
}

export type LeaveSettings = {
  leaveYearMode: LeaveYearMode
  weeklyOffDays: number[]
  sandwichRule: SandwichRule
  minProbationMonths: number
  leaveTypes: LeaveTypePolicy[]
  encashmentRules: EncashmentRules
  teamCoverage: TeamCoverageRules
  escalation: EscalationRules
  holidays: Holiday[]
}
