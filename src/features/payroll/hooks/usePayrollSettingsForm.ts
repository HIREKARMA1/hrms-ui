/**
 * Local draft state and validation for the Payroll Settings form.
 * Used by PayrollSettingsTab.
 */

import { useEffect, useMemo, useState } from 'react'

import type { PayrollSettings } from '../types/payrollSettings'
import { validateProfessionalTaxSlabs } from '../utils/validateProfessionalTaxSlabs'
import { usePayroll } from './usePayroll'

export function usePayrollSettingsForm() {
  const { settings, saveSettings } = usePayroll()
  const [draft, setDraft] = useState<PayrollSettings>(settings)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const slabValidation = useMemo(
    () => validateProfessionalTaxSlabs(draft.professionalTaxSlabs),
    [draft.professionalTaxSlabs],
  )

  useEffect(() => {
    const handle = window.setTimeout(() => setDraft(settings), 0)
    return () => window.clearTimeout(handle)
  }, [settings])

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings],
  )

  function validate(): boolean {
    const validation = validateProfessionalTaxSlabs(draft.professionalTaxSlabs)
    const errors = [...validation.globalErrors]
    if (draft.payDayOfMonth < 1 || draft.payDayOfMonth > 28) {
      errors.push('Pay day must be between 1 and 28.')
    }
    if (draft.workingDaysPerMonth < 1) {
      errors.push('Working days must be at least 1.')
    }
    if (draft.overtimeRules.workingDaysPerMonth < 1 || draft.overtimeRules.hoursPerDay < 1) {
      errors.push('Overtime working days and hours per day must be at least 1.')
    }
    if (draft.finalSettlementRules.leaveEncashmentDayDivisor < 1) {
      errors.push('Settlement day divisors must be at least 1.')
    }
    setFieldErrors(errors)
    return errors.length === 0 && Object.keys(validation.errorsBySlabId).length === 0
  }

  async function handleSave(): Promise<boolean> {
    if (!validate()) {
      return false
    }
    await saveSettings(structuredClone(draft))
    return true
  }

  function discard() {
    setDraft(structuredClone(settings))
    setFieldErrors([])
  }

  return {
    draft,
    setDraft,
    isDirty,
    fieldErrors,
    slabErrorsById: slabValidation.errorsBySlabId,
    handleSave,
    discard,
  }
}
