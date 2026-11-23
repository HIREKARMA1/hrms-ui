/**
 * Payroll settings validation with section ids for routing (Phase 3).
 */

import type { PayrollSettingsSectionId } from '../constants/payrollSettingsSections'
import type { PayrollSettings } from '../types/payrollSettings'
import { validateProfessionalTaxSlabs } from './validateProfessionalTaxSlabs'

export type PayrollSettingsValidationIssue = {
  section: PayrollSettingsSectionId
  message: string
}

export function validatePayrollSettingsDraft(draft: PayrollSettings) {
  const issues: PayrollSettingsValidationIssue[] = []
  const ptStates = Object.keys(draft.professionalTaxSlabsByState ?? {})
  const statesToValidate =
  ptStates.length > 0 ? ptStates : [draft.professionalTaxState]

  statesToValidate.forEach((state) => {
    const slabs =
      draft.professionalTaxSlabsByState?.[state] ??
      (state === draft.professionalTaxState ? draft.professionalTaxSlabs : [])
    const pt = validateProfessionalTaxSlabs(slabs)
    pt.globalErrors.forEach((message) => {
      issues.push({ section: 'professional-tax', message: `${state}: ${message}` })
    })
    Object.values(pt.errorsBySlabId).forEach((message) => {
      issues.push({ section: 'professional-tax', message: `${state}: ${message}` })
    })
  })

  if (draft.payDayOfMonth < 1 || draft.payDayOfMonth > 28) {
    issues.push({ section: 'pay-cycle', message: 'Pay day must be between 1 and 28.' })
  }
  if (draft.lossOfPayBasis === 'working_days' && draft.workingDaysPerMonth < 1) {
    issues.push({ section: 'pay-cycle', message: 'Working days must be at least 1.' })
  }
  if (draft.overtimeRules.workingDaysPerMonth < 1 || draft.overtimeRules.hoursPerDay < 1) {
    issues.push({
      section: 'variable-pay',
      message: 'Overtime working days and hours per day must be at least 1.',
    })
  }
  if (draft.finalSettlementRules.leaveEncashmentDayDivisor < 1) {
    issues.push({ section: 'exit-settlement', message: 'Leave encashment day divisor must be at least 1.' })
  }
  if (draft.finalSettlementRules.noticeRecoveryDayDivisor < 1) {
    issues.push({ section: 'exit-settlement', message: 'Notice recovery day divisor must be at least 1.' })
  }

  const firstErrorSection = issues[0]?.section
  const fieldErrors = issues.map((item) => item.message)
  const activePtValidation = validateProfessionalTaxSlabs(draft.professionalTaxSlabs)

  return {
    ok: issues.length === 0,
    issues,
    firstErrorSection,
    fieldErrors,
    slabErrorsById: activePtValidation.errorsBySlabId,
  }
}