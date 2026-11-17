/**
 * Local draft state and validation for the Payroll Settings form.
 * Used by PayrollSettingsTab.
 */

import { useEffect, useMemo, useState } from 'react'

import type { PayrollSettings } from '../types/payrollSettings'
import type { PayrollSettingsSectionId } from '../constants/payrollSettingsSections'
import { validatePayrollSettingsDraft } from '../utils/validatePayrollSettings'
import { validateProfessionalTaxSlabs } from '../utils/validateProfessionalTaxSlabs'
import { usePayroll } from './usePayroll'

export function usePayrollSettingsForm() {
  const { settings, saveSettings } = usePayroll()
  const [draft, setDraft] = useState<PayrollSettings>(settings)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [issues, setIssues] = useState<ReturnType<typeof validatePayrollSettingsDraft>['issues']>([])

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

  function runValidation() {
    return validatePayrollSettingsDraft(draft)
  }

  async function handleSave(): Promise<{
    ok: boolean
    firstErrorSection?: PayrollSettingsSectionId
  }> {
    const result = runValidation()
    setFieldErrors(result.fieldErrors)
    setIssues(result.issues)
    if (!result.ok) {
      return { ok: false, firstErrorSection: result.firstErrorSection }
    }
    await saveSettings(structuredClone(draft))
    setIssues([])
    return { ok: true }
  }

  function discard() {
    setDraft(structuredClone(settings))
    setFieldErrors([])
    setIssues([])
  }

  return {
    draft,
    setDraft,
    isDirty,
    fieldErrors,
    issues,
    slabErrorsById: slabValidation.errorsBySlabId,
    handleSave,
    discard,
  }
}
