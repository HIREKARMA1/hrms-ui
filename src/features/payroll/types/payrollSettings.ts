/**
 * Company payroll configuration models for settings UI and calculations.
 * Used by payrollService, calculatePayroll utils, and Payroll Settings tab.
 */

import type { SalaryComponentId } from '../constants/salaryComponents'

export type ComponentCalculationType = 'fixed' | 'percent_of_basic'

export type SalaryComponentSetting = {
  id: SalaryComponentId
  label: string
  calculationType: ComponentCalculationType
  defaultValue: number
  includedInPfWages: boolean
  includedInEsiWages: boolean
  lockedFixed?: boolean
}

export type ProfessionalTaxSlab = {
  id: string
  fromGross: number
  toGross: number | null
  monthlyAmount: number
  februaryAmount?: number
}

export type LossOfPayBasis = 'calendar_days' | 'fixed_30' | 'working_days'

export type WageBase = 'Basic' | 'Gross'

export type VariablePayKindTreatment = {
  includedInPfWages: boolean
  includedInEsiWages: boolean
  includedInProfessionalTaxGross: boolean
}

export type OvertimeRules = {
  enabled: boolean
  rateMultiplier: number
  rateBase: WageBase
  workingDaysPerMonth: number
  hoursPerDay: number
  maxHoursPerMonth: number | null
}

export type BonusRules = {
  statutoryBonusPercent: number
  eligibilitySalaryLimit: number
  calculationWageCeiling: number
  bonusWageBase: WageBase
}

export type VariablePayTreatment = {
  overtime: VariablePayKindTreatment
  bonus: VariablePayKindTreatment
  incentive: VariablePayKindTreatment
}

export type FinalSettlementRules = {
  leaveEncashmentRateBase: WageBase
  leaveEncashmentDayDivisor: number
  noticeRecoveryRateBase: WageBase
  noticeRecoveryDayDivisor: number
  gratuityEnabled: boolean
  gratuityMinYears: number
  gratuityDaysPerYear: number
  gratuityDayDivisor: number
  gratuityMaxAmount: number
  gratuityWageBase: WageBase
}

export type PayrollSettings = {
  salaryComponents: SalaryComponentSetting[]
  pfEnabled: boolean
  pfEmployeeRate: number
  pfEmployerRate: number
  pfApplyCeiling: boolean
  pfWageCeiling: number
  esiEnabled: boolean
  esiGrossLimit: number
  esiEmployeeRate: number
  esiEmployerRate: number
  professionalTaxEnabled: boolean
  professionalTaxState: string
  professionalTaxSlabs: ProfessionalTaxSlab[]
  tdsMode: 'manual_per_employee'
  lossOfPayBasis: LossOfPayBasis
  workingDaysPerMonth: number
  payDayOfMonth: number
  overtimeRules: OvertimeRules
  bonusRules: BonusRules
  variablePayTreatment: VariablePayTreatment
  finalSettlementRules: FinalSettlementRules
}
